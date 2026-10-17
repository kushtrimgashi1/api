export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Tuneli për shkarkim direkt si skedar MP4 në telefon
  if (req.query.proxy === '1' && req.query.url) {
    try {
      const vRes = await fetch(req.query.url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Content-Disposition', `attachment; filename="savevid_${Date.now()}.mp4"`);
      const buf = Buffer.from(await vRes.arrayBuffer());
      return res.status(200).send(buf);
    } catch (e) {
      return res.redirect(req.query.url);
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
    if (/\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i.test(c)) return null;
    return c.startsWith('http') ? c : null;
  };

  try {
    let workingUrl = rawUrl.trim();

    // 1. ZGJIDHËSI I /share/r/ DHE /share/v/ NË SERVERIN VERCEL
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
              'Accept-Language': 'en-US,en;q=0.9',
              'Sec-Fetch-Mode': 'navigate'
            }
          });

          if (r.url && !r.url.includes('/login') && !r.url.includes('/share/')) {
            workingUrl = r.url;
          }

          const html = await r.text();

          // Kërkojmë direkt MP4 brenda burimit të Facebook
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
          if (directMp4 && (directMp4.includes('.mp4') || directMp4.includes('fbcdn.net'))) {
            return res.status(200).json({
              hd: directMp4,
              title: 'Facebook Reel / Video',
              author: 'Facebook',
              source: 'FB Direct Stream'
            });
          }

          // Nxjerrim linkun e vërtetë të Reel-it nëse ende jemi te /share/
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

      // 2. FACEBOOK EMBED PLAYER BYPASS
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
            title: 'Facebook Video',
            author: 'Facebook',
            source: 'FB Embed Plugin'
          });
        }
      } catch (e) {}
    }

    // 3. TIKTOK -> TikWM Direct
    if (/tiktok\.com/i.test(workingUrl)) {
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
          title: ttJson.data.title || 'TikTok Video',
          author: ttJson.data.author?.unique_id || 'tiktok',
          source: 'TikWM HD'
        });
      }
    }

    // 4. MULTI-API SERVER POOL (Provon si workingUrl ashtu edhe rawUrl)
    const urlsToTest = [workingUrl];
    if (rawUrl !== workingUrl) urlsToTest.push(rawUrl);

    for (const u of urlsToTest) {
      const enc = encodeURIComponent(u);
      const endpoints = [
        `https://api.agatz.xyz/api/facebook?url=${enc}`,
        `https://api.agatz.xyz/api/instagram?url=${enc}`,
        `https://api.siputzx.my.id/api/d/facebook?url=${enc}`,
        `https://api.siputzx.my.id/api/d/igdl?url=${enc}`,
        `https://api.ryzendesu.vip/api/downloader/fbdl?url=${enc}`,
        `https://vkrdownloader.xyz/server?vkr=${enc}`,
        `https://bk9.fun/download/alldownload?url=${enc}`
      ];

      for (const api of endpoints) {
        try {
          const r = await fetch(api, { headers: { 'User-Agent': 'Mozilla/5.0' } });
          if (!r.ok) continue;
          const rawText = await r.text();
          const matches = rawText.match(/https?:\\?\/\\?\/[^"'\s\\]+(?:\.mp4|fbcdn\.net\/v\/|cdninstagram\.com\/v\/)[^"'\s\\]*/gi) || [];
          for (const m of matches) {
            const valid = cleanUrl(m);
            if (valid) {
              return res.status(200).json({
                hd: valid,
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
