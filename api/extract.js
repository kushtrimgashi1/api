const IG_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
const IG_B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

let igSession = null;

function igShortcodeToId(shortcode) {
  let n = 0n;
  for (const ch of shortcode) {
    const v = IG_B64.indexOf(ch);
    if (v === -1) return null;
    n = n * 64n + BigInt(v);
  }
  return n.toString();
}

function igPickVideo(node) {
  if (!node) return null;
  const fromNode = (n) => {
    const vv = n && n.video_versions;
    if (Array.isArray(vv) && vv.length && vv[0] && vv[0].url) {
      const last = vv[vv.length - 1] && vv[vv.length - 1].url;
      return { hd: vv[0].url, sd: last || vv[0].url };
    }
    return null;
  };
  const direct = fromNode(node);
  if (direct) return direct;
  if (Array.isArray(node.carousel_media)) {
    for (const item of node.carousel_media) {
      const v = fromNode(item);
      if (v) return v;
    }
  }
  return null;
}

async function getIgSession() {
  const now = Date.now();
  if (igSession && now - igSession.ts < 8 * 60 * 1000) return igSession;
  try {
    const r = await fetch('https://www.instagram.com/', {
      headers: {
        'User-Agent': IG_UA,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Upgrade-Insecure-Requests': '1'
      }
    });
    const html = await r.text();
    const raw = typeof r.headers.getSetCookie === 'function'
      ? r.headers.getSetCookie()
      : (r.headers.get('set-cookie') ? [r.headers.get('set-cookie')] : []);
    const cookies = {};
    for (const c of raw) {
      const pair = c.split(';')[0];
      const i = pair.indexOf('=');
      if (i > 0) cookies[pair.slice(0, i).trim()] = pair.slice(i + 1).trim();
    }
    let lsd = (html.match(/\["LSD",\[\],\{"token":"([^"]+)"/) || [])[1];
    if (!lsd) {
      const eqmc = html.match(/<script\b[^>]*\bid="__eqmc"[^>]*>(\{.*?\})<\/script>/s);
      if (eqmc) { try { lsd = JSON.parse(eqmc[1]).l; } catch (e) {} }
    }
    if (!lsd) return null;
    igSession = {
      lsd,
      csrf: cookies.csrftoken || '',
      cookie: Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join('; '),
      ts: now
    };
    return igSession;
  } catch (e) {
    return null;
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const rawUrl = req.query.url;
  if (!rawUrl) return res.status(400).json({ error: 'Mungon linku' });

  const cleanUrl = (s) => {
    if (!s || typeof s !== 'string') return null;
    let c = s;
    // Dekodim i dyfishtë sepse Instagram Embed e kodon dy herë tekstin (p.sh. \\u0026 ose \\\/)
    for (let i = 0; i < 2; i++) {
      c = c
        .replace(/\\\\u0025/g, '%')
        .replace(/\\u0025/g, '%')
        .replace(/\\\\u0026/g, '&')
        .replace(/\\u0026/g, '&')
        .replace(/\\\\u003D/g, '=')
        .replace(/\\u003D/g, '=')
        .replace(/\\\\\//g, '/')
        .replace(/\\\//g, '/')
        .replace(/\\"/g, '"')
        .replace(/&amp;/g, '&')
        .trim();
    }
    if (/\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(c)) return null;
    return c.startsWith('http') ? c : null;
  };

  try {
    let workingUrl = rawUrl.trim();

    // =========================================================================
    // BLLOKU I RI DHE I FUQISHËM VETËM PËR INSTAGRAM (Nuk prek FB apo TikTok)
    // =========================================================================
    if (/instagram\.com|instagr\.am/i.test(workingUrl)) {
      // 1. Nëse është link share i ri (p.sh. instagram.com/share/reel/...), ndjekim ridrejtimin
      if (workingUrl.includes('/share/')) {
        try {
          const redir = await fetch(workingUrl, {
            method: 'GET',
            redirect: 'follow',
            headers: { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X)' }
          });
          if (redir.url && !redir.url.includes('/login')) {
            workingUrl = redir.url;
          }
        } catch (e) {}
      }

      const igMatch = workingUrl.match(/instagram\.com\/(?:[^\/]+\/)?(?:reel|reels|p|tv)\/([A-Za-z0-9_-]+)/i);
      const shortcode = igMatch ? igMatch[1] : null;
      const cleanIgUrl = shortcode ? `https://www.instagram.com/reel/${shortcode}/` : workingUrl.split('?')[0];

      if (shortcode) {
        // METODA 1: Instagram Logged-out GraphQL (Polaris) — metoda zyrtare pa login (e njëjta që përdor yt-dlp)
        try {
          const sess = await getIgSession();
          if (sess) {
            const mediaId = igShortcodeToId(shortcode);
            const body = new URLSearchParams({
              lsd: sess.lsd,
              fb_api_caller_class: 'RelayModern',
              fb_api_req_friendly_name: 'PolarisLoggedOutDesktopWWWPostRootContentQuery',
              server_timestamps: 'true',
              variables: JSON.stringify({ media_id: mediaId }),
              doc_id: '27130156389949648'
            });

            const gqlRes = await fetch('https://www.instagram.com/api/graphql', {
              method: 'POST',
              headers: {
                'User-Agent': IG_UA,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': '*/*',
                'Origin': 'https://www.instagram.com',
                'Referer': `https://www.instagram.com/reel/${shortcode}/`,
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'same-origin',
                'X-ASBD-ID': '129477',
                'X-CSRFToken': sess.csrf,
                'X-FB-LSD': sess.lsd,
                'X-IG-App-ID': '936619743392459',
                'X-IG-WWW-Claim': '0',
                'X-Requested-With': 'XMLHttpRequest',
                'Cookie': sess.cookie
              },
              body: body.toString()
            });

            if (gqlRes.ok) {
              const gqlText = await gqlRes.text();
              let gqlJson = null;
              try {
                gqlJson = JSON.parse(gqlText.replace(/^for\s*\(\s*;\s*;\s*\)\s*;/, ''));
              } catch (e) {}
              const media = gqlJson?.data?.xig_polaris_media;
              const product = media?.if_not_gated_logged_out || (media?.__isXIGPolarisMedia ? media : null);
              const picked = igPickVideo(product);
              if (picked) {
                return res.status(200).json({
                  hd: cleanUrl(picked.hd) || picked.hd,
                  sd: cleanUrl(picked.sd) || picked.sd,
                  title: (product.caption?.text || 'Instagram Reel').slice(0, 80),
                  author: product.user?.username || 'instagram',
                  source: 'IG Polaris'
                });
              }
            }
          }
        } catch (e) {}

        // METODA 2: Fallback nga faqja publike — lexon "video_versions" nga JSON-i i faqes
        for (const pageUrl of [`https://www.instagram.com/p/${shortcode}/`, `https://www.instagram.com/reel/${shortcode}/`]) {
          try {
            const pageRes = await fetch(pageUrl, {
              headers: {
                'User-Agent': IG_UA,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                ...(igSession ? { 'Cookie': igSession.cookie } : {}),
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Upgrade-Insecure-Requests': '1'
              }
            });
            const html = await pageRes.text();
            const block = html.match(/"video_versions"\s*:\s*\[(.*?)\]/s);
            if (block) {
              const urls = [...block[1].matchAll(/"url"\s*:\s*"([^"]+)"/g)]
                .map((m) => cleanUrl(m[1]))
                .filter(Boolean);
              if (urls.length) {
                return res.status(200).json({
                  hd: urls[0],
                  sd: urls[urls.length - 1] || urls[0],
                  title: 'Instagram Reel',
                  author: 'instagram',
                  source: 'IG Webpage'
                });
              }
            }
          } catch (e) {}
        }
      }

      // METODA 3: Multi-API JSON + Deep Regex Search
      const encIg = encodeURIComponent(cleanIgUrl);
      const externalIgApis = [
        `https://api.ryzendesu.vip/api/downloader/igdl?url=${encIg}`,
        `https://api.siputzx.my.id/api/d/igdl?url=${encIg}`,
        `https://api.agatz.xyz/api/instagram?url=${encIg}`,
        `https://bk9.fun/download/instagram?url=${encIg}`,
        `https://vkrdownloader.xyz/server?vkr=${encIg}`,
        `https://api.tiklydown.eu.org/api/download/v2?url=${encIg}`
      ];

      for (const api of externalIgApis) {
        try {
          const r = await fetch(api, { headers: { 'User-Agent': 'Mozilla/5.0' } });
          if (!r.ok) continue;
          const text = await r.text();

          // Kontrollojmë çdo fushë url brenda përgjigjes JSON
          let foundUrl = null;
          try {
            const j = JSON.parse(text);
            const strJ = JSON.stringify(j);
            const urlMatches = strJ.match(/https?:\\?\/\\?\/[^"'\s\\]+/gi) || [];
            for (const candidate of urlMatches) {
              const cl = cleanUrl(candidate);
              if (cl && !cl.includes('instagram.com/p/') && !cl.includes('instagram.com/reel/') && !cl.includes('avatar')) {
                if (cl.includes('.mp4') || cl.includes('cdninstagram') || cl.includes('fbcdn') || cl.includes('rapidcdn') || cl.includes('snapinsta') || cl.includes('token=')) {
                  foundUrl = cl;
                  break;
                }
              }
            }
          } catch (e) {}

          if (foundUrl) {
            return res.status(200).json({
              hd: foundUrl,
              sd: foundUrl,
              title: 'Instagram Reel',
              author: 'instagram',
              source: new URL(api).hostname.replace('api.', '')
            });
          }
        } catch (e) {}
      }

      return res.status(404).json({ error: 'Instagram nuk lejoi nxjerrjen e kësaj videoje. Provo me një link tjetër Reel.' });
    }

    // =========================================================================
    // KODI ORIGJINAL I V41 PËR FACEBOOK & TIKTOK (100% I PAPREKUR!)
    // =========================================================================

    // A. ZGJIDHËSI I /share/r/ DHE /share/v/ PËR FACEBOOK
    if (/facebook\.com|fb\.watch|fb\.com/i.test(workingUrl)) {
      const userAgents = [
        'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
        'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
      ];

      for (const ua of userAgents) {
        try {
          const r = await fetch(workingUrl, {
            method: 'GET',
            redirect: 'follow',
            headers: {
              'User-Agent': ua,
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.9'
            }
          });

          if (r.url && !r.url.includes('/login') && !r.url.includes('/share/')) {
            workingUrl = r.url;
          }

          const html = await r.text();

          const hdMatch = html.match(/"playable_url_quality_hd"\s*:\s*"([^"]+)"/) ||
                          html.match(/"browser_native_hd_url"\s*:\s*"([^"]+)"/) ||
                          html.match(/"hd_src_no_ratelimit"\s*:\s*"([^"]+)"/) ||
                          html.match(/"hd_src"\s*:\s*"([^"]+)"/);
          const sdMatch = html.match(/"playable_url"\s*:\s*"([^"]+)"/) ||
                          html.match(/"browser_native_sd_url"\s*:\s*"([^"]+)"/) ||
                          html.match(/"sd_src"\s*:\s*"([^"]+)"/) ||
                          html.match(/property="og:video:secure_url"\s+content="([^"]+)"/) ||
                          html.match(/property="og:video"\s+content="([^"]+)"/);

          const directMp4 = cleanUrl(hdMatch?.[1] || sdMatch?.[1]);
          const sdMp4 = cleanUrl(sdMatch?.[1]) || directMp4;
          if (directMp4 && (directMp4.includes('.mp4') || directMp4.includes('fbcdn.net'))) {
            return res.status(200).json({
              hd: directMp4,
              sd: sdMp4,
              title: 'Facebook Reel / Video',
              author: 'Facebook',
              source: 'FB Direct Stream'
            });
          }

          const ogUrl = html.match(/property="og:url"\s+content="([^"]+)"/) ||
                        html.match(/rel="canonical"\s+href="([^"]+)"/);
          if (ogUrl?.[1] && !ogUrl[1].includes('/login') && !ogUrl[1].includes('/share/')) {
            workingUrl = cleanUrl(ogUrl[1]) || workingUrl;
          } else {
            const vidId = html.match(/\/reel\/(\d{8,25})/) ||
                          html.match(/\/videos\/(\d{8,25})/) ||
                          html.match(/"video_id"\s*:\s*"(\d{8,25})"/) ||
                          html.match(/story_fbid=(\d{8,25})/);
            if (vidId?.[1]) {
              workingUrl = `https://www.facebook.com/reel/${vidId[1]}`;
            }
          }

          if (!workingUrl.includes('/share/')) break;
        } catch (e) {}
      }

      // B. FACEBOOK EMBED PLAYER BYPASS
      try {
        const embRes = await fetch(`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(workingUrl)}&show_text=false`, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        });
        const embHtml = await embRes.text();
        const hd = embHtml.match(/"hd_src_no_ratelimit"\s*:\s*"([^"]+)"/) || embHtml.match(/"hd_src"\s*:\s*"([^"]+)"/);
        const sd = embHtml.match(/"sd_src_no_ratelimit"\s*:\s*"([^"]+)"/) || embHtml.match(/"sd_src"\s*:\s*"([^"]+)"/);
        const embMp4 = cleanUrl(hd?.[1] || sd?.[1]);
        if (embMp4) {
          return res.status(200).json({
            hd: embMp4,
            sd: cleanUrl(sd?.[1]) || embMp4,
            title: 'Facebook Video',
            author: 'Facebook',
            source: 'FB Embed Plugin'
          });
        }
      } catch (e) {}
    }

    // C. TIKTOK -> TikWM Direct
    if (/tiktok\.com|vm\.tiktok|vt\.tiktok/i.test(workingUrl)) {
      const ttRes = await fetch('https://www.tikwm.com/api/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `url=${encodeURIComponent(workingUrl)}&hd=1`
      });
      const ttJson = await ttRes.json();
      const ttMp4 = cleanUrl(ttJson?.data?.hdplay || ttJson?.data?.play);
      if (ttMp4) {
        return res.status(200).json({
          hd: ttMp4,
          sd: cleanUrl(ttJson?.data?.play) || ttMp4,
          title: ttJson.data.title || 'TikTok Video',
          author: ttJson.data.author?.unique_id || 'tiktok',
          source: 'TikWM HD'
        });
      }
    }

    // D. MULTI-API SERVER POOL (FB, TikTok)
    const urlsToTest = [workingUrl];
    if (rawUrl !== workingUrl) urlsToTest.push(rawUrl);

    for (const u of urlsToTest) {
      const enc = encodeURIComponent(u);
      const endpoints = [
        `https://api.agatz.xyz/api/facebook?url=${enc}`,
        `https://api.siputzx.my.id/api/d/facebook?url=${enc}`,
        `https://api.ryzendesu.vip/api/downloader/fbdl?url=${enc}`,
        `https://vkrdownloader.xyz/server?vkr=${enc}`,
        `https://bk9.fun/download/alldownload?url=${enc}`
      ];

      for (const api of endpoints) {
        try {
          const r = await fetch(api, { headers: { 'User-Agent': 'Mozilla/5.0' } });
          if (!r.ok) continue;
          const rawText = await r.text();
          const matches = rawText.match(/https?:\\?\/\\?\/[^"'\s\\]+(?:\.mp4|fbcdn\.net\/o1\/v\/|fbcdn\.net\/v\/|cdninstagram\.com\/v\/)[^"'\s\\]*/gi) || [];
          for (const m of matches) {
            const valid = cleanUrl(m);
            if (valid) {
              return res.status(200).json({
                hd: valid,
                sd: valid,
                title: 'Social Video MP4',
                author: 'Creator',
                source: new URL(api).hostname.replace('api.', '')
              });
            }
          }
        } catch (e) {}
      }
    }

    return res.status(404).json({ error: 'Nuk u gjet stream publik', resolvedUrl: workingUrl });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
