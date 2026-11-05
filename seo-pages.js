import { TIKTOK } from './seo-tiktok.js';
import { INSTAGRAM } from './seo-instagram.js';
import { FACEBOOK } from './seo-facebook.js';

// Keyword-rich URLs, one per platform. Slugs stay in English so the same
// hreflang cluster works for all 9 languages.
export const PLATFORMS = {
  'tiktok-video-downloader': {
    key: 'tiktok',
    name: 'TikTok',
    color: '#111111',
    navKey: 'seo.navTiktok',
    icon: '<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true"><path d="M16 3c.4 2.1 1.9 3.7 4 4v3c-1.5 0-2.9-.5-4-1.3V15a6 6 0 1 1-6-6c.3 0 .7 0 1 .1v3.1a3 3 0 1 0 2 2.8V3h3z"/></svg>',
    content: TIKTOK
  },
  'instagram-video-downloader': {
    key: 'instagram',
    name: 'Instagram',
    color: '#d6249f',
    navKey: 'seo.navInstagram',
    icon: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#fff" stroke-width="1.9" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="3.8"/><circle cx="17.2" cy="6.8" r="1" fill="#fff" stroke="none"/></svg>',
    content: INSTAGRAM
  },
  'facebook-video-downloader': {
    key: 'facebook',
    name: 'Facebook',
    color: '#1877f2',
    navKey: 'seo.navFacebook',
    icon: '<svg viewBox="0 0 24 24" width="15" height="15" fill="#fff" aria-hidden="true"><path d="M15.12 5.32H17V2.14A26.11 26.11 0 0 0 14.26 2c-2.72 0-4.58 1.66-4.58 4.7v2.62H6.61v3.56h3.07V22h3.68v-9.12h3.06l.46-3.56h-3.52V7.05c0-1.05.28-1.73 1.76-1.73z"/></svg>',
    content: FACEBOOK
  }
};

export const PLATFORM_SLUGS = Object.keys(PLATFORMS);

export function platformContent(lang, slug) {
  const p = PLATFORMS[slug];
  if (!p) return null;
  return p.content[lang] || p.content.en;
}
