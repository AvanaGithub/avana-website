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
     "relatedAudiences":  ["knee-joint-pain", "recovering-from-surgery"],
     "relatedConditions": ["osteoarthritis"]
   }
   ```

3. **That's it.** The product instantly appears on every category page where its `relatedX` arrays match. Same product in 3 categories = one entry, three appearances.

### Valid relation slugs

| relatedPainAreas | relatedAudiences | relatedConditions |
|---|---|---|
| `knee` | `knee-joint-pain` | `osteoarthritis` |
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
sudo apt update && sudo apt install -y nginx certbot python3-certbot-nginx

# 3. Place the site root
sudo mkdir -p /var/www/avanasurgical
sudo chown -R $USER:$USER /var/www/avanasurgical

# 4. Configure nginx
sudo cp nginx.conf.example /etc/nginx/sites-available/avanasurgical.com
sudo ln -s /etc/nginx/sites-available/avanasurgical.com /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 5. Point your DNS A record to the droplet IP, then enable HTTPS
sudo certbot --nginx -d avanasurgical.com -d www.avanasurgical.com
```

### Each subsequent deploy

```bash
# from your local machine, sync everything except large/local-only stuff
rsync -avz --delete \
  --exclude='.git' --exclude='avana-blog-theme*' --exclude='start-server.bat' \
  ./ root@YOUR_DROPLET_IP:/var/www/avanasurgical/
```

(Or use `scp -r`, or set up a tiny GitHub Action — anything that uploads the static files.)

The WordPress blog (`avana-blog-theme/`) deploys separately — it goes into your WordPress install, not this static droplet root.

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
4. Rename a product in `data/products.json` — reload two pages where it appears (e.g. `solution-template.html?type=painArea&slug=knee` and `solution-template.html?type=audience&slug=knee-joint-pain`). The new name should appear in both. ← proves the shared catalog is working.
5. Click any product card CTA — should open the matching `osteokart.com` URL in a new tab.
6. Resize the browser to mobile width — hamburger menu opens; Solutions expands into an accordion.

---

## 8. Files NOT to commit / deploy

- `avana-blog-theme/` — WordPress theme, separate deploy
- `avana-blog-theme.zip` — build artifact
- `start-server.bat` — local-dev helper

Add these to a `.gitignore` (or a deploy excludes list) so they don't end up on the droplet.
