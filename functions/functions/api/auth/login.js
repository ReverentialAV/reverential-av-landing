import { json, error, setCookie, createSession, verifyPassword, COOKIE_NAME } from '../../_utils.js';

// POST /api/auth/login
// Body: { email, password, remember? }

export async function onRequestPost({ request, env }) {
  let email, password, remember;
  try { ({ email, password, remember } = await request.json()); }
  catch { return error('Invalid request'); }

  if (!email || !password) return error('Email and password are required');

  const client = await env.DB.prepare(
    'SELECT id, name, password_hash, active FROM clients WHERE email = ?'
  ).bind(email.toLowerCase().trim()).first();

  // Constant-time failure — don't reveal whether email exists
  if (!client || !client.active) {
    return json({ error: 'Incorrect email or password' }, 401);
  }
  if (!client.password_hash) {
    return json({ error: 'Password not set yet. Check your invite email or contact support.' }, 401);
  }

  const valid = await verifyPassword(password, client.password_hash);
  if (!valid) return json({ error: 'Incorrect email or password' }, 401);

  const days      = remember ? 30 : 1;
  const sessionId = await createSession(env, client.id, 'client', days);
  const cookie    = setCookie(COOKIE_NAME, sessionId, days);

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Set-Cookie': cookie },
  });
}
