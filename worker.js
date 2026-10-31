import { onRequest } from './functions/api/extract.js';
import { LANGS as LANGS_META, META, KEYS, LOCALES } from './i18n-data.js';

const LANGS = LANGS_META.map(l => l.code);

const RTL = ['ar'];
const CANONICAL_HOST = 'vidridge.com';

const DOC_PAGES = {
  about: { title: '0.6' },
  privacy: { title: '0.3' },
  terms: { title: '0.3' }
};

// IndexNow (Bing / Yandex / DuckDuckGo): key file is served at /<KEY>.txt
const INDEXNOW_KEY = '084e6597c5a3d36a699c36eee83504ba';
const INDEXNOW_FALLBACK_TOKEN = '9fd89838d7207dd62002f52294ce5d179988';

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
    title = `VidRidge — ${t(lang, slug + '.title')}`;
    desc = t(lang, slug + '.lead');
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
  return links.join('\n  ');
}

function inject(html, lang, kind, origin, slug) {
  const dir = RTL.includes(lang) ? 'rtl' : 'ltr';
  html = html.replace('<html lang="en">', `<html lang="${lang}" dir="${dir}">`);

  let title = META[lang].title;
  let desc = META[lang].desc;
  if (kind === 'watch') {
    title = `VidRidge — ${META[lang].watch}`;
  } else if (kind === 'doc') {
    title = `VidRidge — ${t(lang, slug + '.title')}`;
    desc = t(lang, slug + '.lead');
  }
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`);
  if (kind !== 'watch') {
    html = html.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(desc)}">`);
  }

  const links = seoLinks(lang, kind, origin, slug);
  if (html.includes('<!--SEO-->')) html = html.replace('<!--SEO-->', links);
  else html = html.replace('</head>', '  ' + links + '\n</head>');
  return html;
}

async function serveHtml(request, env, assetPath, lang, origin, slug) {
  const assetUrl = new URL(request.url);
  assetUrl.pathname = assetPath;
  const res = await env.ASSETS.fetch(new Request(assetUrl.toString(), { headers: request.headers }));
  let html = await res.text();
  const kind = assetPath === '/watch.html' ? 'watch' : (slug ? 'doc' : 'index');
  html = localize(html, lang);
  html = inject(html, lang, kind, origin, slug);
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
  const pages = [{ path: '/', priority: '1.0' }, { path: '/about', priority: '0.6' }, { path: '/privacy', priority: '0.3' }, { path: '/terms', priority: '0.3' }];
  const urls = [];
  for (const page of pages) {
    for (const l of LANGS) {
      const alts = LANGS.map(a => `    <xhtml:link rel="alternate" hreflang="${a}" href="${origin}/${a}${page.path}"/>`).join('\n');
      urls.push(`  <url>\n    <loc>${origin}/${l}${page.path}</loc>\n${alts}\n    <xhtml:link rel="alternate" hreflang="x-default" href="${origin}/en${page.path}"/>\n    <changefreq>weekly</changefreq>\n    <priority>${page.priority}</priority>\n  </url>`);
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

function siteUrls() {
  const urls = [];
  for (const l of LANGS) {
    urls.push(`https://${CANONICAL_HOST}/${l}/`);
    for (const slug of Object.keys(DOC_PAGES)) urls.push(`https://${CANONICAL_HOST}/${l}/${slug}`);
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

export default {
  async fetch(request, env, ctx) {
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
      const doc = rest.match(/^\/(about|privacy|terms)(\/|\.html)?$/);
      if (doc) {
        if (rest.endsWith('/') || rest.endsWith('.html')) {
          return redirect(origin + '/' + lang + '/' + doc[1] + url.search, 301);
        }
        return serveHtml(request, env, '/' + doc[1] + '.html', lang, origin, doc[1]);
      }
    }

    if (pathname === '/watch' || pathname === '/watch.html') {
      return redirect(origin + '/' + pickLang(request, url) + '/watch' + url.search);
    }

    const topDoc = pathname.match(/^\/(about|privacy|terms)(\/|\.html)?$/);
    if (topDoc) {
      return redirect(origin + '/' + pickLang(request, url) + '/' + topDoc[1]);
    }

    return env.ASSETS.fetch(request);
  }
};
