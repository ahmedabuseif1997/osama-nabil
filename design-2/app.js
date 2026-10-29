/* Design 2 — index list with cursor preview, masonry wall, numbered services. */
(function () {
  'use strict';
  var PF = window.PF;
  var SERVICES = ['branding', 'social', 'print', 'profile', 'type'];
  var filter = 'all';
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function ordered() {
    return PF.projects.filter(function (p) { return p.featured; }).concat(PF.projects.filter(function (p) { return !p.featured; }));
  }

  function renderName() {
    var parts = PF.name().split(' ');
    document.querySelector('[data-name-first]').textContent = parts[0];
    document.querySelector('[data-name-last]').textContent = parts.slice(1).join(' ');
    document.querySelector('.hero__name').setAttribute('aria-label', PF.name());
  }

  function renderHeroIndex() {
    document.getElementById('heroIndex').innerHTML = SERVICES.map(function (k) {
      var n = PF.projects.filter(function (p) { return p.cats.indexOf(k) > -1; }).length;
      return '<li><span>' + esc(PF.catLabel(k)) + '</span><b>' + pad(n) + '</b></li>';
    }).join('');
  }

  function renderNumbers() {
    var countries = {};
    PF.projects.forEach(function (p) { if (p.country) countries[p.country] = 1; });
    var data = [
      [PF.projects.filter(function (p) { return p.slug !== 'typography'; }).length, 'stats.brands'],
      [Object.keys(countries).length, 'stats.countries'],
      [PF.totalImages(), 'stats.designs'],
      [SERVICES.length, 'stats.disciplines']
    ];
    var wrap = document.getElementById('numbers');
    wrap.innerHTML = data.map(function (d) { return '<div class="reveal"><b>' + d[0] + '</b><span>' + esc(PF.t(d[1])) + '</span></div>'; }).join('');
    wrap.querySelectorAll('b').forEach(function (b, i) { PF.countUp(b, data[i][0]); });
  }

  function renderFilters() {
    var wrap = document.getElementById('filters');
    wrap.innerHTML = '';
    ['all'].concat(SERVICES).forEach(function (k) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-selected', String(k === filter));
      b.textContent = k === 'all' ? PF.t('work.all') : PF.catLabel(k);
      b.addEventListener('click', function () { filter = k; renderFilters(); applyFilter(); });
      wrap.appendChild(b);
    });
  }

  function applyFilter() {
    document.querySelectorAll('#workIndex li').forEach(function (li) {
      var cats = li.getAttribute('data-cats').split(' ');
      li.classList.toggle('is-hidden', filter !== 'all' && cats.indexOf(filter) === -1);
    });
  }

  function renderIndex() {
    var list = document.getElementById('workIndex');
    list.innerHTML = '';
    ordered().forEach(function (p, i) {
      var li = document.createElement('li');
      li.setAttribute('data-cats', p.cats.join(' '));
      li.innerHTML =
        '<button type="button" aria-label="' + esc(PF.t('work.open') + ': ' + PF.pick(p.title)) + '">' +
        '<img class="index__thumb" loading="lazy" alt="" src="' + PF.cover(p) + '">' +
        '<span class="index__n">' + pad(i + 1) + '</span>' +
        '<span class="index__t">' + esc(PF.pick(p.title)) + '</span>' +
        '<span class="index__c">' + esc(p.cats.map(PF.catLabel).join(' / ')) + '</span>' +
        '<span class="index__c">' + esc(PF.countryLabel(p.country) || '—') + '</span>' +
        '<span class="index__k">' + p.images.length + '</span></button>';
      var btn = li.querySelector('button');
      btn.addEventListener('click', function () { PF.lightbox.open(p, 0); });
      if (finePointer) {
        btn.addEventListener('mouseenter', function () { showPreview(p); });
        btn.addEventListener('mouseleave', hidePreview);
      }
      list.appendChild(li);
    });
    applyFilter();
  }

  var preview = document.getElementById('preview');
  var previewImg = preview.querySelector('img');
  function showPreview(p) { previewImg.src = PF.cover(p); preview.classList.add('is-on'); }
  function hidePreview() { preview.classList.remove('is-on'); }
  if (finePointer) {
    document.addEventListener('mousemove', function (e) {
      preview.style.left = (e.clientX + (document.documentElement.dir === 'rtl' ? -200 : 200)) + 'px';
      preview.style.top = e.clientY + 'px';
    }, { passive: true });
  }

  function renderWall() {
    var picks = [];
    ordered().forEach(function (p) {
      var take = p.featured ? [1, 3] : [1];
      take.forEach(function (i) { if (p.images[i]) picks.push([p, i]); });
    });
    var wrap = document.getElementById('wall');
    wrap.innerHTML = '';
    picks.forEach(function (x) {
      var p = x[0], im = p.images[x[1]];
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', PF.pick(p.title));
      b.innerHTML = '<img loading="lazy" alt="" src="' + PF.img(p.slug, im[0]) + '" width="' + im[1] + '" height="' + im[2] + '"><span>' + esc(PF.pick(p.title)) + '</span>';
      b.addEventListener('click', function () { PF.lightbox.open(p, x[1]); });
      wrap.appendChild(b);
    });
  }

  function renderServices() {
    document.getElementById('svcList').innerHTML = SERVICES.map(function (k, i) {
      return '<div class="svc__row reveal"><b>' + pad(i + 1) + '</b><h3>' + esc(PF.t('svc.' + k + '.t')) + '</h3><p>' + esc(PF.t('svc.' + k + '.d')) + '</p></div>';
    }).join('');
  }

  function renderAll() {
    renderName();
    renderHeroIndex();
    renderNumbers();
    renderFilters();
    renderIndex();
    renderWall();
    renderServices();
    PF.reveal('.reveal');
  }

  document.addEventListener('DOMContentLoaded', function () {
    renderAll();
    PF.onLang(function () { renderAll(); document.querySelectorAll('.reveal').forEach(function (e) { e.classList.add('is-in'); }); });
  });
})();
