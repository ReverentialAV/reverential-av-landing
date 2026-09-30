import { parseCookies, clearCookie, COOKIE_NAME } from '../../_utils.js';

export async function onRequestPost({ request, env }) {
  const cookies   = parseCookies(request);
  const sessionId = cookies[COOKIE_NAME];
  if (sessionId) {
    await env.DB.prepare(
      "DELETE FROM sessions WHERE id = ? AND type = 'client'"
    ).bind(sessionId).run();
  }
  const siteUrl = env.SITE_URL || 'https://www.reverentialav.in';
  return new Response(null, {
    status: 302,
    headers: { Location: `${siteUrl}/login.html`, 'Set-Cookie': clearCookie(COOKIE_NAME) },
  });
}
