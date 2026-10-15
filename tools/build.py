#!/usr/bin/env python3
"""Inject the shared partials (head, header, footer) into every page.

Each page contains marker pairs such as
    <!-- @include header -->  ...  <!-- @end header -->
and everything between them is replaced with partials/header.html.
{{cur:<page>}} placeholders become aria-current="page" on the matching page.

Usage:  python3 tools/build.py        (run from the project folder)
The pages are plain HTML, so this is only needed after editing a partial.
"""
import pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
PARTS = ROOT / 'partials'
PAGES = sorted(ROOT.glob('*.html'))

def render(name, page):
    text = (PARTS / f'{name}.html').read_text(encoding='utf-8').strip('\n')
    def cur(m):
        return ' aria-current="page"' if m.group(1) == page else ''
    return re.sub(r'\{\{cur:([a-z0-9-]+)\}\}', cur, text)

changed = 0
for p in PAGES:
    src = p.read_text(encoding='utf-8')
    out = src
    for name in ('head', 'header', 'footer'):
        pat = re.compile(r'(<!-- @include %s -->)(.*?)(<!-- @end %s -->)' % (name, name), re.S)
        out = pat.sub(lambda m: m.group(1) + '\n' + render(name, p.stem) + '\n' + m.group(3), out)
    if out != src:
        p.write_text(out, encoding='utf-8'); changed += 1
    print(f'{p.name}: {"updated" if out != src else "unchanged"}')
print(f'{changed} page(s) updated')
