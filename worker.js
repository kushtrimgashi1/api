import { onRequest } from './functions/api/extract.js';

export default {
  async fetch(request, env, ctx) {
    const { pathname } = new URL(request.url);
    if (pathname === '/api/extract' || pathname === '/api/extract/') {
      return onRequest({ request, env, ctx });
    }
    return env.ASSETS.fetch(request);
  }
};
