import { json, error, hashPassword, setCookie, createSession, COOKIE_NAME } from '../../_utils.js';

// POST /api/auth/set-password
// Body: { token, password }
// Validates the invite/reset token, sets the hashed password, creates a session.

export async function onRequestPost({ request, env }) {
  let token, password;
  try { ({ token, password } = await request.json()); }
  catch { return error('Invalid request'); }

  if (!token || !password) return error('Token and password are required');
  if (password.length < 8)  return error('Password must be at least 8 characters');

  // Find valid unused token
  const record = await env.DB.prepare(
    `SELECT t.*, c.id AS cid, c.active
     FROM auth_tokens t
     JOIN clients c ON c.id = t.client_id
     WHERE t.token = ? AND t.used = 0
       AND t.expires_at > datetime('now')
       AND c.active = 1`
  ).bind(token).first();

  if (!record) return error('This link has expired or already been used. Request a new one.', 401);

  // Hash and store password
  const hash = await hashPassword(password);

  await env.DB.prepare(
    'UPDATE clients SET password_hash = ? WHERE id = ?'
  ).bind(hash, record.cid).run();

  // Mark token as used
  await env.DB.prepare(
    'UPDATE auth_tokens SET used = 1 WHERE id = ?'
  ).bind(record.id).run();

  // Log them in automatically
  const sessionId = await createSession(env, record.cid, 'client', 30);
  const cookie    = setCookie(COOKIE_NAME, sessionId, 30);

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Set-Cookie': cookie },
  });
}

