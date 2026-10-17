export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.query.proxy === '1' && req.query.url) {
    const targetUrl = req.query.url;
    try {
      const vRes = await fetch(targetUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Content-Disposition', `attachment; filename="savevid_${Date.now()}.mp4"`);
      return res.status(200).send(Buffer.from(await vRes.arrayBuffer()));
    } catch (e) {
      return res.redirect(302, targetUrl);
    }
  }

  const rawUrl = req.query.url;
  if (!rawUrl) return res.status(400).json({ error: 'Mungon linku' });

  try {
    let workingUrl = rawUrl.trim();

    // 1. Përdorim Cobalt v10 API (Më e forta për Instagram, Facebook & TikTok)
    const cobaltEndpoints = [
      'https://co.wuk.sh/api/json',
      'https://cobalt-backend.canine.tools/',
      'https://api.cobalt.tools/api/json'
    ];

    for (const endpoint of cobaltEndpoints) {
      try {
        const cRes = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: workingUrl, videoQuality: '1080' })
        });
        const cJson = await cRes.json();
        const videoUrl = cJson.url || cJson.picker?.[0]?.url;
        if (videoUrl) {
          return res.status(200).json({
            hd: videoUrl,
            sd: videoUrl,
            title: cJson.filename || 'Social Video',
            author: 'Creator'
          });
        }
      } catch (e) {}
    }

    // 2. Fallback për TikTok nëse Cobalt nuk përgjigjet
    if (/tiktok\.com/i.test(workingUrl)) {
      const tt = await fetch('https://www.tikwm.com/api/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `url=${encodeURIComponent(workingUrl)}&hd=1`
      });
      const json = await tt.json();
      const mp4 = json?.data?.hdplay || json?.data?.play;
      if (mp4) {
        return res.status(200).json({ hd: mp4, sd: mp4, title: json.data.title || 'TikTok', author: 'TikTok' });
      }
    }

    return res.status(404).json({ error: 'Videoja nuk u gjet. Sigurohu që postimi të jetë publik.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
