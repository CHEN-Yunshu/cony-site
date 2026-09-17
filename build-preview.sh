#!/bin/bash
# 生成包含代码与照片的独立预览文件；不依赖同目录的 assets。
set -e
cd "$(dirname "$0")"
python3 - <<'PY'
from pathlib import Path
import base64, mimetypes, re
root = Path('.')
html = (root / 'index.html').read_text(encoding='utf-8')
css = (root / 'styles.css').read_text(encoding='utf-8')
html = html.replace('<link rel="stylesheet" href="styles.css">', '<style>\n' + css + '\n</style>')
# 内联脚本移动到 body 末尾，避免失去 defer 后在 DOM 构建前运行。
scripts = []
for name in ('config.js', 'i18n.js', 'app.js'):
    html = re.sub(r'<script src="' + re.escape(name) + r'"(?: defer)?></script>', '', html)
    script = (root / name).read_text(encoding='utf-8').replace('</script', '<\\/script')
    scripts.append('<script>\n' + script + '\n</script>')
html = html.replace('</body>', '\n'.join(scripts) + '\n</body>')
for asset in sorted((root / 'assets').iterdir()):
    if not asset.is_file() or asset.suffix.lower() not in ('.jpg', '.png', '.webp', '.svg'):
        continue
    name = asset.as_posix()
    if name not in html:
        continue
    mime = mimetypes.guess_type(name)[0]
    data = 'data:' + mime + ';base64,' + base64.b64encode(asset.read_bytes()).decode('ascii')
    html = html.replace('"' + name + '"', '"' + data + '"')
    html = html.replace("'" + name + "'", "'" + data + "'")
(root / 'preview.html').write_text(html, encoding='utf-8')
print('preview.html rebuilt:', round(len(html.encode()) / 1024), 'KB')
PY
