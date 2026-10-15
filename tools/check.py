#!/usr/bin/env python3
"""Static validation for the Girish Cold Drinks website.

Checks
  1. Every local file referenced by the pages (href, src, srcset, CSS url())
     exists — including the product images named in assets/js/data.js.
  2. Every in-page / cross-page #anchor points to a real id, and every
     menu.html#category[/item] link matches the menu data.
  3. Every <img> has an alt attribute and width/height (prevents layout shift).
  4. NO PRICES: no currency symbols, "Rs", "INR", "MRP", "price", "per kg",
     "/-" or similar anywhere in the pages, scripts, styles or partials.

Usage:  python3 tools/check.py      (exit code 1 if anything fails)
"""
import json, pathlib, re, sys
from html.parser import HTMLParser

ROOT = pathlib.Path(__file__).resolve().parent.parent
PAGES = sorted(ROOT.glob('*.html'))
errors = []

class Collect(HTMLParser):
    def __init__(self):
        super().__init__()
        self.refs, self.ids, self.imgs = [], set(), []
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if 'id' in a: self.ids.add(a['id'])
        for k in ('href', 'src'):
            if a.get(k): self.refs.append(a[k])
        if a.get('srcset'):
            self.refs += [p.strip().split(' ')[0] for p in a['srcset'].split(',')]
        if a.get('imagesrcset'):
            self.refs += [p.strip().split(' ')[0] for p in a['imagesrcset'].split(',')]
        if tag == 'img': self.imgs.append(a)

# ---- menu data (parsed from data.js without running it)
data_js = (ROOT / 'assets/js/data.js').read_text(encoding='utf-8')
def slugify(s):
    s = s.lower().replace('&', ' and ')
    return re.sub(r'^-+|-+$', '', re.sub(r'[^a-z0-9]+', '-', s))
cats = {}
for m in re.finditer(r"\{ slug: '([^']+)'.*?img: '([^']+)'.*?items: \[(.*?)\] \}", data_js, re.S):
    slug, img, body = m.group(1), m.group(2), m.group(3)
    names = re.findall(r"name: '([^']+)'", body) or re.findall(r"'([^']+)'", body)
    imgs = re.findall(r"img: '([^']+)'", body) + [img]
    items = {slugify(re.sub(r'\s*\(Seasonal\)\s*', '', n, flags=re.I).strip()) for n in names}
    cats[slug] = items
    for im in imgs:
        for size in (480, 900):
            f = ROOT / f'assets/images/products/{im}-{size}.webp'
            if not f.exists(): errors.append(f'data.js: missing image {f.relative_to(ROOT)}')
if len(cats) < 14: errors.append(f'data.js: expected 14 categories, parsed {len(cats)}')

# ---- pages
page_ids = {}
parsed = {}
for p in PAGES:
    c = Collect(); c.feed(p.read_text(encoding='utf-8'))
    parsed[p.name] = c; page_ids[p.name] = c.ids

for name, c in parsed.items():
    for r in c.refs:
        if re.match(r'^(https?:|tel:|mailto:|data:|//)', r): continue
        path, _, frag = r.partition('#')
        target = name if path == '' else path.split('?')[0]
        if path and not (ROOT / target).exists():
            errors.append(f'{name}: missing file {r}'); continue
        if frag:
            if target == 'menu.html' and name != 'menu.html' or (target == 'menu.html' and path):
                parts = frag.split('/')
                if parts[0] not in cats: errors.append(f'{name}: unknown menu category #{frag}')
                elif len(parts) > 1 and parts[1] not in cats[parts[0]]: errors.append(f'{name}: unknown menu item #{frag}')
            elif target.endswith('.html') and frag not in page_ids.get(target, set()):
                errors.append(f'{name}: anchor #{frag} not found in {target}')
    for a in c.imgs:
        if 'alt' not in a: errors.append(f'{name}: <img src={a.get("src")}> has no alt')
        if not (a.get('width') and a.get('height')): errors.append(f'{name}: <img src={a.get("src")}> has no width/height')

# ---- CSS url() references
for css in ROOT.glob('assets/css/*.css'):
    for u in re.findall(r'url\(["\']?([^)"\']+)', css.read_text(encoding='utf-8')):
        if u.startswith(('data:', 'http')): continue
        if not (css.parent / u).exists(): errors.append(f'{css.name}: missing {u}')

# ---- NO PRICES
price = re.compile(r'(₹|\bRs\.?\s?\d|\bINR\b|\bMRP\b|\bprices?\b|\bpricing\b|per\s+kg|per\s+scoop|\d\s*/-|\$\s?\d)', re.I)
scan = PAGES + list(ROOT.glob('partials/*.html')) + list(ROOT.glob('assets/js/*.js')) + list(ROOT.glob('assets/css/*.css'))
for f in scan:
    for i, line in enumerate(f.read_text(encoding='utf-8').splitlines(), 1):
        for m in price.finditer(line):
            ctx = line[max(0, m.start() - 30): m.end() + 30]
            # allow the explicit "no prices" developer comments in data.js / menu.js
            if f.suffix == '.js' and re.search(r'(NO PRICES|never add a price|Never renders prices|show prices)', line, re.I):
                continue
            errors.append(f'PRICE? {f.relative_to(ROOT)}:{i}: …{ctx.strip()}…')

print(f'Checked {len(PAGES)} pages, {sum(len(c.refs) for c in parsed.values())} references, {sum(len(c.imgs) for c in parsed.values())} images, {len(cats)} menu categories.')
if errors:
    print('\n'.join('  ✗ ' + e for e in errors)); sys.exit(1)
print('  ✓ All files, anchors, menu links and image attributes are valid.')
print('  ✓ No prices, currency symbols or price wording found.')
