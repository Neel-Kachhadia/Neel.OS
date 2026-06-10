export interface TaxBreakdownItem {
  range: string;
  rate: string;
  amount: number;
}

export interface TaxResult {
  tax: number;
  cess: number;
  total: number;
  breakdown: TaxBreakdownItem[];
  note?: string;
  cessLabel?: string;
  deductions?: number;
  taxableIncome?: number;
}

export interface TaxSystem {
  id: string;
  label: string;
  calculate: (gross: number) => TaxResult;
}

export interface CountryTaxData {
  name: string;
  flag: string;
  currency: string;
  currencyCode: string;
  usdRate: number;
  incomeLabel: string;
  note: string;
  taxYear: string;
  systems: TaxSystem[];
}

const TAX_SYSTEMS: Record<string, CountryTaxData> = {

  IN: {
    name: 'India',
    flag: '🇮🇳',
    currency: '₹',
    currencyCode: 'INR',
    usdRate: 0.012,
    incomeLabel: 'Annual Gross Income (₹)',
    note: 'New Regime FY2024-25. Standard deduction ₹75,000 applied.',
    taxYear: 'FY2024-25',
    systems: [
      {
        id: 'new',
        label: 'New Regime (Recommended)',
        calculate: (gross: number): TaxResult => {
          const std = 75000;
          const taxable = Math.max(0, gross - std);
          if (taxable <= 700000) return {
            tax: 0, cess: 0, total: 0,
            breakdown: [],
            note: '87A rebate applied — zero tax',
            cessLabel: 'Health & Edu. Cess (4%)',
            deductions: std,
            taxableIncome: taxable,
          };
          const slabs: { limit: number; rate: number }[] = [
            { limit: 400000, rate: 0 },
            { limit: 800000, rate: 0.05 },
            { limit: 1200000, rate: 0.10 },
            { limit: 1600000, rate: 0.15 },
            { limit: 2000000, rate: 0.20 },
            { limit: 2400000, rate: 0.25 },
            { limit: Infinity, rate: 0.30 },
          ];
          let tax = 0;
          let prev = 0;
          const breakdown: TaxBreakdownItem[] = [];
          for (const slab of slabs) {
            if (taxable <= prev) break;
            const slabIncome = Math.min(taxable, slab.limit) - prev;
            const slabTax = slabIncome * slab.rate;
            tax += slabTax;
            if (slabTax > 0 || slab.rate === 0) {
              const hi = slab.limit === Infinity ? '∞' : `₹${slab.limit / 100000}L`;
              breakdown.push({
                range: `₹${prev / 100000}L – ${hi}`,
                rate: `${slab.rate * 100}%`,
                amount: slabTax,
              });
            }
            prev = slab.limit;
          }
          const cess = tax * 0.04;
          return {
            tax, cess, total: tax + cess, breakdown,
            cessLabel: 'Health & Edu. Cess (4%)',
            deductions: std,
            taxableIncome: taxable,
          };
        },
      },
      {
        id: 'old',
        label: 'Old Regime (With Deductions)',
        calculate: (gross: number): TaxResult => {
          const std = 50000;
          const sec80c = 150000;
          const taxable = Math.max(0, gross - std - sec80c);
          const slabs: { limit: number; rate: number }[] = [
            { limit: 250000, rate: 0 },
            { limit: 500000, rate: 0.05 },
            { limit: 1000000, rate: 0.20 },
            { limit: Infinity, rate: 0.30 },
          ];
          let tax = 0;
          let prev = 0;
          const breakdown: TaxBreakdownItem[] = [];
          for (const slab of slabs) {
            if (taxable <= prev) break;
            const slabIncome = Math.min(taxable, slab.limit) - prev;
            const slabTax = slabIncome * slab.rate;
            tax += slabTax;
            const hi = slab.limit === Infinity ? '∞' : `₹${slab.limit / 100000}L`;
            breakdown.push({
              range: `₹${prev / 100000}L – ${hi}`,
              rate: `${slab.rate * 100}%`,
              amount: slabTax,
            });
            prev = slab.limit;
          }
          const cess = tax * 0.04;
          return {
            tax, cess, total: tax + cess, breakdown,
            note: 'Assumes std deduction ₹50K + 80C ₹1.5L',
            cessLabel: 'Health & Edu. Cess (4%)',
            deductions: std + sec80c,
            taxableIncome: taxable,
          };
        },
      },
    ],
  },

  US: {
    name: 'United States',
    flag: '🇺🇸',
    currency: '$',
    currencyCode: 'USD',
    usdRate: 1,
    incomeLabel: 'Annual Gross Income ($)',
    note: 'Federal income tax 2024. Single filer. State tax not included.',
    taxYear: '2024',
    systems: [
      {
        id: 'federal',
        label: 'Federal Tax 2024 (Single)',
        calculate: (gross: number): TaxResult => {
          const standardDeduction = 14600;
          const taxable = Math.max(0, gross - standardDeduction);
          const slabs: { limit: number; rate: number }[] = [
            { limit: 11600, rate: 0.10 },
            { limit: 47150, rate: 0.12 },
            { limit: 100525, rate: 0.22 },
            { limit: 191950, rate: 0.24 },
            { limit: 243725, rate: 0.32 },
            { limit: 609350, rate: 0.35 },
            { limit: Infinity, rate: 0.37 },
          ];
          let tax = 0;
          let prev = 0;
          const breakdown: TaxBreakdownItem[] = [];
          for (const slab of slabs) {
            if (taxable <= prev) break;
            const inc = Math.min(taxable, slab.limit) - prev;
            const t = inc * slab.rate;
            tax += t;
            if (t > 0) breakdown.push({
              range: `$${prev.toLocaleString()} – $${slab.limit === Infinity ? '∞' : slab.limit.toLocaleString()}`,
              rate: `${slab.rate * 100}%`,
              amount: t,
            });
            prev = slab.limit;
          }
          const ss = Math.min(gross, 168600) * 0.062;
          const medicare = gross * 0.0145;
          const fica = ss + medicare;
          return {
            tax, cess: fica, total: tax + fica, breakdown,
            note: `Includes FICA: SS $${Math.round(ss).toLocaleString()} + Medicare $${Math.round(medicare).toLocaleString()}`,
            cessLabel: 'FICA (SS + Medicare)',
            deductions: standardDeduction,
            taxableIncome: taxable,
          };
        },
      },
    ],
  },

  GB: {
    name: 'United Kingdom',
    flag: '🇬🇧',
    currency: '£',
    currencyCode: 'GBP',
    usdRate: 1.27,
    incomeLabel: 'Annual Gross Income (£)',
    note: 'PAYE 2024-25. England, Wales, Northern Ireland rates.',
    taxYear: '2024-25',
    systems: [
      {
        id: 'paye',
        label: 'Income Tax 2024-25',
        calculate: (gross: number): TaxResult => {
          const personalAllowance = 12570;
          const effectivePA = gross > 125140 ? 0
            : gross > 100000 ? Math.max(0, personalAllowance - (gross - 100000) / 2)
            : personalAllowance;
          const taxable = Math.max(0, gross - effectivePA);
          const slabs: { limit: number; rate: number; label: string }[] = [
            { limit: 37700, rate: 0.20, label: 'Basic rate' },
            { limit: 125140, rate: 0.40, label: 'Higher rate' },
            { limit: Infinity, rate: 0.45, label: 'Additional rate' },
          ];
          let tax = 0;
          let prev = 0;
          const breakdown: TaxBreakdownItem[] = [];
          for (const slab of slabs) {
            if (taxable <= prev) break;
            const inc = Math.min(taxable, slab.limit) - prev;
            const t = inc * slab.rate;
            tax += t;
            if (t > 0) breakdown.push({
              range: `£${prev.toLocaleString()} – £${slab.limit === Infinity ? '∞' : slab.limit.toLocaleString()}`,
              rate: `${slab.rate * 100}% (${slab.label})`,
              amount: t,
            });
            prev = slab.limit;
          }
          const ni = gross <= 12570 ? 0
            : gross <= 50270 ? (gross - 12570) * 0.08
            : (50270 - 12570) * 0.08 + (gross - 50270) * 0.02;
          return {
            tax, cess: ni, total: tax + ni, breakdown,
            note: `Includes NI: £${Math.round(ni).toLocaleString()}`,
            cessLabel: 'National Insurance',
            deductions: effectivePA,
            taxableIncome: taxable,
          };
        },
      },
    ],
  },

  DE: {
    name: 'Germany',
    flag: '🇩🇪',
    currency: '€',
    currencyCode: 'EUR',
    usdRate: 1.08,
    incomeLabel: 'Annual Gross Income (€)',
    note: 'Einkommensteuer 2024. Single, no church tax.',
    taxYear: '2024',
    systems: [
      {
        id: 'est',
        label: 'Income Tax 2024',
        calculate: (gross: number): TaxResult => {
          let tax = 0;
          const breakdown: TaxBreakdownItem[] = [];
          if (gross <= 11604) {
            tax = 0;
            breakdown.push({ range: '€0 – €11,604', rate: '0%', amount: 0 });
          } else if (gross <= 17005) {
            const y = (gross - 11604) / 10000;
            tax = (979.18 * y + 1400) * y;
            breakdown.push({ range: '€11,605 – €17,005', rate: '14–24%', amount: tax });
          } else if (gross <= 66760) {
            const z = (gross - 17005) / 10000;
            tax = (192.59 * z + 2397) * z + 966;
            breakdown.push({ range: '€17,006 – €66,760', rate: '24–42%', amount: tax });
          } else if (gross <= 277825) {
            tax = 0.42 * gross - 10602;
            breakdown.push({ range: '€66,761 – €277,825', rate: '42%', amount: tax });
          } else {
            tax = 0.45 * gross - 18936;
            breakdown.push({ range: 'Above €277,826', rate: '45%', amount: tax });
          }
          const soli = tax > 18130 ? tax * 0.055 : 0;
          const social = Math.min(gross, 90600) * 0.20;
          return {
            tax, cess: soli + social, total: tax + soli + social, breakdown,
            note: `Incl. solidarity surcharge + social contributions (~20%)`,
            cessLabel: 'Solidarity + Social',
          };
        },
      },
    ],
  },

  CA: {
    name: 'Canada',
    flag: '🇨🇦',
    currency: 'C$',
    currencyCode: 'CAD',
    usdRate: 0.73,
    incomeLabel: 'Annual Gross Income (C$)',
    note: 'Federal tax 2024. Provincial tax varies — not included.',
    taxYear: '2024',
    systems: [
      {
        id: 'federal',
        label: 'Federal Tax 2024',
        calculate: (gross: number): TaxResult => {
          const bpa = 15705;
          const taxable = Math.max(0, gross - bpa);
          const slabs: { limit: number; rate: number }[] = [
            { limit: 55867, rate: 0.15 },
            { limit: 111733, rate: 0.205 },
            { limit: 154906, rate: 0.26 },
            { limit: 220000, rate: 0.29 },
            { limit: Infinity, rate: 0.33 },
          ];
          let tax = 0;
          let prev = 0;
          const breakdown: TaxBreakdownItem[] = [];
          for (const slab of slabs) {
            if (taxable <= prev) break;
            const inc = Math.min(taxable, slab.limit) - prev;
            const t = inc * slab.rate;
            tax += t;
            if (t > 0) breakdown.push({
              range: `C$${prev.toLocaleString()} – C$${slab.limit === Infinity ? '∞' : slab.limit.toLocaleString()}`,
              rate: `${slab.rate * 100}%`,
              amount: t,
            });
            prev = slab.limit;
          }
          const cpp = Math.max(0, Math.min(gross, 68500) - 3500) * 0.0595;
          const ei = Math.min(gross, 63200) * 0.0166;
          return {
            tax, cess: cpp + ei, total: tax + cpp + ei, breakdown,
            note: `Incl. CPP C$${Math.round(cpp).toLocaleString()} + EI C$${Math.round(ei).toLocaleString()}. Add ~7-15% provincial tax.`,
            cessLabel: 'CPP + EI',
            deductions: bpa,
            taxableIncome: taxable,
          };
        },
      },
    ],
  },

  AU: {
    name: 'Australia',
    flag: '🇦🇺',
    currency: 'A$',
    currencyCode: 'AUD',
    usdRate: 0.65,
    incomeLabel: 'Annual Gross Income (A$)',
    note: 'FY2024-25. Resident. Includes Medicare levy 2%.',
    taxYear: 'FY2024-25',
    systems: [
      {
        id: 'resident',
        label: 'Income Tax FY2024-25',
        calculate: (gross: number): TaxResult => {
          const slabs: { limit: number; rate: number }[] = [
            { limit: 18200, rate: 0 },
            { limit: 45000, rate: 0.19 },
            { limit: 120000, rate: 0.325 },
            { limit: 180000, rate: 0.37 },
            { limit: Infinity, rate: 0.45 },
          ];
          let tax = 0;
          let prev = 0;
          const breakdown: TaxBreakdownItem[] = [];
          for (const slab of slabs) {
            if (gross <= prev) break;
            const inc = Math.min(gross, slab.limit) - prev;
            const t = inc * slab.rate;
            tax += t;
            if (slab.rate > 0 && t > 0) breakdown.push({
              range: `A$${prev.toLocaleString()} – A$${slab.limit === Infinity ? '∞' : slab.limit.toLocaleString()}`,
              rate: `${slab.rate * 100}%`,
              amount: t,
            });
            prev = slab.limit;
          }
          const medicare = gross * 0.02;
          const lito = gross <= 37500 ? 700
            : gross <= 45000 ? 700 - (gross - 37500) * 0.05
            : gross <= 66667 ? 325 - (gross - 45000) * 0.015
            : 0;
          const finalTax = Math.max(0, tax - lito);
          return {
            tax: finalTax, cess: medicare, total: finalTax + medicare, breakdown,
            note: `LITO offset A$${Math.round(lito).toLocaleString()} applied. Medicare levy 2% included.`,
            cessLabel: 'Medicare Levy (2%)',
          };
        },
      },
    ],
  },

  SG: {
    name: 'Singapore',
    flag: '🇸🇬',
    currency: 'S$',
    currencyCode: 'SGD',
    usdRate: 0.74,
    incomeLabel: 'Annual Gross Income (S$)',
    note: 'YA2024. Tax resident. CPF not included.',
    taxYear: 'YA2024',
    systems: [
      {
        id: 'resident',
        label: 'Income Tax YA2024',
        calculate: (gross: number): TaxResult => {
          if (gross <= 20000) return {
            tax: 0, cess: 0, total: 0, breakdown: [],
            note: 'No tax on first S$20,000',
          };
          const slabs: { limit: number; rate: number }[] = [
            { limit: 20000, rate: 0 },
            { limit: 30000, rate: 0.02 },
            { limit: 40000, rate: 0.035 },
            { limit: 80000, rate: 0.07 },
            { limit: 120000, rate: 0.115 },
            { limit: 160000, rate: 0.15 },
            { limit: 200000, rate: 0.18 },
            { limit: 240000, rate: 0.19 },
            { limit: 280000, rate: 0.195 },
            { limit: 320000, rate: 0.20 },
            { limit: 500000, rate: 0.22 },
            { limit: 1000000, rate: 0.23 },
            { limit: Infinity, rate: 0.24 },
          ];
          let tax = 0;
          let prev = 0;
          const breakdown: TaxBreakdownItem[] = [];
          for (const slab of slabs) {
            if (gross <= prev) break;
            const inc = Math.min(gross, slab.limit) - prev;
            const t = inc * slab.rate;
            tax += t;
            if (slab.rate > 0 && t > 0) breakdown.push({
              range: `S$${prev.toLocaleString()} – S$${slab.limit === Infinity ? '∞' : slab.limit.toLocaleString()}`,
              rate: `${slab.rate * 100}%`,
              amount: t,
            });
            prev = slab.limit;
          }
          return { tax, cess: 0, total: tax, breakdown };
        },
      },
    ],
  },

  AE: {
    name: 'UAE',
    flag: '🇦🇪',
    currency: 'AED',
    currencyCode: 'AED',
    usdRate: 0.27,
    incomeLabel: 'Annual Gross Income (AED)',
    note: 'No personal income tax in the UAE.',
    taxYear: '2024',
    systems: [
      {
        id: 'none',
        label: 'Personal Income Tax',
        calculate: (_gross: number): TaxResult => ({
          tax: 0, cess: 0, total: 0,
          breakdown: [],
          note: 'UAE has ZERO personal income tax. VAT 5% on consumption.',
        }),
      },
    ],
  },

  NL: {
    name: 'Netherlands',
    flag: '🇳🇱',
    currency: '€',
    currencyCode: 'EUR',
    usdRate: 1.08,
    incomeLabel: 'Annual Gross Income (€)',
    note: 'Box 1 (work income) 2024. Includes national insurance.',
    taxYear: '2024',
    systems: [
      {
        id: 'box1',
        label: 'Box 1 — Work Income 2024',
        calculate: (gross: number): TaxResult => {
          const slabs: { limit: number; rate: number; label: string }[] = [
            { limit: 75518, rate: 0.3697, label: 'incl. national insurance' },
            { limit: Infinity, rate: 0.495, label: 'top rate' },
          ];
          let tax = 0;
          let prev = 0;
          const breakdown: TaxBreakdownItem[] = [];
          for (const slab of slabs) {
            if (gross <= prev) break;
            const inc = Math.min(gross, slab.limit) - prev;
            const t = inc * slab.rate;
            tax += t;
            if (t > 0) breakdown.push({
              range: `€${prev.toLocaleString()} – €${slab.limit === Infinity ? '∞' : slab.limit.toLocaleString()}`,
              rate: `${(slab.rate * 100).toFixed(1)}% (${slab.label})`,
              amount: t,
            });
            prev = slab.limit;
          }
          const credit = gross <= 24812 ? 3362
            : gross <= 75518 ? Math.max(0, 3362 - (gross - 24812) * 0.06095)
            : 0;
          const finalTax = Math.max(0, tax - credit);
          return {
            tax: finalTax, cess: 0, total: finalTax, breakdown,
            note: `General tax credit €${Math.round(credit).toLocaleString()} applied`,
          };
        },
      },
    ],
  },

  SE: {
    name: 'Sweden',
    flag: '🇸🇪',
    currency: 'kr',
    currencyCode: 'SEK',
    usdRate: 0.095,
    incomeLabel: 'Annual Gross Income (kr)',
    note: '2024 estimate. Municipal ~32% + state tax. Varies by municipality.',
    taxYear: '2024',
    systems: [
      {
        id: 'income',
        label: 'Income Tax 2024 (estimate)',
        calculate: (gross: number): TaxResult => {
          const municipal = gross * 0.32;
          const stateTax = gross > 598500 ? (gross - 598500) * 0.20 : 0;
          const tax = municipal + stateTax;
          const breakdown: TaxBreakdownItem[] = [
            { range: 'All income', rate: '32%', amount: municipal },
          ];
          if (stateTax > 0) breakdown.push({
            range: 'Above kr598,500', rate: '+20% (state)', amount: stateTax,
          });
          const social = gross * 0.07;
          return {
            tax, cess: social, total: tax + social, breakdown,
            note: 'Municipal rate assumed 32%. Actual rate varies by municipality.',
            cessLabel: 'Social contributions (7%)',
          };
        },
      },
    ],
  },

  JP: {
    name: 'Japan',
    flag: '🇯🇵',
    currency: '¥',
    currencyCode: 'JPY',
    usdRate: 0.0067,
    incomeLabel: 'Annual Gross Income (¥)',
    note: 'National income tax 2024. Resident tax ~10% additional.',
    taxYear: '2024',
    systems: [
      {
        id: 'national',
        label: 'National Income Tax 2024',
        calculate: (gross: number): TaxResult => {
          let deduction = 0;
          if (gross <= 1625000) deduction = 550000;
          else if (gross <= 1800000) deduction = gross * 0.4 - 100000;
          else if (gross <= 3600000) deduction = gross * 0.3 + 80000;
          else if (gross <= 6600000) deduction = gross * 0.2 + 440000;
          else if (gross <= 8500000) deduction = gross * 0.1 + 1100000;
          else deduction = 1950000;
          const taxable = Math.max(0, gross - deduction - 480000);
          const slabs: { limit: number; rate: number }[] = [
            { limit: 1950000, rate: 0.05 },
            { limit: 3300000, rate: 0.10 },
            { limit: 6950000, rate: 0.20 },
            { limit: 9000000, rate: 0.23 },
            { limit: 18000000, rate: 0.33 },
            { limit: 40000000, rate: 0.40 },
            { limit: Infinity, rate: 0.45 },
          ];
          let tax = 0;
          let prev = 0;
          const breakdown: TaxBreakdownItem[] = [];
          for (const slab of slabs) {
            if (taxable <= prev) break;
            const inc = Math.min(taxable, slab.limit) - prev;
            const t = inc * slab.rate;
            tax += t;
            if (t > 0) breakdown.push({
              range: `¥${(prev / 10000).toFixed(0)}万 – ¥${slab.limit === Infinity ? '∞' : (slab.limit / 10000).toFixed(0) + '万'}`,
              rate: `${slab.rate * 100}%`,
              amount: t,
            });
            prev = slab.limit;
          }
          const surtax = tax * 0.021;
          const resident = taxable * 0.10;
          return {
            tax, cess: surtax + resident, total: tax + surtax + resident, breakdown,
            note: 'Incl. reconstruction surtax + ~10% resident tax',
            cessLabel: 'Surtax + Resident tax',
            deductions: deduction + 480000,
            taxableIncome: taxable,
          };
        },
      },
    ],
  },

  BR: {
    name: 'Brazil',
    flag: '🇧🇷',
    currency: 'R$',
    currencyCode: 'BRL',
    usdRate: 0.20,
    incomeLabel: 'Annual Gross Income (R$)',
    note: 'IRPF 2024. Monthly rates applied annually.',
    taxYear: '2024',
    systems: [
      {
        id: 'irpf',
        label: 'IRPF 2024',
        calculate: (gross: number): TaxResult => {
          const monthly = gross / 12;
          let monthlyTax = 0;
          if (monthly <= 2259.20) {
            monthlyTax = 0;
          } else if (monthly <= 2826.65) {
            monthlyTax = (monthly - 2259.20) * 0.075;
          } else if (monthly <= 3751.05) {
            monthlyTax = (2826.65 - 2259.20) * 0.075 + (monthly - 2826.65) * 0.15;
          } else if (monthly <= 4664.68) {
            monthlyTax = (2826.65 - 2259.20) * 0.075 + (3751.05 - 2826.65) * 0.15 + (monthly - 3751.05) * 0.225;
          } else {
            monthlyTax = (2826.65 - 2259.20) * 0.075 + (3751.05 - 2826.65) * 0.15 + (4664.68 - 3751.05) * 0.225 + (monthly - 4664.68) * 0.275;
          }
          const annualTax = monthlyTax * 12;
          const breakdown: TaxBreakdownItem[] = [
            { range: 'Based on monthly income', rate: 'Progressive', amount: annualTax },
          ];
          const inss = Math.min(gross, 90720) * 0.09;
          return {
            tax: annualTax, cess: inss, total: annualTax + inss, breakdown,
            note: 'INSS social security included (simplified)',
            cessLabel: 'INSS',
          };
        },
      },
    ],
  },

  ZA: {
    name: 'South Africa',
    flag: '🇿🇦',
    currency: 'R',
    currencyCode: 'ZAR',
    usdRate: 0.054,
    incomeLabel: 'Annual Gross Income (R)',
    note: '2024-25. Includes primary rebate.',
    taxYear: '2024-25',
    systems: [
      {
        id: 'paye',
        label: 'PAYE 2024-25',
        calculate: (gross: number): TaxResult => {
          const slabs: { limit: number; rate: number }[] = [
            { limit: 237100, rate: 0.18 },
            { limit: 370500, rate: 0.26 },
            { limit: 512800, rate: 0.31 },
            { limit: 673000, rate: 0.36 },
            { limit: 857900, rate: 0.39 },
            { limit: 1817000, rate: 0.41 },
            { limit: Infinity, rate: 0.45 },
          ];
          let tax = 0;
          let prev = 0;
          const breakdown: TaxBreakdownItem[] = [];
          for (const slab of slabs) {
            if (gross <= prev) break;
            const inc = Math.min(gross, slab.limit) - prev;
            const t = inc * slab.rate;
            tax += t;
            if (t > 0) breakdown.push({
              range: `R${prev.toLocaleString()} – R${slab.limit === Infinity ? '∞' : slab.limit.toLocaleString()}`,
              rate: `${slab.rate * 100}%`,
              amount: t,
            });
            prev = slab.limit;
          }
          const rebate = 17235;
          const finalTax = Math.max(0, tax - rebate);
          return {
            tax: finalTax, cess: 0, total: finalTax, breakdown,
            note: `Primary rebate R${rebate.toLocaleString()} applied`,
          };
        },
      },
    ],
  },

  NZ: {
    name: 'New Zealand',
    flag: '🇳🇿',
    currency: 'NZ$',
    currencyCode: 'NZD',
    usdRate: 0.61,
    incomeLabel: 'Annual Gross Income (NZ$)',
    note: '2024-25. Includes ACC earners levy.',
    taxYear: '2024-25',
    systems: [
      {
        id: 'paye',
        label: 'Income Tax 2024-25',
        calculate: (gross: number): TaxResult => {
          const slabs: { limit: number; rate: number }[] = [
            { limit: 14000, rate: 0.105 },
            { limit: 48000, rate: 0.175 },
            { limit: 70000, rate: 0.30 },
            { limit: 180000, rate: 0.33 },
            { limit: Infinity, rate: 0.39 },
          ];
          let tax = 0;
          let prev = 0;
          const breakdown: TaxBreakdownItem[] = [];
          for (const slab of slabs) {
            if (gross <= prev) break;
            const inc = Math.min(gross, slab.limit) - prev;
            const t = inc * slab.rate;
            tax += t;
            if (t > 0) breakdown.push({
              range: `NZ$${prev.toLocaleString()} – NZ$${slab.limit === Infinity ? '∞' : slab.limit.toLocaleString()}`,
              rate: `${slab.rate * 100}%`,
              amount: t,
            });
            prev = slab.limit;
          }
          const acc = Math.min(gross, 142283) * 0.016;
          return {
            tax, cess: acc, total: tax + acc, breakdown,
            note: `ACC earners levy NZ$${Math.round(acc).toLocaleString()} included`,
            cessLabel: 'ACC Levy',
          };
        },
      },
    ],
  },

  FR: {
    name: 'France',
    flag: '🇫🇷',
    currency: '€',
    currencyCode: 'EUR',
    usdRate: 1.08,
    incomeLabel: 'Annual Gross Income (€)',
    note: '2024 barème. Single (1 part). Social charges not included.',
    taxYear: '2024',
    systems: [
      {
        id: 'bareme',
        label: 'Impôt sur le revenu 2024',
        calculate: (gross: number): TaxResult => {
          const deduction = Math.min(Math.max(gross * 0.10, 495), 14171);
          const taxable = gross - deduction;
          const slabs: { limit: number; rate: number }[] = [
            { limit: 11294, rate: 0 },
            { limit: 28797, rate: 0.11 },
            { limit: 82341, rate: 0.30 },
            { limit: 177106, rate: 0.41 },
            { limit: Infinity, rate: 0.45 },
          ];
          let tax = 0;
          let prev = 0;
          const breakdown: TaxBreakdownItem[] = [];
          for (const slab of slabs) {
            if (taxable <= prev) break;
            const inc = Math.min(taxable, slab.limit) - prev;
            const t = inc * slab.rate;
            tax += t;
            if (slab.rate > 0 && t > 0) breakdown.push({
              range: `€${prev.toLocaleString()} – €${slab.limit === Infinity ? '∞' : slab.limit.toLocaleString()}`,
              rate: `${slab.rate * 100}%`,
              amount: t,
            });
            prev = slab.limit;
          }
          return {
            tax, cess: 0, total: tax, breakdown,
            note: `Professional expenses deduction €${Math.round(deduction).toLocaleString()} applied`,
            deductions: deduction,
            taxableIncome: taxable,
          };
        },
      },
    ],
  },
};

export default TAX_SYSTEMS;
