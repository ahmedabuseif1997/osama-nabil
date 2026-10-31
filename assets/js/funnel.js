/* Conversion layer shared by every design: 3-step brief that prepares an email, sticky CTA, client names strip. */
(function () {
  'use strict';
  var PF = window.PF;

  /* ---------- Brief form ---------- */
  function initBrief(form) {
    var steps = form.querySelectorAll('.brief__step');
    var bar = form.querySelector('.brief__progress i b');
    var num = form.querySelector('.brief__n');
    var done = form.querySelector('.brief__done');
    var out = form.querySelector('.brief__out');
    var cur = 0;

    function show(i) {
      cur = i;
      steps.forEach(function (s, k) { s.classList.toggle('is-active', k === i); s.hidden = k !== i; });
      num.textContent = i + 1;
      bar.style.width = ((i + 1) / steps.length * 100) + '%';
    }

    function err(step, msg) {
      var e = step.querySelector('.brief__err');
      e.textContent = msg || '';
    }

    function valid(step) {
      var group = step.querySelector('[data-group]');
      if (group && !step.querySelector('[name="' + group.getAttribute('data-group') + '"]:checked')) {
        err(step, PF.t('brief.pick'));
        return false;
      }
      var bad = Array.prototype.filter.call(step.querySelectorAll('[required]'), function (f) { return !f.value.trim(); });
      step.querySelectorAll('[required]').forEach(function (f) { f.setAttribute('aria-invalid', String(!f.value.trim())); });
      if (bad.length) { err(step, PF.t('brief.req')); bad[0].focus(); return false; }
      err(step, '');
      return true;
    }

    form.addEventListener('click', function (e) {
      var t = e.target.closest('[data-next], [data-back], [data-again], [data-copy]');
      if (!t) return;
      var step = steps[cur];
      if (t.hasAttribute('data-next')) {
        if (!valid(step)) return;
        show(cur + 1);
        var first = steps[cur].querySelector('input, textarea');
        if (first) first.focus({ preventScroll: true });
      } else if (t.hasAttribute('data-back')) {
        show(cur - 1);
      } else if (t.hasAttribute('data-again')) {
        form.reset();
        done.hidden = true;
        form.querySelector('.brief__progress').hidden = false;
        show(0);
      } else if (t.hasAttribute('data-copy')) {
        copy(out.value, t);
      }
    });

    form.addEventListener('change', function () { err(steps[cur], ''); });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!valid(steps[cur])) return;
      var text = compose(form);
      out.value = text;
      var subject = PF.t('brief.subject') + ' — ' + (form.elements.name.value.trim() || '');
      window.location.href = 'mailto:' + PF.profile.email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(text);
      steps.forEach(function (s) { s.hidden = true; });
      form.querySelector('.brief__progress').hidden = true;
      done.hidden = false;
      done.querySelector('h3').focus();
    });

    show(0);
  }

  function labelFor(input) {
    var span = input.parentNode.querySelector('span');
    return span ? span.textContent.trim() : input.value;
  }

  function compose(form) {
    var services = Array.prototype.map.call(form.querySelectorAll('[name="services"]:checked'), labelFor);
    var time = form.querySelector('[name="timeline"]:checked');
    var rows = [
      ['brief.f.services', services.join(PF.lang === 'ar' ? '، ' : ', ')],
      ['brief.f.timeline', time ? labelFor(time) : ''],
      ['brief.f.budget', form.elements.budget.value.trim()],
      ['brief.f.name', form.elements.name.value.trim()],
      ['brief.f.contact', form.elements.contact.value.trim()],
      ['brief.f.company', form.elements.company.value.trim()],
      ['brief.f.details', form.elements.details.value.trim()]
    ];
    return rows.filter(function (r) { return r[1]; }).map(function (r) { return PF.t(r[0]) + ': ' + r[1]; }).join('\n');
  }

  function copy(text, btn) {
    function ok() {
      var old = btn.textContent;
      btn.textContent = PF.t('brief.copied');
      setTimeout(function () { btn.textContent = old; }, 1800);
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(ok, fallback);
    } else fallback();
    function fallback() {
      var ta = btn.closest('.brief__done').querySelector('.brief__out');
      ta.select();
      try { document.execCommand('copy'); ok(); } catch (e) {}
    }
  }

  /* Any [data-brief-service="branding"] link pre-ticks that service in the brief. */
  function preselect() {
    document.addEventListener('click', function (e) {
      var a = e.target.closest('[data-brief-service]');
      if (!a) return;
      var box = document.querySelector('.brief__form [name="services"][value="' + a.getAttribute('data-brief-service') + '"]');
      if (box) box.checked = true;
    });
  }

  /* ---------- Sticky CTA ---------- */
  function initSticky() {
    var bar = document.querySelector('.sticky-cta');
    var brief = document.getElementById('contact');
    if (!bar || !brief) return;
    var briefVisible = false;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { briefVisible = en[0].isIntersecting; update(); }, { threshold: 0.05 }).observe(brief);
    }
    function update() {
      var on = window.scrollY > window.innerHeight * 0.7 && !briefVisible && !document.body.classList.contains('pf-lb-open');
      bar.classList.toggle('is-on', on);
      bar.setAttribute('aria-hidden', String(!on));
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ---------- Clients strip ---------- */
  function renderClients() {
    document.querySelectorAll('[data-clients]').forEach(function (ul) {
      var names = PF.clients().map(function (p) { return PF.pick(p.title); });
      var html = names.map(function (n) { return '<li>' + n.replace(/[&<>"]/g, '') + '</li>'; }).join('');
      ul.innerHTML = ul.hasAttribute('data-marquee') ? html + html.replace(/<li>/g, '<li aria-hidden="true">') : html;
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.brief__form').forEach(initBrief);
    preselect();
    initSticky();
    renderClients();
    PF.onLang(renderClients);
  });
})();
