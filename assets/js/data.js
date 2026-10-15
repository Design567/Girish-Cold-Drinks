/* =====================================================================
   Girish Cold Drinks — menu data (single source for the Our Menu page)
   ---------------------------------------------------------------------
   • Item names are exactly as printed on the shop's menu board
     (carried over from the previous website).
   • NO PRICES. Never add a price field here (strict site rule).
   • `img` is the base name of a file in assets/images/products/
     (each exists as <img>-480.webp and <img>-900.webp).
   ===================================================================== */
(function () {
  'use strict';

  var GROUPS = {
    drinks:   'Cold Drinks',
    desserts: 'Ice Cream & Desserts',
    snacks:   'Snacks',
    premix:   'Instant Premix'
  };

  var IMG = {
    'lassi':          { w: 900, h: 1166, alt: 'Glass of creamy lassi topped with dry fruits and saffron, with a splash of milk' },
    'milk-shake':     { w: 900, h: 1328, alt: 'Chocolate milk shake topped with cream, chocolate sauce and a cherry' },
    'fruit-juice':    { w: 900, h: 1310, alt: 'Glass of fresh fruit juice surrounded by mango, orange, strawberry and kiwi' },
    'faluda':         { w: 900, h: 1329, alt: 'Rose faluda layered with ice cream, nuts and rose syrup' },
    'thandai':        { w: 900, h: 1325, alt: 'Glass of thandai topped with pistachios, almonds and rose petals' },
    'cream-shake':    { w: 900, h: 1357, alt: 'Cream shake topped with whipped cream, chocolate, banana and strawberries' },
    'fruit-salad':    { w: 900, h: 1056, alt: 'Cream fruit salad in a glass bowl with mango, kiwi, banana and strawberries' },
    'cold-coco':      { w: 900, h: 1331, alt: 'Glass of cold coco with chocolate drizzle, cream and ice' },
    'shrikhand':      { w: 900, h: 1067, alt: 'Bowl of shrikhand garnished with saffron, almonds and pistachios' },
    'icecream':       { w: 900, h: 1339, alt: 'Ice cream sundae with scoops, chocolate sauce, fruit and a cherry' },
    'pizza':          { w: 900, h: 1293, alt: 'Cheesy vegetable pizza with a stretchy cheese pull' },
    'sandwich':       { w: 900, h: 1399, alt: 'Grilled cheese sandwich with vegetables' },
    'bhel':           { w: 900, h: 1338, alt: 'Bowl of bhel with puffed rice, sev, peanuts, tomato and coriander' },
    'khajur-makhana': { w: 872, h: 1344, alt: 'Girish Cold Drinks Khajur Makhana instant premix pouch' },
    'cold-coco2':     { w: 869, h: 1336, alt: 'Girish Cold Drinks Coco instant premix pouch' },
    'thandai2':       { w: 900, h: 1348, alt: 'Girish Cold Drinks Thandai instant premix pouch' }
  };

  /* bg = soft section tint, accent = strong colour, ink = readable text on bg */
  var CATEGORIES = [
    { slug: 'lassi', name: 'Lassi', group: 'drinks', size: '200 ml', note: 'Also available with ice-cream', img: 'lassi',
      bg: '#d9efff', accent: '#1f6fe0', ink: '#0b2a6b', blurb: 'Sweet, salted, fruity and dry-fruit lassi.',
      items: ['Sweet Lassi', 'Rose Lassi', 'Mango Lassi', 'Sp. Kesar Kaju Lassi', 'Fruit Lassi', 'Jelly Lassi', 'Dry Fruit Lassi', 'Makhania Lassi', 'Salted Lassi'] },
    { slug: 'milk-shake', name: 'Milk Shake', group: 'drinks', size: '200 ml', note: 'Also available with ice-cream', img: 'milk-shake',
      bg: '#f4e2d3', accent: '#8a4a26', ink: '#3b1d0f', blurb: 'Fruit, chocolate, coffee and dry-fruit shakes.',
      items: ['Chikku', 'Pineapple', 'Mango Pleasure', 'Chocolate', 'Strawberry', 'Mango', 'Black Current', 'Sitafal (Custard Apple) (Seasonal)', 'Mix Fruit', 'Cold Coffee', 'Khajoor (Seasonal)', 'Kaju-Anjir'] },
    { slug: 'fresh-fruit-juice', name: 'Fresh Fruit Juice', group: 'drinks', size: '200 ml', note: 'Also available with ice-cream', img: 'fruit-juice',
      bg: '#ffe9a8', accent: '#e07800', ink: '#4a2600', blurb: 'Mosambi, pineapple, litchi and seasonal fruit juices.',
      items: ['Mosambi', 'Orange (Seasonal)', 'Pineapple', 'Pineapple Mosambi (Mara Mari)', 'Black Grape', 'Cocktail', 'Dadam', 'Litchi', 'Apple', 'Orange Pina (Seasonal)', 'Ganga Jamna (Seasonal)', 'Water Melon (Seasonal)', 'Jamun (Seasonal)', 'Falsa (Seasonal)', 'Mosambi/Orange Mix Juice'] },
    { slug: 'faluda', name: 'Faluda', group: 'drinks', size: '250 ml', note: 'Served with ice-cream', img: 'faluda',
      bg: '#ffdbe5', accent: '#d12f67', ink: '#5a0f2a', blurb: 'Kesar, rose, strawberry, chocolate and Rajwadi faluda.',
      items: ['Kesar', 'Rose', 'Strawberry', 'Chocolate', 'Sp. Lilagar Thandai', 'Rajwadi Faluda'] },
    { slug: 'special-thandai', name: 'Special Thandai', group: 'drinks', size: '250 ml', note: '', img: 'thandai',
      bg: '#e6f0cf', accent: '#5f7f1c', ink: '#24320a', blurb: 'Our Lilagar Thandai.',
      items: ['Lilagar Thandai'] },
    { slug: 'cream-shake', name: 'Cream Shake', group: 'drinks', size: '200 ml', note: 'Also available with ice-cream', img: 'cream-shake',
      bg: '#ffe0d6', accent: '#d9485f', ink: '#541320', blurb: 'Rose cream and kesar cream shakes.',
      items: ['Rose Cream', 'Kesar Cream'] },
    { slug: 'cold-coco', name: 'Cold Coco', group: 'drinks', size: '200 ml', note: 'Also available with ice-cream', img: 'cold-coco',
      bg: '#ead6c6', accent: '#6b3418', ink: '#2e140a', blurb: 'Cold coco, plain or with chips, nuts or cashew.',
      items: ['Cold Coco', 'Coco with chips', 'Coco with Nuts', 'Coco with Cashew'] },
    { slug: 'fruit-salad', name: 'Fruit Salad', group: 'desserts', size: '200 ml', note: 'Also available with ice-cream', img: 'fruit-salad',
      bg: '#ffe6c7', accent: '#e8590c', ink: '#4d1d00', blurb: 'Cream fruit salad, with or without jelly.',
      items: ['Sp. Cream Fruit Salad', 'Cream Fruit Salad With Jelly', 'Icecream with Jelly'] },
    { slug: 'shrikhand-sweets', name: 'Shrikhand & Sweets', group: 'desserts', size: '', note: '', img: 'shrikhand',
      bg: '#fff0bf', accent: '#c98a00', ink: '#3f2b00', blurb: 'Shrikhand, matho and basudi.',
      items: ['Kesar Elaychi', 'Mix Fruit', 'Kaju Draksh', 'Anjir Akhrot Matho', 'Cream Fruit Matho', 'Mango Matho', 'Sp. Kesar Pista Basudi', 'Rajbhog Matho'] },
    { slug: 'havmore-icecream', name: 'Havmore Icecream (Scoop)', short: 'Ice Cream Scoops', group: 'desserts', size: '', note: '', img: 'icecream',
      bg: '#ffdce9', accent: '#c2255c', ink: '#4f0d26', blurb: 'Nine flavours, by the scoop.',
      items: ['Vanilla', 'Strawberry', 'Kajudraksh', 'Butter Scotch', 'Chocolate Chips', 'Kesar Pista', 'Almond Carnival', 'American Nuts', 'Rajbhog'] },
    { slug: 'pizza', name: 'Pizza', group: 'snacks', size: '', note: '', img: 'pizza',
      bg: '#ffdccb', accent: '#d9480f', ink: '#4a1500', blurb: 'Italian, Jain, cheese bake and the Sp. Girish Pizza.',
      items: ['Italian Pizza', 'Jain Pizza', 'Pineapple Pizza', 'Cheese Bake Pizza (Italian)', 'Cheese Bake Pizza (Jain)', 'Sp. Girish Pizza (Dry fruits)'] },
    { slug: 'sandwich', name: 'Sandwich', group: 'snacks', size: '', note: '', img: 'sandwich',
      bg: '#f7e6c4', accent: '#a86512', ink: '#3d2200', blurb: 'Chutney, cheese, aloo, club and more.',
      items: ['Vegetable Sandwich (Only Jain)', 'Aloo Mutter Sandwich', 'Chutney Sandwich', 'Cheese Sandwich', 'Cheese Chutney Sandwich', 'Aloo Cheese Sandwich', 'Veg. Cheese Sandwich', 'Cheese Jam Sandwich', 'Mix Sandwich', '3 In One', 'Club (Toast)'] },
    { slug: 'bhel', name: 'Bhel', group: 'snacks', size: '', note: '', img: 'bhel',
      bg: '#fff1c4', accent: '#d97706', ink: '#432400', blurb: 'Sp. Bhel, Sp. Jain Bhel and Cheese Bhel.',
      items: ['Sp. Bhel', 'Sp. Jain Bhel', 'Cheese Bhel'] },
    { slug: 'instant-premix', name: 'Instant Premix', group: 'premix', size: '', note: 'Packaged instant premix range', img: 'khajur-makhana',
      bg: '#e2e9ff', accent: '#1d3fc4', ink: '#0b1d5c', blurb: 'Khajur Makhana, Coco and Thandai premixes.',
      items: [
        { name: 'Khajur Makhana', img: 'khajur-makhana' },
        { name: 'Cold Coco', img: 'cold-coco2' },
        { name: 'Thandai', img: 'thandai2' }
      ] }
  ];

  function slugify(s) {
    return String(s).toLowerCase()
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /* Normalise items into objects; detect "(Seasonal)" so it can be styled. */
  CATEGORIES.forEach(function (c) {
    c.groupLabel = GROUPS[c.group];
    c.items = c.items.map(function (it) {
      var o = typeof it === 'string' ? { name: it } : it;
      var seasonal = /\(Seasonal\)/i.test(o.name);
      var clean = o.name.replace(/\s*\(Seasonal\)\s*/i, '').trim();
      return {
        name: clean,
        seasonal: seasonal,
        slug: slugify(clean),
        img: o.img || c.img
      };
    });
  });

  window.GCD = { groups: GROUPS, categories: CATEGORIES, img: IMG, slugify: slugify };
})();
