# Avana Surgical — Deploy & Content Guide

Concise guide for two things you'll do regularly: **adding products** and **deploying changes to DigitalOcean**.

---

## 1. Architecture at a glance

```
data/products.json                    ← single source of truth for every product
data/pain-areas/{slug}.json           ← hero, conditions, FAQ for each pain area
data/audiences/{slug}.json            ← same shape, for "I have X" pages
data/conditions/{slug}.json           ← same shape, for condition pages

solution-template.html                ← ONE template renders all three
assets/js/solution-loader.js          ← reads URL → loads the right JSON
                                        → filters products.json by relation

partials/header.html                  ← shared navbar + Solutions mega-menu
partials/footer.html                  ← shared footer
assets/js/include-partials.js         ← injects partials at runtime
assets/js/header-behavior.js          ← sticky header + mega-menu + mobile nav
```

**Clean URLs** (`/solutions/knee`, `/audiences/back-pain`, `/conditions/osteoarthritis`) are served by nginx — see `nginx.conf.example`.

---

## 2. Managing the catalogue with the visual editor (recommended)

For non-technical team members and for any "add this product to back-pain" style edit, use the local catalogue editor instead of hand-editing JSON.

1. **Launch a local server** — double-click `start-server.bat` (or run `py -3 -m http.server 8000` from the repo root).
2. **Open the editor** — http://localhost:8000/_tools/catalog-editor.html
3. **Edit** — tick or untick category checkboxes for any product. Use the search and filters to find products quickly. The coverage strip at the top shows how many products are tagged in each category (pills go red when a category has fewer than 3 products).
4. **Add or remove products** — `+ Add product` opens a modal for the basic fields; the × on each row deletes (after confirm).
5. **Download** — click `↓ Download products.json`. Your browser saves an updated `products.json` (usually to your Downloads folder).
6. **Replace** — overwrite `C:\avana_website\data\products.json` with the downloaded file.
7. **Commit & push**:
   ```bash
   git add data/products.json
   git commit -m "Catalogue: <short summary of what changed>"
   git push origin main
   ```
   GitHub Pages rebuilds in ~30–90 seconds and your team will see the change.

The editor lives in `_tools/` — that underscore prefix means GitHub Pages' default Jekyll behaviour **excludes it from the public site**. Browsing to `https://avanagithub.github.io/avana-website/_tools/catalog-editor.html` returns 404. So the editor stays a local-only admin tool while still sitting in the repo for everyone to clone.

> **Tip — adding new images** still requires dropping the image file into `images/products/`. The editor only manages metadata. Image filename should match the slug.

### Managing training programs (Training tab)

The same editor now has a **Training Programs** tab for the Surgeon page. Workflow:

1. Switch to the **Training Programs** tab in the editor.
2. Click **+ Add program** — fill in slug (kebab-case, e.g. `2026-04-knee-cadaver-chennai`), name, date, faculty (one doctor per line), place, venue, activity checkboxes, description, optional highlights, optional registration URL.
3. Save the program.
4. **Drop your photos** into `images/training/{slug}/` and rename them `01.jpg, 02.jpg, …, NN.jpg`.
5. Click **Edit** on the program and set **Photo count** to N.
6. Click **↓ Download training-programs.json** — replace `data/training-programs.json` with the downloaded file. Commit & push.

A program's date determines whether it appears under **Upcoming** (date ≥ today) or **Past** (date < today). When tomorrow arrives, an upcoming program automatically moves to past — no manual flag flip.

> **Tip — photo numbering** is forgiving. If `photoCount = 8` but you've only uploaded `01.jpg` through `05.jpg`, the missing 3 vanish silently on the live page (no broken-image icons). Convenient when prepping a card while photos are still being processed.

---

## 3. Adding a new product by hand-editing JSON

If you'd rather skip the editor, the same change is just a JSON edit:

1. **Image**: drop the product photo into `images/products/{product-slug}.jpg`
   (use kebab-case; max ~250 KB; ideally 800×600).

2. **Catalog entry**: open `data/products.json` and append:

   ```json
   {
     "slug": "my-new-brace",
     "name": "My New Brace",
     "brand": "Breg",
     "shortDescription": "1–2 sentences shown on the card.",
     "usage": "Short 'recommended for' line (optional)",
     "image": "images/products/my-new-brace.jpg",
     "link": "https://osteokart.com/products/my-new-brace?utm_source=avana",
     "ctaLabel": "Buy Now",
     "relatedPainAreas":  ["knee"],
     "relatedAudiences":  ["seniors", "recovering-from-surgery"],
     "relatedConditions": ["osteoarthritis"]
   }
   ```

3. **That's it.** The product instantly appears on every category page where its `relatedX` arrays match. Same product in 3 categories = one entry, three appearances.

### Valid relation slugs

| relatedPainAreas | relatedAudiences | relatedConditions |
|---|---|---|
| `knee` | `seniors` | `osteoarthritis` |
| `spine` | `back-pain` | `post-surgery-recovery` |
| `shoulder` | `recovering-from-surgery` | `cold-therapy` |
| `elbow` | `surgeon` | `spine-support` |
| `foot` | | |
| `hip` | | |

To add a brand-new pain area / audience / condition: also create the matching `data/<folder>/<slug>.json` file (clone an existing one, edit the meta + hero text) and register the slug in `assets/js/solution-loader.js` under the `TYPES` registry.

---

## 4. Local preview

The site needs an HTTP server (browsers block `fetch()` on `file://`):

```bash
# Windows: double-click start-server.bat   (Python's http.server)
# Or any of:
npx serve .
python -m http.server 8000
```

Then open:
- `http://localhost:8000/` — homepage
- `http://localhost:8000/solution-template.html?type=painArea&slug=knee` — knee page
- `http://localhost:8000/solution-template.html?type=audience&slug=back-pain`
- `http://localhost:8000/solution-template.html?type=condition&slug=osteoarthritis`
- `http://localhost:8000/_tools/catalog-editor.html` — visual catalogue editor (local only)

Locally the clean URLs (`/solutions/knee`) do NOT work — nginx rewrites only kick in on the server. Use query-string form when previewing.

---

## 5. Deploying to DigitalOcean

### One-time droplet setup

```bash
# 1. Create an Ubuntu droplet (1 GB / $6 plan is fine)
# 2. SSH in and install nginx + (optionally) certbot
sudo apt update && sudo apt install -y nginx certbot python3-certbot-nginx git

# 3. Clone the repo to the site root
sudo mkdir -p /var/www/avanasurgical
sudo chown -R $USER:$USER /var/www/avanasurgical
cd /var/www/avanasurgical
git clone https://github.com/AvanaGithub/avana-website.git .

# 4. Configure nginx (preview first, then production after DNS cutover)
sudo cp nginx.preview.conf.example /etc/nginx/sites-available/preview.avanasurgical.com
sudo ln -s /etc/nginx/sites-available/preview.avanasurgical.com /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 5. Point DNS A record (preview.avanasurgical.com → droplet IP), enable HTTPS
sudo certbot --nginx -d preview.avanasurgical.com

# 6. Production goes through the same flow when ready:
#    sudo cp nginx.conf.example /etc/nginx/sites-available/avanasurgical.com
#    sudo ln -s ../sites-available/avanasurgical.com /etc/nginx/sites-enabled/
#    sudo certbot --nginx -d avanasurgical.com -d www.avanasurgical.com
```

### Each subsequent deploy (run on the droplet)

```bash
cd /var/www/avanasurgical
git pull
rm -rf _tools proposals
npm install
npm run build
nginx -t
systemctl reload nginx
```

**About `rm -rf _tools proposals`:** the catalogue editor (`_tools/catalog-editor.html`) and any HTML in `proposals/` are **for local content management only** and must never reach the live droplet filesystem. They stay in the git repo for everyone to clone locally; this `rm` line strips them from the working tree after every pull. Nginx also returns 404 for `/_tools/` and `/proposals/` as a defense-in-depth layer (see `nginx.conf.example` and `nginx.preview.conf.example`).

**About `npm install` / `npm run build`:** this site is currently **vanilla static HTML/CSS/JS — there is no `package.json` and no build step**. Those two commands are no-ops today and can be omitted. They're listed in the canonical deploy block so the script keeps working unchanged if a build step is added later (e.g. asset bundling, image optimisation).

The Ghost blog (planned at `/blog` as a sub-path) deploys separately — see `GHOST-SETUP.md`.

### Post-deploy verification (admin lockdown)

After each deploy, run these from your laptop to confirm the admin/preview folders are sealed off:

```bash
# 1. HTTP-level check — every URL should return 404
curl -I https://preview.avanasurgical.com/_tools/catalog-editor.html
curl -I https://preview.avanasurgical.com/_tools/
curl -I https://preview.avanasurgical.com/proposals/
# Expected on each: HTTP/2 404
```

And on the droplet itself, confirm the files don't exist on disk:

```bash
# 2. Filesystem check — should print nothing if the rm step ran
find /var/www/avanasurgical -path '*_tools*'
find /var/www/avanasurgical -path '*proposals*'
# Expected: no output (no deployed admin/proposal folders)
```

If either filesystem check returns paths, the `rm -rf` step in the deploy block was skipped — re-run it and reload nginx.

### Defense-in-depth — what's already in the repo

| Layer | Where | What it does |
|---|---|---|
| Filesystem removal | `rm -rf _tools proposals` in deploy block | Files never reach the droplet |
| Nginx 404 | `location ^~ /_tools/ { return 404; }` in both `nginx.conf.example` and `nginx.preview.conf.example` | Even if files leak onto disk, HTTP can't reach them |
| Crawler block | `robots.txt` — `Disallow: /_tools/` + `Disallow: /proposals/` | Search engines never index |
| Sitemap | `sitemap.xml` contains zero `/_tools/`, `/proposals/`, or `catalog-editor` URLs | No admin URLs surfaced |
| Internal links | No `<a href>` from any rendered page (navbar, footer, sitemap, content) points at `/_tools/*` | Verified by repo-wide grep |
| Underscore prefix | `_tools/` filename | Some static hosts auto-exclude underscore-prefixed paths (e.g. GitHub Pages with default Jekyll) |

The site is protected even if one layer fails. The real protection is the filesystem `rm` + nginx 404 on the droplet — Netlify config is optional and not the production target.

---

## 6. URL Map

| URL | Source | What it shows |
|---|---|---|
| `/` | `index.html` | Homepage |
| `/careers.html` | `careers.html` | Careers |
| `/solutions/{slug}` | `solution-template.html` + `data/pain-areas/{slug}.json` | Pain-area page |
| `/audiences/{slug}` | `solution-template.html` + `data/audiences/{slug}.json` | Recovery-need page |
| `/conditions/{slug}` | `solution-template.html` + `data/conditions/{slug}.json` | Condition page |
| `/pain.html?area=...` | `pain.html` (redirect) | Backwards-compat → `/solutions/{slug}` |
| `/blog/` | WordPress | The blog (separate install) |

---

## 7. Testing your change before deploy

A quick end-to-end smoke test:

1. Start a local server (see §3).
2. Hover **Solutions** in the navbar — the mega-menu should drop down with two columns. Tap a knee link → the knee page renders with knee products.
3. Open the audience and condition pages via query string (see §3). Same template, different content.
4. Rename a product in `data/products.json` — reload two pages where it appears (e.g. `solution-template.html?type=painArea&slug=knee` and `solution-template.html?type=audience&slug=seniors`). The new name should appear in both. ← proves the shared catalog is working.
5. Click any product card CTA — should open the matching `osteokart.com` URL in a new tab.
6. Resize the browser to mobile width — hamburger menu opens; Solutions expands into an accordion.

---

## 8. Files NOT to deploy to the droplet

Stripped at deploy time by `rm -rf _tools proposals` (see §5):

- `_tools/` — admin / catalogue editor (local only — accessing it on the droplet is blocked by nginx 404 anyway, but it should never be on disk in the first place)
- `proposals/` — internal preview HTML

Stripped by `.gitignore` or never committed in the first place:

- `avana-blog-theme/` — historical WordPress theme, separate deploy lane
- `avana-blog-theme.zip` — build artifact
- `start-server.bat` — local-dev helper

> ⚠ If you ever change the deploy method (e.g. swap `git pull` for `rsync`), make sure the new method **still excludes `_tools/` and `proposals/`**. Nginx 404 + robots.txt are belt-and-suspenders, but the primary protection is "the files don't exist on the droplet."
