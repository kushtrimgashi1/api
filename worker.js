import { onRequest } from './functions/api/extract.js';
import { LANGS as LANGS_META, META, KEYS, LOCALES } from './i18n-data.js';
import { PLATFORMS, PLATFORM_SLUGS, platformContent } from './seo-pages.js';

const LANGS = LANGS_META.map(l => l.code);

const RTL = ['ar'];
const CANONICAL_HOST = 'vidridge.com';

const DOC_PAGES = {
  about: { priority: '0.6' },
  privacy: { priority: '0.3' },
  terms: { priority: '0.3' },
  contact: { priority: '0.4' },
  download: { priority: '0.9', slug: 'dl' }
};

// Page slug (URL) -> i18n key prefix (title/lead live under `dl.`)
function docSlug(slug) {
  const cfg = DOC_PAGES[slug];
  return (cfg && cfg.slug) || slug;
}

// IndexNow (Bing / Yandex / DuckDuckGo): key file is served at /<KEY>.txt
const INDEXNOW_KEY = '084e6597c5a3d36a699c36eee83504ba';
const INDEXNOW_FALLBACK_TOKEN = '9fd89838d7207dd62002f52294ce5d179988';
const SITEMAP_LASTMOD = '2026-11-05';

// Cloudflare Web Analytics beacon. The token is public (it ships in the page
// source), so it lives here; CF_BEACON_TOKEN in the dashboard still wins.
const CF_BEACON_TOKEN = 'dfb6c4334d314c1e88ceb3c8e74cb732';

// /{lang}/<slug> for the three platform landing pages.
const PLATFORM_RE = new RegExp('^/(' + PLATFORM_SLUGS.join('|') + ')(/|\\.html)?$');

const DICT = {};
for (const code of LANGS) {
  const arr = LOCALES[code] || [];
  const o = {};
  for (let i = 0; i < KEYS.length; i++) {
    o[KEYS[i]] = (arr[i] != null && arr[i] !== '') ? arr[i] : (LOCALES.en[i] != null ? LOCALES.en[i] : KEYS[i]);
  }
  DICT[code] = o;
}

function t(lang, key) {
  const d = DICT[lang] || DICT.en;
  return d[key] != null ? d[key] : (DICT.en[key] != null ? DICT.en[key] : key);
}

const GEO = {
  AL: 'sq', XK: 'sq', MK: 'sq',
  IT: 'it', SM: 'it', VA: 'it',
  DE: 'de', AT: 'de', CH: 'de', LI: 'de',
  FR: 'fr', BE: 'fr', LU: 'fr', MC: 'fr',
  ES: 'es', MX: 'es', AR: 'es', CO: 'es', CL: 'es', PE: 'es', VE: 'es', UY: 'es', EC: 'es', BO: 'es', PY: 'es', CR: 'es', CU: 'es', DO: 'es', GT: 'es', HN: 'es', NI: 'es', PA: 'es', SV: 'es', PR: 'es',
  PT: 'pt', BR: 'pt', AO: 'pt', MZ: 'pt', CV: 'pt', GW: 'pt', ST: 'pt', TL: 'pt',
  TR: 'tr',
  SA: 'ar', AE: 'ar', EG: 'ar', DZ: 'ar', MA: 'ar', TN: 'ar', JO: 'ar', LB: 'ar', KW: 'ar', QA: 'ar', BH: 'ar', OM: 'ar', IQ: 'ar', LY: 'ar', SD: 'ar', YE: 'ar', SY: 'ar', PS: 'ar', MR: 'ar'
};

function pickLang(request, url) {
  const cookie = request.headers.get('Cookie') || '';
  const m = cookie.match(/(?:^|;\s*)lang=([a-z]{2})(?:;|$)/);
  if (m && LANGS.includes(m[1])) return m[1];
  const q = (url.searchParams.get('lang') || '').toLowerCase();
  if (LANGS.includes(q)) return q;
  const country = (request.cf && request.cf.country) || '';
  return GEO[country] || 'en';
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ---- Server-side translation: crawlers get localized text without running JS ----
function localize(html, lang) {
  if (lang === 'en') {
    // English is the authored text, but still fill placeholders.
    return html.split('__LANG__').join('en');
  }
  // 1. innerHTML bindings (allow markup)
  html = html.replace(/<([a-zA-Z][\w-]*)([^>]*\sdata-i18n-html="([^"]+)"[^>]*)>[\s\S]*?<\/\1>/g,
    (m, tag, attrs, key) => `<${tag}${attrs}>${t(lang, key)}</${tag}>`);

  // 2. plain text bindings
  html = html.replace(/<([a-zA-Z][\w-]*)([^>]*\sdata-i18n="([^"]+)"[^>]*)>[\s\S]*?<\/\1>/g,
    (m, tag, attrs, key) => `<${tag}${attrs}>${esc(t(lang, key))}</${tag}>`);

  // 3. attribute bindings
  html = html.replace(/<([a-zA-Z][\w-]*)([^>]*)>/g, (m, tag, attrs) => {
    let out = attrs;
    const subs = [
      ['data-i18n-ph', 'placeholder'],
      ['data-i18n-aria', 'aria-label'],
      ['data-i18n-title', 'title']
    ];
    for (const [dataAttr, attr] of subs) {
      const mm = out.match(new RegExp('\\s' + dataAttr + '="([^"]+)"'));
      if (!mm) continue;
      const val = t(lang, mm[1]);
      out = out.replace(new RegExp('\\s' + attr + '="[^"]*"'), '');
      out = out.replace(mm[0], mm[0] + ` ${attr}="${esc(val)}"`);
    }
    return `<${tag}${out}>`;
  });

  return html.split('__LANG__').join(lang);
}

function seoLinks(lang, kind, origin, slug) {
  if (kind === 'watch') {
    return `<link rel="canonical" href="${origin}/${lang}/watch">`;
  }
  const path = slug ? '/' + slug : '/';
  const links = LANGS.map(l => `<link rel="alternate" hreflang="${l}" href="${origin}/${l}${path}">`);
  links.push(`<link rel="alternate" hreflang="x-default" href="${origin}/en${path}">`);
  links.push(`<link rel="canonical" href="${origin}/${lang}${path}">`);

  let title, desc;
  if (kind === 'doc') {
    const meta = docMeta(lang, slug);
    title = meta.fullTitle;
    desc = meta.desc;
  } else {
    title = META[lang].title;
    desc = META[lang].desc;
  }
  links.push(`<meta property="og:type" content="${kind === 'doc' ? 'article' : 'website'}">`);
  links.push(`<meta property="og:site_name" content="VidRidge">`);
  links.push(`<meta property="og:title" content="${esc(title)}">`);
  links.push(`<meta property="og:description" content="${esc(desc)}">`);
  links.push(`<meta property="og:url" content="${origin}/${lang}${path}">`);
  links.push(`<meta property="og:locale" content="${lang}">`);
  links.push(`<meta name="twitter:card" content="summary_large_image">`);
  links.push(`<meta name="twitter:title" content="${esc(title)}">`);
  links.push(`<meta name="twitter:description" content="${esc(desc)}">`);
  if (kind === 'doc' && slug === 'download') {
    links.push(`<meta property="og:image" content="${origin}/img/og-app.png">`);
    links.push(`<meta property="og:image:width" content="1200">`);
    links.push(`<meta property="og:image:height" content="630">`);
    links.push(`<meta name="twitter:image" content="${origin}/img/og-app.png">`);
  }
  if (kind === 'doc' && PLATFORMS[slug]) {
    const img = `${origin}/img/og-${PLATFORMS[slug].key}.png`;
    links.push(`<meta property="og:image" content="${img}">`);
    links.push(`<meta property="og:image:width" content="1200">`);
    links.push(`<meta property="og:image:height" content="630">`);
    links.push(`<meta name="twitter:image" content="${img}">`);
  }
  return links.join('\n  ');
}

// Localized <title>/description for a document page (SEO-tuned when available).
function docMeta(lang, slug) {
  const pc = platformContent(lang, slug);
  if (pc) {
    return { title: pc.title, fullTitle: pc.title, desc: pc.desc };
  }
  const k = docSlug(slug);
  const d = DICT[lang] || DICT.en;
  const title = d[k + '.seoTitle'] || d[k + '.title'] || META[lang].title;
  return {
    title,
    // SEO titles already carry the brand: avoid "VidRidge — VidRidge APK …".
    fullTitle: /VidRidge/i.test(title) ? title : `VidRidge — ${title}`,
    desc: d[k + '.seoDesc'] || d[k + '.lead'] || META[lang].desc
  };
}

// Structured data: lets Google/Bing show this as an installable app page.
function appJsonLd(lang, origin) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'MobileApplication',
    name: 'VidRidge',
    alternateName: 'VidRidge — video downloader',
    description: docMeta(lang, 'download').desc,
    operatingSystem: 'Android 10+',
    applicationCategory: 'MultimediaApplication',
    applicationSubCategory: 'Video downloader',
    downloadUrl: origin + '/app/vidridge.apk',
    installUrl: origin + '/' + lang + '/download',
    softwareVersion: '1.1',
    fileSize: '38KB',
    inLanguage: LANGS,
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    publisher: { '@type': 'Organization', name: 'VidRidge', url: origin + '/' }
  });
}

// FAQPage markup mirrors the visible Q&A block on /download.
function faqJsonLd(lang) {
  const qa = [1, 2, 3].map(i => ({
    '@type': 'Question',
    name: t(lang, 'dl.q' + i),
    acceptedAnswer: { '@type': 'Answer', text: t(lang, 'dl.a' + i) }
  }));
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: lang,
    mainEntity: qa
  });
}

function inject(html, lang, kind, origin, slug, env) {
  const dir = RTL.includes(lang) ? 'rtl' : 'ltr';
  html = html.replace('<html lang="en">', `<html lang="${lang}" dir="${dir}">`);

  const beacon = (env && env.CF_BEACON_TOKEN) || CF_BEACON_TOKEN;
  if (beacon && !html.includes('cloudflareinsights.com/beacon')) {
    const tag = `<script type="module" src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='${JSON.stringify({ token: beacon })}'></script>`;
    html = html.replace('</head>', '  ' + tag + '\n</head>');
  }

  let title = META[lang].title;
  let desc = META[lang].desc;
  if (kind === 'watch') {
    title = `VidRidge — ${META[lang].watch}`;
  } else if (kind === 'doc') {
    const meta = docMeta(lang, slug);
    title = meta.fullTitle;
    desc = meta.desc;
  }
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`);
  if (kind !== 'watch') {
    html = html.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(desc)}">`);
  }

  const links = seoLinks(lang, kind, origin, slug);
  if (html.includes('<!--SEO-->')) html = html.replace('<!--SEO-->', links);
  else html = html.replace('</head>', '  ' + links + '\n</head>');

  if (kind === 'doc' && slug === 'download') {
    const ld = `<script type="application/ld+json">${appJsonLd(lang, origin)}</script>\n  ` +
      `<script type="application/ld+json">${faqJsonLd(lang)}</script>`;
    html = html.replace('</head>', '  ' + ld + '\n</head>');
  }

  if (kind === 'doc' && PLATFORMS[slug]) {
    html = html.replace('</head>', '  ' + platformJsonLd(lang, slug, origin) + '\n</head>');
  }
  return html;
}

// HowTo + FAQ + breadcrumbs for a platform landing page.
function platformJsonLd(lang, slug, origin) {
  const c = platformContent(lang, slug);
  const p = PLATFORMS[slug];
  const howTo = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: c.h1,
    description: c.intro,
    inLanguage: lang,
    totalTime: 'PT1M',
    step: c.steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.h,
      text: s.p
    }))
  };
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: lang,
    mainEntity: c.faq.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a }
    }))
  };
  const crumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'VidRidge', item: origin + '/' + lang + '/' },
      { '@type': 'ListItem', position: 2, name: p.name, item: origin + '/' + lang + '/' + slug }
    ]
  };
  return [howTo, faq, crumbs]
    .map(j => `<script type="application/ld+json">${JSON.stringify(j)}</script>`)
    .join('\n  ');
}

// Server-rendered body content for a platform landing page.
function fillPlatform(html, lang, slug) {
  const p = PLATFORMS[slug];
  const c = platformContent(lang, slug);
  const steps = c.steps.map((s, i) =>
    `<li><span class="n">${i + 1}</span><div><h3>${esc(s.h)}</h3><p>${esc(s.p)}</p></div></li>`).join('');
  const faq = c.faq.map(f =>
    `<div class="qa"><h3>${esc(f.q)}</h3><p>${esc(f.a)}</p></div>`).join('');
  const related = PLATFORM_SLUGS.filter(s => s !== slug).map(s =>
    `<a class="chip" href="/__LANG__/${s}"><span class="dot" style="background:${PLATFORMS[s].color}"></span>${esc(t(lang, PLATFORMS[s].navKey))}</a>`).join('');
  const values = {
    __PLATFORM_NAME__: p.name,
    __PLATFORM_COLOR__: p.color,
    __ICON__: p.icon,
    __H1__: esc(c.h1),
    __LEAD__: esc(c.lead),
    __INTRO__: esc(c.intro),
    __STEPS__: steps,
    __FAQ__: faq,
    __RELATED__: related
  };
  for (const [token, value] of Object.entries(values)) html = html.split(token).join(value);
  return html;
}

async function serveHtml(request, env, assetPath, lang, origin, slug) {
  const assetUrl = new URL(request.url);
  assetUrl.pathname = assetPath;
  const res = await env.ASSETS.fetch(new Request(assetUrl.toString(), { headers: request.headers }));
  let html = await res.text();
  const kind = assetPath === '/watch.html' ? 'watch' : (slug ? 'doc' : 'index');
  if (slug && PLATFORMS[slug]) html = fillPlatform(html, lang, slug);
  html = localize(html, lang);
  // Only the Albanian page ships screenshots in its own language.
  if (slug === 'download' && lang === 'sq') {
    html = html.split('/img/app-').join('/img/sq/app-');
  }
  html = inject(html, lang, kind, origin, slug, env);
  return new Response(html, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=300',
      'content-language': lang,
      'x-vr-lang': lang
    }
  });
}

function sitemap(origin) {
  const pages = [{ path: '/', priority: '1.0' }];
  for (const [slug, cfg] of Object.entries(DOC_PAGES)) pages.push({ path: '/' + slug, priority: cfg.priority });
  for (const slug of PLATFORM_SLUGS) pages.push({ path: '/' + slug, priority: '0.8' });
  const urls = [];
  for (const page of pages) {
    for (const l of LANGS) {
      const alts = LANGS.map(a => `    <xhtml:link rel="alternate" hreflang="${a}" href="${origin}/${a}${page.path}"/>`).join('\n');
      urls.push(`  <url>\n    <loc>${origin}/${l}${page.path}</loc>\n    <lastmod>${SITEMAP_LASTMOD}</lastmod>\n${alts}\n    <xhtml:link rel="alternate" hreflang="x-default" href="${origin}/en${page.path}"/>\n    <changefreq>weekly</changefreq>\n    <priority>${page.priority}</priority>\n  </url>`);
    }
  }
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`;
}

function robots(origin) {
  return `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /watch\nDisallow: /*/watch\n\nSitemap: ${origin}/sitemap.xml\n`;
}

function redirect(location, status = 302) {
  return new Response(null, {
    status,
    headers: { location, 'cache-control': 'no-store' }
  });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
  });
}

const CONTACT_TO = 'kushtrimgashi90@gmail.com';
const CONTACT_FROM = 'noreply@vidridge.com';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

async function handleContact(request, env) {
  if (request.method !== 'POST') {
    return json({ ok: false, error: 'method_not_allowed' }, 405);
  }
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return json({ ok: false, error: 'bad_request' }, 400);
  }
  const name = String(body && body.name || '').trim().slice(0, 80);
  const email = String(body && body.email || '').trim().slice(0, 120);
  const message = String(body && body.message || '').trim().slice(0, 2000);
  const honey = String(body && body.website || '').trim();

  // Honeypot: pretend success so bots do not learn the rule.
  if (honey) return json({ ok: true });

  if (!name || !email || !message || !EMAIL_RE.test(email)) {
    return json({ ok: false, error: 'invalid' }, 400);
  }

  const text = `From: ${name} <${email}>\n\n${message}\n\n---\nSent from vidridge.com contact form`;
  const subject = `VidRidge contact — ${name}`.slice(0, 120);
  const to = (env && env.CONTACT_TO) || CONTACT_TO;
  // Resend's shared test sender works without a verified domain, but it only
  // delivers to the account owner's address. Set CONTACT_FROM once the domain
  // is verified in Resend.
  const from = (env && env.CONTACT_FROM)
    || ((env && env.RESEND_API_KEY) ? 'onboarding@resend.dev' : CONTACT_FROM);

  // 1) Cloudflare Email Service binding (requires Workers Paid).
  const binding = env && env.CONTACT_EMAIL;
  if (binding && typeof binding.send === 'function') {
    try {
      await binding.send({
        to,
        from: { email: from, name: 'VidRidge' },
        replyTo: email,
        subject,
        text
      });
    } catch (e) {
      return json({ ok: false, error: 'send_failed', code: (e && e.code) || null }, 502);
    }
    return json({ ok: true });
  }

  // 2) Resend HTTP API — works on the free Workers plan (3,000 emails/month).
  const resendKey = env && env.RESEND_API_KEY;
  if (resendKey) {
    let res, payload;
    try {
      res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        signal: AbortSignal.timeout(8000),
        headers: {
          authorization: 'Bearer ' + resendKey,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          from: `VidRidge <${from}>`,
          to: [to],
          subject,
          text,
          reply_to: email
        })
      });
      payload = await res.json().catch(() => ({}));
    } catch (e) {
      return json({ ok: false, error: 'send_failed', code: 'network' }, 502);
    }
    if (!res.ok) {
      return json({
        ok: false,
        error: 'send_failed',
        code: (payload && (payload.name || payload.message)) || ('http_' + res.status)
      }, 502);
    }
    return json({ ok: true });
  }

  // 3) Web3Forms — no domain or DNS needed, just one key. Free tier 250/month.
  //    The destination is whatever address the key was created with.
  const web3Key = env && env.WEB3FORMS_KEY;
  if (web3Key) {
    let res, payload;
    try {
      res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        signal: AbortSignal.timeout(8000),
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({
          access_key: web3Key,
          subject,
          from_name: 'VidRidge contact',
          email,
          replyto: email,
          message: text
        })
      });
      payload = await res.json().catch(() => ({}));
    } catch (e) {
      return json({ ok: false, error: 'send_failed', code: 'network' }, 502);
    }
    if (!res.ok || !payload || payload.success !== true) {
      return json({
        ok: false,
        error: 'send_failed',
        code: (payload && payload.message) || ('http_' + res.status)
      }, 502);
    }
    return json({ ok: true });
  }

  // 4) Nothing configured: answer immediately so the page can offer the
  //    prefilled mail button instead of making the visitor wait.
  return json({ ok: false, error: 'not_configured' }, 503);
}

// HSTS + nosniff on every response (including curl/asset responses).
const SECURITY_HEADERS = {
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin'
};

function secure(res) {
  const headers = new Headers(res.headers);
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) headers.set(k, v);
  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers
  });
}

function siteUrls() {
  const urls = [];
  for (const l of LANGS) {
    urls.push(`https://${CANONICAL_HOST}/${l}/`);
    for (const slug of Object.keys(DOC_PAGES)) urls.push(`https://${CANONICAL_HOST}/${l}/${slug}`);
    for (const slug of PLATFORM_SLUGS) urls.push(`https://${CANONICAL_HOST}/${l}/${slug}`);
  }
  return urls;
}

async function submitIndexNow(urls) {
  const body = {
    host: CANONICAL_HOST,
    key: INDEXNOW_KEY,
    keyLocation: `https://${CANONICAL_HOST}/${INDEXNOW_KEY}.txt`,
    urlList: urls
  };
  const endpoints = ['https://api.indexnow.org/indexnow', 'https://www.bing.com/indexnow'];
  const results = [];
  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json; charset=utf-8' },
        body: JSON.stringify(body)
      });
      results.push({ endpoint, status: res.status });
      // 200/202 = accepted. 429 = shared-IP quota hit, retrying the other endpoint won't help.
      if (res.status === 200 || res.status === 202 || res.status === 429) break;
    } catch (e) {
      results.push({ endpoint, status: 0, error: String(e && e.message || e) });
    }
  }
  return results;
}

async function handle(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const origin = url.origin;

    // Canonical host: HTTPS + apex only (single redirect for http://www -> https://apex)
    const host = url.hostname.toLowerCase();
    const isLocalOrIp = host === 'localhost' || /^[\d.]+$/.test(host);
    if (!isLocalOrIp) {
      let target = host;
      if (host.startsWith('www.')) target = host.slice(4);
      if (!pathname.startsWith('/api/') && host.endsWith('.workers.dev') && !CANONICAL_HOST.endsWith('.workers.dev')) {
        target = CANONICAL_HOST;
      }
      if (url.protocol === 'http:' || target !== host) {
        return redirect('https://' + target + pathname + url.search, 301);
      }
    }

    if (pathname === '/api/extract' || pathname === '/api/extract/') {
      return onRequest({ request, env, ctx });
    }

    if (pathname === '/api/contact' || pathname === '/api/contact/') {
      return handleContact(request, env);
    }

    if (pathname === '/sitemap.xml') {
      return new Response(sitemap(origin), {
        headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public, max-age=3600' }
      });
    }

    if (pathname === '/' + INDEXNOW_KEY + '.txt') {
      return new Response(INDEXNOW_KEY, {
        headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=86400' }
      });
    }

    if (pathname === '/api/indexnow') {
      const token = url.searchParams.get('token') || request.headers.get('x-indexnow-token') || '';
      const expected = (env && env.INDEXNOW_TOKEN) || INDEXNOW_FALLBACK_TOKEN;
      if (token !== expected) {
        return new Response(JSON.stringify({ ok: false, error: 'unauthorized' }), {
          status: 401,
          headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
        });
      }
      let urls = siteUrls();
      if (request.method === 'POST') {
        try {
          const payload = await request.json();
          if (payload && Array.isArray(payload.urls) && payload.urls.length) {
            urls = payload.urls.filter(u => typeof u === 'string' && u.startsWith('https://' + CANONICAL_HOST + '/'));
          }
        } catch (e) {}
      } else if (url.searchParams.get('urls')) {
        urls = url.searchParams.get('urls').split(',').map(s => s.trim())
          .filter(u => u.startsWith('https://' + CANONICAL_HOST + '/'));
      }
      const results = await submitIndexNow(urls);
      return new Response(JSON.stringify({ ok: true, submitted: urls.length, urls, results }, null, 2), {
        headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
      });
    }

    if (pathname === '/favicon.ico') {
      return redirect(origin + '/favicon.svg', 301);
    }

    // Templates are rendered by the worker; never expose the raw file.
    if (pathname === '/platform.html') {
      return redirect(origin + '/' + pickLang(request, url) + '/', 302);
    }

    // Android APK (sideload, no Play Store needed)
    if (pathname === '/app' || pathname === '/app/') {
      return redirect(origin + '/app/vidridge.apk', 302);
    }

    if (pathname === '/app/vidridge.apk') {
      const res = await env.ASSETS.fetch(request);
      const headers = new Headers(res.headers);
      headers.set('content-type', 'application/vnd.android.package-archive');
      headers.set('content-disposition', 'attachment; filename="vidridge.apk"');
      headers.set('cache-control', 'public, max-age=3600');
      return new Response(res.body, { status: res.status, headers });
    }

    // PWA manifest — must be served with a manifest content type to be valid.
    if (pathname === '/manifest.webmanifest') {
      const res = await env.ASSETS.fetch(request);
      const headers = new Headers(res.headers);
      headers.set('content-type', 'application/manifest+json; charset=utf-8');
      headers.set('cache-control', 'public, max-age=3600');
      return new Response(res.body, { status: res.status, headers });
    }

    // Service worker must stay revalidated, otherwise updates never ship.
    if (pathname === '/sw.js') {
      const res = await env.ASSETS.fetch(request);
      const headers = new Headers(res.headers);
      headers.set('content-type', 'text/javascript; charset=utf-8');
      headers.set('service-worker-allowed', '/');
      headers.set('cache-control', 'no-cache, must-revalidate');
      return new Response(res.body, { status: res.status, headers });
    }

    // Shared from the phone's share sheet into the installed app.
    if (pathname === '/share') {
      const raw = url.searchParams.get('url') || url.searchParams.get('text') || '';
      const found = raw.match(/https?:\/\/[^\s]+/);
      const target = new URL(origin + '/' + pickLang(request, url) + '/');
      if (found) target.searchParams.set('url', found[0]);
      return redirect(target.toString(), 302);
    }

    if (pathname === '/robots.txt') {
      return new Response(robots(origin), {
        headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=3600' }
      });
    }

    if (pathname === '/' || pathname === '/index.html') {
      return redirect(origin + '/' + pickLang(request, url) + '/');
    }

    const m = pathname.match(/^\/([a-z]{2})(\/.*)?$/);
    if (m && LANGS.includes(m[1])) {
      const lang = m[1];
      const rest = m[2] || '';
      if (rest === '') return redirect(origin + '/' + lang + '/', 301);
      if (rest === '/' || rest === '/index.html') return serveHtml(request, env, '/index.html', lang, origin);
      if (rest === '/watch' || rest === '/watch/' || rest === '/watch.html') {
        if (rest === '/watch/' || rest === '/watch.html') return redirect(origin + '/' + lang + '/watch' + url.search, 301);
        return serveHtml(request, env, '/watch.html', lang, origin);
      }
      const doc = rest.match(/^\/(about|privacy|terms|contact|download)(\/|\.html)?$/);
      if (doc) {
        if (rest.endsWith('/') || rest.endsWith('.html')) {
          return redirect(origin + '/' + lang + '/' + doc[1] + url.search, 301);
        }
        return serveHtml(request, env, '/' + doc[1] + '.html', lang, origin, doc[1]);
      }

      const plat = rest.match(PLATFORM_RE);
      if (plat) {
        if (rest.endsWith('/') || rest.endsWith('.html')) {
          return redirect(origin + '/' + lang + '/' + plat[1] + url.search, 301);
        }
        return serveHtml(request, env, '/platform.html', lang, origin, plat[1]);
      }
    }

    if (pathname === '/watch' || pathname === '/watch.html') {
      return redirect(origin + '/' + pickLang(request, url) + '/watch' + url.search);
    }

    const topDoc = pathname.match(/^\/(about|privacy|terms|contact|download)(\/|\.html)?$/);
    if (topDoc) {
      return redirect(origin + '/' + pickLang(request, url) + '/' + topDoc[1]);
    }

    const topPlat = pathname.match(PLATFORM_RE);
    if (topPlat) {
      return redirect(origin + '/' + pickLang(request, url) + '/' + topPlat[1]);
    }

    return env.ASSETS.fetch(request);
}

export default {
  async fetch(request, env, ctx) {
    const res = await handle(request, env, ctx);
    return secure(res);
  }
};
