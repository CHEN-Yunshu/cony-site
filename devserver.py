#!/usr/bin/env python3
"""本地预览服务器。python 自带的 http.server 会让浏览器缓存 config.js /
i18n.js，改完配置刷新还是旧的。这里强制不缓存。"""
import http.server, socketserver, os, sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 4321
os.chdir(os.path.dirname(os.path.abspath(__file__)))

class NoCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()
    def log_message(self, *a): pass

socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(('', PORT), NoCache) as httpd:
    print(f'serving on http://localhost:{PORT}')
    httpd.serve_forever()
