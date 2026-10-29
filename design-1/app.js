/* Design 1 — renders stats, services, marquee and the filterable work grid. */
(function () {
  'use strict';
  var PF = window.PF;
  var SERVICES = ['branding', 'social', 'print', 'profile', 'type'];
  var filter = 'all';

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function ordered() {
    return PF.projects.filter(function (p) { return p.featured; })
      .concat(PF.projects.filter(function (p) { return !p.featured; }));
  }

  function renderStats() {
    var countries = {};
    PF.projects.forEach(function (p) { if (p.country) countries[p.country] = 1; });
    var brands = PF.projects.filter(function (p) { return p.slug !== 'typography'; }).length;
    var data = [
      [brands, 'stats.brands'],
      [Object.keys(countries).length, 'stats.countries'],
      [PF.totalImages(), 'stats.designs'],
      [SERVICES.length, 'stats.disciplines']
    ];
    var wrap = document.getElementById('stats');
    wrap.innerHTML = '';
    data.forEach(function (d) {
      var s = el('div', 'stat reveal', '<b>' + d[0] + '</b><span data-i18n="' + d[1] + '">' + esc(PF.t(d[1])) + '</span>');
      wrap.appendChild(s);
      PF.countUp(s.querySelector('b'), d[0]);
    });
  }

  function renderServices() {
    var wrap = document.getElementById('servicesGrid');
    wrap.innerHTML = '';
    SERVICES.forEach(function (k, i) {
      wrap.appendChild(el('article', 'svc reveal',
        '<span class="svc__n">0' + (i + 1) + '</span>' +
        '<h3>' + esc(PF.t('svc.' + k + '.t')) + '</h3><p>' + esc(PF.t('svc.' + k + '.d')) + '</p>'));
    });
  }

  function renderFilters() {
    var wrap = document.getElementById('filters');
    wrap.innerHTML = '';
    ['all'].concat(SERVICES).forEach(function (k) {
      var b = el('button', null, esc(k === 'all' ? PF.t('work.all') : PF.catLabel(k)));
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-selected', String(k === filter));
      b.addEventListener('click', function () { filter = k; renderFilters(); applyFilter(); });
      wrap.appendChild(b);
    });
  }

  function applyFilter() {
    document.querySelectorAll('#workGrid .card').forEach(function (c) {
      var cats = c.getAttribute('data-cats').split(' ');
      c.classList.toggle('is-hidden', filter !== 'all' && cats.indexOf(filter) === -1);
    });
  }

  function renderWork() {
    var wrap = document.getElementById('workGrid');
    wrap.innerHTML = '';
    ordered().forEach(function (p, i) {
      var c = el('button', 'card reveal' + (i === 0 || i === 4 ? ' card--wide' : ''));
      c.type = 'button';
      c.setAttribute('data-cats', p.cats.join(' '));
      c.setAttribute('aria-label', PF.t('work.open') + ': ' + PF.pick(p.title));
      var meta = p.cats.map(function (k) { return '<span class="tag">' + esc(PF.catLabel(k)) + '</span>'; }).join('');
      if (p.country) meta += '<span>' + esc(PF.countryLabel(p.country)) + '</span>';
      c.innerHTML =
        '<div class="card__media"><img loading="lazy" src="' + PF.cover(p) + '" width="' + p.images[0][1] + '" height="' + p.images[0][2] + '" alt="' + esc(PF.pick(p.title)) + '"></div>' +
        '<span class="card__count">' + p.images.length + ' ' + esc(PF.t('work.images')) + '</span>' +
        '<div class="card__body"><div class="card__meta">' + meta + '</div><h3>' + esc(PF.pick(p.title)) + '</h3><p>' + esc(PF.pick(p.desc)) + '</p></div>';
      c.addEventListener('click', function () { PF.lightbox.open(p, 0); });
      wrap.appendChild(c);
    });
    applyFilter();
  }

  function renderAll() {
    renderStats();
    renderServices();
    renderFilters();
    renderWork();
    PF.reveal('.reveal');
  }

  document.addEventListener('DOMContentLoaded', function () {
    var liwa = PF.bySlug('liwa-2025');
    var about = document.getElementById('aboutImg');
    about.src = PF.cover(liwa);
    about.addEventListener('click', function () { PF.lightbox.open(liwa, 0); });
    renderAll();
    PF.onLang(function () { renderAll(); document.querySelectorAll('.reveal').forEach(function (e) { e.classList.add('is-in'); }); });
    var nav = document.querySelector('.nav');
    window.addEventListener('scroll', function () { nav.classList.toggle('is-scrolled', window.scrollY > 10); }, { passive: true });
  });
})();
