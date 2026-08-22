#!/usr/bin/env python3
"""
把 Cony 校对完的 Excel 装回 i18n.js。

用法:  python3 apply-proofread.py 文案校对表_Cony网站.xlsx

会先备份 i18n.js -> i18n.js.bak，然后只覆盖有改动的条目，
并把改了哪些打印出来。［换行］等记号会自动转回 HTML。
"""
import sys, re, shutil
from openpyxl import load_workbook

XLSX = sys.argv[1] if len(sys.argv) > 1 else '文案校对表_Cony网站.xlsx'
LANGS = ('en', 'zh', 'ko', 'th')

def to_html(s):
    if s is None: return None
    s = str(s)
    # 顺序要紧：先长的
    s = (s.replace('&', '&amp;')
           .replace('"', '&quot;')
           .replace('［空行］', '<br><br>').replace('［换行］', '<br>')
           .replace('［粗体］', '<b>').replace('［/粗体］', '</b>'))
    return s.replace('\r', '').strip('\n')

def esc_js(s):
    return s.replace('\\', '\\\\').replace("'", "\\'")

def unesc_js(s):
    return s.replace("\\'", "'").replace('\\\\', '\\')

# ---- 读 Excel ----
ws = load_workbook(XLSX)['文案']
edits = {}
for row in ws.iter_rows(min_row=2, values_only=True):
    key = row[0]
    if not key or str(key).startswith('▌'):      # 分节行
        continue
    edits[str(key).strip()] = {lg: to_html(row[2 + i]) for i, lg in enumerate(LANGS)}
print(f'read {len(edits)} keys from {XLSX}')

# ---- 读 i18n.js ----
src = open('i18n.js', encoding='utf-8').read()
pat = re.compile(
    r"^(    (\w+): \{\n"
    r"      en: ')((?:[^'\\]|\\.)*)(',\n      zh: ')((?:[^'\\]|\\.)*)"
    r"(',\n      ko: ')((?:[^'\\]|\\.)*)(',\n      th: ')((?:[^'\\]|\\.)*)(',\n    \},)",
    re.M)

changed, missing = [], []
def sub(m):
    key = m.group(2)
    raw = {'en': m.group(3), 'zh': m.group(5), 'ko': m.group(7), 'th': m.group(9)}
    cur = {lg: unesc_js(v) for lg, v in raw.items()}   # 比对用未转义的原文
    new = edits.get(key)
    if new is None:
        missing.append(key)
        return m.group(0)
    out = dict(raw)
    for lg in LANGS:
        v = new[lg]
        if v is not None and v != cur[lg]:
            out[lg] = esc_js(v)
            changed.append((key, lg, cur[lg][:38], v[:38]))
    return (m.group(1) + out['en'] + m.group(4) + out['zh'] +
            m.group(6) + out['ko'] + m.group(8) + out['th'] + m.group(10))

new_src, n = pat.subn(sub, src)
print(f'matched {n} entries in i18n.js')
if missing:
    print(f'!! {len(missing)} keys missing from the sheet (left unchanged): {missing[:10]}')

if not changed:
    print('no changes — i18n.js untouched')
else:
    shutil.copy('i18n.js', 'i18n.js.bak')
    open('i18n.js', 'w', encoding='utf-8').write(new_src)
    print(f'\napplied {len(changed)} change(s):\n')
    for key, lg, old, new in changed:
        print(f'  {key:16} [{lg}]  {old!r}\n{"":22}-> {new!r}')
    print('\nbacked up to i18n.js.bak — now run ./build-preview.sh')
