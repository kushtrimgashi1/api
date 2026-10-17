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
          'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });

      if (resp.url && !resp.url.includes('/login')) {
        resolvedUrl = resp.url;
      }

      const html = await resp.text();

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
          

