#!/bin/bash
# 把 config.js 内联进单文件，用于生成可分享的预览版
cd "$(dirname "$0")"
python3 - <<'PY'
html = open('index.html', encoding='utf-8').read()
cfg  = open('config.js', encoding='utf-8').read()
i18n = open('i18n.js', encoding='utf-8').read()
html = html.replace('<script src="config.js"></script>', '<script>\n'+cfg+'\n</script>')
html = html.replace('<script src="i18n.js"></script>', '<script>\n'+i18n+'\n</script>')
html = html.replace('<title>Cony — Licensed Korean Beauty Coordinator</title>', '<title>Cony Seoul</title>')
open('preview.html','w',encoding='utf-8').write(html)
print('preview.html rebuilt,', len(html), 'bytes')
PY
