export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // 1. TUNELI PËR SHKARKIM DIREKT NË DOWNLOADS SI SKEDAR .MP4 (I PAPREKUR NGA V41)
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
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': '*/*',
          'Referer': referer
        }
      });

      if (!vRes.ok) throw new Error(`CDN HTTP ${vRes.status}`);

      const filename = `savevid_${Date.now()}.mp4`;
      res.setHeader('Content-Type', 'application/octet-stream');
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
    const c = s
      .replace(/\\u0025/g, '%')
      .replace(/\\u0026/g, '&')
      .replace(/\\u003D/g, '=')
      .replace(/\\\//g, '/')
      .replace(/&amp;/g, '&')
      .trim();
    if (/\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(c)) return null;
    return c.startsWith('http') ? c : null;
  };

  try {
    let workingUrl = rawUrl.trim();

    // =========================================================================
    // SHTESA E RE VETËM PËR INSTAGRAM (Nuk e prek fare Facebook-un apo TikTok-un)
    // =========================================================================
    if (/instagram\.com|instagr\.am/i.test(workingUrl)) {
      // Pastrojmë linkun nga parametrat ?igsh=... ose ?dl=... që prishin API-t
      const igMatch = workingUrl.match(/instagram\.com\/(?:[^\/]+\/)?(?:reel|reels|p|tv)\/([A-Za-z0-9_-]+)/i);
      const shortcode = igMatch ? igMatch[1] : null;
      const cleanIgUrl = shortcode ? `https://www.instagram.com/reel/${shortcode}/` : workingUrl.split('?')[0];

      // Metoda IG-1: Instagram Embed Captions Page (Nuk kërkon login për Reels publike!)
      if (shortcode) {
        try {
          const embRes = await fetch(`https://www.instagram.com/p/${shortcode}/embed/captioned/`, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
              'Accept': 'text/html,application/xhtml+xml'
            }
          });
          const embHtml = await embRes.text();
          const vMatch = embHtml.match(/"video_url"\s*:\s*"([^"]+)"/) ||
                         embHtml.match(/\\?"video_url\\?"\s*:\s*\\?"([^"\\]+)\\?"/) ||
                         embHtml.match(/class="EmbeddedMediaVideo"[^>]+src="([^"]+)"/);
          const directIgMp4 = cleanUrl(vMatch?.[1]);
          if (directIgMp4) {
            return res.status(200).json({
              hd: directIgMp4,
              sd: directIgMp4,
              title: 'Instagram Reel',
              author: 'Instagram',
              source: 'IG Embed Direct'
            });
          }
        } catch (e) {}

        // Metoda IG-2: Polar / GraphQL JSON Embed
        try {
          const gqlRes = await fetch(`https://www.instagram.com/graphql/query/?query_hash=b3055c01b4b222b8a47dc12b090e4e64&variables=${encodeURIComponent(JSON.stringify({ shortcode }))}`, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
              'X-IG-App-ID': '936619743392459'
            }
          });
          if (gqlRes.ok) {
            const gqlJson = await gqlRes.json();
            const vUrl = cleanUrl(gqlJson?.data?.shortcode_media?.video_url);
            if (vUrl) {
              return res.status(200).json({
                hd: vUrl,
                sd: vUrl,
                title: 'Instagram Reel',
                author: gqlJson?.data?.shortcode_media?.owner?.username || 'Instagram',
                source: 'IG GraphQL'
              });
            }
          }
        } catch (e) {}
      }

      // Metoda IG-3: 6 API të dedikuara për Instagram me URL të pastruar
      const encIg = encodeURIComponent(cleanIgUrl);
      const igApis = [
        `https://api.ryzendesu.vip/api/downloader/igdl?url=${encIg}`,
        `https://api.siputzx.my.id/api/d/igdl?url=${encIg}`,
        `https://api.agatz.xyz/api/instagram?url=${encIg}`,
        `https://bk9.fun/download/instagram?url=${encIg}`,
        `https://bk9.fun/download/alldownload?url=${encIg}`,
        `https://vkrdownloader.xyz/server?vkr=${encIg}`
      ];

      for (const api of igApis) {
        try {
          const r = await fetch(api, { headers: { 'User-Agent': 'Mozilla/5.0' } });
          if (!r.ok) continue;
          const rawText = await r.text();
          // Kërkojmë çdo link videoje të Instagramit (edhe kur nuk ka .mp4 në fund të path-it)
          const matches = rawText.match(/https?:\\?\/\\?\/[^"'\s\\]+(?:\.mp4|cdninstagram\.com|fbcdn\.net\/v\/)[^"'\s\\]*/gi) || [];
          for (const m of matches) {
            const valid = cleanUrl(m);
            if (valid) {
              return res.status(200).json({
                hd: valid,
                sd: valid,
                title: 'Instagram Reel',
                author: 'Instagram',
                source: new URL(api).hostname.replace('api.', '')
              });
            }
          }
        } catch (e) {}
      }

      return res.status(404).json({ error: 'Videoja e Instagramit nuk u gjet. Sigurohu që llogaria e Instagramit të jetë publike.' });
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
