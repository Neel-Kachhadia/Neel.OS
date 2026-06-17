import TAX_SYSTEMS from '@/lib/taxData';
import { COMPANIES, Company } from '@/lib/companies';

type ProjectKind = 'neurofin' | 'equity' | 'market';

interface MarketLikePrice {
  price: number;
  change: number;
  changePct: number;
  volume: number;
  stale?: boolean;
}

interface ProjectAskContext {
  selectedCompany?: Company | null;
  livePrice?: MarketLikePrice | null;
  range?: string;
  activeAlerts?: Array<{ symbol: string; level: string; price: number; acked?: boolean }>;
}

const COUNTRY_ALIASES: Record<string, string[]> = {
  IN: ['india', 'indian', 'inr'],
  US: ['united states', 'usa', 'america', 'us', 'usd'],
  GB: ['united kingdom', 'uk', 'britain', 'gbp'],
  AE: ['uae', 'dubai', 'united arab emirates', 'aed'],
  SG: ['singapore', 'sgd'],
  CA: ['canada', 'cad'],
  AU: ['australia', 'aud'],
  DE: ['germany', 'deutschland', 'eur'],
  FR: ['france'],
};

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9.+\s-]/g, ' ').replace(/\s+/g, ' ').trim();
}

function hasPhrase(text: string, phrase: string): boolean {
  return new RegExp(`(^|\\s)${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\s|$)`, 'i').test(text);
}

function findCountryKey(query: string): string {
  const normalized = normalizeText(query);
  for (const [key, country] of Object.entries(TAX_SYSTEMS)) {
    if (hasPhrase(normalized, key.toLowerCase())) return key;
    if (hasPhrase(normalized, normalizeText(country.name))) return key;
  }
  for (const [key, aliases] of Object.entries(COUNTRY_ALIASES)) {
    if (aliases.some(alias => hasPhrase(normalized, alias))) return key;
  }
  return 'IN';
}

function parseIncome(query: string): number | null {
  const normalized = query.toLowerCase().replace(/,/g, '');
  const unit = normalized.match(/(\d+(?:\.\d+)?)\s*(crore|cr|lakh|lac|million|mn|m|k)\b/);
  if (unit) {
    const value = Number(unit[1]);
    const suffix = unit[2];
    if (suffix === 'crore' || suffix === 'cr') return value * 10000000;
    if (suffix === 'lakh' || suffix === 'lac') return value * 100000;
    if (suffix === 'million' || suffix === 'mn' || suffix === 'm') return value * 1000000;
    if (suffix === 'k') return value * 1000;
  }

  const numbers = (normalized.match(/\b\d+(?:\.\d+)?\b/g) ?? [])
    .map(match => Number(match))
    .filter(value => Number.isFinite(value) && value > 0);
  return numbers.length ? numbers[numbers.length - 1] : null;
}

function fmtNum(value: number, countryKey = 'IN'): string {
  const rounded = Math.round(value);
  return new Intl.NumberFormat(countryKey === 'IN' ? 'en-IN' : 'en').format(rounded);
}

function fmtCurrency(value: number, countryKey: string): string {
  const country = TAX_SYSTEMS[countryKey];
  return `${country.currency}${fmtNum(value, countryKey)}`;
}

function findCompany(query: string, fallback?: Company | null): Company {
  const normalized = normalizeText(query);
  const match = COMPANIES.find(company => {
    const id = normalizeText(company.id);
    const name = normalizeText(company.name);
    return hasPhrase(normalized, id) || normalized.includes(name) || name.split(' ').some(part => part.length > 3 && hasPhrase(normalized, part));
  });
  return match ?? fallback ?? COMPANIES[0];
}

function answerNeuroFin(query: string): string {
  const normalized = normalizeText(query);
  const asksTax = /\b(tax|rate|income|salary|tds|take home|take-home)\b/i.test(normalized);

  if (asksTax) {
    const income = parseIncome(query);
    if (!income) {
      return [
        '[NEUROFIN:TAX]',
        'Give me a country and gross income.',
        'Example: tax rate of india on 12000000',
      ].join('\n');
    }

    const countryKey = findCountryKey(query);
    const country = TAX_SYSTEMS[countryKey];
    const primarySystem = country.systems[0];
    const primary = primarySystem.calculate(income);
    const effectiveRate = income > 0 ? (primary.total / income) * 100 : 0;
    const takeHomeMonthly = (income - primary.total) / 12;

    const lines = [
      `[NEUROFIN:TAX] ${country.name} - ${country.taxYear}`,
      `regime            ${primarySystem.label}`,
      `gross income      ${fmtCurrency(income, countryKey)}`,
    ];

    if (primary.taxableIncome != null) lines.push(`taxable income    ${fmtCurrency(primary.taxableIncome, countryKey)}`);
    if (primary.deductions != null && primary.deductions > 0) lines.push(`deductions        ${fmtCurrency(primary.deductions, countryKey)}`);
    lines.push(
      `total tax         ${fmtCurrency(primary.total, countryKey)}`,
      `effective rate    ${effectiveRate.toFixed(2)}%`,
      `monthly tax       ${fmtCurrency(primary.total / 12, countryKey)}`,
      `take-home / mo    ${fmtCurrency(takeHomeMonthly, countryKey)}`,
    );
    if (primary.note) lines.push(`note              ${primary.note}`);

    if (countryKey === 'IN' && country.systems[1]) {
      const old = country.systems[1].calculate(income);
      const saving = Math.abs(primary.total - old.total);
      lines.push(
        '',
        `old regime tax   ${fmtCurrency(old.total, 'IN')}`,
        `new regime tax   ${fmtCurrency(primary.total, 'IN')}`,
        `better option    ${primary.total <= old.total ? 'new regime' : 'old regime'} by ${fmtCurrency(saving, 'IN')}`,
      );
    }

    return lines.join('\n');
  }

  if (/\b(stack|architecture|langgraph|agents?)\b/i.test(normalized)) {
    return [
      '[NEUROFIN:ARCHITECTURE]',
      '12 specialist agents route through LangGraph.',
      'Budgeting, tax, risk, goals, anomaly detection, and recommendation nodes run as a coordinated pipeline.',
      'Stack: React, Python, LangGraph, AWS Lambda, S3, Docker, Groq.',
    ].join('\n');
  }

  return [
    '[NEUROFIN:QUERY]',
    'Ask about tax, agents, architecture, deployment, or the pipeline.',
    'Example: tax rate of india on 12000000',
  ].join('\n');
}

function answerEquity(query: string, context: ProjectAskContext): string {
  const company = findCompany(query, context.selectedCompany);
  const bullishPct = Math.round((company.analystBuy / company.analystTotal) * 100);

  return [
    `[EQUITY:RESEARCH] ${company.exchange}:${company.id}`,
    `company           ${company.name}`,
    `sector            ${company.sector}`,
    `market cap        ${company.marketCap}`,
    `p/e               ${company.pe}x`,
    `eps               ${company.currency}${company.eps}`,
    `revenue           ${company.revenue}`,
    `net profit        ${company.netProfit}`,
    `52w range         ${company.currency}${fmtNum(company.low52w)} - ${company.currency}${fmtNum(company.high52w)}`,
    `consensus         ${company.consensus} (${company.analystBuy} buy / ${company.analystHold} hold / ${company.analystSell} sell)`,
    `bullish score     ${bullishPct}%`,
    '',
    `thesis            ${company.description}`,
    `next              analyse ${company.id}  |  chart ${company.id}`,
  ].join('\n');
}

function answerMarket(query: string, context: ProjectAskContext): string {
  const company = findCompany(query, context.selectedCompany);
  const price = context.livePrice;
  const alert = context.activeAlerts?.find(item => !item.acked);
  const move = price ? `${price.change >= 0 ? '+' : '-'}${Math.abs(price.change).toFixed(2)} (${price.changePct >= 0 ? '+' : '-'}${Math.abs(price.changePct).toFixed(2)}%)` : 'loading';

  const lines = [
    `[MARKET:QUERY] ${company.exchange}:${company.id}`,
    `selected          ${company.name}`,
    `range             ${(context.range ?? '1d').toUpperCase()}`,
    `last price        ${price ? `${company.currency}${price.price.toFixed(2)}` : 'loading'}`,
    `move              ${move}`,
    `volume            ${price ? fmtNum(price.volume) : 'loading'}`,
    `market cap        ${company.marketCap}`,
    `p/e               ${company.pe}x`,
    `consensus         ${company.consensus}`,
  ];

  if (alert) {
    lines.push('', `active alert      ${alert.symbol} ${alert.level}`);
  } else {
    lines.push('', 'active alert      none');
  }

  lines.push('next              charts | options | alerts | chart ' + company.id);
  return lines.join('\n');
}

export function answerProjectAsk(project: ProjectKind, query: string, context: ProjectAskContext = {}): string {
  const text = query.trim();
  if (!text) return '';

  if (project === 'neurofin') return answerNeuroFin(text);
  if (project === 'equity') return answerEquity(text, context);
  return answerMarket(text, context);
}
