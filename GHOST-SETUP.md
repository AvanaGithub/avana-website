# Ghost CMS — Setup Guide for Avana

> ⚠️ **Deprecation note (kept for historical reference):** This guide was written for an earlier plan where Ghost would live on the subdomain `blog.avanasurgical.com`. The current plan is to host the blog at the sub-path **`/blog`** on the main domain (proxied through nginx on the same droplet). The Ghost server-side install steps (Node.js, MySQL, Ghost-CLI, themes) are still accurate — but the URL, DNS, and SSL sections below need to be re-done for the `/blog` sub-path before this doc is used for a real install.

This guide installs Ghost as the blog at **`blog.avanasurgical.com`**, on your existing DigitalOcean droplet, alongside the main static site. Total time: ~45 minutes once the droplet is reachable.

---

## Architecture (the big picture)

```
avanasurgical.com           →  Netlify (free) — main static site
blog.avanasurgical.com      →  DigitalOcean droplet — Ghost (Node.js + MySQL + nginx)
```

The main site fetches the 3 most recent posts via Ghost's Content API and shows them in the homepage "Latest from Our Blog" section. All other blog reading happens on `blog.avanasurgical.com` (the Ghost-hosted site itself).

---

## What you need before starting

| Thing | Where to get it |
|---|---|
| DigitalOcean droplet (2 GB RAM / 1 vCPU minimum) | DigitalOcean dashboard |
| `root` or `sudo` SSH access to the droplet | DigitalOcean → Droplet → Access |
| `blog.avanasurgical.com` DNS A record pointing at the droplet's public IP | Wherever your DNS is managed (e.g. Cloudflare, Namecheap) |
| Email address for Let's Encrypt SSL renewal warnings | Your work email |
| `avana-ghost-theme/` folder zipped (already in this repo) | See **Step 5** below |

---

## Step 1 — Prepare the droplet (one-time)

SSH into the droplet:
```bash
ssh root@<your-droplet-ip>
```

Update packages and create a non-root user for Ghost:
```bash
apt update && apt -y upgrade
adduser avana
usermod -aG sudo avana
```

Install required system packages:
```bash
apt -y install nginx mysql-server curl
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt -y install nodejs
```

Set up MySQL root password:
```bash
mysql_secure_installation
# Follow prompts; remember the root password — Ghost needs it once.
```

Install Ghost-CLI globally:
```bash
npm install -g ghost-cli@latest
```

---

## Step 2 — DNS

In your DNS provider, add an **A record**:
- **Host / Name:** `blog`
- **Type:** A
- **Value:** `<your-droplet-public-ip>`
- **TTL:** 300 (5 minutes)

Wait for propagation (`nslookup blog.avanasurgical.com` should return the droplet IP).

---

## Step 3 — Install Ghost

Log out of root, log back in as the `avana` user:
```bash
exit
ssh avana@<your-droplet-ip>
```

Create the Ghost directory:
```bash
sudo mkdir -p /var/www/ghost
sudo chown avana:avana /var/www/ghost
sudo chmod 775 /var/www/ghost
cd /var/www/ghost
```

Run the Ghost installer (interactive wizard):
```bash
ghost install
```

It will ask:

| Prompt | Answer |
|---|---|
| **Blog URL** | `https://blog.avanasurgical.com` |
| **MySQL hostname** | `localhost` |
| **MySQL username** | `root` |
| **MySQL password** | *(the one you set in Step 1)* |
| **Ghost database name** | `ghost_avana` (or accept default) |
| **Set up a Ghost MySQL user?** | `Yes` |
| **Set up nginx?** | `Yes` |
| **Set up SSL (Let's Encrypt)?** | `Yes` — enter your email |
| **Set up systemd?** | `Yes` |
| **Start Ghost?** | `Yes` |

When it finishes, Ghost is running at `https://blog.avanasurgical.com`.

---

## Step 4 — First admin user

Open `https://blog.avanasurgical.com/ghost/` in your browser. Ghost runs the first-time-setup wizard:
- Site name: `Avana Surgical`
- Admin email + password
- Done

You are now logged into the Ghost admin UI.

---

## Step 5 — Upload the Avana theme

The Ghost theme lives in this repo at `avana-ghost-theme/`. Zip it first:

**On Windows (PowerShell):**
```powershell
Compress-Archive -Path C:\avana_website\avana-ghost-theme\* -DestinationPath C:\avana_website\avana-ghost-theme.zip -Force
```

**On macOS / Linux:**
```bash
cd /path/to/avana_website
zip -r avana-ghost-theme.zip avana-ghost-theme/
```

In Ghost admin → **Settings → Design → Change theme → Upload theme** → pick the `.zip` → click **Activate**.

The blog now uses Avana branding.

---

## Step 6 — Generate the Content API key (for the homepage integration)

1. In Ghost admin → **Settings → Integrations → + Add custom integration**
2. Name: `Avana Main Website`
3. Save → you'll see a **Content API Key** (26 characters, alphanumeric)
4. Copy it

Open `data/ghost-config.json` in your local repo:
```json
{
  "apiUrl":        "https://blog.avanasurgical.com",
  "contentApiKey": "PASTE_THE_26_CHAR_KEY_HERE",
  "postsPerPage":  3,
  "blogUrl":       "https://blog.avanasurgical.com",
  "enabled":       true
}
```

Set `enabled` to `true`. Commit + push.

The next time someone loads the homepage, the 3 most recent Ghost posts replace the placeholder cards automatically.

> **Is it safe to commit the Content API key?**
> Yes. Ghost's Content API key is intentionally **public + read-only**. It can only fetch posts you've already published. Even if leaked, it cannot create, edit, or delete anything. (Don't confuse it with the **Admin** API key — never commit that one.)

---

## Step 7 — CORS (if you host the main site on Netlify)

Ghost allows cross-origin Content API requests by default — `avanasurgical.com` (or `*.netlify.app`) fetching from `blog.avanasurgical.com` works out of the box. No extra config needed.

---

## Ongoing — adding a blog post

1. Open `https://blog.avanasurgical.com/ghost/`
2. Click **+ New post**
3. Write, add a feature image, save as Published
4. Done — the post is live on `blog.avanasurgical.com` immediately
5. The 3 most recent posts will appear on the main site's homepage on the next page load

To categorise posts by pain area for future "Related articles" features, add **tags** matching the page slug: `knee`, `spine`, `back-pain`, `shoulder`, `elbow`, `foot`, `hip`.

---

## Maintenance

| Task | Command (run as `avana` on the droplet) |
|---|---|
| Update Ghost when a new version drops | `cd /var/www/ghost && ghost update` |
| Restart Ghost | `cd /var/www/ghost && ghost restart` |
| Check Ghost logs | `cd /var/www/ghost && ghost log` |
| Backup database manually | `mysqldump -u root -p ghost_avana > ~/ghost-backup-$(date +%F).sql` |

Strongly recommended: **enable DigitalOcean automated backups** ($2.40/mo for a $12 droplet) so the entire VM is snapshotted weekly.

---

## Troubleshooting

| Symptom | Likely cause / fix |
|---|---|
| Homepage blog cards still show "Coming soon" | `enabled: false` in `ghost-config.json`, or `contentApiKey` empty / wrong, or Ghost down. Check browser DevTools console for the `Ghost blog loader skipped: …` warning. |
| Blog returns 502 Bad Gateway | Ghost process crashed. SSH in → `cd /var/www/ghost && ghost restart` |
| SSL certificate warnings | `ghost setup ssl` reruns the Let's Encrypt step |
| Theme upload fails validation | Run `gscan avana-ghost-theme/` locally first (`npm i -g gscan`) to see the errors |

---

## Cost summary

| Item | Cost |
|---|---|
| DigitalOcean droplet (already in use) | $12 / month |
| DigitalOcean backups (recommended) | $2.40 / month |
| Let's Encrypt SSL | Free |
| Ghost (self-hosted, open source) | Free |
| **Total monthly** | **~$14.40** |

(For comparison, Ghost(Pro) hosted is $9–$25/mo.)
