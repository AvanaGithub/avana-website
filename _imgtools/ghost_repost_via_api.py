#!/usr/bin/env python3
"""
Ghost Admin API re-poster — bypasses the JSON import problem.

Problem: Ghost's JSON import stored our html but the mobiledoc/lexical
format didn't match what Ghost 5.130's renderer expects, so {{content}}
returned "undefined".

Fix: this script deletes each existing broken post via the Admin API
and re-creates it using ?source=html — that endpoint takes raw HTML
and Ghost handles the lexical conversion server-side, guaranteed to
produce a renderable post.

Usage:
    py _imgtools/ghost_repost_via_api.py <path-to-ghost-import.json>

No external deps (uses stdlib only).
"""

import sys
import json
import hmac
import hashlib
import base64
import time
import urllib.request
import urllib.error
from pathlib import Path

ADMIN_API_URL = "https://preview.avanasurgical.com/blog"
ADMIN_KEY = "6a5dfd2710672a025a1162ec:4193a556352fcfe8e0c7ac1b38a9fa5d33ff607c0becd57190c70a659a7e4142"


def b64url(data):
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()


def make_jwt():
    key_id, secret_hex = ADMIN_KEY.split(":")
    secret = bytes.fromhex(secret_hex)
    header = json.dumps({"alg": "HS256", "typ": "JWT", "kid": key_id}, separators=(",", ":")).encode()
    now = int(time.time())
    payload = json.dumps({"iat": now, "exp": now + 300, "aud": "/admin/"}, separators=(",", ":")).encode()
    signing = f"{b64url(header)}.{b64url(payload)}"
    sig = hmac.new(secret, signing.encode(), hashlib.sha256).digest()
    return f"{signing}.{b64url(sig)}"


def api(method, path, body=None):
    token = make_jwt()
    url = f"{ADMIN_API_URL}/ghost/api/admin{path}"
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(url, method=method, data=data)
    req.add_header("Authorization", f"Ghost {token}")
    req.add_header("Content-Type", "application/json")
    req.add_header("Accept-Version", "v5.0")
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            body = r.read().decode()
            return r.status, json.loads(body) if body else None
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode()) if e.headers.get("Content-Type", "").startswith("application/json") else None


def get_post_id_by_slug(slug):
    status, data = api("GET", f"/posts/slug/{slug}/")
    if status == 200 and data and data.get("posts"):
        return data["posts"][0]["id"]
    return None


def delete_post(post_id):
    status, _ = api("DELETE", f"/posts/{post_id}/")
    return status in (200, 204)


def create_post(post):
    payload = {"posts": [{
        "title": post["title"],
        "slug": post["slug"],
        "html": post["html"],
        "status": "published",
        "published_at": post["published_at"],
        "custom_excerpt": post.get("custom_excerpt") or "",
    }]}
    status, data = api("POST", "/posts/?source=html", payload)
    return status, data


def main():
    if len(sys.argv) < 2:
        print("Usage: py ghost_repost_via_api.py <ghost-import.json>")
        sys.exit(1)

    src = Path(sys.argv[1])
    if not src.exists():
        print(f"  File not found: {src}")
        sys.exit(1)

    with open(src, encoding="utf-8") as f:
        d = json.load(f)

    posts = d["db"][0]["data"]["posts"]
    print(f"  Loaded {len(posts)} posts from {src.name}")
    print(f"  Target: {ADMIN_API_URL}")
    print()

    ok, failed = 0, 0
    for i, p in enumerate(posts, 1):
        slug = p["slug"]
        print(f"  [{i:2}/{len(posts)}] {slug[:50]:<52}", end=" ", flush=True)

        existing_id = get_post_id_by_slug(slug)
        if existing_id:
            deleted = delete_post(existing_id)
            print(f"deleted={'y' if deleted else 'n'}", end=" ")

        status, data = create_post(p)
        if status == 201:
            print("created")
            ok += 1
        else:
            print(f"FAILED status={status}")
            if data:
                err = data.get("errors", [{}])[0]
                print(f"           → {err.get('message', 'unknown')[:120]}")
            failed += 1

    print()
    print(f"  DONE — {ok} succeeded, {failed} failed")


if __name__ == "__main__":
    main()
