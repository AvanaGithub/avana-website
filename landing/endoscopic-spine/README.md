# Avana Endoscopic Spine — Landing Page

Single-page lead capture for paid Meta / Google ads targeting Indian patients with back/leg pain who may be candidates for full-endoscopic spine surgery (RIWO Spine / Richard Wolf, Germany).

**Goal:** qualified consultation requests at the lowest cost per lead. The form collects Name · Mobile · City · Main symptom · Optional MRI · Consent. After submit, an Avana team member calls within 24 hours.

This folder is a **standalone static site**. No build step, no dependencies.

```
landing/endoscopic-spine/
├── index.html              ← the page
├── styles.css              ← all styling
├── script.js               ← validation + form submit (incl. file upload) + tracking
├── logo.svg                ← PLACEHOLDER — replace with real Avana wordmark
├── favicon.svg             ← PLACEHOLDER — replace
├── hero.jpg                ← PLACEHOLDER — 1 cm incision close-up OR reassuring patient image
├── MRI.png                 ← PLACEHOLDER — before/after MRI scans
├── endoscopic_image.png    ← PLACEHOLDER — before/after endoscopic-view photos
├── Riwospine.jpeg          ← PLACEHOLDER — conditions infographic
└── README.md               ← this file
```

---

## ⚠ Before publishing

> **Run a plagiarism check on the page copy as a final safeguard** (it's written from clinical facts, not borrowed from RIWOspine's brochure, but a fresh check is cheap).
>
> **Have a spine specialist review the medical claims and approve the disclaimer** before going live.

---

## Placeholders to replace before going live

### 1. (required) Meta Pixel ID

`index.html`, top of `<head>`. Search for `PIXEL_ID` (3 occurrences). Replace with the real numeric pixel ID, e.g. `123456789012345`.

### 2. (required) Google Tag Manager container ID

`index.html`. Search for `GTM-XXXXXXX` (2 occurrences). Replace with the real GTM container, e.g. `GTM-ABC1234`.

### 3. (required) Lead submission endpoint

`script.js`, `CONFIG.LEAD_ENDPOINT`. Paste the URL of the system that receives the lead.

The form supports an **optional MRI upload** — that needs a backend that accepts `multipart/form-data` (file uploads):

| Backend | Supports file upload? | Notes |
|---|---|---|
| **Custom Node/Express on your DigitalOcean droplet** | ✅ Yes | Recommended. Save the file to disk or S3 and forward the lead to your CRM. |
| **Formspree.io** | ✅ Yes (paid tier) | Easiest if you don't want to build a backend. |
| **Cloudinary upload widget + Zapier** | ✅ Yes | Cloudinary handles the file, Zapier handles the lead text. |
| Google Apps Script web app | ❌ No (text only) | If you use this, set `CONFIG.FORWARD_FILE = false` in `script.js`. The user can still SELECT a file (UI), but it won't be uploaded — tell them in the success message to share via WhatsApp after the call. |
| Zapier basic webhook | ❌ No | Same as above. |

**If you leave `LEAD_ENDPOINT` empty**, the page still works for testing — payloads log to the browser console, success state still shows. No backend required for QA.

### 4. (required) WhatsApp number for fallback contact

`script.js`, `CONFIG.WHATSAPP_NUMBER`. Use full international format, no `+` or spaces. Example: `919876543210`. Used in the success-state fallback link.

### 5. (required) Hero image — `hero.jpg`

Drop a JPG/WebP. **Two good options:**

| Option | Brief |
|---|---|
| **The 1 cm incision close-up** (from your existing poster) | Tactile and instantly conveys "small." Works well as a credibility cue. |
| **Calm patient back-view** | Reassuring, less clinical. Better if 1 cm photo feels too "scar-y" for cold ads. |

Aspect ratio 4:3, dimensions ~1280×960, compress to ~150–250 KB. The CSS uses `object-fit: cover`.

### 6. (required) Before/after images

Drop the user-supplied files into this folder with these exact filenames:

- `MRI.png` — paired before/after MRI scans (one image, side-by-side)
- `endoscopic_image.png` — paired before/after endoscopic view (one image, side-by-side)
- `Riwospine.jpeg` — your conditions infographic

If the originals are named differently, either rename them OR edit the three `<img src>` paths in `index.html` (search the file for `MRI.png`, `endoscopic_image.png`, `Riwospine.jpeg`).

Compress each to under ~300 KB before uploading. Medical images often have dark backgrounds — the CSS pre-loads with a dark fallback so they don't flash white during load.

### 7. (required) Logo

Replace `logo.svg` with the real Avana wordmark. SVG keeps it crisp at any DPR. Renders at ~30 px tall in the sticky header.

### 8. (optional) Favicon

Replace `favicon.svg` with the real Avana icon. Current placeholder is a gold "A" on dark.

### 9. (optional) Footer details

`index.html`, the `<footer>` block. Replace bracketed placeholders:

- `[Address line 1, Address line 2, Chennai, India]`
- `[contact email]`
- `[phone]`

Privacy Policy and Terms links currently point at `#`. Link them to real pages.

### 10. (medical-legal) Disclaimer language

The footer disclaimer is drafted to be honest and protective: makes clear the page is education only, not medical advice, surgery is suitable only for selected patients, and Avana does NOT itself provide medical treatment (it facilitates access to specialists/technology).

**Adjust the final line to match exactly how Avana's role is structured** — e.g. whether leads route to partner surgeons / hospitals, or to in-house clinical staff who refer onwards. Have your medical advisor approve before publishing.

---

## Pre-launch checklist (in order)

- [ ] Run a plagiarism check on the page copy
- [ ] Have a spine specialist review medical claims + disclaimer
- [ ] Replace `PIXEL_ID` (3 places) + `GTM-XXXXXXX` (2 places)
- [ ] Set `LEAD_ENDPOINT` and `WHATSAPP_NUMBER` in `script.js`
- [ ] If your endpoint doesn't accept file uploads, set `FORWARD_FILE = false`
- [ ] Drop in `hero.jpg`, `MRI.png`, `endoscopic_image.png`, `Riwospine.jpeg`
- [ ] Replace `logo.svg`, `favicon.svg`
- [ ] Fill in footer address + contact, link Privacy/Terms
- [ ] Submit a test lead with a real phone number — confirm the lead lands wherever you expect, AND that the file (if uploaded) arrives intact
- [ ] Test on a real Android phone on 4G — full page should be usable in <3 s
- [ ] Open Meta Events Manager → confirm the `Lead` event fires
- [ ] Open GTM Preview mode → confirm `lead_submit` dataLayer push fires
- [ ] Run Lighthouse mobile audit → target Performance 90+, Accessibility 100

---

## Local preview

From the repo root:

```bash
python -m http.server 8000
```

Open <http://localhost:8000/landing/endoscopic-spine/>.

---

## Deploying to the existing DigitalOcean droplet

Folder is part of the main `avanasurgical.com` repo. `git pull` on the droplet brings it along, and nginx serves it from `/landing/endoscopic-spine/` automatically.

For a cleaner URL like `https://avanasurgical.com/endoscopic-spine/` add this single block to the nginx site config:

```nginx
location ^~ /endoscopic-spine/ {
    alias /var/www/avanasurgical/landing/endoscopic-spine/;
    try_files $uri $uri/ /landing/endoscopic-spine/index.html;
}
```

Then `sudo nginx -t && sudo systemctl reload nginx`.

---

## Voice / copy rules baked in — don't accidentally undo

- **Plain language only.** Every clinical term is explained in one phrase ("disc," "sciatica," "endoscope," "decompression").
- **Patient's lived experience first.** Sections lead with what they feel, not with the product.
- **Honest disclaimers.** The "Is this right for everyone?" section says no — and that builds trust faster than a sales pitch.
- **Never degrade open surgery.** It's framed as "the standard approach" with different trade-offs, not as "the wrong choice."
- **Conservative care still comes first.** "Most back pain settles with rest, medication and physiotherapy, and it should always be tried first."

If you swap in new copy, sanity-check against these rules.

---

## Performance expectations

- Single small CSS file (~7 KB gzipped)
- Single small JS file (~3.5 KB gzipped)
- System font stack — zero font requests
- `fetchpriority="high"` on hero `<img>`
- Lazy-loaded MRI / endoscopic / infographic images (below the fold)

Lighthouse mobile target (after real images compressed):
- Performance: 90+
- Accessibility: 100
- Best practices: 100
- SEO: 95+

The biggest performance risk is uncompressed MRI/endoscopic images. Use [Squoosh](https://squoosh.app) or `cwebp` to get each under ~300 KB before uploading.
