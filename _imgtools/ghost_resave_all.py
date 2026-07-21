#!/usr/bin/env python3
"""
Ghost Admin API: re-save every post to force Ghost to fully process
the lexical → html rendering. Some API-created posts don't trigger
the same save pipeline that manual editor saves do, leaving frontend
{{content}} to return "undefined" even though DB has real content.

Usage:  py _imgtools/ghost_resave_all.py

Run only after: ghost_repost_via_api.py has already created posts.
"""

import json, hmac, hashlib, base64, time, urllib.request, urllib.error

ADMIN_API_URL = "https://preview.avanasurgical.com/blog"
ADMIN_KEY = "6a5dfd2710672a025a1162ec:4193a556352fcfe8e0c7ac1b38a9fa5d33ff607c0becd57190c70a659a7e4142"


def b64url(d): return base64.urlsafe_b64encode(d).rstrip(b"=").decode()

def make_jwt():
    kid, sec = ADMIN_KEY.split(":")
    h = json.dumps({"alg":"HS256","typ":"JWT","kid":kid},separators=(",",":")).encode()
    p = json.dumps({"iat":int(time.time()),"exp":int(time.time())+300,"aud":"/admin/"},separators=(",",":")).encode()
    s = f"{b64url(h)}.{b64url(p)}"
    sig = hmac.new(bytes.fromhex(sec), s.encode(), hashlib.sha256).digest()
    return f"{s}.{b64url(sig)}"

def api(method, path, body=None):
    url = f"{ADMIN_API_URL}/ghost/api/admin{path}"
    req = urllib.request.Request(url, method=method, data=json.dumps(body).encode() if body else None)
    req.add_header("Authorization", f"Ghost {make_jwt()}")
    req.add_header("Content-Type", "application/json")
    req.add_header("Accept-Version", "v5.0")
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            data = r.read().decode()
            return r.status, json.loads(data) if data else None
    except urllib.error.HTTPError as e:
        try:
            return e.code, json.loads(e.read().decode())
        except Exception:
            return e.code, None

def main():
    status, data = api("GET", "/posts/?limit=all&formats=html,lexical")
    if status != 200:
        print(f"  Failed to list: {status}"); return
    posts = data["posts"]
    print(f"  Found {len(posts)} posts. Re-saving each...")
    print()

    ok, failed = 0, 0
    for i, p in enumerate(posts, 1):
        pid = p["id"]
        slug = p["slug"]
        print(f"  [{i:2}/{len(posts)}] {slug[:50]:<52}", end=" ", flush=True)
        # PUT with the same lexical + a touch to updated_at forces full re-render
        payload = {"posts": [{
            "lexical": p["lexical"],
            "updated_at": p["updated_at"],  # concurrency check
        }]}
        s, d = api("PUT", f"/posts/{pid}/?source=", payload)
        if s == 200:
            print("saved")
            ok += 1
        else:
            print(f"FAILED status={s}")
            if d:
                err = d.get("errors", [{}])[0]
                print(f"           → {err.get('message', 'unknown')[:120]}")
            failed += 1

    print()
    print(f"  DONE — {ok} saved, {failed} failed")

if __name__ == "__main__":
    main()
