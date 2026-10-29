/* Shared runtime for every design: profile, EN/AR strings, image paths, lightbox, scroll reveal. */
(function () {
  'use strict';

  var profile = {
    name: { en: 'Osama Nabil', ar: 'أسامة نبيل' },
    email: 'osamanabil419700@gmail.com'
  };

  var strings = window.PORTFOLIO_STRINGS || { en: {}, ar: {} };

  var projects = window.PORTFOLIO_PROJECTS || [];
  var root = document.documentElement;
  var base = root.getAttribute('data-base') || '';
  var listeners = [];

  function readLang() {
    var q = new URLSearchParams(location.search).get('lang');
    if (q === 'ar' || q === 'en') return q;
    try { var s = localStorage.getItem('pf-lang'); if (s === 'ar' || s === 'en') return s; } catch (e) {}
    return 'en';
  }

  var PF = {
    profile: profile,
    projects: projects,
    lang: readLang(),
    t: function (key) { return (strings[PF.lang] && strings[PF.lang][key]) || strings.en[key] || key; },
    name: function () { return profile.name[PF.lang]; },
    pick: function (obj) { return obj ? (obj[PF.lang] || obj.en) : ''; },
    img: function (slug, file) { var m = window.PF_IMG_MAP; return (m && m[slug + '/' + file]) || base + 'assets/work/' + slug + '/' + file; },
    cover: function (p) { return PF.img(p.slug, p.images[0][0]); },
    catLabel: function (c) { return PF.t('cat.' + c); },
    countryLabel: function (c) { return c ? PF.t('country.' + c) : ''; },
    totalImages: function () { return projects.reduce(function (n, p) { return n + p.images.length; }, 0); },
    onLang: function (fn) { listeners.push(fn); },
    setLang: function (l) {
      PF.lang = l;
      try { localStorage.setItem('pf-lang', l); } catch (e) {}
      PF.applyStrings();
      listeners.forEach(function (fn) { fn(l); });
    },
    toggleLang: function () { PF.setLang(PF.lang === 'en' ? 'ar' : 'en'); },
    applyStrings: function () {
      root.lang = PF.lang;
      root.dir = PF.lang === 'ar' ? 'rtl' : 'ltr';
      document.title = PF.t('meta.title');
      var md = document.querySelector('meta[name="description"]');
      if (md) md.setAttribute('content', PF.t('meta.description'));
      document.querySelectorAll('[data-i18n]').forEach(function (el) { el.textContent = PF.t(el.getAttribute('data-i18n')); });
      document.querySelectorAll('[data-i18n-html]').forEach(function (el) { el.innerHTML = PF.t(el.getAttribute('data-i18n-html')); });
      document.querySelectorAll('[data-i18n-ph]').forEach(function (el) { el.setAttribute('placeholder', PF.t(el.getAttribute('data-i18n-ph'))); });
      document.querySelectorAll('[data-i18n-aria]').forEach(function (el) { el.setAttribute('aria-label', PF.t(el.getAttribute('data-i18n-aria'))); });
      document.querySelectorAll('[data-name]').forEach(function (el) { el.textContent = PF.name(); });
      document.querySelectorAll('[data-email]').forEach(function (el) {
        el.setAttribute('href', 'mailto:' + profile.email);
        if (el.hasAttribute('data-email-text')) el.textContent = profile.email;
      });
      document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
    },
    reveal: function (selector) {
      var els = document.querySelectorAll(selector);
      if (!('IntersectionObserver' in window)) { els.forEach(function (el) { el.classList.add('is-in'); }); return; }
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
      els.forEach(function (el) { if (!el.classList.contains('is-in')) io.observe(el); });
    },
    countUp: function (el, to) {
      var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce || !('IntersectionObserver' in window)) { el.textContent = to; return; }
      el.textContent = '0';
      var io = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        var start = performance.now(), dur = 1200;
        (function tick(now) {
          var k = Math.min(1, (now - start) / dur);
          el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3)));
          if (k < 1) requestAnimationFrame(tick);
        })(start);
      }, { threshold: 0.4 });
      io.observe(el);
    }
  };

  /* ---------- Lightbox ---------- */
  var lb, lbImg, lbCap, lbCount, lbThumbs, current = null, idx = 0, lastFocus = null;

  function buildLightbox() {
    lb = document.createElement('div');
    lb.className = 'pf-lb';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.hidden = true;
    lb.innerHTML =
      '<div class="pf-lb__bar"><div class="pf-lb__cap"></div><div class="pf-lb__count"></div>' +
      '<button class="pf-lb__btn pf-lb__close" type="button" data-i18n-aria="lb.close">✕</button></div>' +
      '<div class="pf-lb__stage"><button class="pf-lb__btn pf-lb__nav pf-lb__prev" type="button" data-i18n-aria="lb.prev">‹</button>' +
      '<img class="pf-lb__img" alt=""><button class="pf-lb__btn pf-lb__nav pf-lb__next" type="button" data-i18n-aria="lb.next">›</button></div>' +
      '<div class="pf-lb__thumbs"></div>';
    document.body.appendChild(lb);
    lbImg = lb.querySelector('.pf-lb__img');
    lbCap = lb.querySelector('.pf-lb__cap');
    lbCount = lb.querySelector('.pf-lb__count');
    lbThumbs = lb.querySelector('.pf-lb__thumbs');
    lb.querySelector('.pf-lb__close').addEventListener('click', close);
    lb.querySelector('.pf-lb__prev').addEventListener('click', function () { go(-1); });
    lb.querySelector('.pf-lb__next').addEventListener('click', function () { go(1); });
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target.classList.contains('pf-lb__stage')) close(); });
    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      var rtl = root.dir === 'rtl';
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') go(rtl ? -1 : 1);
      else if (e.key === 'ArrowLeft') go(rtl ? 1 : -1);
    });
    var x0 = null;
    lb.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) < 40) return;
      var forward = dx < 0;
      if (root.dir === 'rtl') forward = !forward;
      go(forward ? 1 : -1);
    }, { passive: true });
    PF.applyStrings();
  }

  function render() {
    var im = current.images[idx];
    lbImg.src = PF.img(current.slug, im[0]);
    lbImg.width = im[1];
    lbImg.height = im[2];
    lbImg.alt = PF.pick(current.title) + ' — ' + (idx + 1);
    lbCap.textContent = PF.pick(current.title);
    lbCount.textContent = (idx + 1) + ' / ' + current.images.length;
    lbThumbs.querySelectorAll('button').forEach(function (b, i) {
      b.classList.toggle('is-active', i === idx);
      if (i === idx) b.scrollIntoView({ block: 'nearest', inline: 'center' });
    });
  }

  function go(d) {
    var n = current.images.length;
    idx = (idx + d + n) % n;
    render();
  }

  function open(p, i) {
    if (!lb) buildLightbox();
    current = p; idx = i || 0; lastFocus = document.activeElement;
    lbThumbs.innerHTML = '';
    p.images.forEach(function (im, k) {
      var b = document.createElement('button');
      b.type = 'button';
      b.innerHTML = '<img loading="lazy" alt="" src="' + PF.img(p.slug, im[0]) + '">';
      b.addEventListener('click', function () { idx = k; render(); });
      lbThumbs.appendChild(b);
    });
    lb.hidden = false;
    document.body.classList.add('pf-lb-open');
    render();
    lb.querySelector('.pf-lb__close').focus();
  }

  function close() {
    lb.hidden = true;
    document.body.classList.remove('pf-lb-open');
    if (lastFocus) lastFocus.focus();
  }

  PF.lightbox = { open: open, close: close };
  PF.bySlug = function (slug) { return projects.filter(function (p) { return p.slug === slug; })[0]; };

  window.PF = PF;
  document.addEventListener('DOMContentLoaded', function () {
    PF.applyStrings();
    document.querySelectorAll('[data-lang-toggle]').forEach(function (b) { b.addEventListener('click', PF.toggleLang); });
  });
})();
