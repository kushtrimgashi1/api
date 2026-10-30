import { onRequest } from './functions/api/extract.js';

const LANGS = ['en', 'sq', 'it', 'de', 'fr', 'es', 'pt', 'tr', 'ar'];
const RTL = ['ar'];
const CANONICAL_HOST = 'vidridge.com';

// IndexNow (Bing / Yandex / DuckDuckGo): key file is served at /<KEY>.txt
const INDEXNOW_KEY = '084e6597c5a3d36a699c36eee83504ba';
const INDEXNOW_FALLBACK_TOKEN = '9fd89838d7207dd62002f52294ce5d179988';

const META = {
  en: { watch: 'Watch video', title: 'VidRidge — Download videos & reels without watermark (TikTok, Facebook, Instagram)', desc: 'Download videos, reels and posts from TikTok, Facebook and Instagram in HD & SD. Free, no login, no watermark.' },
  sq: { watch: 'Shiko videon', title: 'VidRidge — Shkarko video & reels pa watermark (TikTok, Facebook, Instagram)', desc: 'Shkarko video, reels dhe postime nga TikTok, Facebook dhe Instagram në HD & SD. Falas, pa login, pa watermark.' },
  it: { watch: 'Guarda il video', title: 'VidRidge — Scarica video e reel senza watermark (TikTok, Facebook, Instagram)', desc: 'Scarica video, reel e post da TikTok, Facebook e Instagram in HD e SD. Gratis, senza login, senza watermark.' },
  de: { watch: 'Video ansehen', title: 'VidRidge — Videos und Reels ohne Wasserzeichen herunterladen (TikTok, Facebook, Instagram)', desc: 'Lade Videos, Reels und Beiträge von TikTok, Facebook und Instagram in HD und SD herunter. Kostenlos, ohne Login, ohne Wasserzeichen.' },
  fr: { watch: 'Regarder la vidéo', title: 'VidRidge — Téléchargez vidéos et reels sans filigrane (TikTok, Facebook, Instagram)', desc: 'Téléchargez vidéos, reels et publications depuis TikTok, Facebook et Instagram en HD et SD. Gratuit, sans connexion, sans filigrane.' },
  es: { watch: 'Ver el video', title: 'VidRidge — Descarga videos y reels sin marca de agua (TikTok, Facebook, Instagram)', desc: 'Descarga videos, reels y publicaciones de TikTok, Facebook e Instagram en HD y SD. Gratis, sin registro, sin marca de agua.' },
  pt: { watch: 'Assistir ao vídeo', title: 'VidRidge — Baixe vídeos e reels sem marca d\'água (TikTok, Facebook, Instagram)', desc: 'Baixe vídeos, reels e publicações do TikTok, Facebook e Instagram em HD e SD. Grátis, sem login, sem marca d\'água.' },
  tr: { watch: 'Videoyu izle', title: 'VidRidge — Videoları ve reels\'leri filigransız indirin (TikTok, Facebook, Instagram)', desc: 'TikTok, Facebook ve Instagram\'dan video, reels ve gönderileri HD ve SD olarak indirin. Ücretsiz, giriş yok, filigran yok.' },
  ar: { watch: 'مشاهدة الفيديو', title: 'VidRidge — حمّل الفيديوهات والريلز بدون علامة مائية (تيك توك، فيسبوك، إنستغرام)', desc: 'حمّل الفيديوهات والريلز والمنشورات من تيك توك وفيسبوك وإنستغرام بجودة HD و SD. مجاناً، بدون تسجيل، وبدون علامة مائية.' }
};

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

function seoLinks(lang, isWatch, origin) {
  const meta = META[lang] || META.en;
  if (isWatch) {
    return `<link rel="canonical" href="${origin}/${lang}/watch">`;
  }
  const links = LANGS.map(l => `<link rel="alternate" hreflang="${l}" href="${origin}/${l}/">`);
  links.push(`<link rel="alternate" hreflang="x-default" href="${origin}/en/">`);
  links.push(`<link rel="canonical" href="${origin}/${lang}/">`);
  links.push(`<meta property="og:type" content="website">`);
  links.push(`<meta property="og:site_name" content="VidRidge">`);
  links.push(`<meta property="og:title" content="${esc(meta.title)}">`);
  links.push(`<meta property="og:description" content="${esc(meta.desc)}">`);
  links.push(`<meta property="og:url" content="${origin}/${lang}/">`);
  links.push(`<meta property="og:locale" content="${lang}">`);
  links.push(`<meta name="twitter:card" content="summary_large_image">`);
  links.push(`<meta name="twitter:title" content="${esc(meta.title)}">`);
  links.push(`<meta name="twitter:description" content="${esc(meta.desc)}">`);
  return links.join('\n  ');
}

function inject(html, lang, isWatch, origin) {
  const meta = META[lang] || META.en;
  const dir = RTL.includes(lang) ? 'rtl' : 'ltr';
  html = html.replace('<html lang="en">', `<html lang="${lang}" dir="${dir}">`);
  const title = isWatch ? `VidRidge — ${meta.watch}` : meta.title;
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`);
  if (!isWatch) {
    html = html.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(meta.desc)}">`);
  }
  const links = seoLinks(lang, isWatch, origin);
  if (html.includes('<!--SEO-->')) html = html.replace('<!--SEO-->', links);
  else html = html.replace('</head>', '  ' + links + '\n</head>');
  return html;
}

async function serveHtml(request, env, assetPath, lang, origin) {
  const assetUrl = new URL(request.url);
  assetUrl.pathname = assetPath;
  const res = await env.ASSETS.fetch(new Request(assetUrl.toString(), { headers: request.headers }));
  const html = await res.text();
  return new Response(inject(html, lang, assetPath === '/watch.html', origin), {
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
  const urls = LANGS.map(l => {
    const alts = LANGS.map(a => `    <xhtml:link rel="alternate" hreflang="${a}" href="${origin}/${a}/"/>`).join('\n');
    return `  <url>\n    <loc>${origin}/${l}/</loc>\n${alts}\n    <xhtml:link rel="alternate" hreflang="x-default" href="${origin}/en/"/>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>`;
  }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`;
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
  return LANGS.map(l => `https://${CANONICAL_HOST}/${l}/`);
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

    // Canonical host: force HTTPS and one hostname (www / *.workers.dev -> apex)
    if (url.protocol === 'http:') {
      return redirect('https://' + url.host + pathname + url.search, 301);
    }
    const host = url.hostname.toLowerCase();
    if (!pathname.startsWith('/api/') && host !== 'localhost' && !/^[\d.]+$/.test(host)) {
      if (host.startsWith('www.') && host.slice(4) !== host) {
        return redirect('https://' + host.slice(4) + pathname + url.search, 301);
      }
      if (host.endsWith('.workers.dev') && host !== CANONICAL_HOST) {
        return redirect('https://' + CANONICAL_HOST + pathname + url.search, 301);
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
    }

    if (pathname === '/watch' || pathname === '/watch.html') {
      return redirect(origin + '/' + pickLang(request, url) + '/watch' + url.search);
    }

    return env.ASSETS.fetch(request);
  }
};
