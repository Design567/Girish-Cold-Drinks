/* =====================================================================
   Girish Cold Drinks — shared interactions (all pages)
   No dependencies. Every effect respects prefers-reduced-motion.
   ===================================================================== */
(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  var fineMQ = window.matchMedia('(hover: hover) and (pointer: fine)');
  var reduce = function () { return reduceMQ.matches; };
  var html = document.documentElement;

  /* ---------- Year ---------- */
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Header state + scroll progress ---------- */
  var header = $('.header');
  var progress = $('.progress');
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || window.pageYOffset;
      if (header) header.classList.toggle('is-scrolled', y > 30);
      if (progress) {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.setProperty('--p', max > 0 ? Math.min(1, y / max).toFixed(4) : 0);
      }
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile drawer ---------- */
  var burger = $('.burger');
  var drawer = $('#drawer');
  if (burger && drawer) {
    var lastFocus = null;
    var setDrawer = function (open) {
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      drawer.classList.toggle('is-open', open);
      document.body.classList.toggle('drawer-open', open);
      header.classList.toggle('is-scrolled', open || (window.scrollY > 30));
      if (open) {
        lastFocus = document.activeElement;
        setTimeout(function () { var f = $('a', drawer); if (f) f.focus(); }, 80);
      } else if (lastFocus) {
        lastFocus.focus();
      }
    };
    burger.addEventListener('click', function () { setDrawer(burger.getAttribute('aria-expanded') !== 'true'); });
    drawer.addEventListener('click', function (e) { if (e.target.closest('a')) setDrawer(false); });
    document.addEventListener('keydown', function (e) {
      if (!drawer.classList.contains('is-open')) return;
      if (e.key === 'Escape') { setDrawer(false); return; }
      if (e.key === 'Tab') { // keep focus inside the drawer (+ burger)
        var items = [burger].concat($$('a', drawer));
        var i = items.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); items[items.length - 1].focus(); }
        else if (!e.shiftKey && i === items.length - 1) { e.preventDefault(); items[0].focus(); }
      }
    });
    window.addEventListener('resize', function () { if (window.innerWidth > 1023 && drawer.classList.contains('is-open')) setDrawer(false); });
  }

  /* ---------- Split headings into words for a staggered rise ---------- */
  function splitWords(el) {
    if (el.dataset.splitDone) return;
    el.dataset.splitDone = '1';
    var wi = 0;
    var walk = function (node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var parts = child.textContent.split(/(\s+)/);
          var frag = document.createDocumentFragment();
          parts.forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
            var w = document.createElement('span'); w.className = 'w';
            var inner = document.createElement('span'); inner.textContent = p;
            inner.style.setProperty('--wi', wi++);
            w.appendChild(inner); frag.appendChild(w);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1 && child.tagName !== 'BR') {
          // Wrap whole inline elements (e.g. <em>) as one word unit
          var w2 = document.createElement('span'); w2.className = 'w';
          var holder = document.createElement('span'); holder.style.setProperty('--wi', wi++);
          node.replaceChild(w2, child); holder.appendChild(child); w2.appendChild(holder);
        }
      });
    };
    walk(el);
  }
  $$('[data-split]').forEach(splitWords);

  /* ---------- Reveal on scroll ---------- */
  var revealEls = function (root) { return $$('[data-reveal], [data-split]', root); };
  var io = null;
  if ('IntersectionObserver' in window && !reduce()) {
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { reveal(en.target); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  }
  // Once revealed, drop [data-reveal] so the element's own hover/transition styles take over.
  function reveal(el) {
    el.classList.add('is-in');
    if (el.hasAttribute('data-reveal')) {
      var delay = parseFloat(getComputedStyle(el).transitionDelay) || 0;
      setTimeout(function () { el.removeAttribute('data-reveal'); }, 1300 + delay * 1000);
    }
  }
  var pending = [];
  function observeReveals(root) {
    revealEls(root).forEach(function (el) {
      if (io) { io.observe(el); pending.push(el); } else reveal(el);
    });
  }
  // Safety net for very fast scrolling/flings: anything already scrolled
  // into or past the viewport is revealed even if the observer missed it.
  function sweepReveals() {
    if (!pending.length) return;
    var vh = window.innerHeight;
    pending = pending.filter(function (el) {
      if (el.classList.contains('is-in') || !el.isConnected) return false;
      if (el.getBoundingClientRect().top < vh * 0.95) { reveal(el); if (io) io.unobserve(el); return false; }
      return true;
    });
  }
  observeReveals(document);
  // Stagger children: [data-stagger] sets --i on each [data-reveal] child
  $$('[data-stagger]').forEach(function (g) {
    $$('[data-reveal]', g).forEach(function (el, i) { el.style.setProperty('--i', i % 8); });
  });

  /* ---------- Animated counters (real numbers only) ---------- */
  function countUp(el) {
    var to = parseInt(el.getAttribute('data-count'), 10) || 0;
    if (reduce()) { el.textContent = to; return; }
    var start = null, dur = 1400;
    var step = function (t) {
      if (!start) start = t;
      var p = Math.min(1, (t - start) / dur);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  var counters = $$('[data-count]');
  if (counters.length) {
    if ('IntersectionObserver' in window) {
      var cio = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { countUp(e.target); cio.unobserve(e.target); } });
      }, { threshold: 0.6 });
      counters.forEach(function (c) { cio.observe(c); });
    } else counters.forEach(countUp);
  }

  /* ---------- Scroll parallax: [data-speed] ---------- */
  var para = $$('[data-speed]');
  var allowParallax = function () { return !reduce() && window.innerWidth > 760; };
  function runParallax() {
    if (!para.length) return;
    var vh = window.innerHeight;
    para.forEach(function (el) {
      if (!allowParallax()) { el.style.translate = ''; return; }
      var r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      var center = r.top + r.height / 2 - vh / 2;
      var s = parseFloat(el.getAttribute('data-speed')) || 0;
      el.style.translate = '0 ' + (-center * s).toFixed(1) + 'px';
    });
  }
  var pTick = false;
  window.addEventListener('scroll', function () {
    if (pTick) return; pTick = true;
    requestAnimationFrame(function () { runParallax(); runStack(); sweepReveals(); pTick = false; });
  }, { passive: true });
  window.addEventListener('resize', function () { runParallax(); runStack(); });

  /* ---------- Stacked showcases: older panel recedes as the next covers it ---------- */
  var panels = $$('.show');
  function runStack() {
    if (!panels.length || reduce()) return;
    var vh = window.innerHeight;
    panels.forEach(function (p, i) {
      var next = panels[i + 1];
      var inner = $('.show__inner', p);
      if (!next || !inner) return;
      var nt = next.getBoundingClientRect().top;
      var cover = Math.min(1, Math.max(0, 1 - nt / vh));
      inner.style.setProperty('--cover', cover.toFixed(3));
    });
  }
  runParallax(); runStack();

  /* ---------- 3D tilt cards: [data-tilt] ---------- */
  function bindTilt(el) {
    if (el.dataset.tiltBound || !fineMQ.matches || reduce()) return;
    el.dataset.tiltBound = '1';
    var max = parseFloat(el.getAttribute('data-tilt')) || 8;
    var glare = document.createElement('span'); glare.className = 'tilt-glare'; glare.setAttribute('aria-hidden', 'true');
    el.appendChild(glare);
    var raf = null;
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(function () {
        el.style.transform = 'perspective(900px) rotateX(' + ((0.5 - y) * max).toFixed(2) + 'deg) rotateY(' + ((x - 0.5) * max).toFixed(2) + 'deg) translateY(-6px)';
        el.style.setProperty('--gx', (x * 100).toFixed(1) + '%');
        el.style.setProperty('--gy', (y * 100).toFixed(1) + '%');
      });
    });
    el.addEventListener('pointerleave', function () {
      if (raf) cancelAnimationFrame(raf);
      el.style.transform = '';
    });
  }
  $$('[data-tilt]').forEach(bindTilt);

  /* ---------- Pointer depth for layered stages: [data-depth-root] ---------- */
  $$('[data-depth-root]').forEach(function (root) {
    if (!fineMQ.matches || reduce()) return;
    var layers = $$('[data-depth]', root);
    root.addEventListener('pointermove', function (e) {
      var r = root.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      layers.forEach(function (l) {
        var d = parseFloat(l.getAttribute('data-depth')) || 10;
        l.style.translate = (x * d).toFixed(1) + 'px ' + (y * d).toFixed(1) + 'px';
      });
    });
    root.addEventListener('pointerleave', function () { layers.forEach(function (l) { l.style.translate = ''; }); });
  });

  /* ---------- Hero flavour switcher ---------- */
  var hero = $('#hero');
  if (hero) {
    var btns = $$('.flav-btn', hero);
    var items = $$('.stage__item', hero);
    var sats = $$('.stage__sat', hero);
    var tagName = $('[data-flav-name]', hero);
    var cur = 0, timer = null;
    var satImgs = sats.map(function (s) { return $('img', s); });
    var show = function (n, user) {
      if (n === cur || !items[n]) return;
      var prev = items[cur];
      prev.classList.remove('is-active'); prev.classList.add('is-leaving');
      setTimeout(function () { prev.classList.remove('is-leaving'); }, 650);
      items[n].classList.add('is-active');
      btns.forEach(function (b, i) { b.setAttribute('aria-pressed', String(i === n)); });
      hero.style.setProperty('--flav', btns[n].getAttribute('data-color'));
      if (tagName) tagName.textContent = btns[n].getAttribute('data-name');
      // Satellites show the next two flavours
      sats.forEach(function (s, k) {
        var idx = (n + 1 + k) % items.length;
        var src = $('img', items[idx]);
        s.classList.add('is-swapping');
        setTimeout(function () {
          satImgs[k].src = src.currentSrc || src.src;
          satImgs[k].alt = '';
          s.classList.remove('is-swapping');
        }, 300);
      });
      cur = n;
      if (user) restart();
    };
    var restart = function () {
      if (timer) clearInterval(timer);
      if (reduce()) return;
      timer = setInterval(function () { show((cur + 1) % items.length); }, 5200);
    };
    btns.forEach(function (b, i) { b.addEventListener('click', function () { show(i, true); }); });
    hero.addEventListener('pointerenter', function () { if (timer) clearInterval(timer); });
    hero.addEventListener('pointerleave', restart);
    hero.addEventListener('focusin', function () { if (timer) clearInterval(timer); });
    document.addEventListener('visibilitychange', function () { if (document.hidden) { if (timer) clearInterval(timer); } else restart(); });
    restart();
  }

  /* ---------- Coverflow carousel ---------- */
  var cf = $('#cf');
  if (cf) {
    var slides = $$('.cf__slide', cf);
    var cap = $('.cf__caption', cf);
    var word = $('.cf__word', cf);
    var dotsWrap = $('.cf__dots', cf);
    var live = $('.cf__live', cf);
    var idx = 0;
    var dots = slides.map(function (s, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Show ' + s.getAttribute('data-name'));
      b.addEventListener('click', function () { go(i); });
      dotsWrap.appendChild(b); return b;
    });
    var layout = function () {
      var w = window.innerWidth;
      var gap = w < 760 ? 150 : w < 1100 ? 230 : 290;
      slides.forEach(function (s, i) {
        var o = i - idx;
        var n = slides.length;
        if (o > n / 2) o -= n; if (o < -n / 2) o += n; // wrap around
        var a = Math.abs(o);
        var vis = a <= 2;
        s.style.transform = 'translateX(' + (o * gap) + 'px) translateZ(' + (-a * 220) + 'px) rotateY(' + (-o * 28) + 'deg) scale(' + (a === 0 ? 1 : 0.86) + ')';
        s.style.opacity = vis ? (a === 0 ? 1 : a === 1 ? 0.85 : 0.35) : 0;
        s.style.zIndex = String(10 - a);
        s.style.filter = a === 0 ? 'none' : 'blur(' + (a * 1.2) + 'px) saturate(.9)';
        s.style.pointerEvents = vis ? '' : 'none';
        var hit = $('.cf__hit', s);
        if (hit) hit.tabIndex = a === 1 ? 0 : -1;
        s.setAttribute('aria-hidden', String(a !== 0));
      });
      dots.forEach(function (d, i) { d.setAttribute('aria-current', String(i === idx)); });
    };
    var setCaption = function () {
      var s = slides[idx];
      var fill = function () {
        $('h3', cap).textContent = s.getAttribute('data-name');
        $('p', cap).textContent = s.getAttribute('data-cat');
        var a = $('a', cap);
        a.href = s.getAttribute('data-href');
        $('span', a).textContent = 'View in ' + s.getAttribute('data-cat-short');
        if (word) word.textContent = s.getAttribute('data-word');
        if (live) live.textContent = s.getAttribute('data-name') + ', ' + (idx + 1) + ' of ' + slides.length;
        cap.classList.remove('is-changing');
      };
      if (reduce()) { fill(); return; }
      cap.classList.add('is-changing');
      setTimeout(fill, 220);
    };
    var go = function (n) { idx = (n + slides.length) % slides.length; layout(); setCaption(); };
    $('.cf__prev', cf).addEventListener('click', function () { go(idx - 1); });
    $('.cf__next', cf).addEventListener('click', function () { go(idx + 1); });
    slides.forEach(function (s, i) {
      var hit = $('.cf__hit', s);
      if (hit) hit.addEventListener('click', function () { go(i); });
    });
    cf.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(idx - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); go(idx + 1); }
    });
    // Drag / swipe
    var stage = $('.cf__stage', cf), sx = null, moved = false;
    stage.addEventListener('pointerdown', function (e) { sx = e.clientX; moved = false; });
    window.addEventListener('pointerup', function (e) {
      if (sx === null) return;
      var dx = e.clientX - sx; sx = null;
      if (Math.abs(dx) > 40) { moved = true; go(idx + (dx < 0 ? 1 : -1)); }
    });
    stage.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    window.addEventListener('resize', layout);
    layout(); setCaption();
  }

  /* ---------- Lightbox (native <dialog>) ---------- */
  $$('[data-lightbox]').forEach(function (btn) {
    var dlg = document.getElementById(btn.getAttribute('data-lightbox'));
    if (!dlg || typeof dlg.showModal !== 'function') { btn.hidden = true; return; }
    btn.addEventListener('click', function () { dlg.showModal(); });
    $$('[data-close]', dlg).forEach(function (c) { c.addEventListener('click', function () { dlg.close(); }); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  });

  /* ---------- Page transitions between internal pages ---------- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a');
    if (!a || reduce()) return;
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target && a.target !== '_self') return;
    if (a.hasAttribute('download')) return;
    var href = a.getAttribute('href') || '';
    if (!href || href.charAt(0) === '#' || /^(tel:|mailto:|https?:|\/\/)/i.test(href)) return;
    var url = new URL(a.href, location.href);
    var here = new URL(location.href);
    if (url.pathname === here.pathname) return; // same page (e.g. menu.html#lassi while on menu)
    e.preventDefault();
    try { sessionStorage.setItem('gcd-nav', '1'); } catch (err) {}
    html.classList.add('is-leaving');
    setTimeout(function () { location.href = a.href; }, 420);
  });
  // Coming back via the back/forward cache: clear any leaving state
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) html.classList.remove('is-leaving', 'is-entering');
  });
  // Remove the entering class after its animation so it never blocks clicks
  if (html.classList.contains('is-entering')) setTimeout(function () { html.classList.remove('is-entering'); }, 1000);

  /* Expose a tiny API for page scripts (menu.js) */
  window.GCDUI = { observeReveals: observeReveals, bindTilt: bindTilt, reduce: reduce, split: splitWords };
})();
