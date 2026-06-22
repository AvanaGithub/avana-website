#!/usr/bin/env python3
"""
Avana local dev server — handles the same clean-URL rewrites as nginx
so /solutions/knee-pain etc. work locally just like in production.

Run:  python start-server.py
      (or double-click start-server.bat which now calls this)
Open: http://localhost:8000/
"""
import http.server
import socketserver
import sys
from urllib.parse import urlsplit, urlunsplit

PORT = 8000

# Same explicit clean-URL map as solution-loader.js EXPLICIT_ROUTES.
# These are served by /solution-template.html — JS reads the URL.
EXPLICIT_ROUTES = {
    '/solutions/knee-pain',
    '/solutions/foot-ankle-pain',
    '/solutions/shoulder-pain',
    '/solutions/elbow-pain',
    '/solutions/back-pain',
    '/solutions/spine-pain',
    '/solutions/hip-pain',
    '/conditions/osteoarthritis',
    '/conditions/post-surgery-recovery',
    '/solutions/cold-therapy',
    '/solutions/spine-support',
    '/for-surgeons',
}

# Pretty URLs that map to .html files (about → about.html, etc.)
PRETTY_PAGES = {
    '/about':            '/about.html',
    '/careers':          '/careers.html',
    '/testimonials':     '/testimonials.html',
    '/privacy-policy':   '/privacy-policy.html',
    '/testing-landing-page': '/testing-landing-page.html',
    '/kodiak-landing':       '/kodiak-landing.html',
    '/recovery-blueprint':   '/recovery-blueprint.html',
}


class RewriteHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        parts = urlsplit(self.path)
        path = parts.path.rstrip('/')

        # Clean URLs that resolve to the solution template
        if path in EXPLICIT_ROUTES:
            self.path = '/solution-template.html' + (('?' + parts.query) if parts.query else '')
        # Pretty URLs for static pages
        elif path in PRETTY_PAGES:
            self.path = PRETTY_PAGES[path] + (('?' + parts.query) if parts.query else '')
        # /audiences/* and /conditions/* generic prefix (legacy)
        elif path.startswith('/audiences/') or path.startswith('/conditions/'):
            self.path = '/solution-template.html' + (('?' + parts.query) if parts.query else '')
        # /solutions/* fallback (anything we didn't explicitly list)
        elif path.startswith('/solutions/'):
            self.path = '/solution-template.html' + (('?' + parts.query) if parts.query else '')

        return super().do_GET()


if __name__ == '__main__':
    with socketserver.TCPServer(('', PORT), RewriteHandler) as httpd:
        print()
        print('  ===============================================')
        print('   AVANA SURGICAL - Local Preview Server')
        print('  ===============================================')
        print()
        print(f'   Server running at: http://localhost:{PORT}/')
        print()
        print('   Clean URLs that now work locally:')
        print(f'     http://localhost:{PORT}/                              (homepage)')
        print(f'     http://localhost:{PORT}/about')
        print(f'     http://localhost:{PORT}/careers')
        print(f'     http://localhost:{PORT}/testimonials')
        print(f'     http://localhost:{PORT}/solutions/knee-pain')
        print(f'     http://localhost:{PORT}/solutions/back-pain')
        print(f'     http://localhost:{PORT}/conditions/osteoarthritis')
        print(f'     http://localhost:{PORT}/for-surgeons')
        print(f'     http://localhost:{PORT}/_tools/catalog-editor.html    (admin)')
        print()
        print('   Press Ctrl+C to stop.')
        print('  ===============================================')
        print()
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print('\nServer stopped.')
            sys.exit(0)
