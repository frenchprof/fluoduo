#!/usr/bin/env python3
"""Serve out/ the way Cloudflare Pages does: /a/b and /a/b/ → /a/b.html."""
import http.server, os, sys, urllib.parse

ROOT = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else "out")
PORT = int(sys.argv[2]) if len(sys.argv) > 2 else 4173


class H(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=ROOT, **k)

    def translate_path(self, path):
        p = urllib.parse.unquote(urllib.parse.urlparse(path).path)
        fs = os.path.join(ROOT, p.lstrip("/"))
        if os.path.isdir(fs):
            idx = os.path.join(fs, "index.html")
            if os.path.isfile(idx):
                return idx
            html = fs.rstrip("/") + ".html"
            if os.path.isfile(html):
                return html
        if not os.path.exists(fs) and os.path.isfile(fs + ".html"):
            return fs + ".html"
        return fs

    def log_message(self, *a):
        pass


http.server.ThreadingHTTPServer(("127.0.0.1", PORT), H).serve_forever()
