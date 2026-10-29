/* Shared motion helpers for the 3D designs: smoothed scroll loop, section progress, pointer tilt. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var subs = [];
  var cur = window.scrollY, target = cur, running = false;

  function loop() {
    target = window.scrollY;
    cur += (target - cur) * 0.14;
    if (Math.abs(target - cur) < 0.2) cur = target;
    var vel = target - cur;
    for (var i = 0; i < subs.length; i++) subs[i](cur, vel);
    if (cur !== target) requestAnimationFrame(loop);
    else running = false;
  }

  function kick() {
    if (running) return;
    running = true;
    requestAnimationFrame(loop);
  }

  window.addEventListener('scroll', kick, { passive: true });
  window.addEventListener('resize', function () { cur = window.scrollY; kick(); });

  var Motion = {
    reduce: reduce,
    clamp: function (v, a, b) { return Math.max(a, Math.min(b, v)); },
    lerp: function (a, b, t) { return a + (b - a) * t; },
    /* fn(scrollY, velocity) runs every frame while the page is moving, and once on start. */
    onScroll: function (fn) { subs.push(fn); fn(window.scrollY, 0); },
    refresh: function () { cur = window.scrollY - 1; kick(); },
    top: function (el) { return el.getBoundingClientRect().top + window.scrollY; },
    /* 0 when the section's top reaches the viewport top, 1 when its bottom reaches the viewport bottom. */
    progress: function (el, y) {
      var t = Motion.top(el), span = el.offsetHeight - window.innerHeight;
      return span <= 0 ? 0 : Motion.clamp((y - t) / span, 0, 1);
    },
    /* 0 when the element enters from the bottom, 1 when it leaves at the top. */
    pass: function (el, y) {
      var t = Motion.top(el), vh = window.innerHeight;
      return Motion.clamp((y + vh - t) / (vh + el.offsetHeight), 0, 1);
    },
    tilt: function (el, max) {
      if (reduce || !window.matchMedia('(hover: hover)').matches) return;
      max = max || 10;
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.style.setProperty('--ry', (x * max * 2).toFixed(2) + 'deg');
        el.style.setProperty('--rx', (-y * max * 2).toFixed(2) + 'deg');
        el.style.setProperty('--gx', ((x + 0.5) * 100).toFixed(1) + '%');
        el.style.setProperty('--gy', ((y + 0.5) * 100).toFixed(1) + '%');
      });
      el.addEventListener('pointerleave', function () {
        el.style.setProperty('--rx', '0deg');
        el.style.setProperty('--ry', '0deg');
      });
    }
  };

  /* Wraps each word in <span class="w"><span class="wi" style="--i:n"> for staggered reveals. Words, not letters, so Arabic stays joined. */
  Motion.splitWords = function (root) {
    (root || document).querySelectorAll('[data-split]').forEach(function (el) {
      var i = 0;
      (function walk(node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (n) {
          if (n.nodeType === 3) {
            var frag = document.createDocumentFragment();
            n.textContent.split(/(\s+)/).forEach(function (part) {
              if (!part) return;
              if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
              var w = document.createElement('span'), wi = document.createElement('span');
              w.className = 'w'; wi.className = 'wi'; wi.style.setProperty('--i', i++);
              wi.textContent = part; w.appendChild(wi); frag.appendChild(w);
            });
            n.parentNode.replaceChild(frag, n);
          } else if (n.nodeType === 1 && !n.classList.contains('w')) walk(n);
        });
      })(el);
    });
  };

  /* Buttons drift toward the pointer. */
  Motion.magnetic = function (selector, strength) {
    if (reduce || !window.matchMedia('(hover: hover)').matches) return;
    strength = strength || 0.3;
    document.querySelectorAll(selector).forEach(function (el) {
      if (el.dataset.mag) return;
      el.dataset.mag = '1';
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * strength).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * strength).toFixed(1) + 'px)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
  };

  /* Custom cursor: a dot plus a trailing ring that grows over interactive elements. */
  Motion.cursor = function () {
    if (reduce || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    var dot = document.createElement('div'), ring = document.createElement('div');
    dot.className = 'cur-dot'; ring.className = 'cur-ring';
    document.body.appendChild(ring); document.body.appendChild(dot);
    document.documentElement.classList.add('has-cursor');
    var mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    window.addEventListener('pointermove', function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = 'translate(' + mx + 'px,' + my + 'px)';
      var hot = e.target.closest && e.target.closest('a, button, [data-hot]');
      ring.classList.toggle('is-hot', !!hot);
    }, { passive: true });
    (function follow() {
      rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
      ring.style.transform = 'translate(' + rx.toFixed(1) + 'px,' + ry.toFixed(1) + 'px)';
      requestAnimationFrame(follow);
    })();
  };

  if (reduce) document.documentElement.classList.add('rm');
  window.Motion = Motion;
})();
