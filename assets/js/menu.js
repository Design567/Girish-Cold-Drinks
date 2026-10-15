/* =====================================================================
   Our Menu page — category → products → product views
   Routes (hash based, so they also work when opened from disk):
     menu.html                    all categories (filter + search)
     menu.html#lassi              one category and its products
     menu.html#lassi/mango-lassi  one product
   Never renders prices.
   ===================================================================== */
(function () {
  'use strict';
  var D = window.GCD;
  var UI = window.GCDUI || { observeReveals: function () {}, bindTilt: function () {}, reduce: function () { return true; } };
  if (!D) return;

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var root = $('#menu-root');
  var hero = $('.page-hero');
  var status = $('#menu-status');
  var search = $('#menu-search');
  var searchBox = $('.search');
  var segBtns = $$('.seg button');
  var P = 'assets/images/products/';
  var group = 'all';
  var firstRender = true;

  var ARROW = '<svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  var ARROW_L = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>';
  var ARROW_UR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8"/></svg>';
  var PHONE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>';

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }
  function norm(s) { return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  function highlight(text, q) {
    if (!q) return esc(text);
    var i = norm(text).indexOf(norm(q));
    if (i < 0) return esc(text);
    return esc(text.slice(0, i)) + '<mark>' + esc(text.slice(i, i + q.length)) + '</mark>' + esc(text.slice(i + q.length));
  }
  function imgTag(slug, sizes, alt, cls, eager) {
    var m = D.img[slug] || { w: 900, h: 1200, alt: '' };
    return '<img' + (cls ? ' class="' + cls + '"' : '') +
      ' src="' + P + slug + '-900.webp" srcset="' + P + slug + '-480.webp 480w, ' + P + slug + '-900.webp 900w"' +
      ' sizes="' + sizes + '" width="' + m.w + '" height="' + m.h + '" alt="' + esc(alt == null ? m.alt : alt) + '"' +
      (eager ? ' decoding="async"' : ' loading="lazy" decoding="async"') + '>';
  }
  function thumbTag(slug) {
    var m = D.img[slug] || { w: 480, h: 640 };
    return '<img src="' + P + slug + '-480.webp" width="' + Math.round(m.w * 480 / 900) + '" height="' + Math.round(m.h * 480 / 900) + '" alt="" loading="lazy" decoding="async">';
  }
  function vars(c) { return '--bg:' + c.bg + ';--accent:' + c.accent + ';--ink-c:' + c.ink; }
  function catBySlug(s) { for (var i = 0; i < D.categories.length; i++) if (D.categories[i].slug === s) return D.categories[i]; return null; }
  function seasonal(it) { return it.seasonal ? '<span class="tag-s">Seasonal</span>' : ''; }
  function crumbs(list) {
    return '<nav class="crumbs" aria-label="Breadcrumb"><ol>' + list.map(function (l, i) {
      return i === list.length - 1 ? '<li><span aria-current="page">' + esc(l[0]) + '</span></li>' : '<li><a href="' + l[1] + '">' + esc(l[0]) + '</a></li>';
    }).join('') + '</ol></nav>';
  }

  /* ---------- Card templates ---------- */
  function catCard(c, i) {
    return '<a class="cat-card" href="#' + c.slug + '" style="' + vars(c) + ';--i:' + (i % 8) + '" data-tilt="7" data-reveal="pop">' +
      '<span class="cat-card__img">' + imgTag(c.img, '(max-width: 760px) 45vw, 260px', '') + '</span>' +
      '<span class="cat-card__body"><span><span class="cat-card__group">' + esc(c.groupLabel) + '</span><h3>' + esc(c.short || c.name) + '</h3>' +
      '<span class="cat-card__count">' + c.items.length + (c.items.length === 1 ? ' item' : ' items') + '</span></span>' +
      '<span class="cat-card__go" aria-hidden="true">' + ARROW_UR + '</span></span></a>';
  }
  function prodCard(c, it, idx, q, showCat) {
    return '<li data-reveal="up" style="--i:' + (idx % 8) + '"><a class="prod-card" href="#' + c.slug + '/' + it.slug + '" style="' + vars(c) + '">' +
      '<span class="prod-card__img">' + thumbTag(it.img) + '</span>' +
      '<span><span class="prod-card__no">' + (showCat ? esc(c.short || c.name) : String(idx + 1).padStart(2, '0')) + '</span>' +
      '<h3>' + highlight(it.name, q) + seasonal(it) + '</h3>' +
      '<span class="prod-card__cat">' + esc(c.size ? c.size : c.groupLabel) + '</span></span>' +
      '<span class="prod-card__go" aria-hidden="true">' + ARROW + '</span></a></li>';
  }

  /* ---------- Views ---------- */
  function viewAll() {
    var q = search.value.trim();
    hero.classList.remove('page-hero--compact');
    if (q) return viewSearch(q);
    var groups = group === 'all' ? Object.keys(D.groups) : [group];
    var html = '<div class="view">';
    var shown = 0;
    groups.forEach(function (g) {
      var cats = D.categories.filter(function (c) { return c.group === g; });
      if (!cats.length) return;
      shown += cats.length;
      var count = cats.reduce(function (n, c) { return n + c.items.length; }, 0);
      html += '<section class="menu-group" aria-labelledby="g-' + g + '"><div class="menu-group__head"><h2 id="g-' + g + '">' + esc(D.groups[g]) + '</h2><span>' + cats.length + (cats.length === 1 ? ' category' : ' categories') + ' · ' + count + ' items</span></div>' +
        '<div class="menu-cats">' + cats.map(catCard).join('') + '</div></section>';
    });
    html += '</div>';
    setStatus(group === 'all' ? 'Choose a category to see its items.' : 'Showing ' + shown + ' ' + D.groups[group] + ' categories.');
    return { html: html, title: 'Our Menu | Girish Cold Drinks' };
  }

  function viewSearch(q) {
    var hits = [];
    D.categories.forEach(function (c) {
      if (group !== 'all' && c.group !== group) return;
      var catHit = norm(c.name).indexOf(norm(q)) > -1;
      c.items.forEach(function (it) {
        if (catHit || norm(it.name).indexOf(norm(q)) > -1) hits.push([c, it]);
      });
    });
    if (!hits.length) {
      setStatus('No items match “' + q + '”.');
      return { html: '<div class="view menu-empty"><strong>No items match your search.</strong><p>Try another name, or <button type="button" class="btn btn--sm btn--navy" data-reset>show all categories</button></p></div>', title: 'Search | Our Menu | Girish Cold Drinks' };
    }
    setStatus(hits.length + (hits.length === 1 ? ' item matches' : ' items match') + ' “' + q + '”.');
    return {
      html: '<div class="view"><ul class="prod-grid">' + hits.map(function (h, i) { return prodCard(h[0], h[1], i, q, true); }).join('') + '</ul></div>',
      title: 'Search | Our Menu | Girish Cold Drinks'
    };
  }

  function viewCategory(c) {
    hero.classList.add('page-hero--compact');
    var i = D.categories.indexOf(c);
    var prev = D.categories[(i - 1 + D.categories.length) % D.categories.length];
    var next = D.categories[(i + 1) % D.categories.length];
    var badges = '<li><b>' + c.items.length + '</b> ' + (c.items.length === 1 ? 'item' : 'items') + '</li>' +
      (c.size ? '<li><b>' + esc(c.size) + '</b> serve</li>' : '') +
      (c.note ? '<li>' + esc(c.note) + '</li>' : '') +
      '<li>' + esc(c.groupLabel) + '</li>';
    var html = '<div class="view">' +
      '<section class="cat-hero" style="' + vars(c) + '" aria-labelledby="view-title">' +
        '<div class="cat-hero__copy">' +
          crumbs([['Home', 'index.html'], ['Our Menu', 'menu.html'], [c.name]]) +
          '<h2 class="cat-hero__title" id="view-title" tabindex="-1">' + esc(c.name) + '</h2>' +
          '<p class="cat-hero__blurb">' + esc(c.blurb) + '</p>' +
          '<ul class="badges">' + badges + '</ul>' +
          '<div class="btn-row"><a class="btn btn--navy" href="menu.html">' + ARROW_L + ' All categories</a><a class="btn btn--light" href="#' + c.slug + '/' + c.items[0].slug + '">View first item ' + ARROW + '</a></div>' +
        '</div>' +
        '<div class="cat-hero__img">' + imgTag(c.img, '(max-width: 1023px) 60vw, 380px', null, '', true) + '</div>' +
      '</section>' +
      '<h3 class="sr-only">' + esc(c.name) + ' items</h3>' +
      '<ul class="prod-grid">' + c.items.map(function (it, k) { return prodCard(c, it, k, '', false); }).join('') + '</ul>' +
      '<nav class="cat-pager" aria-label="More categories">' +
        pager(prev, 'prev') + pager(next, 'next') +
      '</nav></div>';
    setStatus('');
    return { html: html, title: c.name + ' | Our Menu | Girish Cold Drinks' };
  }
  function pager(c, dir) {
    return '<a class="pager-link pager-link--' + dir + '" href="#' + c.slug + '" style="' + vars(c) + '">' + thumbTag(c.img) +
      '<span><small>' + (dir === 'prev' ? '← Previous category' : 'Next category →') + '</small><strong>' + esc(c.short || c.name) + '</strong></span></a>';
  }

  function viewProduct(c, it) {
    hero.classList.add('page-hero--compact');
    var k = c.items.indexOf(it);
    var others = c.items.filter(function (x) { return x !== it; });
    var badges = '<li>' + esc(c.groupLabel) + '</li>' +
      (c.size ? '<li><b>' + esc(c.size) + '</b> serve</li>' : '') +
      (it.seasonal ? '<li><b>Seasonal</b></li>' : '') +
      (c.note ? '<li>' + esc(c.note) + '</li>' : '');
    var html = '<div class="view">' +
      '<article class="prod-view" style="' + vars(c) + '" aria-labelledby="view-title">' +
        '<div class="prod-view__visual" data-tilt="5">' + imgTag(it.img, '(max-width: 1023px) 80vw, 560px', it.img === c.img ? (it.name + ' — representative ' + c.name + ' photo: ' + D.img[it.img].alt) : null, '', true) + '</div>' +
        '<div class="prod-view__info">' +
          crumbs([['Home', 'index.html'], ['Our Menu', 'menu.html'], [c.short || c.name, '#' + c.slug], [it.name]]) +
          '<a class="prod-view__cat" href="#' + c.slug + '">' + esc(c.name) + '</a>' +
          '<h2 class="prod-view__title" id="view-title" tabindex="-1">' + esc(it.name) + '</h2>' +
          '<ul class="badges">' + badges + '</ul>' +
          '<div class="btn-row"><a class="btn btn--navy" href="#' + c.slug + '">' + ARROW_L + ' Back to ' + esc(c.short || c.name) + '</a><a class="btn btn--ghost-dark" href="tel:+918799460328">' + PHONE + ' Call the shop</a></div>' +
        '</div>' +
      '</article>' +
      (others.length ? '<section class="more-strip" aria-labelledby="more-title"><h2 id="more-title">More in ' + esc(c.short || c.name) + '</h2><ul class="prod-grid">' +
        others.map(function (x) { return prodCard(c, x, c.items.indexOf(x), '', false); }).join('') + '</ul></section>' : '') +
      '<nav class="cat-pager" aria-label="All categories"><a class="pager-link pager-link--prev" href="menu.html" style="--bg:#e4f4ff;--accent:#1d3fc4">' + thumbTag('lassi') + '<span><small>← Back to</small><strong>All categories</strong></span></a></nav>' +
      '</div>';
    setStatus('');
    return { html: html, title: it.name + ' — ' + c.name + ' | Girish Cold Drinks' };
  }

  function setStatus(t) { if (status) status.textContent = t; }

  /* ---------- Router ---------- */
  function parse() {
    var h = decodeURIComponent((location.hash || '').replace(/^#/, ''));
    h = h.replace(/^cat-/, ''); // old site anchors (#cat-lassi)
    if (h === 'havmore-icecream-scoop') h = 'havmore-icecream';
    var parts = h.split('/');
    var c = parts[0] ? catBySlug(parts[0]) : null;
    var it = null;
    if (c && parts[1]) c.items.forEach(function (x) { if (x.slug === parts[1]) it = x; });
    return { c: c, it: it, raw: h };
  }

  function render(fromNav) {
    var r = parse();
    var out;
    if (r.c && r.it) out = viewProduct(r.c, r.it);
    else if (r.c) out = viewCategory(r.c);
    else {
      out = viewAll();
      if (r.raw && !search.value) setStatus('We couldn’t find that page — here are all our categories.');
    }
    var apply = function () {
      root.innerHTML = out.html;
      document.title = out.title;
      UI.observeReveals(root);
      $$('[data-tilt]', root).forEach(UI.bindTilt);
      var reset = $('[data-reset]', root);
      if (reset) reset.addEventListener('click', function () { search.value = ''; searchBox.classList.remove('has-value'); render(true); search.focus(); });
    };
    apply(); // .view entrance animation is CSS-driven (and disabled for reduced motion)

    if (!firstRender && fromNav !== 'search') {
      var top = (r.c ? root : $('.menu-main')).getBoundingClientRect().top + window.scrollY - 96;
      window.scrollTo({ top: Math.max(0, top), behavior: UI.reduce() ? 'auto' : 'smooth' });
      var t = $('#view-title', root);
      if (t) setTimeout(function () { t.focus({ preventScroll: true }); }, 350);
    }
    firstRender = false;
  }

  window.addEventListener('hashchange', function () { render(true); });

  segBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      group = b.getAttribute('data-group');
      segBtns.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      if (location.hash) history.pushState(null, '', location.pathname + location.search);
      render(true);
    });
  });

  var tmr = null;
  search.addEventListener('input', function () {
    searchBox.classList.toggle('has-value', !!search.value);
    clearTimeout(tmr);
    tmr = setTimeout(function () {
      if (location.hash) history.replaceState(null, '', location.pathname + location.search);
      render('search');
    }, 160);
  });
  $('.search__clear').addEventListener('click', function () {
    search.value = ''; searchBox.classList.remove('has-value'); render('search'); search.focus();
  });
  $('#menu-form').addEventListener('submit', function (e) { e.preventDefault(); render('search'); });

  // Accept ?q= from other pages or bookmarks
  var params = new URLSearchParams(location.search);
  var qp = params.get('q');
  if (qp) { search.value = qp; searchBox.classList.add('has-value'); }
  var gp = params.get('group');
  if (gp && D.groups[gp]) {
    group = gp;
    segBtns.forEach(function (x) { x.setAttribute('aria-pressed', String(x.getAttribute('data-group') === gp)); });
  }

  render(false);
})();
