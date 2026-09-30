import { json, generateToken, resetEmail, sendEmail } from '../../_utils.js';

// POST /api/auth/forgot
// Body: { email }
// Sends a password-reset link. Always returns success to prevent email enumeration.

export async function onRequestPost({ request, env }) {
  let email;
  try { ({ email } = await request.json()); }
  catch { return json({ success: true }); }

  if (!email) return json({ success: true });

  const client = await env.DB.prepare(
    'SELECT id, name, contact_name FROM clients WHERE email = ? AND active = 1'
  ).bind(email.toLowerCase().trim()).first();

  if (client) {
    // Expire previous unused tokens
    await env.DB.prepare(
      'UPDATE auth_tokens SET used = 1 WHERE client_id = ? AND used = 0'
    ).bind(client.id).run();

    const token     = generateToken(32);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    await env.DB.prepare(
      'INSERT INTO auth_tokens (id, client_id, token, expires_at) VALUES (?, ?, ?, ?)'
    ).bind(crypto.randomUUID(), client.id, token, expiresAt).run();

    const siteUrl  = env.SITE_URL || 'https://www.reverentialav.in';
    const resetUrl = `${siteUrl}/set-password.html?token=${token}&mode=reset`;
    const name     = client.contact_name || client.name;

    try {
      await sendEmail(env, {
        to:      email,
        subject: 'Reset your Reverential Care Portal password',
        html:    resetEmail(name, resetUrl),
      });
    } catch (e) {
      console.error('Reset email failed:', e.message);
    }
  }

  return json({ success: true });
}
