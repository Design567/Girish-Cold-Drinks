# Girish Cold Drinks — Website (2026 redesign)

A colourful, image-led, fully animated website for **Girish Cold Drinks**, C. G. Road, Navrangpura, Ahmedabad.
It is built on the same technology as the previous site (plain HTML, CSS and JavaScript, no framework and no build step), and it uses the product images supplied in `Images.zip`.

**No prices are shown anywhere on the site.** There is no price data in the source, and `tools/check.py` and the browser tests both check for prices (see "Testing").

---

## 1. Run the website

**Requirements:** any modern browser (Chrome, Edge, Firefox or Safari from 2023 or later). There are no dependencies to install.

**Option A: open from disk.** Unzip the folder and double-click `index.html`. Every page and every menu link works from disk.

**Option B: local web server (recommended for testing).** You need Python 3.8+.

```bash
cd girish-cold-drinks-website
python3 -m http.server 8080
# then open http://localhost:8080
```

**Deploy:** upload the whole folder to any static host, such as Netlify, Vercel, GitHub Pages, cPanel or S3. It needs no server-side code.

You need an internet connection for the Google Fonts (Bricolage Grotesque, Plus Jakarta Sans and Kaushan Script) and for the Google Map on the Contact page. Without one, the site falls back to system fonts and still works.

## 2. Build and validation commands (optional, Python 3.8+)

| Command | What it does |
|---|---|
| `python3 tools/build.py` | Copies the shared `partials/` (head, header, footer) into every page. Run it after you edit a partial. |
| `python3 tools/check.py` | Checks that every linked file, image, `#anchor` and `menu.html#category/item` link exists, that every `<img>` has `alt`, `width` and `height`, and that no prices, currency symbols or price wording appear anywhere. It exits with code 1 on failure. |

## 3. Pages and routes

| Page | Contents |
|---|---|
| `index.html` | Hero with a drink switcher → scrolling ribbons → **Pick your craving** category cards → **Signature** 3D carousel → **Premix showcases** (Khajur Makhana, Cold Coco, Thandai) → **Our Story** (with `history1.jpg`) → **Why visit** counters → **Good vibes** promo → **Visit us** → footer |
| `menu.html` | **Our Menu**. Shows category cards grouped by type, with filters (All, Cold Drinks, Desserts, Snacks, Premix) and a search box. |
| `menu.html#lassi` | One category: a large photo, item count, serve size and note, the product cards, breadcrumbs, and previous/next category links |
| `menu.html#lassi/mango-lassi` | One product: a large photo, breadcrumbs, a back-to-category link and "More in Lassi". The browser Back button works. |
| `menu.html?group=snacks` | The menu opened with a filter already applied. Old links such as `#cat-lassi` still work. |
| `about.html` | About us, what we serve, the premix range, why visit, and visit us |
| `history.html` | The full story as a timeline, the newspaper article (with a zoom lightbox), and the "Legacy of taste" line |
| `contact.html` | Address, phone, hours, directions, the Google Map, and a promo |

The homepage shows **categories only**. The individual products appear after a visitor picks a category.

## 4. Folder structure

```
index.html  about.html  menu.html  history.html  contact.html
assets/
  css/main.css            Design tokens, components, responsive rules, motion system
  js/main.js              Shared: header, mobile drawer, reveals, parallax, 3D tilt,
                          hero switcher, carousel, counters, lightbox, page transitions
  js/data.js              THE MENU: 14 categories / 92 items (edit items here)
  js/menu.js              Our Menu router: categories → products → product
  images/products/        Supplied images as optimised WebP (…-480.webp and …-900.webp)
  images/products/Cold_Coco1.jpeg   Original supplied JPEG (fallback for the showcase)
  images/history/history1.jpg|.webp Supplied history image
  logo.svg, favicon-32.png, apple-touch-icon.png   (kept from the existing site)
partials/                 Shared head / header / footer (see tools/build.py)
tools/build.py, tools/check.py
```

### Edit the menu

Open `assets/js/data.js` and add, rename or remove item names in a category's `items` list. The Our Menu page, search, category counts and product pages update automatically. If you add a whole new category, also give it a card on the homepage (`index.html`, "Pick your craving") if you want it featured there. **Never add a price field.**

## 5. Supplied images and where they are used

Each image was resized to 480 px and 900 px wide WebP. Transparency was kept, and only empty transparent margins were trimmed (no product was cropped). Cut-outs use `object-fit: contain`. Every image below the fold uses `loading="lazy"` with `srcset` and `sizes`.

| Supplied file | Used for |
|---|---|
| `Lassi.png` | Lassi category, hero (default drink), signature carousel, about, history timeline |
| `Milk-shake.png` | Milk Shake category, carousel ("Chocolate"), about hero, timeline |
| `Fruit juice.png` | Fresh Fruit Juice category, carousel ("Cocktail"), promo collage, why card, timeline |
| `Faluda.png` | Faluda category, hero switcher, carousel, promo |
| `Thandai.png` | Special Thandai category, carousel, Thandai showcase (glass) |
| `Cream shake.png` | Cream Shake category |
| `Fruit Salad.png` | Fruit Salad category, carousel |
| `Cold coco.png` | Cold Coco category, hero switcher, Cold Coco showcase (glass), about |
| `Shrikhand.png` | Shrikhand & Sweets category, carousel, about |
| `icecream.png` | Havmore Icecream (Scoop) category, carousel, promo, contact hero |
| `pizza.png`, `sandwich.png`, `Bhel.png` | Pizza, Sandwich and Bhel categories, carousel, visit section, heroes |
| **`Khajur_Makhana.png`** | **Khajur Makhana showcase** (main visual) and the Instant Premix product |
| **`Cold_Coco1.jpeg`** | **Cold Coco showcase** (main visual, framed) |
| **`Thandai1.png`** | **Thandai showcase** (main visual, framed) |
| `Cold_Coco2.png`, `Thandai2.png` | Instant Premix product pages and about-page premix cards (transparent pouches) |
| `Mango_Mastani1.png` | Hero drink switcher ("Mango Mastani") |
| **`history1.jpg`** | **Our Story** section (home) and the History page, with a full-size lightbox |
| `Khajur_Makhana1.png` | Not used. It is the same pouch as `Khajur_Makhana.png` in a scene, and showing both would repeat the product. |

The cartoon-style 3D drink renders and the hot-linked stock photos from the previous version are no longer used, because every category now has a supplied product image. Their files and the renderer tooling have been removed from the project.

## 6. Design system (summary)

- **Blues:** navy `#071640`, deep `#0a2470`, royal `#1d3fc4`, blue `#2a63f5`, sky `#5cc6ff`, light `#e4f4ff`
- **Warm neutrals:** cream `#fff8ec`, beige `#f6ead6`
- **Accents:** mango `#ffc21a`, orange `#ff7a1a`, logo berry `#a32669`
- **Category colours:** each category has a soft background, an accent and a text colour, taken from its photo (see `data.js`)
- **Showcase themes:** Khajur Makhana in gold and date, Cold Coco in deep chocolate, Thandai in pistachio and rose
- **Type:** headings use Bricolage Grotesque (800). Body text uses Plus Jakarta Sans at 18 px with a 1.65 line height. A Kaushan Script accent echoes the "legacy of taste" script on the packaging. Sizes are fluid, set with `clamp()`.
- **Motion:** scroll reveals (fade, rise, zoom, pop and clip), word-by-word heading reveals, scroll parallax, pointer depth layers, 3D tilt cards, stacking sticky showcases, a 3D carousel, ribbons, floating products, a curtain page transition and a scroll progress bar. **Everything turns off under `prefers-reduced-motion`**, and parallax is disabled on small screens.

## 7. Accessibility and quality

The site includes a skip link, visible focus rings, keyboard support (carousel arrow keys, Esc closes the drawer and lightbox), a focus trap in the mobile drawer, `aria-current` navigation, breadcrumbs, live regions for search results and the carousel, alt text on every content image, and empty `alt` on decorative images. Image `width` and `height` are set to prevent layout shift. Tap targets are at least 44 px, and there is no horizontal overflow from 360 px to 1440 px. A `<noscript>` fallback lists the full menu.

## 8. Testing performed

- `python3 tools/check.py`: all 5 pages and about 585 references, 157 images and 14 menu categories pass. No price wording was found.
- Headless Chromium (Playwright), on every page at **1440, 1024, 768, 390 and 360 px** widths, checked for:
  - no prices in the rendered text, titles, meta tags or attributes
  - no broken images
  - no horizontal overflow
  - no JavaScript errors
  - no content left hidden after scrolling
- **All 14 category routes and all 92 product routes** render the correct heading and the correct number of products, with no prices.
- The tests also exercised these interactions:
  - Category → product → back to category, including the browser Back button.
  - Search ("mango" finds 4 items) and the empty-search state with reset.
  - Group filters and `?group=` links, and the legacy `#cat-lassi` link.
  - The hero switcher and the hero CTA smooth-scrolling to the categories section.
  - Carousel next and arrow keys, and every carousel link resolves to a product.
  - Lightbox open and close.
  - The page transition clears after navigation.
  - Mobile drawer open, Esc, focus and navigation.
  - The skip link and focus outline.
  - With reduced motion, all content is visible at once.
- The site was also opened directly from disk (`file://`).

## 9. Please verify before launch (owner checklist)

1. **History text.** The Our Story text is summarised and translated from the Gujarati newspaper feature in `history1.jpg` ("Heroes of Amdavad"). Please check the wording and the names (Vashrambhai Thakkar; his son Girish; the six sons; the move from Saurashtra; the shop in Manek Chowk; "Girish Cold Drinks char rasta").
2. **Founding year.** The newspaper gives **1948–49**, but the pouches say **"Since 1952"**. Because the two sources disagree, the site shows **no founding year**. Add one once it is confirmed.
3. **Mango Mastani.** `Mango_Mastani1.png` appears in the hero switcher, but Mango Mastani is **not on the menu board**. Add it to `data.js` if you sell it, or swap the image.
4. **Instant Premix category.** This category (Khajur Makhana, Cold Coco, Thandai) was added from the supplied pouch images. The site makes no claims about pack size, availability or preparation. Please confirm that these are sold.
5. **Product photos.** Each category's photo also illustrates every item in that category, and it is labelled as a representative photo on product pages.
6. **"Havmore" spelling.** This is kept exactly as printed on the menu board. The brand usually writes it "Havmor".
7. **Before going live:** add `<link rel="canonical">` and change `og:image` to an absolute URL on your domain. Social links were not added because no verified profile URLs were supplied. Add them to `partials/footer.html` and run `tools/build.py`.

Business details (unchanged from the previous site, as confirmed by the owner): GROUND FLOOR, Abhishek Complex, 1, Chimanlal Girdharlal Road, near Girish Cold Drinks, Mithakhali, Navrangpura, Ahmedabad, Gujarat 380006 · 087994 60328 · Monday–Sunday 10:30 AM – 12:00 AM.
