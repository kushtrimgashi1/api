export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Tuneli për shkarkim direkt në Downloads si skedar .mp4
  if (req.query.proxy === '1' && req.query.url) {
    const targetUrl = req.query.url;
    try {
      let referer = 'https://www.instagram.com/';
      if (targetUrl.includes('facebook') || targetUrl.includes('fbcdn')) referer = 'https://www.facebook.com/';
      if (targetUrl.includes('tiktok')) referer = 'https://www.tiktok.com/';

      const vRes = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Referer': referer
        }
      });
      if (!vRes.ok) throw new Error('CDN error');
      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Content-Disposition', `attachment; filename="savevid_${Date.now()}.mp4"`);
      return res.status(200).send(Buffer.from(await vRes.arrayBuffer()));
    } catch (e) {
      return res.redirect(302, targetUrl.includes('?') ? `${targetUrl}&dl=1` : `${targetUrl}?dl=1`);
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

    // Zgjidhësi për linqet e Facebook /share/
    if (/facebook\.com|fb\.watch/i.test(workingUrl) && workingUrl.includes('/share/')) {
      try {
        const r = await fetch(workingUrl, { 
          headers: { 'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)' }, 
          redirect: 'follow' 
        });
        if (r.url && !r.url.includes('/share/')) workingUrl = r.url;
        const html = await r.text();
        const match = html.match(/\/reel\/(\d+)/) || html.match(/\/videos\/(\d+)/) || html.match(/"video_id"\s*:\s*"(\d+)"/);
        if (match && match[1]) {
          workingUrl = `https://www.facebook.com/reel/${match[1]}`;
        }
      } catch (e) {}
    }

    // TikTok -> TikWM
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

    // Multi-API Server Pool (Për Instagram Reels, Facebook, etj.)
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

    return res.status(404).json({ error: 'Videoja nuk u gjet. Sigurohu që postimi të jetë publik.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
