#!/usr/bin/env python3
"""Pre-renders every page for search engines and LLM crawlers (no JavaScript needed to read the content).

For each page that contains the markers below it:
  * fills every [data-i18n] / [data-i18n-html] element with the English copy from assets/js/strings.js
  * writes the SEO <head> block between <!--seo--> and <!--/seo--> (title, description, canonical,
    Open Graph, Twitter, JSON-LD: WebSite, ProfilePage, Person, ProfessionalService, FAQPage, ItemList)
  * inserts shared conversion partials between <!--inc:NAME--> and <!--/inc:NAME-->
    (clients, midcta, faq, brief, sticky)
  * inserts static project / service lists between <!--pr:projects--> / <!--pr:projects:li--> /
    <!--pr:services--> / <!--pr:services:li--> markers (JavaScript replaces them with the interactive versions)
and regenerates robots.txt, sitemap.xml and llms.txt at the repo root.

Run after any content change:  python3 tools/prerender.py
SITE_URL defaults to the production domain, https://www.osamanabil.com/.
"""
import datetime
import html
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE_URL = os.environ.get('SITE_URL', 'https://www.osamanabil.com/').rstrip('/') + '/'
EMAIL = 'osamanabil419700@gmail.com'
NAME_EN, NAME_AR = 'Osama Nabil', 'أسامة نبيل'
SERVICES = ['branding', 'social', 'print', 'profile', 'type']
COUNTRIES = {'eg': 'Egypt', 'sa': 'Saudi Arabia', 'ae': 'United Arab Emirates', 'om': 'Oman', 'qa': 'Qatar'}
PHONE, PHONE_DISPLAY, WHATSAPP = '+201005606850', '+20 100 560 6850', 'https://wa.me/201005606850'
SOCIAL = [('whatsapp', WHATSAPP, 'WhatsApp'),
          ('instagram', 'https://www.instagram.com/osamanabiill/', 'Instagram'),
          ('behance', 'https://www.behance.net/osamanabil4197', 'Behance'),
          ('facebook', 'https://www.facebook.com/anaosama.nabil', 'Facebook'),
          ('gmail', 'mailto:' + EMAIL, 'Gmail')]
SAME_AS = [u for k, u, _ in SOCIAL if k in ('instagram', 'behance', 'facebook')]
CURRENCIES = ['EGP', 'SAR', 'AED', 'OMR', 'QAR', 'USD']  # market order, then USD


def load_js_json(path, var):
    src = open(os.path.join(ROOT, path), encoding='utf-8').read()
    body = src.split('window.' + var + ' = ', 1)[1].strip()
    return json.loads(body.rstrip(';'))


S = load_js_json('assets/js/strings.js', 'PORTFOLIO_STRINGS')
EN = S['en']
PROJECTS = load_js_json('assets/js/data.js', 'PORTFOLIO_PROJECTS')
ORDERED = [p for p in PROJECTS if p['featured']] + [p for p in PROJECTS if not p['featured']]
CLIENTS = [p for p in PROJECTS if p.get('client') is not False]
e = html.escape
FAQ_N = len([k for k in EN if re.match(r'faq\.q\d+$', k)])


def icon(name, size=22):
    svg = open(os.path.join(ROOT, 'assets/img/icons/%s.svg' % name), encoding='utf-8').read()
    svg = re.sub(r'<title>.*?</title>', '', svg)
    return svg.replace('<svg role="img"', '<svg aria-hidden="true" focusable="false" width="%d" height="%d" fill="currentColor"' % (size, size))


def t(k):
    return EN[k]


def i18n(tag, key, cls='', extra=''):
    c = ' class="%s"' % cls if cls else ''
    return '<%s%s data-i18n="%s"%s>%s</%s>' % (tag, c, key, extra, e(t(key)), tag)


# ---------------------------------------------------------------- partials
def p_clients(base=''):
    names = ''.join('<li>%s</li>' % e(p['title']['en']) for p in CLIENTS)
    return ('<section class="clients" aria-labelledby="clientsTitle"><div class="f-wrap clients__head">'
            '<h2 class="clients__title" id="clientsTitle" data-i18n="clients.title">%s</h2>%s</div>'
            '<div class="clients__rail"><ul class="clients__list" data-clients data-marquee>%s</ul></div></section>'
            % (e(t('clients.title')), i18n('p', 'clients.kicker', 'clients__kicker'), names))


def p_midcta(base=''):
    return ('<aside class="midcta"><div>%s%s</div>'
            '<a class="f-btn" href="#contact"><span data-i18n="cta.contact">%s</span> <span class="arr" aria-hidden="true">→</span></a></aside>'
            % (i18n('h3', 'mid.title'), i18n('p', 'mid.text'), e(t('cta.contact'))))


def p_faq(base=''):
    items = ''.join('<details%s><summary data-i18n="faq.q%d">%s</summary><p data-i18n="faq.a%d">%s</p></details>'
                    % (' open' if i == 1 else '', i, e(t('faq.q%d' % i)), i, e(t('faq.a%d' % i))) for i in range(1, FAQ_N + 1))
    return ('<section class="faq f-wrap" id="faq" aria-labelledby="faqTitle"><div class="faq__grid"><div>%s'
            '<h2 class="f-h2" id="faqTitle" data-i18n="faq.title">%s</h2></div><div class="faq__list">%s</div></div></section>'
            % (i18n('p', 'faq.kicker', 'f-kicker'), e(t('faq.title')), items))


def chip(kind, name, value, key):
    return ('<label class="brief__chip"><input type="%s" name="%s" value="%s"><span data-i18n="%s">%s</span></label>'
            % (kind, name, value, key, e(t(key))))


def field(name, key, kind='input', required=False, auto='', mode=''):
    req = ' required aria-required="true"' if required else ''
    star = ' <small data-i18n="brief.required">%s</small>' % e(t('brief.required')) if required else ''
    attrs = (' autocomplete="%s"' % auto if auto else '') + (' inputmode="%s"' % mode if mode else '')
    ctl = ('<textarea id="bf-%s" name="%s" rows="3"></textarea>' % (name, name) if kind == 'textarea'
           else '<input id="bf-%s" name="%s" type="text"%s%s>' % (name, name, attrs, req))
    return '<div class="brief__field"><label for="bf-%s"><span data-i18n="%s">%s</span>%s</label>%s</div>' % (
        name, key, e(t(key)), star, ctl)


def p_brief(base=''):
    services = ''.join(chip('checkbox', 'services', k, 'cat.' + k) for k in SERVICES) + chip('checkbox', 'services', 'unsure', 'brief.unsure')
    times = ''.join(chip('radio', 'timeline', 't%d' % i, 'brief.t%d' % i) for i in range(1, 5))
    nav_next = '<button type="button" class="f-btn" data-next><span data-i18n="brief.next">%s</span> <span class="arr" aria-hidden="true">→</span></button>' % e(t('brief.next'))
    nav_back = '<button type="button" class="f-btn f-btn--ghost" data-back data-i18n="brief.back">%s</button>' % e(t('brief.back'))
    trust = ''.join(i18n('li', 'brief.trust%d' % i) for i in range(1, 4))
    return (
        '<section class="brief f-wrap" id="contact" aria-labelledby="briefTitle"><div class="brief__grid">'
        '<div class="brief__intro">%s<h2 class="f-h2" id="briefTitle" data-i18n="brief.title">%s</h2>%s'
        '<div class="brief__person"><img src="%sassets/img/avatar.webp" width="96" height="96" alt="%s" loading="lazy">'
        '<p><b>%s</b><span data-i18n="brief.person">%s</span></p></div>'
        '<ul class="brief__trust">%s</ul>'
        '<p class="brief__alt"><span data-i18n="brief.alt">%s</span> <a data-email data-email-text href="mailto:%s">%s</a> '
        '<span data-i18n="brief.wa">%s</span> <a href="%s" target="_blank" rel="noopener" dir="ltr">%s</a></p></div>'
        '<form class="brief__form" novalidate aria-label="%s">'
        '<div class="brief__progress" aria-live="polite"><span><span data-i18n="brief.step">%s</span> <b class="brief__n">1</b> <span data-i18n="brief.of">%s</span> 3</span><i><b></b></i></div>'
        '<fieldset class="brief__step is-active"><legend data-i18n="brief.q1">%s</legend>%s'
        '<div class="brief__chips" data-group="services">%s</div><p class="brief__err" role="alert"></p>'
        '<div class="brief__nav">%s</div></fieldset>'
        '<fieldset class="brief__step" hidden><legend data-i18n="brief.q2">%s</legend>'
        '<div class="brief__chips" data-group="timeline">%s</div><p class="brief__err" role="alert"></p>'
        '<div class="brief__field"><label for="bf-budget" data-i18n="brief.budget">%s</label><div class="brief__money">'
        '<input id="bf-budget" name="budget" type="text" inputmode="numeric" placeholder="%s" data-i18n-ph="brief.budgetPh">'
        '<select name="currency" aria-label="%s" data-i18n-aria="brief.currency">%s</select></div></div>'
        '<div class="brief__nav">%s%s</div></fieldset>'
        '<fieldset class="brief__step" hidden><legend data-i18n="brief.q3">%s</legend>%s%s%s%s'
        '<input type="checkbox" name="botcheck" class="brief__hp" tabindex="-1" autocomplete="off" aria-hidden="true">'
        '<p class="brief__err" role="alert"></p><div class="brief__nav brief__nav--send">%s'
        '<button type="submit" class="f-btn f-btn--ghost" data-via="email"><span data-i18n="brief.sendMail">%s</span></button>'
        '<button type="submit" class="f-btn f-btn--wa" data-via="whatsapp">%s<span data-i18n="brief.sendWa">%s</span></button></div></fieldset>'
        '<div class="brief__done" hidden><h3 tabindex="-1" class="brief__doneT" data-i18n="brief.doneT">%s</h3>'
        '<p class="brief__doneP" data-i18n="brief.doneP">%s</p>'
        '<div class="brief__manual"><p class="brief__links"><a data-email data-email-text href="mailto:%s">%s</a> · '
        '<a href="%s" target="_blank" rel="noopener" dir="ltr">%s</a></p>'
        '<textarea class="brief__out" readonly aria-label="Brief"></textarea>'
        '<button type="button" class="f-btn" data-copy data-i18n="brief.copy">%s</button></div>'
        '<div class="brief__nav"><button type="button" class="f-btn f-btn--ghost" data-again data-i18n="brief.again">%s</button></div></div>'
        '</form></div></section>'
        % (i18n('p', 'brief.kicker', 'f-kicker'), e(t('brief.title')), i18n('p', 'brief.lead', 'brief__lead'),
           base, NAME_EN, NAME_EN, e(t('brief.person')), trust,
           e(t('brief.alt')), EMAIL, EMAIL, e(t('brief.wa')), WHATSAPP, PHONE_DISPLAY, e(t('brief.title')),
           e(t('brief.step')), e(t('brief.of')),
           e(t('brief.q1')), i18n('p', 'brief.q1h', 'brief__hint'), services, nav_next,
           e(t('brief.q2')), times, e(t('brief.budget')), e(t('brief.budgetPh')), e(t('brief.currency')),
           ''.join('<option value="%s" data-i18n="cur.%s">%s</option>' % (c, c, e(t('cur.' + c))) for c in CURRENCIES),
           nav_back, nav_next,
           e(t('brief.q3')),
           field('name', 'brief.name', required=True, auto='name'),
           field('contact', 'brief.contact', required=True, auto='email', mode='email'),
           field('company', 'brief.company', auto='organization'),
           field('details', 'brief.details', kind='textarea'),
           nav_back, e(t('brief.sendMail')), icon('whatsapp', 20), e(t('brief.sendWa')),
           e(t('brief.doneT')), e(t('brief.doneP')), EMAIL, EMAIL, WHATSAPP, PHONE_DISPLAY, e(t('brief.copy')), e(t('brief.again'))))


def p_sticky(base=''):
    return ('<div class="sticky-cta" aria-hidden="true"><img src="%sassets/img/avatar.webp" width="40" height="40" alt="" loading="lazy">%s'
            '<a class="f-btn" href="#contact"><span data-i18n="sticky.cta">%s</span> <span class="arr" aria-hidden="true">→</span></a></div>'
            % (base, i18n('span', 'sticky.text'), e(t('sticky.cta'))))


def p_contactbar(base=''):
    icons = ''.join('<li><a class="cbar__icon cbar__icon--%s" href="%s"%s aria-label="%s" title="%s">%s</a></li>'
                    % (k, u, '' if u.startswith('mailto:') else ' target="_blank" rel="noopener"', lab, lab, icon(k)) for k, u, lab in SOCIAL)
    return ('<section class="cbar f-wrap" aria-labelledby="cbarTitle"><div class="cbar__head">'
            '<h2 class="cbar__title" id="cbarTitle" data-i18n="cbar.title">%s</h2>%s</div>'
            '<ul class="cbar__icons">%s</ul>'
            '<ul class="cbar__lines"><li>%s<span data-i18n="cbar.email">%s</span> <a href="mailto:%s">%s</a></li>'
            '<li>%s<span data-i18n="cbar.phone">%s</span> <a href="%s" target="_blank" rel="noopener" dir="ltr">%s</a></li></ul></section>'
            % (e(t('cbar.title')), i18n('p', 'cbar.text', 'cbar__text'), icons,
               icon('gmail', 18), e(t('cbar.email')), EMAIL, EMAIL,
               icon('whatsapp', 18), e(t('cbar.phone')), WHATSAPP, PHONE_DISPLAY))


PARTIALS = {'contactbar': p_contactbar, 'clients': p_clients, 'midcta': p_midcta, 'faq': p_faq, 'brief': p_brief, 'sticky': p_sticky}


# ---------------------------------------------------------------- static lists
def project_line(p):
    bits = [EN['cat.' + c] for c in p['cats']]
    if p['country']:
        bits.append(COUNTRIES[p['country']])
    bits.append('%d %s' % (len(p['images']), EN['work.images']))
    return '<article class="pr-item"><h3>%s</h3><p>%s</p><p>%s</p></article>' % (
        e(p['title']['en']), e(p['desc']['en']), e(' · '.join(bits)))


def pr_projects(li=False):
    items = [project_line(p) for p in ORDERED]
    return ''.join(('<li>%s</li>' % x) if li else x for x in items)


def pr_services(li=False):
    items = ['<article class="pr-item"><h3>%s</h3><p>%s</p></article>' % (
        e(EN['svc.%s.t' % k]), e(EN['svc.%s.d' % k])) for k in SERVICES]
    return ''.join(('<li>%s</li>' % x) if li else x for x in items)


# ---------------------------------------------------------------- SEO head
def jsonld(url):
    person_id = SITE_URL + '#person'
    img = SITE_URL + 'assets/img/portrait.jpg'
    graph = [
        {'@type': 'WebSite', '@id': SITE_URL + '#website', 'url': SITE_URL, 'name': EN['meta.title'],
         'inLanguage': ['en', 'ar'], 'publisher': {'@id': person_id}},
        {'@type': 'ProfilePage', '@id': url + '#page', 'url': url, 'name': EN['meta.title'],
         'description': EN['meta.description'], 'isPartOf': {'@id': SITE_URL + '#website'},
         'mainEntity': {'@id': person_id}, 'inLanguage': 'en'},
        {'@type': 'Person', '@id': person_id, 'name': NAME_EN, 'alternateName': NAME_AR,
         'jobTitle': EN['hero.kicker'], 'description': EN['meta.description'], 'image': img, 'url': SITE_URL,
         'email': 'mailto:' + EMAIL, 'telephone': PHONE, 'sameAs': SAME_AS, 'knowsLanguage': ['ar', 'en'],
         'hasCredential': {'@type': 'EducationalOccupationalCredential', 'credentialCategory': 'degree',
                           'name': 'Bachelor of Applied Arts (Design)'},
         'knowsAbout': ['Brand identity design', 'Brand guidelines', 'Logo design', 'Social media design',
                        'Print design', 'Event collateral', 'Company profile design', 'Arabic typography'],
         'workLocation': [{'@type': 'Country', 'name': n} for n in COUNTRIES.values()]},
        {'@type': 'ProfessionalService', '@id': SITE_URL + '#service', 'name': NAME_EN + ' — ' + EN['hero.kicker'],
         'url': SITE_URL, 'image': img, 'email': EMAIL, 'telephone': PHONE, 'sameAs': SAME_AS, 'founder': {'@id': person_id},
         'description': EN['meta.description'],
         'areaServed': [{'@type': 'Country', 'name': n} for n in COUNTRIES.values()],
         'availableLanguage': ['Arabic', 'English'],
         'hasOfferCatalog': {'@type': 'OfferCatalog', 'name': EN['services.kicker'], 'itemListElement': [
             {'@type': 'Offer', 'itemOffered': {'@type': 'Service', 'name': EN['svc.%s.t' % k],
                                                'description': EN['svc.%s.d' % k]}} for k in SERVICES]}},
        {'@type': 'FAQPage', '@id': url + '#faq', 'mainEntity': [
            {'@type': 'Question', 'name': EN['faq.q%d' % i],
             'acceptedAnswer': {'@type': 'Answer', 'text': EN['faq.a%d' % i]}} for i in range(1, FAQ_N + 1)]},
        {'@type': 'ItemList', '@id': url + '#work', 'name': EN['work.kicker'], 'itemListElement': [
            {'@type': 'ListItem', 'position': i + 1, 'item': {
                '@type': 'CreativeWork', 'name': p['title']['en'], 'description': p['desc']['en'],
                'genre': [EN['cat.' + c] for c in p['cats']],
                'image': SITE_URL + 'assets/work/%s/%s' % (p['slug'], p['images'][0][0]),
                'creator': {'@id': person_id}}} for i, p in enumerate(ORDERED)]},
    ]
    return json.dumps({'@context': 'https://schema.org', '@graph': graph}, ensure_ascii=False, separators=(',', ':'))


def seo_head(url):
    title, desc = e(EN['meta.title']), e(EN['meta.description'])
    img = SITE_URL + 'assets/img/portrait.jpg'
    return '\n'.join([
        '<title>%s</title>' % title,
        '  <meta name="description" content="%s">' % desc,
        '  <link rel="canonical" href="%s">' % url,
        '  <meta name="robots" content="index, follow, max-image-preview:large">',
        '  <meta name="author" content="%s">' % NAME_EN,
        '  <meta property="og:type" content="profile">',
        '  <meta property="og:site_name" content="%s">' % NAME_EN,
        '  <meta property="og:title" content="%s">' % title,
        '  <meta property="og:description" content="%s">' % desc,
        '  <meta property="og:url" content="%s">' % url,
        '  <meta property="og:image" content="%s">' % img,
        '  <meta property="og:image:width" content="800">',
        '  <meta property="og:image:height" content="1001">',
        '  <meta property="og:image:alt" content="%s">' % NAME_EN,
        '  <meta property="og:locale" content="en_US">',
        '  <meta property="og:locale:alternate" content="ar_AE">',
        '  <meta property="profile:first_name" content="Osama">',
        '  <meta property="profile:last_name" content="Nabil">',
        '  <meta name="twitter:card" content="summary_large_image">',
        '  <meta name="twitter:title" content="%s">' % title,
        '  <meta name="twitter:description" content="%s">' % desc,
        '  <meta name="twitter:image" content="%s">' % img,
        '  <script type="application/ld+json">%s</script>' % jsonld(url),
        '  ',
    ])


# ---------------------------------------------------------------- page processing
def fill_i18n(h):
    def text(m):
        return m.group(1) + e(EN[m.group('k')]) + m.group(5)

    def raw(m):
        return m.group(1) + EN[m.group('k')] + m.group(5)

    h = re.sub(r'(<(?P<tag>[a-z0-9]+)\b[^>]*?\sdata-i18n="(?P<k>[^"]+)"[^>]*>)(.*?)(</(?P=tag)>)', text, h, flags=re.S)
    h = re.sub(r'(<(?P<tag>[a-z0-9]+)\b[^>]*?\sdata-i18n-html="(?P<k>[^"]+)"[^>]*>)(.*?)(</(?P=tag)>)', raw, h, flags=re.S)
    return h


def between(h, name, content):
    pat = re.compile(r'(<!--%s-->)(.*?)(<!--/%s-->)' % (re.escape(name), re.escape(name)), re.S)
    return pat.sub(lambda m: m.group(1) + content + m.group(3), h)


def process(path):
    rel = os.path.relpath(os.path.dirname(path), ROOT)
    url = SITE_URL if rel == '.' else SITE_URL + rel.replace(os.sep, '/') + '/'
    h = open(path, encoding='utf-8').read()
    if '<!--seo-->' not in h:
        return False
    h = between(h, 'seo', seo_head(url))
    base = '' if rel == '.' else '../' * (rel.count(os.sep) + 1)
    for name, fn in PARTIALS.items():
        h = between(h, 'inc:' + name, fn(base))
    h = between(h, 'pr:projects', pr_projects())
    h = between(h, 'pr:projects:li', pr_projects(li=True))
    h = between(h, 'pr:services', pr_services())
    h = between(h, 'pr:services:li', pr_services(li=True))
    h = fill_i18n(h)
    open(path, 'w', encoding='utf-8').write(h)
    return True


def write_root_files():
    today = datetime.date.today().isoformat()
    open(os.path.join(ROOT, 'robots.txt'), 'w').write(
        'User-agent: *\nAllow: /\n\n'
        + ''.join('User-agent: %s\nAllow: /\n\n' % b for b in
                  ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'PerplexityBot',
                   'Google-Extended', 'Applebot-Extended', 'Bingbot'])
        + 'Sitemap: %ssitemap.xml\n' % SITE_URL)
    open(os.path.join(ROOT, 'sitemap.xml'), 'w').write(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        '  <url><loc>%s</loc><lastmod>%s</lastmod><changefreq>monthly</changefreq><priority>1.0</priority></url>\n'
        '</urlset>\n' % (SITE_URL, today))
    lines = ['# %s — %s' % (NAME_EN, EN['hero.kicker']), '',
             '> ' + EN['meta.description'], '',
             'Arabic name: %s. Bachelor of Applied Arts (Design), 8+ years in graphic design. Works in Arabic and English.' % NAME_AR, '',
             'Contact: email %s · WhatsApp %s (%s) · Instagram %s · Behance %s · Facebook %s · Website %s'
             % (EMAIL, PHONE_DISPLAY, WHATSAPP, SAME_AS[0], SAME_AS[1], SAME_AS[2], SITE_URL), '',
             '## Services', '']
    lines += ['- **%s**: %s' % (EN['svc.%s.t' % k], EN['svc.%s.d' % k]) for k in SERVICES]
    lines += ['', '## Markets', '', '- ' + ', '.join(COUNTRIES.values()), '', '## Selected projects', '']
    for p in ORDERED:
        meta = ', '.join([EN['cat.' + c] for c in p['cats']] + ([COUNTRIES[p['country']]] if p['country'] else []))
        lines.append('- **%s** (%s): %s — %d designs' % (p['title']['en'], meta, p['desc']['en'], len(p['images'])))
    lines += ['', '## FAQ', '']
    for i in range(1, FAQ_N + 1):
        lines += ['### ' + EN['faq.q%d' % i], '', EN['faq.a%d' % i], '']
    lines += ['## How to hire', '', EN['faq.a4'] + ' Email: ' + EMAIL + '. WhatsApp: ' + PHONE_DISPLAY + '.', '']
    open(os.path.join(ROOT, 'llms.txt'), 'w', encoding='utf-8').write('\n'.join(lines))


if __name__ == '__main__':
    pages = [os.path.join(ROOT, 'index.html')] + sorted(
        os.path.join(ROOT, d, 'index.html') for d in os.listdir(ROOT)
        if d.startswith('design-') and os.path.isfile(os.path.join(ROOT, d, 'index.html')))
    done = [os.path.relpath(p, ROOT) for p in pages if process(p)]
    write_root_files()
    print('prerendered:', ', '.join(done) or 'none')
    print('site url:', SITE_URL)
