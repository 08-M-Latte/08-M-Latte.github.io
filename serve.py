#!/usr/bin/env python3
"""ローカル開発用サーバー。

キャッシュは「使えるが必ず検証する」方式 (Cache-Control: no-cache):
- 更新がなければ 304 で軽く済む
- 更新があれば即座に最新内容が配信される
"""

from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class RevalidateHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()


if __name__ == "__main__":
    server = ThreadingHTTPServer(("0.0.0.0", 8080), RevalidateHandler)
    print("Serving on http://localhost:8080/ (Cache-Control: no-cache)")
    server.serve_forever()
