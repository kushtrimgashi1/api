export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.query.proxy === '1' && req.query.url) {
    try {
      const vRes = await fetch(req.query.url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Referer': 'https://www.instagram.com/' }
      });
      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Content-Disposition', `attachment; filename="savevid_${Date.now()}.mp4"`);
      return res.status(200).send(Buffer.from(await vRes.arrayBuffer()));
    } catch (e) {
      return res.redirect(302, req.query.url);
    }
  }

  const rawUrl = req.query.url;
  if (!rawUrl) return res.status(400).json({ error: 'Mungon linku' });

  const cleanUrl = (s) => {
    if (!s || typeof s !== 'string') return null;
    const c = s.replace(/\\u0025/g, '%').replace(/\\u0026/g, '&').replace(/\\u003D/g, '=').replace(/\\\//g, '/').replace(/&amp;/g, '&').trim();
    if (/\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i.test(c)) return null;
    return c.startsWith('http') ? c : null;
  };

  try {
    let workingUrl = rawUrl.trim();

    // 1. Zgjidhësi i Share Links për Facebook
    if (/facebook\.com|fb\.watch/i.test(workingUrl) && workingUrl.includes('/share/')) {
      try {
        const r = await fetch(workingUrl, { headers: { 'User-Agent': 'facebookexternalhit/1.1' }, redirect: 'follow' });
        if (r.url && !r.url.includes('/share/')) workingUrl = r.url;
      } catch (e) {}
    }

    // 2. TikTok -> TikWM
    if (/tiktok\.com/i.test(workingUrl)) {
      try {
        const tt = await fetch('https://www.tikwm.com/api/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `url=${encodeURIComponent(workingUrl)}&hd=1`
        });
        const json = await tt.json();
        const mp4 = cleanUrl(json?.data?.hdplay || json?.data?.play);
        if (mp4) return res.status(200).json({ hd: mp4, sd: cleanUrl(json?.data?.play) || mp4, title: json.data.title || 'TikTok', author: 'TikTok' });
      } catch (e) {}
    }

    // 3. Multi-API Server Pool (Instagram, Facebook, TikTok)
    const enc = encodeURIComponent(workingUrl);
    const apis = [
      `https://api.agatz.xyz/api/instagram?url=${enc}`,
      `https://api.agatz.xyz/api/facebook?url=${enc}`,
      `https://api.siputzx.my.id/api/d/igdl?url=${enc}`,
      `https://api.siputzx.my.id/api/d/facebook?url=${enc}`,
      `https://api.ryzendesu.vip/api/downloader/allinone?url=${enc}`,
      `https://vkrdownloader.xyz/server?vkr=${enc}`
    ];

    for (const api of apis) {
      try {
        const r = await fetch(api, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (!r.ok) continue;
        const text = await r.text();
        const matches = text.match(/https?:\\?\/\\?\/[^"'\s\\]+(?:\.mp4|fbcdn\.net|cdninstagram\.com)[^"'\s\\]*/gi) || [];
        for (const m of matches) {
          const valid = cleanUrl(m);
          if (valid) {
            return res.status(200).json({ hd: valid, sd: valid, title: 'Social Video', author: 'Creator' });
          }
        }
      } catch (e) {}
    }

    return res.status(404).json({ error: 'Videoja nuk u gjet. Sigurohu që postimi është publik.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
