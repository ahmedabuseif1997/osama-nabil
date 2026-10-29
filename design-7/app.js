/* Design 7 — Signal: name/cut-out sandwich with pointer + scroll parallax, speed tapes and badge,
   3D card deck, spotlight services, sliding process rail, halftone poster wipe, kinetic footer band. */
(function () {
  'use strict';
  var PF = window.PF, M = window.Motion;
  var SERVICES = ['branding', 'social', 'print', 'profile', 'type'];
  var SVC_IMG = { branding: ['boost', 2], social: ['black-car', 1], print: ['liwa-2025', 2], profile: ['marble-profile', 1], type: ['typography', 1] };
  var vel = 0;

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function ordered() { return PF.projects.filter(function (p) { return p.featured; }).concat(PF.projects.filter(function (p) { return !p.featured; })); }
  function imgOf(slug, i) { var p = PF.bySlug(slug); return PF.img(slug, p.images[Math.min(i, p.images.length - 1)][0]); }
  function tick(el) { el.classList.remove('tick'); void el.offsetWidth; el.classList.add('tick'); }

  /* ---------- Hero ---------- */
  function renderHero() {
    var parts = PF.name().split(' ');
    document.querySelector('[data-name-first]').textContent = parts[0];
    document.querySelector('[data-name-last]').textContent = parts.slice(1).join(' ');
    var cats = SERVICES.map(PF.catLabel);
    fillBand(document.getElementById('tapeA'), cats, 6);
    fillBand(document.getElementById('tapeB'), ['ae', 'sa', 'om', 'eg'].map(function (c) { return PF.countryLabel(c); }).concat([PF.t('hero.kicker')]), 6);
    fillBand(document.getElementById('talk'), [PF.t('footer.talk'), PF.t('cta.contact')], 4);
    document.getElementById('badgeText').textContent = (PF.t('hero.kicker') + ' • ').repeat(2);
  }

  function fillBand(el, words, times) {
    var chunk = words.map(function (w) { return '<span>' + esc(w) + '</span>'; }).join('');
    el.innerHTML = new Array(times + 1).join(chunk);
  }

  var bands = [];
  function animateBands() {
    bands = [
      { el: document.getElementById('tapeA'), x: 0, dir: 1, speed: 0.8 },
      { el: document.getElementById('tapeB'), x: 0, dir: -1, speed: 0.6 },
      { el: document.getElementById('talk'), x: 0, dir: 1, speed: 0.7 }
    ];
    var badge = document.querySelector('#badge > text'), br = 0;
    (function frame() {
      var boost = 1 + Math.min(Math.abs(vel), 120) * 0.1;
      bands.forEach(function (b) {
        var w = b.el.scrollWidth / 2;
        b.x -= b.dir * b.speed * boost;
        if (w) b.x = ((b.x % w) - w) % w;
        b.el.style.transform = 'translate3d(' + b.x.toFixed(1) + 'px,0,0) skewX(' + M.clamp(-vel * 0.1, -10, 10).toFixed(2) + 'deg)';
      });
      br += 0.25 * boost;
      badge.style.setProperty('--br', (br % 360).toFixed(1) + 'deg');
      vel *= 0.9;
      requestAnimationFrame(frame);
    })();
  }

  function heroPointer() {
    var cut = document.getElementById('heroCut');
    if (M.reduce || !window.matchMedia('(hover: hover)').matches) return;
    window.addEventListener('pointermove', function (e) {
      var x = e.clientX / innerWidth - 0.5, y = e.clientY / innerHeight - 0.5;
      cut.style.setProperty('--px', (x * -24).toFixed(1) + 'px');
      cut.style.setProperty('--py', (y * -10).toFixed(1) + 'px');
    }, { passive: true });
  }

  /* ---------- Deck ---------- */
  var deck, pile, cards = [], list = [], now = -1;
  function buildDeck() {
    deck = document.getElementById('work');
    pile = document.getElementById('pile');
    list = ordered();
    pile.innerHTML = '';
    cards = list.map(function (p, i) {
      var b = document.createElement('div');
      b.className = 'deck__card';
      b.innerHTML = '<img alt="" src="' + PF.cover(p) + '"' + (i > 3 ? ' loading="lazy"' : '') + '>';
      b.style.zIndex = String(list.length - i);
      pile.appendChild(b);
      return b;
    });
    if (!M.reduce) deck.style.height = (list.length * 34 + 100) + 'vh';
    now = -1;
  }

  function updateDeck(y) {
    var p = M.progress(deck, y), pos = p * (list.length - 1);
    for (var i = 0; i < cards.length; i++) {
      var d = i - pos, c = cards[i];
      if (d < -1.2 || d > 6) { c.style.visibility = 'hidden'; continue; }
      c.style.visibility = 'visible';
      if (d < 0) {
        var t = M.clamp(-d, 0, 1);
        c.style.transform = 'translate3d(' + (t * -30).toFixed(1) + '%,' + (t * -115).toFixed(1) + '%,' + (t * 160).toFixed(1) + 'px) rotateX(' + (t * 55).toFixed(1) + 'deg) rotateZ(' + (t * -16).toFixed(1) + 'deg)';
        c.style.opacity = (1 - t).toFixed(3);
      } else {
        c.style.transform = 'translate3d(' + (d * 26).toFixed(1) + 'px,' + (d * -20).toFixed(1) + 'px,' + (d * -90).toFixed(1) + 'px) rotateZ(' + (d * 3).toFixed(2) + 'deg)';
        c.style.opacity = d > 4.5 ? (5.5 - d).toFixed(3) : '1';
      }
    }
    var n = M.clamp(Math.round(pos), 0, list.length - 1);
    if (n !== now) {
      now = n;
      var pr = list[n], num = document.getElementById('deckNum'), title = document.getElementById('deckTitle');
      num.textContent = pad(n + 1);
      title.textContent = PF.pick(pr.title);
      document.getElementById('deckMeta').textContent = pr.cats.map(PF.catLabel).concat(pr.country ? [PF.countryLabel(pr.country)] : []).join(' · ');
      document.getElementById('deckDesc').textContent = PF.pick(pr.desc);
      pile.setAttribute('aria-label', PF.t('work.open') + ': ' + PF.pick(pr.title));
      tick(num); tick(title);
    }
    document.getElementById('deckBar').style.setProperty('--dp', p.toFixed(3));
  }

  /* ---------- Spotlight services ---------- */
  var spotItems = [], spotNow = -1;
  function renderSpot() {
    var ol = document.getElementById('spotList');
    ol.innerHTML = SERVICES.map(function (k) {
      return '<li><a href="#contact" data-brief-service="' + k + '">' + esc(PF.t('svc.' + k + '.t')) + '</a></li>';
    }).join('');
    spotItems = Array.prototype.slice.call(ol.querySelectorAll('li'));
    spotNow = -1;
    setSpot(0);
  }

  function setSpot(i) {
    if (i === spotNow) return;
    spotNow = i;
    spotItems.forEach(function (li, k) { li.classList.toggle('is-on', k === i); });
    var k = SERVICES[i], im = SVC_IMG[k], flip = document.getElementById('spotFlip');
    document.getElementById('spotImg').src = imgOf(im[0], im[1]);
    document.getElementById('spotImg').alt = PF.t('svc.' + k + '.t');
    document.getElementById('spotDesc').textContent = PF.t('svc.' + k + '.d');
    flip.classList.remove('flip'); void flip.offsetWidth; flip.classList.add('flip');
  }

  /* ---------- Poster / read / stats ---------- */
  var readWords = [];
  function splitRead() {
    var el = document.getElementById('readText');
    el.innerHTML = (PF.t('about.p1') + ' ' + PF.t('about.p2')).split(/\s+/).map(function (w) { return '<span class="rw">' + esc(w) + '</span>'; }).join(' ');
    readWords = Array.prototype.slice.call(el.querySelectorAll('.rw'));
  }

  function renderStats() {
    var countries = {};
    PF.projects.forEach(function (p) { if (p.country) countries[p.country] = 1; });
    var data = [
      [PF.projects.filter(function (p) { return p.slug !== 'typography'; }).length, 'stats.brands'],
      [Object.keys(countries).length, 'stats.countries'],
      [PF.totalImages(), 'stats.designs'],
      [SERVICES.length, 'stats.disciplines']
    ];
    var wrap = document.getElementById('stats');
    wrap.innerHTML = data.map(function (d) { return '<div><b>' + d[0] + '</b><span>' + esc(PF.t(d[1])) + '</span></div>'; }).join('');
    wrap.querySelectorAll('b').forEach(function (b, i) { PF.countUp(b, data[i][0]); });
  }

  function renderAll() {
    renderHero();
    buildDeck();
    renderSpot();
    splitRead();
    renderStats();
    M.splitWords();
    PF.reveal('.reveal, [data-split]');
    M.magnetic('.mag', 0.22);
    M.refresh();
  }

  document.addEventListener('DOMContentLoaded', function () {
    M.cursor();
    heroPointer();
    renderAll();
    function openNow() { if (now > -1) PF.lightbox.open(list[now], 0); }
    document.getElementById('deckOpen').addEventListener('click', openNow);
    pile.addEventListener('click', openNow);
    pile.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openNow(); } });
    var poster = document.getElementById('posterImg');
    M.tilt(poster, 6);

    if (M.reduce) {
      readWords.forEach(function (w) { w.classList.add('on'); });
      updateDeck(0);
    } else {
      animateBands();
      var hero = document.getElementById('hero'), back = document.querySelector('.hero__back'), front = document.querySelector('.hero__front'), cut = document.getElementById('heroCut');
      var spot = document.getElementById('services'), track = document.getElementById('process'), rail = document.getElementById('rail'), steps = rail.querySelectorAll('.track__step');
      var read = document.getElementById('readText');
      M.onScroll(function (y, v) {
        vel = v;
        var hp = M.clamp(y / hero.offsetHeight, 0, 1);
        back.style.setProperty('--bx', (-hp * innerWidth * 0.35).toFixed(1) + 'px');
        front.style.setProperty('--fx', (hp * innerWidth * 0.35).toFixed(1) + 'px');
        cut.style.setProperty('--cs', (1 + hp * 0.12).toFixed(3));
        updateDeck(y);
        setSpot(M.clamp(Math.floor(M.progress(spot, y) * SERVICES.length), 0, SERVICES.length - 1));
        var tp = M.progress(track, y), max = rail.scrollWidth - innerWidth;
        rail.style.transform = 'translate3d(' + (-tp * max).toFixed(1) + 'px,0,0)';
        steps.forEach(function (s) {
          var r = s.getBoundingClientRect(), off = (r.left + r.width / 2 - innerWidth / 2) / innerWidth;
          s.style.transform = 'rotateY(' + (off * -28).toFixed(2) + 'deg) skewX(' + M.clamp(-v * 0.06, -6, 6).toFixed(2) + 'deg)';
        });
        var pp = M.pass(poster, y);
        poster.style.setProperty('--wipe', (M.clamp(1 - pp * 2.2, 0, 1) * 100).toFixed(1) + '%');
        var rp = M.clamp((y + innerHeight * 0.75 - M.top(read)) / (read.offsetHeight + innerHeight * 0.25), 0, 1);
        var lit = Math.round(rp * readWords.length);
        readWords.forEach(function (w, i) { w.classList.toggle('on', i < lit); w.classList.toggle('now', i === lit - 1 && lit < readWords.length); });
      });
      window.addEventListener('resize', function () { M.refresh(); });
    }

    PF.onLang(function () {
      renderAll();
      document.querySelectorAll('.reveal, [data-split]').forEach(function (e) { e.classList.add('is-in'); });
    });
  });
})();
