/* =================================================================
   AVANA SURGICAL — STATIC PRE-RENDER FOR /solutions/* + /conditions/*

   Why this exists:
     solution-template.html is a JS-hydrated SPA shell. Crawlers (Bing,
     social-card scrapers, AI agents, most SEO tools, and Google's
     first-pass indexer) get empty content. This script visits each
     SEO-indexed URL in a headless Chromium, captures the FULLY-RENDERED
     HTML, and writes it to <route>/index.html so nginx's existing
     try_files chain ($uri/ → solution-template.html fallback) serves
     the pre-rendered version first.

   How to run:
     1. Start the dev server in another terminal:   py start-server.py
     2. From the repo root, run:                    node _imgtools/prerender.cjs

   When to run:
     After any edit to data/pain-areas/, data/conditions/, data/audiences/,
     data/products.json, or solution-template.html. Push the resulting
     <route>/index.html files alongside the JSON change.

   Output:
     Writes ~12 files like:
       solutions/knee-pain/index.html
       conditions/osteoarthritis/index.html
       for-surgeons/index.html
================================================================= */

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const DEV_ORIGIN  = 'http://localhost:8000';
const PROD_ORIGIN = 'https://avanasurgical.com';
const REPO_ROOT   = path.resolve(__dirname, '..');

// Mirrors EXPLICIT_ROUTES in assets/js/solution-loader.js.
// Keep this in sync when adding new SEO-indexed URLs.
const ROUTES = [
    '/solutions/knee-pain',
    '/solutions/foot-ankle-pain',
    '/solutions/shoulder-pain',
    '/solutions/elbow-pain',
    '/solutions/back-pain',
    '/solutions/spine-pain',
    '/solutions/hip-pain',
    '/solutions/cold-therapy',
    '/solutions/spine-support',
    '/conditions/osteoarthritis',
    '/conditions/post-surgery-recovery',
    '/for-surgeons',
];

async function checkDevServer() {
    try {
        const res = await fetch(DEV_ORIGIN + '/');
        return res.ok;
    } catch { return false; }
}

async function waitForRenderComplete(page) {
    // The loader removes #pain-loading (or hides it) once render finishes.
    // Wait for the H1 in .pain-hero__title to have actual text.
    await page.waitForFunction(() => {
        const h1 = document.querySelector('.pain-hero__title, h1');
        const loadingEl = document.querySelector('#pain-loading');
        const loadingVisible = loadingEl && loadingEl.offsetParent !== null;
        const h1HasText = h1 && h1.textContent.trim().length > 0;
        return h1HasText && !loadingVisible;
    }, { timeout: 10000 });
}

function rewriteOrigins(html) {
    // Any leftover localhost references → production. Mostly defensive —
    // canonicals/og:url in solution-loader.js already use absolute prod URLs,
    // but srcset / inline JSON-LD could leak localhost.
    return html
        .replace(/http:\/\/localhost:8000/g, PROD_ORIGIN)
        .replace(/href="http:\/\/localhost(:\d+)?/g, `href="${PROD_ORIGIN}`);
}

function ensureDir(file) {
    const dir = path.dirname(file);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

(async () => {
    console.log('Avana pre-render — checking dev server…');
    if (!await checkDevServer()) {
        console.error(`✗ Dev server not reachable at ${DEV_ORIGIN}. Start it with:  py start-server.py`);
        process.exit(1);
    }

    console.log('Launching headless Chromium…');
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    let ok = 0, failed = 0;
    const results = [];

    try {
        for (const route of ROUTES) {
            const page = await browser.newPage();
            await page.setViewport({ width: 1280, height: 900 });

            const url = DEV_ORIGIN + route;
            const t0 = Date.now();
            try {
                await page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 });
                await waitForRenderComplete(page);

                // Strip the loading state element entirely so it doesn't ship in markup.
                await page.evaluate(() => {
                    const el = document.querySelector('#pain-loading');
                    if (el) el.remove();
                });

                let html = await page.content();
                html = rewriteOrigins(html);

                // Write to <route>/index.html so nginx's existing try_files
                // ($uri/) picks it up before falling back to solution-template.html.
                const outPath = path.join(REPO_ROOT, route.replace(/^\//, ''), 'index.html');
                ensureDir(outPath);
                fs.writeFileSync(outPath, html, 'utf8');

                const sizeKB = (html.length / 1024).toFixed(1);
                const ms = Date.now() - t0;
                console.log(`  ✓ ${route.padEnd(38)} ${sizeKB.padStart(7)} KB   ${ms}ms`);
                results.push({ route, status: 'ok', sizeKB, ms });
                ok++;
            } catch (err) {
                console.error(`  ✗ ${route.padEnd(38)} ${err.message}`);
                results.push({ route, status: 'failed', error: err.message });
                failed++;
            } finally {
                await page.close();
            }
        }
    } finally {
        await browser.close();
    }

    console.log('\n' + '='.repeat(64));
    console.log(`Pre-render complete:  ${ok} ok  |  ${failed} failed`);
    if (failed > 0) process.exit(1);
})();
