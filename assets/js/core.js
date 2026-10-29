/* Shared runtime for every design: profile, EN/AR strings, image paths, lightbox, scroll reveal. */
(function () {
  'use strict';

  var profile = {
    name: { en: 'Osama Nabil', ar: 'أسامة نبيل' },
    email: 'osamanabil419700@gmail.com'
  };

  var strings = {
    en: {
      'meta.title': 'Osama Nabil — Graphic & Brand Designer',
      'brand': 'OSAMA.',
      'lang.switch': 'العربية',
      'nav.work': 'Work',
      'nav.services': 'Services',
      'nav.process': 'Process',
      'nav.about': 'About',
      'nav.contact': 'Contact',
      'hero.kicker': 'Graphic & Brand Designer',
      'hero.title': 'Design that makes brands <em>speak.</em>',
      'hero.lead': 'I’m Osama Nabil — I craft brand identities, social media campaigns, print collateral and Arabic typography for brands across the UAE, Saudi Arabia, Oman and Egypt.',
      'hero.role': 'Brand identity · Social media · Print · Typography',
      'cta.work': 'View selected work',
      'cta.contact': 'Start a project',
      'cta.email': 'Email me',
      'stats.kicker': 'By the numbers',
      'stats.title': 'A portfolio built on real briefs.',
      'stats.brands': 'Brands designed for',
      'stats.countries': 'Countries — UAE, KSA, Oman, Egypt',
      'stats.designs': 'Designs in this portfolio',
      'stats.disciplines': 'Design disciplines',
      'services.kicker': 'What I do',
      'services.title': 'From the first mark to the everyday post.',
      'svc.branding.t': 'Brand identity & guidelines',
      'svc.branding.d': 'Logos, colour systems, bilingual typography and guideline books that keep a brand consistent everywhere it appears.',
      'svc.social.t': 'Social media design',
      'svc.social.d': 'Campaign posts, seasonal and national-day content and launch announcements — designed natively in Arabic and English.',
      'svc.print.t': 'Print & event collateral',
      'svc.print.d': 'Brochures, passes, bags, flags, roll-ups, exhibition stands, signage and vehicle branding.',
      'svc.profile.t': 'Company profiles',
      'svc.profile.d': 'Structured company profiles and product catalogues that present a business clearly.',
      'svc.type.t': 'Arabic typography',
      'svc.type.d': 'Expressive Arabic lettering that turns a phrase into a visual.',
      'work.kicker': 'Selected work',
      'work.title': 'Brands I’ve shaped.',
      'work.all': 'All',
      'work.images': 'designs',
      'work.open': 'Open project',
      'cat.branding': 'Branding',
      'cat.social': 'Social media',
      'cat.print': 'Print & events',
      'cat.profile': 'Company profile',
      'cat.type': 'Typography',
      'country.ae': 'UAE',
      'country.sa': 'Saudi Arabia',
      'country.om': 'Oman',
      'country.eg': 'Egypt',
      'process.kicker': 'Process',
      'process.title': 'Clear steps, no surprises.',
      'step1.t': 'Brief & research',
      'step1.d': 'Understand the business, the audience and the market the brand speaks to.',
      'step2.t': 'Concept & direction',
      'step2.d': 'Explore directions and agree on one clear visual route.',
      'step3.t': 'Design & refine',
      'step3.d': 'Build the system and refine it through focused feedback rounds.',
      'step4.t': 'Deliver & roll out',
      'step4.d': 'Hand over print-ready and social-ready files, organised and named.',
      'about.kicker': 'About',
      'about.title': 'Arabic & English. Print & digital.',
      'about.p1': 'My work spans the full life of a brand: the mark, the system built around it, and the everyday content that keeps it visible.',
      'about.p2': 'I’ve designed for clinics, cafés, real-estate developers, car-rental and mobility brands, accounting firms, marketing agencies and large events — in both Arabic and English.',
      'contact.kicker': 'Contact',
      'contact.title': 'Have a brand that needs a voice?',
      'contact.lead': 'Send a short brief — what you need, your timeline and where the work will live — and I’ll reply by email.',
      'footer.rights': 'All rights reserved.',
      'footer.top': 'Back to top',
      'lb.close': 'Close',
      'lb.prev': 'Previous',
      'lb.next': 'Next'
    },
    ar: {
      'meta.title': 'أسامة نبيل — مصمم جرافيك وهويات بصرية',
      'brand': 'أسامة.',
      'lang.switch': 'English',
      'nav.work': 'الأعمال',
      'nav.services': 'الخدمات',
      'nav.process': 'طريقة العمل',
      'nav.about': 'نبذة',
      'nav.contact': 'تواصل',
      'hero.kicker': 'مصمم جرافيك وهويات بصرية',
      'hero.title': 'تصميم يجعل العلامة <em>تتكلم.</em>',
      'hero.lead': 'أنا أسامة نبيل — أصمم الهويات البصرية وحملات السوشيال ميديا والمطبوعات والتايبوغرافي العربي لعلامات تجارية في الإمارات والسعودية وعُمان ومصر.',
      'hero.role': 'هوية بصرية · سوشيال ميديا · مطبوعات · تايبوغرافي',
      'cta.work': 'شاهد الأعمال',
      'cta.contact': 'ابدأ مشروعك',
      'cta.email': 'راسلني',
      'stats.kicker': 'بالأرقام',
      'stats.title': 'أعمال حقيقية لعملاء حقيقيين.',
      'stats.brands': 'علامة تجارية',
      'stats.countries': 'دول — الإمارات، السعودية، عُمان، مصر',
      'stats.designs': 'تصميم في هذا المعرض',
      'stats.disciplines': 'مجالات تصميم',
      'services.kicker': 'ماذا أقدّم',
      'services.title': 'من أول شعار إلى البوست اليومي.',
      'svc.branding.t': 'الهوية البصرية ودليلها',
      'svc.branding.d': 'شعارات، أنظمة ألوان، خطوط عربية وإنجليزية، وكتيّبات هوية تحافظ على اتساق العلامة في كل مكان.',
      'svc.social.t': 'تصاميم السوشيال ميديا',
      'svc.social.d': 'بوستات الحملات، المناسبات واليوم الوطني، وإعلانات الإطلاق — بالعربية والإنجليزية.',
      'svc.print.t': 'المطبوعات والفعاليات',
      'svc.print.d': 'بروشورات، بطاقات، حقائب، أعلام، رول أب، أجنحة معارض، لافتات وتغليف سيارات.',
      'svc.profile.t': 'بروفايل الشركات',
      'svc.profile.d': 'بروفايلات وكتالوجات منتجات منظمة تعرض النشاط بوضوح.',
      'svc.type.t': 'التايبوغرافي العربي',
      'svc.type.d': 'حروف عربية معبّرة تحوّل العبارة إلى صورة.',
      'work.kicker': 'أعمال مختارة',
      'work.title': 'علامات صمّمت لها.',
      'work.all': 'الكل',
      'work.images': 'تصميم',
      'work.open': 'عرض المشروع',
      'cat.branding': 'هوية بصرية',
      'cat.social': 'سوشيال ميديا',
      'cat.print': 'مطبوعات وفعاليات',
      'cat.profile': 'بروفايل شركة',
      'cat.type': 'تايبوغرافي',
      'country.ae': 'الإمارات',
      'country.sa': 'السعودية',
      'country.om': 'عُمان',
      'country.eg': 'مصر',
      'process.kicker': 'طريقة العمل',
      'process.title': 'خطوات واضحة بلا مفاجآت.',
      'step1.t': 'الفهم والبحث',
      'step1.d': 'فهم النشاط والجمهور والسوق الذي تخاطبه العلامة.',
      'step2.t': 'الفكرة والاتجاه',
      'step2.d': 'استكشاف الاتجاهات والاتفاق على مسار بصري واضح.',
      'step3.t': 'التصميم والتطوير',
      'step3.d': 'بناء النظام وتطويره عبر جولات ملاحظات مركّزة.',
      'step4.t': 'التسليم والتطبيق',
      'step4.d': 'تسليم ملفات جاهزة للطباعة والنشر، منظمة ومسمّاة.',
      'about.kicker': 'نبذة',
      'about.title': 'عربي وإنجليزي. مطبوع ورقمي.',
      'about.p1': 'أعمالي تغطي حياة العلامة كاملة: الشعار، والنظام البصري المبني حوله، والمحتوى اليومي الذي يبقيها حاضرة.',
      'about.p2': 'صممت لعيادات وكافيهات ومطورين عقاريين وشركات تأجير سيارات ونقل ومكاتب محاسبة ووكالات تسويق وفعاليات كبرى — بالعربية والإنجليزية.',
      'contact.kicker': 'تواصل',
      'contact.title': 'لديك علامة تحتاج صوتًا؟',
      'contact.lead': 'أرسل وصفًا مختصرًا — ماذا تحتاج، والمدة، وأين سيُستخدم التصميم — وسأرد عليك عبر البريد.',
      'footer.rights': 'جميع الحقوق محفوظة.',
      'footer.top': 'للأعلى',
      'lb.close': 'إغلاق',
      'lb.prev': 'السابق',
      'lb.next': 'التالي'
    }
  };

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
      document.querySelectorAll('[data-i18n]').forEach(function (el) { el.textContent = PF.t(el.getAttribute('data-i18n')); });
      document.querySelectorAll('[data-i18n-html]').forEach(function (el) { el.innerHTML = PF.t(el.getAttribute('data-i18n-html')); });
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
