#!/usr/bin/env python3
"""
Migrate WordPress-hosted images inside Ghost posts to Ghost's own storage.

Scans every post's HTML for external <img src="..."> URLs (WordPress uploads,
LinkedIn CDN, etc.), downloads each one, uploads it to Ghost via the Admin
images endpoint, then PUTs the post back with rewritten URLs.

Idempotent: re-running skips images already served from
preview.avanasurgical.com/blog/content/images/.

Usage:
    py _imgtools/ghost_migrate_wp_images.py           # dry-run (default)
    py _imgtools/ghost_migrate_wp_images.py --live    # actually change posts
"""
import json, hmac, hashlib, base64, time, urllib.request, urllib.error, re, ssl, sys, mimetypes, os
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
from html import unescape
from urllib.parse import urlparse

ADMIN_API_URL = "https://preview.avanasurgical.com/blog"
ADMIN_KEY = "6a5dfd2710672a025a1162ec:4193a556352fcfe8e0c7ac1b38a9fa5d33ff607c0becd57190c70a659a7e4142"
GHOST_HOST = "preview.avanasurgical.com"
LIVE = "--live" in sys.argv

CTX = ssl.create_default_context()
CTX.check_hostname = False
CTX.verify_mode = ssl.CERT_NONE


def b64url(d):
    return base64.urlsafe_b64encode(d).rstrip(b"=").decode()


def make_jwt():
    kid, sec = ADMIN_KEY.split(":")
    h = json.dumps({"alg": "HS256", "typ": "JWT", "kid": kid}, separators=(",", ":")).encode()
    p = json.dumps({"iat": int(time.time()), "exp": int(time.time()) + 300, "aud": "/admin/"}, separators=(",", ":")).encode()
    s = f"{b64url(h)}.{b64url(p)}"
    sig = hmac.new(bytes.fromhex(sec), s.encode(), hashlib.sha256).digest()
    return f"{s}.{b64url(sig)}"


def api(method, path, body=None, raw=None, content_type="application/json"):
    url = f"{ADMIN_API_URL}/ghost/api/admin{path}"
    if raw is not None:
        data = raw
    else:
        data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(url, method=method, data=data)
    req.add_header("Authorization", f"Ghost {make_jwt()}")
    req.add_header("Content-Type", content_type)
    req.add_header("Accept-Version", "v5.0")
    try:
        with urllib.request.urlopen(req, timeout=120, context=CTX) as r:
            body = r.read().decode()
            return r.status, json.loads(body) if body else None
    except urllib.error.HTTPError as e:
        try:
            return e.code, json.loads(e.read().decode())
        except Exception:
            return e.code, None


def download(url):
    """Fetch bytes from a URL. Returns (data, content_type) or (None, None)."""
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 avana-migrator"})
        with urllib.request.urlopen(req, timeout=60, context=CTX) as r:
            return r.read(), r.headers.get("Content-Type", "").split(";")[0].strip()
    except Exception as e:
        return None, f"ERR: {e}"


def convert_webp_to_jpeg(data):
    """Convert webp bytes to jpeg bytes. Returns (data, ext) or (data, None) on failure."""
    try:
        from PIL import Image
        import io
        im = Image.open(io.BytesIO(data)).convert("RGB")
        buf = io.BytesIO()
        im.save(buf, format="JPEG", quality=88)
        return buf.getvalue(), "jpg"
    except Exception as e:
        return data, None


def upload_to_ghost(data, filename):
    """POST multipart to Ghost's image upload endpoint. Returns new URL or None."""
    # Ghost rejects .webp — convert to .jpg on the fly.
    if filename.lower().endswith(".webp") or data[:12].startswith(b"RIFF") and b"WEBP" in data[:12]:
        converted, ext = convert_webp_to_jpeg(data)
        if ext:
            data = converted
            filename = re.sub(r"\.webp$", ".jpg", filename, flags=re.IGNORECASE)
            if not filename.lower().endswith(".jpg"):
                filename += ".jpg"
    boundary = f"----avanaboundary{int(time.time()*1000)}"
    mime = mimetypes.guess_type(filename)[0] or "application/octet-stream"
    parts = [
        f"--{boundary}\r\nContent-Disposition: form-data; name=\"purpose\"\r\n\r\nimage\r\n".encode(),
        f"--{boundary}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"{filename}\"\r\nContent-Type: {mime}\r\n\r\n".encode(),
        data,
        f"\r\n--{boundary}--\r\n".encode(),
    ]
    payload = b"".join(parts)
    status, resp = api("POST", "/images/upload/", raw=payload, content_type=f"multipart/form-data; boundary={boundary}")
    if status in (200, 201) and resp:
        return resp["images"][0]["url"]
    print(f"            upload debug: status={status} resp={str(resp)[:200]}")
    return None


def slugify_filename(url):
    """Extract a safe filename from a URL."""
    path = urlparse(url).path
    name = os.path.basename(path) or "image.jpg"
    # strip weird chars
    name = re.sub(r'[^\w.\-]', '_', name)
    if not re.search(r'\.(jpg|jpeg|png|gif|webp|svg)$', name, re.I):
        name += ".jpg"
    return name


def fetch_all_posts():
    all_posts, page = [], 1
    while True:
        s, d = api("GET", f"/posts/?limit=100&page={page}&formats=html")
        if s != 200 or not d:
            print(f"API error page {page}: status={s}", file=sys.stderr)
            break
        all_posts.extend(d["posts"])
        meta = d.get("meta", {}).get("pagination", {})
        if page >= meta.get("pages", 1):
            break
        page += 1
    return all_posts


def main():
    mode = "LIVE" if LIVE else "DRY-RUN"
    print(f"===== Ghost image migration — mode: {mode} =====\n")

    posts = fetch_all_posts()
    print(f"Fetched {len(posts)} posts.\n")

    pattern = re.compile(r'<img[^>]+src="([^"]+)"', re.IGNORECASE)
    # Collect every external URL across every post
    url_to_posts = {}   # url -> list of post ids
    for p in posts:
        html = p.get("html") or ""
        for u in pattern.findall(html):
            u = unescape(u)
            if u.startswith("http") and GHOST_HOST not in u:
                url_to_posts.setdefault(u, []).append(p["id"])

    unique_urls = list(url_to_posts.keys())
    print(f"External images: {len(unique_urls)} unique URLs across {len(set(pid for ids in url_to_posts.values() for pid in ids))} posts\n")

    # Download + upload each unique URL. Build old -> new mapping.
    mapping = {}
    for i, old in enumerate(unique_urls, 1):
        prefix = f"[{i:2}/{len(unique_urls)}]"
        short = old[:70] + ("..." if len(old) > 70 else "")
        print(f"{prefix} {short}")
        if not LIVE:
            mapping[old] = "(would upload)"
            continue
        data, ctype = download(old)
        if data is None:
            print(f"            DOWNLOAD FAILED — {ctype}")
            continue
        fname = slugify_filename(old)
        new_url = upload_to_ghost(data, fname)
        if not new_url:
            print(f"            UPLOAD FAILED")
            continue
        mapping[old] = new_url
        print(f"            [OK] {len(data):>7} bytes → {new_url}")

    print(f"\nMapping built: {len(mapping)} URLs migrated\n")

    if not LIVE:
        print("DRY-RUN complete. Re-run with --live to actually download/upload/rewrite.")
        return

    # Rewrite posts
    updated, failed = 0, 0
    affected_ids = set(pid for u, ids in url_to_posts.items() if u in mapping for pid in ids)
    id_to_post = {p["id"]: p for p in posts}
    for pid in affected_ids:
        p = id_to_post[pid]
        html = p.get("html") or ""
        original = html
        for old, new in mapping.items():
            # replace both the raw form and the HTML-escaped form (&amp;)
            html = html.replace(old, new).replace(old.replace("&", "&amp;"), new)
        if html == original:
            continue
        payload = {"posts": [{"html": html, "updated_at": p["updated_at"]}]}
        s, d = api("PUT", f"/posts/{pid}/?source=html", payload)
        if s == 200:
            updated += 1
            print(f"  [OK] updated  {p['slug']}")
        else:
            failed += 1
            print(f"  [FAIL] FAILED   {p['slug']}  status={s}")
            if d and d.get("errors"):
                print(f"             {d['errors'][0].get('message', '')[:120]}")

    print(f"\nDONE — {updated} posts updated, {failed} failed")


if __name__ == "__main__":
    main()
