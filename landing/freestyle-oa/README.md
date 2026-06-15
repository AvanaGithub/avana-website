# Avana Freestyle OA — Landing Page

Single-page lead capture for paid Meta ads. Goal: qualified form submissions at the lowest cost per lead. No checkout, no payment — the ₹25,000 sale happens later via call + WhatsApp nurture.

This folder is a **standalone static site**. No build step, no dependencies.

```
landing/freestyle-oa/
├── index.html         ← the page
├── styles.css         ← all styling
├── script.js          ← validation + form submit + tracking
├── logo.svg           ← PLACEHOLDER — replace
├── favicon.svg        ← PLACEHOLDER — replace
├── hero.jpg           ← PLACEHOLDER — drop the real photo here
├── knee-care-guide.pdf ← PLACEHOLDER — drop the real lead magnet here
└── README.md          ← this file
```

---

## Placeholders to replace before going live

Tackle the ones marked **(required)** in order. The rest are polish.

### 1. (required) Meta Pixel ID

`index.html`, top of the `<head>` — the Meta Pixel base code.

Search for: `PIXEL_ID` (3 occurrences in the head: 2× JS, 1× noscript fallback).

Replace with the real numeric pixel ID, e.g. `123456789012345`.

### 2. (required) Google Tag Manager container ID

`index.html`, top of the `<head>` AND first line of `<body>`.

Search for: `GTM-XXXXXXX` (2 occurrences).

Replace with the real GTM container, e.g. `GTM-ABC1234`.

### 3. (required) Lead submission endpoint

`script.js`, the `CONFIG` object at the top:

```js
LEAD_ENDPOINT: "",
```

Paste the URL of whatever receives the lead. Common choices:
- **Google Sheets via Apps Script** — a 30-min DIY backend. Free, durable.
- **Zapier / Make webhook** — instant integration into your CRM (Zoho, HubSpot, etc.) or email.
- **Your own backend** — when ready, point at `https://api.avanasurgical.com/leads` or wherever.

**If you leave it empty**, the page still works for testing: payloads log to the browser console, success state still shows, the PDF still downloads. Useful for QA before the backend is wired.

### 4. (required) The lead magnet PDF

Drop the real **Knee Care Guide** PDF into this folder, named exactly:

```
knee-care-guide.pdf
```

Or change the filename in `script.js` → `CONFIG.GUIDE_PDF_URL`.

Keep it under 2 MB for fast download on mobile data. Embed fonts. The download fires the instant the form succeeds, so the user gets it even if their email is slow.

### 5. (required) Hero image

Drop a JPEG/WebP at:

```
hero.jpg
```

Brief: a real, warm, India-context lifestyle shot of an **older person walking comfortably** (alone or with family). Outdoors or daily-life setting. **NOT** clinical, **NOT** pain-coded, **NOT** stock-medical. Warm light. Authentic. 

Aspect ratio: 4:3. Recommended dimensions: 1280 × 960 (then compress to ~150–250 KB). The CSS uses `object-fit: cover`, so it'll crop gracefully across screen sizes.

If you want WebP for performance, name it `hero.webp` and update the `<img src>` in `index.html`.

### 6. (required) Logo

Replace `logo.svg` with the real Avana wordmark. Keep it SVG for crispness. Renders at ~30 px tall in the sticky header — design accordingly.

### 7. (optional) Favicon

Replace `favicon.svg` with the real Avana icon. The current placeholder is just a gold "A" on a dark square.

### 8. (optional) Footer details

`index.html`, the `<footer>` block. Replace the bracketed placeholders:

- `[Address line 1, Address line 2, Chennai, India]`
- `[contact email]`
- `[phone]`

Privacy Policy and Terms links currently point at `#`. Wire them to real pages (or link to the main `avanasurgical.com` Privacy Policy if you'd rather not host duplicates here).

### 9. (optional) Testimonials block

Inside the proof section there's a commented-out `<!-- TESTIMONIALS -->` block. When you have 2–3 real quotes (name + city + permission), un-comment and fill it in. The CSS class hooks (`.testimonials`, `.testimonial`, etc.) aren't styled yet — they'll need a few lines added to `styles.css` when activated.

---

## Pre-launch checklist (in order)

- [ ] Replace `PIXEL_ID` (3 places) + `GTM-XXXXXXX` (2 places)
- [ ] Set `LEAD_ENDPOINT` in `script.js`
- [ ] Drop in `knee-care-guide.pdf`
- [ ] Drop in `hero.jpg` (or `hero.webp` + update tag)
- [ ] Replace `logo.svg`
- [ ] Replace `favicon.svg`
- [ ] Fill in footer address + contact
- [ ] Wire Privacy Policy + Terms links
- [ ] Run Lighthouse mobile audit — target 90+ Performance and 100 Accessibility
- [ ] Test the full submit flow with a real phone number — confirm the lead lands wherever you expect
- [ ] Open the Meta Events Manager → check the `Lead` event fires
- [ ] Open GTM Preview mode → check the `lead_submit` dataLayer push fires

---

## Local preview

From the repo root:

```bash
python -m http.server 8000
```

Open <http://localhost:8000/landing/freestyle-oa/> in the browser.

Or with a Node-based static server:

```bash
npx serve .
```

(No build step. Pure HTML/CSS/JS.)

---

## Deploying to the existing DigitalOcean droplet

The simplest path: the folder is already inside the main `avanasurgical.com` repo. `git pull` on the droplet brings it along with everything else, and nginx will serve it from `/landing/freestyle-oa/` automatically.

If you'd rather host it at a cleaner URL like `https://avanasurgical.com/freestyle-oa/` (no `/landing/` prefix), add this single block to the nginx site config:

```nginx
location ^~ /freestyle-oa/ {
    alias /var/www/avanasurgical/landing/freestyle-oa/;
    try_files $uri $uri/ /landing/freestyle-oa/index.html;
}
```

Then run `sudo nginx -t && sudo systemctl reload nginx`.

---

## Performance notes

- All CSS is one small file (~5 KB gzipped). No CDN, no @import.
- All JS is one small file (~3 KB gzipped). No libraries.
- System font stack — zero web font requests.
- Hero image uses `fetchpriority="high"` for fast LCP.
- Lazy-load the hero image only if you have heavy ones below the fold; LCP usually benefits from eager loading the hero.
- If you swap in WebP, the hero image will probably halve in size.

Expected Lighthouse mobile scores at first paint:
- Performance: 95+
- Accessibility: 100
- Best practices: 100
- SEO: 95+

---

## Voice / copy rules baked in (don't accidentally undo)

- **Never** address the viewer's health directly. ("Do you have knee pain?" ← banned by Meta health policy.)
- **Never** degrade surgery, injections, or other treatments. Always frame as "middle step before surgery" — never "instead of."
- **Always** use plain language. If you add a medical term, explain it in one phrase.
- **Always** show the recognisable situation (morning walk, stairs, family function), not abstract metaphors.
- **Always** Indian number formatting (`₹25,000`, `₹2,00,000`) — never US-style commas.

If you swap in new copy, sanity-check against these rules before pushing live.
