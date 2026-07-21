#!/usr/bin/env python3
"""
WordPress WXR XML → Ghost 5 import JSON converter.

Ghost's migrate CLI (@tryghost/migrate wp-xml) has a Windows path bug
that doubles the C:\\ prefix. This script sidesteps npm entirely — pure
Python stdlib, no dependencies, works on any OS.

Usage:
    py _imgtools/wp_to_ghost.py "path\\to\\wp-export.xml" [output.json]

If output filename omitted, writes to ghost-import.json next to the XML.
Then upload the .json via Ghost admin → Settings → Labs → Import content.

Scope:
    - Extracts published posts (skips drafts, private, trash)
    - Preserves slugs 1:1 (critical for SEO — matches old URLs)
    - Preserves publish dates
    - Keeps post HTML as-is (WordPress and Ghost both use HTML)
    - Converts categories + tags → Ghost tags
    - Ignores media/attachments (URLs stay pointing at old WP site;
      re-upload images later if the old site goes offline)
    - Assigns all posts to the current Ghost admin user (default behavior)
"""

import sys
import json
import re
import uuid
import time
import html
from pathlib import Path
from datetime import datetime, timezone
from xml.etree import ElementTree as ET

WP_NS = "{http://wordpress.org/export/1.2/}"
CONTENT_NS = "{http://purl.org/rss/1.0/modules/content/}"
DC_NS = "{http://purl.org/dc/elements/1.1/}"


def parse_wp_date(date_str):
    """WP export dates look like '2024-01-15 14:30:00'. Return ISO with UTC."""
    if not date_str or date_str == "0000-00-00 00:00:00":
        return None
    try:
        dt = datetime.strptime(date_str.strip(), "%Y-%m-%d %H:%M:%S")
        dt = dt.replace(tzinfo=timezone.utc)
        return dt.strftime("%Y-%m-%dT%H:%M:%S.000Z")
    except ValueError:
        return None


def slugify(name):
    """Simple slug for tags — lowercase, dashes, alphanumeric."""
    s = re.sub(r"[^a-zA-Z0-9]+", "-", name.lower()).strip("-")
    return s or "tag"


def convert(xml_path, out_path):
    tree = ET.parse(xml_path)
    root = tree.getroot()
    channel = root.find("channel")
    if channel is None:
        raise SystemExit("No <channel> in the XML — is this a WordPress export?")

    posts = []
    tag_names = set()
    posts_tags = []
    post_id_counter = 0

    for item in channel.findall("item"):
        post_type = item.findtext(f"{WP_NS}post_type") or "post"
        status = item.findtext(f"{WP_NS}status") or ""
        if post_type != "post":
            continue
        if status != "publish":
            continue

        title = item.findtext("title") or ""
        slug = item.findtext(f"{WP_NS}post_name") or ""
        html_content = item.findtext(f"{CONTENT_NS}encoded") or ""
        pub_date = item.findtext(f"{WP_NS}post_date")
        excerpt = item.findtext(f"{WP_NS}post_excerpt") or ""

        published_at = parse_wp_date(pub_date)
        if not published_at:
            continue

        post_id_counter += 1
        this_post_id = post_id_counter
        post_uuid = str(uuid.uuid4())

        # Ghost 5.130 uses Lexical as its primary editor format. Mobiledoc
        # is legacy — Ghost stores it but {{content}} in themes reads
        # lexical first and returns "undefined" if lexical is empty.
        # We output BOTH — lexical for the renderer + mobiledoc as
        # fallback + html for direct DB access. Belt-and-suspenders-and-belt.
        lexical = json.dumps({
            "root": {
                "children": [
                    {
                        "type": "html",
                        "version": 1,
                        "html": html_content
                    }
                ],
                "direction": None,
                "format": "",
                "indent": 0,
                "type": "root",
                "version": 1
            }
        })
        mobiledoc = json.dumps({
            "version": "0.3.1",
            "atoms": [],
            "cards": [["html", {"html": html_content}]],
            "markups": [],
            "sections": [[10, 0]]
        })
        posts.append({
            "id": this_post_id,
            "uuid": post_uuid,
            "title": html.unescape(title),
            "slug": slug or slugify(title),
            "lexical": lexical,
            "mobiledoc": mobiledoc,
            "html": html_content,
            "feature_image": None,
            "featured": False,
            "type": "post",
            "status": "published",
            "visibility": "public",
            "created_at": published_at,
            "updated_at": published_at,
            "published_at": published_at,
            "custom_excerpt": html.unescape(excerpt.strip()) if excerpt.strip() else None,
        })

        for cat in item.findall("category"):
            name = (cat.text or "").strip()
            if not name:
                continue
            tag_names.add(name)
            posts_tags.append({
                "post_id": this_post_id,
                "tag_slug": slugify(name),
            })

    tags = []
    slug_to_id = {}
    for i, name in enumerate(sorted(tag_names), start=1):
        s = slugify(name)
        slug_to_id[s] = i
        tags.append({
            "id": i,
            "name": name,
            "slug": s,
            "description": None,
            "feature_image": None,
            "visibility": "public",
        })

    post_tag_rows = []
    for i, rel in enumerate(posts_tags, start=1):
        tag_id = slug_to_id.get(rel["tag_slug"])
        if tag_id:
            post_tag_rows.append({
                "id": i,
                "post_id": rel["post_id"],
                "tag_id": tag_id,
            })

    ghost_export = {
        "db": [{
            "meta": {
                "exported_on": int(time.time() * 1000),
                "version": "5.130.6",
            },
            "data": {
                "posts": posts,
                "tags": tags,
                "posts_tags": post_tag_rows,
            },
        }],
    }

    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(ghost_export, f, ensure_ascii=False, indent=2)

    print(f"  Posts converted:    {len(posts)}")
    print(f"  Tags:               {len(tags)}")
    print(f"  Post-tag links:     {len(post_tag_rows)}")
    print(f"  Output written to:  {out_path}")
    print()
    print("  Next step: Ghost admin → Settings → Labs → Import content → upload this .json")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    xml_path = Path(sys.argv[1])
    if not xml_path.exists():
        raise SystemExit(f"File not found: {xml_path}")

    if len(sys.argv) >= 3:
        out_path = Path(sys.argv[2])
    else:
        out_path = xml_path.parent / "ghost-import.json"

    print(f"  Reading:  {xml_path}")
    convert(xml_path, out_path)
