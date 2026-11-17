'use strict';
// Local-only rendering and content checks. Never accesses the live synthetic app.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const pages = ['docs/index.html', 'docs/portfolio/index.html', 'docs/portfolio/healthcare.html', 'docs/portfolio/hc-office-manager.html', 'docs/portfolio/healthcare-summary.html', 'docs/portfolio/hc-office-manager-summary.html', 'docs/portfolio/healthcare-presenter.html', 'docs/portfolio/healthcare-readiness.html', 'index.html', 'transcript.html'];
const status = 'Synthetic workflow verified; pilot acceptance pending.';
const evidence = process.env.PORTFOLIO_EVIDENCE_DIR || '/tmp/tsm-healthcare-portfolio-evidence-20261117';
const styles = text => text.match(/<style\b[^>]*>[\s\S]*?<\/style>/g) || [];
let checks = 0;
const check = (condition, message) => { assert.ok(condition, message); checks++; };
(async () => {
  fs.mkdirSync(evidence, { recursive: true });
  const server = http.createServer((req, res) => {
    let target;
    try { target = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://local').pathname)); }
    catch { res.writeHead(400).end(); return; }
    if (!target.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    if (!fs.existsSync(target) || !fs.statSync(target).isFile()) { res.writeHead(404).end(); return; }
    const type = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.jpg': 'image/jpeg', '.png': 'image/png', '.mp4': 'video/mp4' }[path.extname(target)] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type }); fs.createReadStream(target).pipe(res);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = 'http://127.0.0.1:' + server.address().port;
  const browser = await chromium.launch({ headless: true, ...(process.env.PORTFOLIO_CHROME ? { executablePath: process.env.PORTFOLIO_CHROME } : {}), args: ['--no-sandbox'] });
  const result = { automatedChecksOnly: true, acceptanceAttribution: 'User-run browser acceptance reviewed in ChatGPT; not re-performed by this test', screenshots: [], layouts: [] };
  try {
    for (const file of pages) {
      const current = fs.readFileSync(path.join(root, file), 'utf8');
      if (!file.endsWith('healthcare-presenter.html') && !file.endsWith('healthcare-readiness.html')) {
        const previous = execFileSync('git', ['show', '368150ec:' + file], { cwd: root, encoding: 'utf8' });
        assert.deepEqual(styles(current), styles(previous), file + ': retain existing skin'); checks++;
      }
    }
    for (const width of [1280, 390]) for (const colorScheme of ['light', 'dark']) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, colorScheme });
      // Local rendering only; font services and external destinations are not visited.
      await context.route('**/*', route => route.request().url().startsWith(origin + '/') ? route.continue() : route.abort());
      const page = await context.newPage();
      const errors = []; page.on('pageerror', e => errors.push(e.message));
      for (const file of pages) {
        await page.goto(origin + '/' + file, { waitUntil: 'domcontentloaded' });
        await page.evaluate(() => document.fonts.ready);
        const body = await page.locator('body').innerText();
        check(body.toLowerCase().includes(status.toLowerCase()), file + ': status');
        check(body.includes('$340') && body.includes('$22,420'), file + ': synthetic fixture values');
        check(!errors.length, file + ': no uncaught JavaScript errors: ' + errors.join('; '));
        const layout = await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth }));
        check(layout.scrollWidth <= layout.width + 1, file + ': horizontal overflow ' + JSON.stringify(layout));
        result.layouts.push({ file, width, colorScheme, ...layout });
        const links = await page.locator('a[href],video source[src],video[poster],img[src],script[src],link[rel="stylesheet"]').evaluateAll(els => els.map(el => el.getAttribute('href') || el.getAttribute('src') || el.getAttribute('poster')).filter(Boolean));
        for (const link of links) {
          if (/^(https?:|mailto:|data:|blob:)/i.test(link)) continue;
          const url = new URL(link, origin + '/' + file);
          const local = path.join(root, decodeURIComponent(url.pathname));
          check(fs.existsSync(local), file + ': missing local target ' + link);
          if (url.hash && url.pathname.endsWith('.html')) {
            const target = fs.readFileSync(local, 'utf8');
            const id = decodeURIComponent(url.hash.slice(1));
            check(target.includes('id="' + id + '"') || target.includes("id='" + id + "'"), file + ': missing anchor ' + link);
          }
        }
        if (file.endsWith('healthcare-presenter.html') || file.endsWith('healthcare-readiness.html') || file.endsWith('/healthcare.html')) {
          check(body.includes('HC-CLM-77412') && body.includes('doc-cb8a6600-n0'), file + ': identifiers');
          check(body.includes('1794942277839.json') && body.includes('ChatGPT'), file + ': attributed artifact');
          check(body.includes('historical case duplication') || body.includes('Historical case duplication'), file + ': remaining duplication gap');
          check(body.includes('measured accuracy'), file + ': proxy distinction');
        }
        if (file === 'docs/index.html') for (const slug of ['healthcare', 'hc-office-manager']) {
          await page.locator('button[data-slug="' + slug + '"]').click();
          const caption = await page.locator('#demo-cap').innerText();
          check(caption.includes('Earlier standalone') && caption.includes('Replacement recording pending'), slug + ': honest legacy recording caption');
          await page.locator('video').evaluateAll(els => els.forEach(v => v.pause()));
        }
        if (colorScheme === 'light' && ['docs/portfolio/healthcare.html','docs/portfolio/healthcare-presenter.html','docs/portfolio/healthcare-readiness.html'].includes(file)) {
          const target = path.join(evidence, path.basename(file, '.html') + '-' + width + '.png');
          await page.screenshot({ path: target, fullPage: true }); result.screenshots.push(target);
        }
      }
      await context.close();
    }
    result.checks = checks;
    fs.writeFileSync(path.join(evidence, 'validation.json'), JSON.stringify(result, null, 2));
    console.log('PASS: ' + checks + ' checks; ' + result.layouts.length + ' layouts; ' + result.screenshots.length + ' local portfolio screenshots.');
    console.log('Evidence: ' + evidence);
  } finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
