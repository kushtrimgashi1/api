export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // =========================================================================
  // 1. TUNELI PËR SHKARKIM DIREKT NË DOWNLOADS SI SKEDAR .MP4 (I PAPREKUR)
  // =========================================================================
  if (req.query.proxy === '1' && req.query.url) {
    const targetVideoUrl = req.query.url;
    try {
      const urlObj = new URL(targetVideoUrl);
      let referer = `${urlObj.protocol}//${urlObj.hostname}/`;
      if (targetVideoUrl.includes('fbcdn.net') || targetVideoUrl.includes('facebook.com')) {
        referer = 'https://www.facebook.com/';
      } else if (targetVideoUrl.includes('cdninstagram.com') || targetVideoUrl.includes('instagram.com')) {
        referer = 'https://www.instagram.com/';
      } else if (targetVideoUrl.includes('tiktok')) {
        referer = 'https://www.tiktok.com/';
      }

      const vRes = await fetch(targetVideoUrl, {
        method: 'GET',
        redirect: 'follow',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
          'Accept': '*/*',
          'Referer': referer
        }
      });

      if (!vRes.ok) throw new Error(`CDN HTTP ${vRes.status}`);

      const filename = `savevid_${Date.now()}.mp4`;
      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Cache-Control', 'no-store');

      const contentLength = vRes.headers.get('content-length');
      if (contentLength) {
        res.setHeader('Content-Length', contentLength);
      }

      const arrayBuffer = await vRes.arrayBuffer();
      return res.status(200).send(Buffer.from(arrayBuffer));
    } catch (e) {
      const dlUrl = targetVideoUrl.includes('?') ? `${targetVideoUrl}&dl=1` : `${targetVideoUrl}?dl=1`;
      return res.redirect(302, dlUrl);
    }
  }

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
        // METODA 1: Instagram Official GraphQL POST API (Metoda më e sigurt që përdor yt-dlp & Cobalt)
        const docIds = ['10015901848480474', '8845758582119845', '7153631198062348'];
        for (const doc_id of docIds) {
          try {
            const bodyParams = new URLSearchParams({
              av: '0',
              __d: 'www',
              __user: '0',
              __a: '1',
              __req: '3',
              __hs: '19888.HYP:instagram_web_pkg.2.1..0.0',
              dpr: '1',
              __ccg: 'UNKNOWN',
              lsd: 'AVqbxe3J_YA',
              jazoest: '2957',
              doc_id: doc_id,
              variables: JSON.stringify({
                shortcode: shortcode,
                fetch_comment_count: 2,
                fetch_related_profile_media_count: 0,
                parent_comment_count: 0,
                child_comment_count: 0,
                fetch_like_count: 10,
                fetch_tagged_user_count: null,
                fetch_preview_comment_count: 2,
                has_threaded_comments: true,
                hoisted_comment_id: null,
                hoisted_reply_id: null
              })
            });

            const gqlRes = await fetch('https://www.instagram.com/api/graphql', {
              method: 'POST',
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-IG-App-ID': '936619743392459',
                'X-FB-LSD': 'AVqbxe3J_YA',
                'X-ASBD-ID': '129477',
                'Sec-Fetch-Site': 'same-origin',
                'Origin': 'https://www.instagram.com',
                'Referer': `https://www.instagram.com/reel/${shortcode}/`
              },
              body: bodyParams.toString()
            });

            if (gqlRes.ok) {
              const gqlText = await gqlRes.text();
              const cleanJsonText = gqlText.replace(/^for\s*\(\s*;\s*;\s*\)\s*;/, '');
              const gqlJson = JSON.parse(cleanJsonText);
              const media = gqlJson?.data?.xdt_shortcode_media || gqlJson?.data?.shortcode_media;

              const hdUrl = cleanUrl(
                media?.video_url ||
                media?.video_versions?.[0]?.url ||
                media?.edge_sidecar_to_children?.edges?.[0]?.node?.video_url
              );
              const sdUrl = cleanUrl(media?.video_versions?.[media.video_versions.length - 1]?.url) || hdUrl;

              if (hdUrl) {
                return res.status(200).json({
                  hd: hdUrl,
                  sd: sdUrl,
                  title: media?.edge_media_to_caption?.edges?.[0]?.node?.text?.slice(0, 80) || 'Instagram Reel',
                  author: media?.owner?.username || 'instagram',
                  source: 'IG GraphQL Direct'
                });
              }
            }
          } catch (e) {}
        }

        // METODA 2: Instagram Embed Page Deep Unescape (Kap video_url brenda contextJSON të fshehur)
        const embedUrls = [
          `https://www.instagram.com/p/${shortcode}/embed/captioned/`,
          `https://www.instagram.com/reel/${shortcode}/embed/captioned/`,
          `https://www.instagram.com/p/${shortcode}/embed/`
        ];

        for (const embUrl of embedUrls) {
          try {
            const embRes = await fetch(embUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9'
              }
            });
            const html = await embRes.text();

            // Kërkojmë video_url edhe kur është e koduar me \\"video_url\\":\\"https:...\\"
            const patterns = [
              /\\*"video_url\\*"\s*:\s*\\*"([^"\\]+(?:\\.[^"\\]+)*)\\*"/i,
              /"video_url"\s*:\s*"([^"]+)"/i,
              /class="EmbeddedMediaVideo"[^>]+src="([^"]+)"/i,
              /property="og:video:secure_url"\s+content="([^"]+)"/i,
              /property="og:video"\s+content="([^"]+)"/i
            ];

            for (const reg of patterns) {
              const m = html.match(reg);
              if (m && m[1]) {
                const decoded = cleanUrl(m[1]);
                if (decoded) {
                  return res.status(200).json({
                    hd: decoded,
                    sd: decoded,
                    title: 'Instagram Reel',
                    author: 'instagram',
                    source: 'IG Embed Engine'
                  });
                }
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
