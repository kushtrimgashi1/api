export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Tuneli për shkarkim direkt në Downloads si skedar .mp4
  if (req.query.proxy === '1' && req.query.url) {
    try {
      const videoRes = await fetch(req.query.url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Content-Disposition', `attachment; filename="savevid_${Date.now()}.mp4"`);
      const buffer = Buffer.from(await videoRes.arrayBuffer());
      return res.status(200).send(buffer);
    } catch (e) {
      return res.redirect(req.query.url);
    }
  }

  const rawUrl = req.query.url;
  if (!rawUrl) return res.status(400).json({ error: 'Mungon linku' });

  const cleanStr = (s) => s ? s
    .replace(/\\u0025/g, '%')
    .replace(/\\u0026/g, '&')
    .replace(/\\u003D/g, '=')
    .replace(/\\\//g, '/')
    .replace(/&amp;/g, '&') : null;

  try {
    let resolvedUrl = rawUrl.trim();

    // 1. KONVERTIMI I PADUKSHËM NGA /share/v/ NË /reel/ OSE /watch/
    try {
      const resp = await fetch(resolvedUrl, {
        method: 'GET',
        redirect: 'follow',
        headers: {
          // Imitojmë crawler-in zyrtar që Facebook të na japë direkt linkun e Reel-it dhe stream-in
          'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });

      if (resp.url && !resp.url.includes('/login')) {
        resolvedUrl = resp.url;
      }

      const html = await resp.text();

      // Kontrollojmë nëse Facebook na dha direkt MP4 brenda HTML-së
      const hdMatch = html.match(/"playable_url_quality_hd"\s*:\s*"([^"]+)"/) ||
                      html.match(/"browser_native_hd_url"\s*:\s*"([^"]+)"/) ||
                      html.match(/"hd_src_no_ratelimit"\s*:\s*"([^"]+)"/) ||
                      html.match(/"hd_src"\s*:\s*"([^"]+)"/);
      const sdMatch = html.match(/"playable_url"\s*:\s*"([^"]+)"/) ||
                      html.match(/"browser_native_sd_url"\s*:\s*"([^"]+)"/) ||
                      html.match(/"sd_src"\s*:\s*"([^"]+)"/) ||
                      html.match(/property="og:video:secure_url"\s+content="([^"]+)"/) ||
                      html.match(/property="og:video"\s+content="([^"]+)"/);

      const directMp4 = cleanStr(hdMatch?.[1] || sdMatch?.[1]);
      if (directMp4 && directMp4.startsWith('http') && directMp4.includes('.mp4')) {
        const titleMatch = html.match(/property="og:title"\s+content="([^"]+)"/);
        return res.status(200).json({
          hd: directMp4,
          sd: cleanStr(sdMatch?.[1]) || directMp4,
          title: titleMatch?.[1] || 'Facebook Reel / Video',
          author: 'Facebook',
          resolvedUrl,
          source: 'Vercel Direct FB'
        });
      }

      // Nxjerrim linkun e vërtetë të Reel-it nga meta tags nëse ishte /share/v/
      const ogUrl = html.match(/property="og:url"\s+content="([^"]+)"/) ||
                    html.match(/rel="canonical"\s+href="([^"]+)"/);
      if (ogUrl?.[1] && !ogUrl[1].includes('/login')) {
        resolvedUrl = cleanStr(ogUrl[1]);
      } else {
        const idMatch = html.match(/\/reel\/(\d{10,25})/) ||
                        html.match(/\/videos\/(\d{10,25})/) ||
                        html.match(/"video_id"\s*:\s*"(\d{10,25})"/);
        if (idMatch?.[1]) {
          resolvedUrl = `https://www.facebook.com/reel/${idMatch[1]}`;
        }
      }
    } catch (e) {}

    // 2. NËSE ËSHTË TIKTOK -> TikWM Direct
    if (/tiktok\.com/i.test(resolvedUrl)) {
      const ttRes = await fetch('https://www.tikwm.com/api/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `url=${encodeURIComponent(resolvedUrl)}&hd=1`
      });
      const ttJson = await ttRes.json();
      if (ttJson?.data?.play) {
        return res.status(200).json({
          hd: ttJson.data.hdplay || ttJson.data.play,
          sd: ttJson.data.play,
          title: ttJson.data.title || 'TikTok Video',
          author: ttJson.data.author?.unique_id || 'tiktok',
          resolvedUrl,
          source: 'Vercel TikWM'
        });
      }
    }

    // 3. FACEBOOK EMBED PLAYER BYPASS (Përdor linkun e konvertuar të Reel-it)
    if (/facebook\.com|fb\.watch/i.test(resolvedUrl)) {
      try {
        const embedUrl = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(resolvedUrl)}&show_text=false`;
        const embRes = await fetch(embedUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        });
        const embHtml = await embRes.text();
        const hd = embHtml.match(/"hd_src_no_ratelimit"\s*:\s*"([^"]+)"/) || embHtml.match(/"hd_src"\s*:\s*"([^"]+)"/);
        const sd = embHtml.match(/"sd_src_no_ratelimit"\s*:\s*"([^"]+)"/) || embHtml.match(/"sd_src"\s*:\s*"([^"]+)"/);
        const mp4 = cleanStr(hd?.[1] || sd?.[1]);
        if (mp4 && mp4.startsWith('http')) {
          return res.status(200).json({
            hd: mp4,
            sd: cleanStr(sd?.[1]) || mp4,
            title: 'Facebook Reel',
            author: 'Facebook',
            resolvedUrl,
            source: 'Vercel FB Embed'
          });
        }
      } catch (e) {}
    }

    // 4. MULTI-API SERVER-TO-SERVER (Me linkun tashmë të konvertuar në Reel!)
    const urlsToTry = [resolvedUrl];
    if (resolvedUrl !== rawUrl) urlsToTry.push(rawUrl);

    for (const u of urlsToTry) {
      const enc = encodeURIComponent(u);
      const apis = [
        `https://api.ryzendesu.vip/api/downloader/fbdl?url=${enc}`,
        `https://api.ryzendesu.vip/api/downloader/allinone?url=${enc}`,
        `https://api.siputzx.my.id/api/d/facebook?url=${enc}`,
        `https://api.siputzx.my.id/api/d/igdl?url=${enc}`,
        `https://vkrdownloader.xyz/server?vkr=${enc}`
      ];

      for (const api of apis) {
        try {
          const r = await fetch(api, { headers: { 'User-Agent': 'Mozilla/5.0' } });
          if (!r.ok) continue;
          const text = await r.text();
          const mp4Match = text.match(/https?:\\?\/\\?\/[^"'\s\\]+\.mp4[^"'\s\\]*/gi);
          if (mp4Match && mp4Match.length > 0) {
            const validMp4 = cleanStr(mp4Match[0]);
            if (validMp4 && !validMp4.match(/\.(jpg|jpeg|png|webp)/i)) {
              return res.status(200).json({
                hd: validMp4,
                sd: validMp4,
                title: 'Social Video MP4',
                author: 'Creator',
                resolvedUrl,
                source: 'Vercel Multi-Engine'
              });
            }
          }
        } catch (e) {}
      }
    }

    return res.status(404).json({ error: 'Videoja nuk u gjet ose është private.', resolvedUrl });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

