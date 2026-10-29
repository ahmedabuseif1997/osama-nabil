/* Design 3 — bento tiles, featured slideshow, category rails, services accordion. */
(function () {
  'use strict';
  var PF = window.PF;
  var SERVICES = ['branding', 'social', 'print', 'profile', 'type'];
  var showTimer = null;

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function renderTiles() {
    var countries = [];
    PF.projects.forEach(function (p) { if (p.country && countries.indexOf(p.country) === -1) countries.push(p.country); });
    var brands = PF.projects.filter(function (p) { return p.slug !== 'typography'; }).length;
    var total = PF.totalImages();
    document.getElementById('statBrands').innerHTML = '<b>' + brands + '</b><span>' + esc(PF.t('stats.brands')) + '</span>';
    document.getElementById('statDesigns').innerHTML = '<b>' + total + '</b><span>' + esc(PF.t('stats.designs')) + '</span>';
    PF.countUp(document.querySelector('#statBrands b'), brands);
    PF.countUp(document.querySelector('#statDesigns b'), total);
    document.getElementById('countries').innerHTML =
      '<b>' + countries.length + '</b><span class="label">' + esc(PF.t('stats.countries').split(' — ')[0]) + '</span>' +
      '<ul>' + countries.map(function (c) { return '<li>' + esc(PF.countryLabel(c)) + '</li>'; }).join('') + '</ul>';
    document.getElementById('chips').innerHTML = SERVICES.map(function (k) { return '<span>' + esc(PF.catLabel(k)) + '</span>'; }).join('');
  }

  function renderShow() {
    var feat = PF.projects.filter(function (p) { return p.featured; });
    var box = document.getElementById('show');
    box.innerHTML = feat.map(function (p, i) {
      return '<img alt="" ' + (i === 0 ? '' : 'loading="lazy" ') + 'src="' + PF.cover(p) + '" class="pf-fit' + (i === 0 ? ' is-on' : '') + '" style="background-color:' + p.images[0][3] + '">';
    }).join('') + '<span class="cap"></span>';
    var imgs = box.querySelectorAll('img'), cap = box.querySelector('.cap'), i = 0;
    function set(n) {
      imgs[i].classList.remove('is-on');
      i = n;
      imgs[i].classList.add('is-on');
      cap.textContent = PF.pick(feat[i].title) + ' ↗';
      box.setAttribute('aria-label', PF.t('work.open') + ': ' + PF.pick(feat[i].title));
    }
    set(0);
    box.onclick = function () { PF.lightbox.open(feat[i], 0); };
    clearInterval(showTimer);
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      showTimer = setInterval(function () { set((i + 1) % feat.length); }, 3200);
    }
  }

  function renderRails() {
    var wrap = document.getElementById('rails');
    wrap.innerHTML = '';
    [['branding'], ['social'], ['print', 'profile', 'type']].forEach(function (group) {
      var list = PF.projects.filter(function (p) { return p.cats.some(function (c) { return group.indexOf(c) > -1; }); });
      if (!list.length) return;
      var rail = document.createElement('div');
      rail.className = 'rail reveal';
      rail.innerHTML =
        '<div class="rail__head"><h3>' + esc(group.map(PF.catLabel).join(' · ')) + '</h3><span class="n">' + list.length + '</span>' +
        '<div class="rail__nav"><button type="button" data-d="-1" aria-label="' + esc(PF.t('lb.prev')) + '">‹</button>' +
        '<button type="button" data-d="1" aria-label="' + esc(PF.t('lb.next')) + '">›</button></div></div>' +
        '<div class="rail__track"></div>';
      var track = rail.querySelector('.rail__track');
      list.forEach(function (p) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'proj';
        b.setAttribute('aria-label', PF.t('work.open') + ': ' + PF.pick(p.title));
        b.innerHTML = '<div class="proj__img"><img loading="lazy" alt=""' + PF.fit(p) + ' src="' + PF.cover(p) + '"></div>' +
          '<div class="proj__b"><h4>' + esc(PF.pick(p.title)) + '</h4><p>' +
          esc([PF.countryLabel(p.country), p.images.length + ' ' + PF.t('work.images')].filter(Boolean).join(' · ')) + '</p></div>';
        b.addEventListener('click', function () { PF.lightbox.open(p, 0); });
        track.appendChild(b);
      });
      rail.querySelectorAll('.rail__nav button').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var d = +btn.getAttribute('data-d') * (document.documentElement.dir === 'rtl' ? -1 : 1);
          track.scrollBy({ left: d * track.clientWidth * 0.8, behavior: 'smooth' });
        });
      });
      wrap.appendChild(rail);
    });
  }

  function renderAcc() {
    document.getElementById('acc').innerHTML = SERVICES.map(function (k, i) {
      return '<details class="reveal"' + (i === 0 ? ' open' : '') + '><summary><b>0' + (i + 1) + '</b>' + esc(PF.t('svc.' + k + '.t')) +
        '</summary><p>' + esc(PF.t('svc.' + k + '.d')) + '</p></details>';
    }).join('');
  }

  function renderAll() {
    renderTiles();
    renderShow();
    renderRails();
    renderAcc();
    PF.reveal('.reveal');
  }

  document.addEventListener('DOMContentLoaded', function () {
    renderAll();
    PF.onLang(function () { renderAll(); document.querySelectorAll('.reveal').forEach(function (e) { e.classList.add('is-in'); }); });
  });
})();
