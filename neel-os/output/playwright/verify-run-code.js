async (page) => {
  const base = 'http://127.0.0.1:3102'
  const shotDir = 'D:/Neel.OS/neel-os/output/playwright'
  const EMAIL = 'neel1234kachhadia@gmail.com'
  const results = {}
  const notes = {}
  const consoleIssues = []
  const screenshots = []

  page.on('console', msg => {
    if (msg.type() === 'error') consoleIssues.push(msg.text())
  })
  page.on('pageerror', err => consoleIssues.push(err.message))

  function add(group, name, passed, detail = '') {
    if (!results[group]) results[group] = []
    results[group].push({ name, passed: !!passed, detail })
  }
  function note(group, text) {
    if (!notes[group]) notes[group] = []
    notes[group].push(text)
  }
  async function bodyText() {
    try { return await page.locator('body').innerText({ timeout: 2000 }) } catch { return '' }
  }
  async function hasText(text, timeout = 2500) {
    try {
      await page.waitForFunction(t => document.body.innerText.includes(t), text, { timeout })
      return true
    } catch { return false }
  }
  async function waitText(text, timeout = 10000) {
    return hasText(text, timeout)
  }
  async function screenshot(name) {
    const p = `${shotDir}/${name}`
    await page.screenshot({ path: p, fullPage: true })
    screenshots.push(name)
  }
  async function noCardPanelClasses() {
    return await page.evaluate(() => !Array.from(document.querySelectorAll('[class]')).some(el => /card|panel/i.test(String(el.getAttribute('class') || ''))))
  }
  async function setupRoot(viewport = { width: 1440, height: 900 }) {
    await page.setViewportSize(viewport)
    await page.goto(base, { waitUntil: 'domcontentloaded' })
    await page.evaluate(() => { localStorage.clear(); sessionStorage.clear() })
    await page.reload({ waitUntil: 'domcontentloaded' })
    if (viewport.width >= 768) {
      if (await hasText('Resume previous session?', 5000)) {
        await page.locator('button').filter({ hasText: /start fresh/i }).first().click({ timeout: 5000 })
      }
      const sawAudioGate = await waitText('enable system audio?', 20000)
      if (sawAudioGate) {
        await page.locator('button').filter({ hasText: /^\[n/ }).first().click({ timeout: 5000 })
      }
      const ready = await waitText('AVAILABLE COMMANDS', 15000)
      if (!ready) {
        const preview = (await bodyText()).slice(0, 500)
        throw new Error(`terminal root did not become ready; body preview: ${preview}`)
      }
    } else {
      const ready = await waitText('NEEL KACHHADIA', 10000)
      if (!ready) {
        const preview = (await bodyText()).slice(0, 500)
        throw new Error(`mobile root did not become ready; body preview: ${preview}`)
      }
    }
  }
  async function runCommand(cmd, waitFor) {
    const input = page.getByLabel('Terminal input')
    await input.fill(cmd)
    await input.press('Enter')
    if (waitFor) await waitText(waitFor, 12000)
  }
  async function clickButtonMatching(pattern) {
    const btn = page.locator('button').filter({ hasText: pattern }).first()
    await btn.click({ timeout: 6000 })
  }
  function regexCount(text, regex) {
    const m = text.match(regex)
    return m ? m.length : 0
  }

  try {
    await setupRoot()
    let text = await bodyText()
    add('CHECK 01', 'page does not contain /capabilities before command', !text.includes('/capabilities'))
    const availableBlock = text.slice(text.indexOf('AVAILABLE COMMANDS'))
    add('CHECK 01', 'AVAILABLE COMMANDS omits capabilities', !/capabilities/i.test(availableBlock))
    await runCommand('/capabilities', 'command not found: /capabilities')
    text = await bodyText()
    add('CHECK 01', 'unknown command response shown', text.includes('command not found: /capabilities'))
    add('CHECK 01', 'no capabilities state transition', !text.includes('Opening /neel/capabilities'))
  } catch (e) { add('CHECK 01', 'group execution', false, String(e.message || e)) }

  try {
    await setupRoot()
    await screenshot('terminal_root.png')
    text = await bodyText()
    add('CHECK 02', 'NEEL KACHHADIA visible', text.includes('NEEL KACHHADIA'))
    add('CHECK 02', 'Mumbai education line visible', text.includes('B.Tech · DJSCE Mumbai · 2024-28'))
    add('CHECK 02', 'AVAILABLE COMMANDS visible', text.includes('AVAILABLE COMMANDS'))
    add('CHECK 02', 'run neurofin visible', text.includes('run neurofin'))
    add('CHECK 02', 'run equity visible', text.includes('run equity'))
    add('CHECK 02', 'run market visible', text.includes('run market'))
    add('CHECK 02', 'ssh transmission visible', text.includes('ssh transmission'))
    add('CHECK 02', 'sudo hire-neel visible', text.includes('sudo hire-neel'))
    add('CHECK 02', '/capabilities not visible', !text.includes('/capabilities'))
    add('CHECK 02', 'uptime HH:MM:SS visible', /uptime:\s*\d{2}:\d{2}:\d{2}/.test(text))
    add('CHECK 02', 'ONLINE visible', text.includes('ONLINE'))
    add('CHECK 02', 'SYSTEM HEALTH visible', text.includes('SYSTEM HEALTH'))
    add('CHECK 02', 'press / hint absent', !text.includes('press / to open terminal'))
  } catch (e) { add('CHECK 02', 'group execution', false, String(e.message || e)) }

  try {
    await runCommand('run neurofin', 'NEUROFIN')
    await page.waitForTimeout(3500)
    await screenshot('neurofin_entry.png')
    text = await bodyText()
    add('CHECK 03', 'path indicator/prompt shows neurofin', text.includes('/projects/neurofin'))
    add('CHECK 03', 'NEUROFIN header visible', text.includes('NEUROFIN'))
    add('CHECK 03', 'LIVE marker visible', text.includes('LIVE ●'))
    for (const label of ['trace', 'calculate', 'ask', 'readme', 'git log']) add('CHECK 03', `${label} command visible`, text.includes(label))
    add('CHECK 03', 'no card/panel classes', await noCardPanelClasses())
    add('CHECK 03', 'prompt before content visible', text.includes('root@neel:/projects/neurofin $'))
    add('CHECK 03', 'AgentTrace bars/text visible', text.includes('budget-agent') || text.includes('forecast-agent'))
    add('CHECK 03', 'exit button visible', text.includes('← exit') || text.includes('← root@neel:~$'))
    await clickButtonMatching(/^readme$/)
    await waitText('cat readme.md', 5000)
    text = await bodyText()
    add('CHECK 03', 'readme prompt visible', text.includes('cat readme.md'))
    add('CHECK 03', '12 specialist agents visible', text.includes('12 specialist agents'))
    add('CHECK 03', 'Sub-200ms visible', text.includes('Sub-200ms'))
    await clickButtonMatching(/^git log$/)
    await waitText('git log --oneline', 5000)
    text = await bodyText()
    add('CHECK 03', 'git prompt visible', text.includes('git log --oneline'))
    add('CHECK 03', 'e9b3f07 visible', text.includes('e9b3f07'))
    add('CHECK 03', '7 commit hashes visible', regexCount(text, /\b[0-9a-f]{7}\b/g) >= 7)
  } catch (e) { add('CHECK 03', 'group execution', false, String(e.message || e)) }

  try {
    await clickButtonMatching(/^calculate$/)
    await waitText('run calculate', 5000)
    text = await bodyText()
    add('CHECK 04', 'calculate prompt visible', text.includes('run calculate'))
    add('CHECK 04', 'income input visible', await page.locator('input[placeholder="0"]').count() > 0)
    add('CHECK 04', 'calculate button visible', text.includes('CALCULATE'))
    add('CHECK 04', 'country selector visible', text.includes('India') || text.includes('COUNTRY'))
    await page.locator('input[placeholder="0"]').first().fill('1200000')
    await clickButtonMatching(/CALCULATE/)
    await page.waitForTimeout(3000)
    text = await bodyText()
    add('CHECK 04', 'AgentTrace fires/visible', text.includes('budget-agent') || text.includes('Tax estimate'))
    add('CHECK 04', 'output section visible', text.includes('INCOME TAX') || text.includes('TOTAL TAX'))
    add('CHECK 04', 'INCOME TAX label visible', text.includes('INCOME TAX'))
    add('CHECK 04', 'NET TAX PAYABLE/TOTAL TAX label visible', text.includes('NET TAX PAYABLE') || text.includes('TOTAL TAX'))
    add('CHECK 04', 'rupee amount visible', /₹\s?[0-9,]+/.test(text))
  } catch (e) { add('CHECK 04', 'group execution', false, String(e.message || e)) }

  try {
    await clickButtonMatching(/exit/)
    await waitText('AVAILABLE COMMANDS', 8000)
    await screenshot('back_to_root.png')
    text = await bodyText()
    add('CHECK 05', 'terminal root visible', text.includes('NEEL KACHHADIA'))
    add('CHECK 05', 'available commands visible', text.includes('AVAILABLE COMMANDS'))
    add('CHECK 05', 'neurofin world not visible', !text.includes('AI FINANCIAL ASSISTANT'))
  } catch (e) { add('CHECK 05', 'group execution', false, String(e.message || e)) }

  try {
    await runCommand('run equity', 'EQUITY RESEARCH')
    await page.waitForTimeout(3000)
    await screenshot('equity_entry.png')
    text = await bodyText()
    add('CHECK 06', 'EQUITY RESEARCH header visible', text.includes('EQUITY RESEARCH'))
    for (const label of ['thesis', 'analyse', 'chart', 'ask']) add('CHECK 06', `${label} command visible`, text.includes(label))
    add('CHECK 06', 'equity prompt visible', text.includes('root@neel:/projects/equity-research $'))
    add('CHECK 06', 'Thesis signals visible', text.includes('SIGNALS RETRIEVED') || text.includes('relevance'))
    add('CHECK 06', 'no card/panel classes', await noCardPanelClasses())
    await clickButtonMatching(/^analyse$/)
    await waitText('INDIA', 5000)
    text = await bodyText()
    add('CHECK 06', 'company selector visible', text.includes('Click a name') || text.includes('analyse {SYMBOL}'))
    add('CHECK 06', 'INDIA heading visible', text.includes('INDIA'))
    add('CHECK 06', 'GLOBAL heading visible', text.includes('GLOBAL'))
    add('CHECK 06', 'RELIANCE option visible', text.includes('RELIANCE'))
    add('CHECK 06', 'AAPL option visible', text.includes('AAPL'))
    await clickButtonMatching(/^RELIANCE$/)
    await page.waitForTimeout(1000)
    text = await bodyText()
    add('CHECK 06', 'RELIANCE INDUSTRIES visible', text.includes('RELIANCE INDUSTRIES'))
    add('CHECK 06', 'P/E Ratio visible', text.includes('P/E Ratio'))
    add('CHECK 06', 'ANALYST CONSENSUS visible', text.includes('ANALYST CONSENSUS'))
    add('CHECK 06', 'LANGGRAPH THESIS visible', text.includes('LANGGRAPH THESIS'))
  } catch (e) { add('CHECK 06', 'group execution', false, String(e.message || e)) }

  try {
    await clickButtonMatching(/exit/)
    await waitText('AVAILABLE COMMANDS', 8000)
    await runCommand('run market', 'NEEL TERMINAL')
    await page.waitForTimeout(2500)
    await screenshot('market_entry.png')
    text = await bodyText()
    add('CHECK 07', 'NEEL TERMINAL header visible', text.includes('NEEL TERMINAL'))
    for (const label of ['[EQUITY]', '[OPTIONS]', '[CHARTS]', '[ALERTS]', '[PORTFOLIO]', '[F1:HELP]']) add('CHECK 07', `${label} visible`, text.includes(label))
    add('CHECK 07', 'NIFTY 50 visible', text.includes('NIFTY 50'))
    add('CHECK 07', 'BANKNIFTY visible', text.includes('BANKNIFTY'))
    add('CHECK 07', 'price chart svg visible', await page.locator('svg.recharts-surface').count() > 0)
    add('CHECK 07', 'OPTIONS CHAIN visible', text.includes('OPTIONS CHAIN'))
    add('CHECK 07', 'tick stream visible', text.includes('TICK STREAM') && /\d{2}:\d{2}:\d{2}/.test(text))
    add('CHECK 07', 'RUST CORE visible', text.includes('RUST CORE'))
    add('CHECK 07', 'progress chars visible', text.includes('████'))
    await clickButtonMatching(/\[OPTIONS\]/)
    await page.waitForTimeout(500)
    text = await bodyText()
    add('CHECK 07', 'options data visible in options view', text.includes('OPTIONS CHAIN'))
    add('CHECK 07', 'DELTA column visible', text.includes('DELTA'))
    add('CHECK 07', 'GAMMA column visible', text.includes('GAMMA'))
    await clickButtonMatching(/\[CHARTS\]/)
    await page.waitForTimeout(500)
    add('CHECK 07', 'chart visible in charts view', await page.locator('svg.recharts-surface').count() > 0)
    await clickButtonMatching(/\[ALERTS\]/)
    await page.waitForTimeout(500)
    text = await bodyText()
    add('CHECK 07', 'alerts content visible', text.includes('FIBONACCI ALERT HISTORY') || text.includes('No alerts'))
    await clickButtonMatching(/\[F1:HELP\]/)
    await page.waitForTimeout(500)
    text = await bodyText()
    add('CHECK 07', 'command list visible', text.includes('AVAILABLE COMMANDS'))
  } catch (e) { add('CHECK 07', 'group execution', false, String(e.message || e)) }

  try {
    await setupRoot()
    await page.getByRole('button', { name: /Switch to recruiter mode/i }).click()
    await waitText('CANDIDATE DOSSIER', 5000)
    await screenshot('recruiter_dossier.png')
    text = await bodyText()
    for (const item of ['CONFIDENTIAL', 'CANDIDATE DOSSIER', 'NEEL KACHHADIA', 'THE SYSTEMS', 'NeuroFin', '[LIVE ●]', 'Equity Research', 'Market Terminal', '[70%', 'NEEL.OS', 'THE PROOF', 'Amazon 10K AI', 'Mumbai Hacks', 'STACK DEPTH', 'AI/ML', 'LangGraph', 'DOWNLOAD RESUME', 'EMAIL NOW', 'Most people his age are learning', 'ENTER SYSTEM']) {
      add('CHECK 08', `${item} visible`, text.includes(item))
    }
    await clickButtonMatching(/ENTER SYSTEM/)
    await waitText('AVAILABLE COMMANDS', 5000)
    text = await bodyText()
    add('CHECK 08', 'terminal root visible after enter', text.includes('NEEL KACHHADIA') && text.includes('AVAILABLE COMMANDS'))
  } catch (e) { add('CHECK 08', 'group execution', false, String(e.message || e)) }

  try {
    await runCommand('ssh transmission', 'generating public channel')
    await page.waitForTimeout(1200)
    await screenshot('transmission.png')
    text = await bodyText()
    add('CHECK 09', 'ssh prompt visible', text.includes('ssh neel@transmission'))
    add('CHECK 09', 'generating public channel visible', text.includes('generating public channel'))
    add('CHECK 09', 'email visible', text.includes(EMAIL))
    const emailMetric = await page.evaluate(email => {
      const matches = Array.from(document.querySelectorAll('*')).filter(el => (el.textContent || '').trim() === email)
        .map(el => ({ fontSize: parseFloat(getComputedStyle(el).fontSize), tag: el.tagName }))
        .sort((a, b) => b.fontSize - a.fontSize)[0]
      return matches || null
    }, EMAIL)
    add('CHECK 09', 'email is large', !!emailMetric && emailMetric.fontSize > 40, emailMetric ? String(emailMetric.fontSize) : 'not found')
    add('CHECK 09', 'tagline visible', text.includes("Let's build something unreasonable."))
    const unreasonableColor = await page.evaluate(() => {
      const el = Array.from(document.querySelectorAll('span')).find(e => (e.textContent || '').trim() === 'unreasonable')
      return el ? getComputedStyle(el).color : ''
    })
    add('CHECK 09', 'unreasonable is expected lime', unreasonableColor === 'rgb(200, 240, 39)', unreasonableColor)
    add('CHECK 09', 'exit visible', text.includes('← exit'))
    const clickedEmail = await page.evaluate(email => {
      const matches = Array.from(document.querySelectorAll('*')).filter(el => (el.textContent || '').trim() === email)
      const el = matches.sort((a, b) => parseFloat(getComputedStyle(b).fontSize) - parseFloat(getComputedStyle(a).fontSize))[0]
      if (!el) return false
      ;(el).dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, clientX: 400, clientY: 400 }))
      return true
    }, EMAIL)
    await page.waitForTimeout(700)
    text = await bodyText()
    add('CHECK 09', 'copy confirmation visible', clickedEmail && /copied/i.test(text))
  } catch (e) { add('CHECK 09', 'group execution', false, String(e.message || e)) }

  try {
    await clickButtonMatching(/exit/)
    await waitText('AVAILABLE COMMANDS', 8000)
    const input = page.getByLabel('Terminal input')
    await input.fill('sudo hire-neel')
    await input.press('Enter')
    const sawPassword = await hasText('password for visitor', 1500)
    const sawMask = await hasText('████████', 1500)
    const sawAccess = await hasText('Access granted', 2500)
    const sawSsh = await hasText('ssh neel@transmission connected', 2500)
    await screenshot('sudo_sequence.png')
    add('CHECK 10', 'password text visible during sequence', sawPassword)
    add('CHECK 10', 'password mask visible during sequence', sawMask)
    add('CHECK 10', 'Access granted appears', sawAccess)
    add('CHECK 10', 'ssh connected appears', sawSsh)
    await waitText(EMAIL, 6000)
    text = await bodyText()
    add('CHECK 10', 'transmission visible after sequence', text.includes(EMAIL))
  } catch (e) { add('CHECK 10', 'group execution', false, String(e.message || e)) }

  try {
    await page.goto(`${base}/nonexistent-route`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(1000)
    await screenshot('404_kernel_panic.png')
    text = await bodyText()
    add('CHECK 11', 'KERNEL PANIC visible', text.includes('KERNEL PANIC'))
    add('CHECK 11', 'route not found visible', text.includes('route not found'))
    add('CHECK 11', '/identity mount visible', text.includes('/identity'))
    add('CHECK 11', '/projects mount visible', text.includes('/projects'))
    add('CHECK 11', '/capabilities absent', !text.includes('/capabilities'))
    add('CHECK 11', 'reboot button visible', text.includes('reboot to /neel'))
    await clickButtonMatching(/reboot to \/neel/)
    await page.waitForTimeout(1000)
    text = await bodyText()
    add('CHECK 11', 'boot or terminal root visible after reboot', text.includes('NEEL.OS') || text.includes('NEEL KACHHADIA'))
  } catch (e) { add('CHECK 11', 'group execution', false, String(e.message || e)) }

  try {
    await page.goto(base, { waitUntil: 'networkidle' })
    const scriptPayloads = await page.evaluate(async () => {
      const srcs = Array.from(document.scripts).map(s => s.src).filter(Boolean)
      const inline = Array.from(document.scripts).map(s => s.textContent || '')
      const fetched = []
      for (const src of srcs) {
        try { fetched.push(await fetch(src).then(r => r.text())) } catch { fetched.push('') }
      }
      return { srcs, inline, fetched }
    })
    const allClient = [...scriptPayloads.inline, ...scriptPayloads.fetched].join('\n')
    add('CHECK 12', 'no gsk_ in client scripts', !allClient.includes('gsk_'))
    add('CHECK 12', 'no GROQ_API_KEY in client scripts', !allClient.includes('GROQ_API_KEY'))
    add('CHECK 12', 'no KV_REST_API in client scripts', !allClient.includes('KV_REST_API'))
    await page.goto(`${base}/_next/static/chunks/`, { waitUntil: 'domcontentloaded' })
    text = await bodyText()
    add('CHECK 12', 'chunk directory page has no gsk_', !text.includes('gsk_'))
    add('CHECK 12', 'client chunks have no NEXT_PUBLIC_GROQ', !allClient.includes('NEXT_PUBLIC_GROQ'))
  } catch (e) { add('CHECK 12', 'group execution', false, String(e.message || e)) }

  try {
    const seriousBefore = consoleIssues.filter(t => /TypeError|undefined|Minified React error|WebGL shader/i.test(t))
    await setupRoot()
    await page.waitForTimeout(1000)
    await runCommand('run neurofin', 'NEUROFIN')
    await page.waitForTimeout(1000)
    await clickButtonMatching(/exit/)
    await waitText('AVAILABLE COMMANDS', 8000)
    await runCommand('run market', 'NEEL TERMINAL')
    await page.waitForTimeout(1000)
    const seriousAfter = consoleIssues.filter(t => /TypeError|undefined|Minified React error|WebGL shader/i.test(t))
    add('CHECK 13', 'no serious console errors on load/transitions', seriousAfter.length === seriousBefore.length, seriousAfter.slice(seriousBefore.length).join(' | '))
    add('CHECK 13', 'no Minified React error', !consoleIssues.some(t => /Minified React error/i.test(t)))
    add('CHECK 13', 'no WebGL shader compile errors', !consoleIssues.some(t => /WebGL shader/i.test(t)))
  } catch (e) { add('CHECK 13', 'group execution', false, String(e.message || e)) }

  try {
    await setupRoot({ width: 390, height: 844 })
    await screenshot('mobile_terminal.png')
    text = await bodyText()
    add('CHECK 14', 'PocketShell/mobile renders', text.includes('NEEL.OS') && text.includes('PROJECTS') && !text.includes('AVAILABLE COMMANDS'))
    for (const label of ['PROJECTS', 'STACK', 'LOGS', 'CONTACT']) add('CHECK 14', `${label} bottom button visible`, text.includes(label))
    add('CHECK 14', 'RECRUITER mode button visible', text.includes('[RECRUITER]'))
    const noOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)
    add('CHECK 14', 'no horizontal overflow', noOverflow)
    add('CHECK 14', 'NEEL KACHHADIA visible', text.includes('NEEL KACHHADIA'))
    await page.setViewportSize({ width: 1440, height: 900 })
  } catch (e) { add('CHECK 14', 'group execution', false, String(e.message || e)) }

  const groupNames = ['CHECK 01','CHECK 02','CHECK 03','CHECK 04','CHECK 05','CHECK 06','CHECK 07','CHECK 08','CHECK 09','CHECK 10','CHECK 11','CHECK 12','CHECK 13','CHECK 14']
  const titles = {
    'CHECK 01': 'Capabilities removed',
    'CHECK 02': 'Terminal root layout',
    'CHECK 03': 'NeuroFin terminal style',
    'CHECK 04': 'Tax Calculator',
    'CHECK 05': 'Back navigation',
    'CHECK 06': 'Equity terminal style',
    'CHECK 07': 'Bloomberg terminal',
    'CHECK 08': 'Recruiter dossier',
    'CHECK 09': 'Transmission',
    'CHECK 10': 'sudo hire-neel',
    'CHECK 11': '404 kernel panic',
    'CHECK 12': 'Security',
    'CHECK 13': 'Performance/errors',
    'CHECK 14': 'Mobile viewport',
  }
  const failingGroups = []
  const lines = []
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  lines.push('PLAYWRIGHT BROWSER VERIFICATION REPORT')
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  let passCount = 0
  let failCount = 0
  for (const g of groupNames) {
    const checks = results[g] || [{ name: 'not executed', passed: false, detail: '' }]
    const ok = checks.every(c => c.passed)
    if (ok) passCount++; else { failCount++; failingGroups.push(g) }
    const failed = checks.filter(c => !c.passed)
    lines.push(`${g} — ${titles[g].padEnd(28)} ${ok ? 'PASS' : 'FAIL'}${failed.length ? '  ' + failed.map(f => `${f.name}${f.detail ? ` (${f.detail})` : ''}`).join('; ') : ''}`)
  }
  lines.push('')
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  lines.push(`TOTAL: ${passCount} PASS  ${failCount} FAIL`)
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  lines.push('')
  lines.push('CRITICAL FAILURES (fix before deploy):')
  if (failingGroups.length) failingGroups.forEach(g => lines.push(`  ${g} — ${titles[g]}`)); else lines.push('  none')
  lines.push('')
  lines.push('NON-CRITICAL FAILURES (polish):')
  lines.push('  none')
  lines.push('')
  lines.push('SCREENSHOTS SAVED:')
  for (const s of screenshots) lines.push(`  ${s}`)
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  return lines.join('\n')
}
