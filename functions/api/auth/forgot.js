// POST /api/auth/forgot — self-contained, no imports

function generateToken() {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return Array.from(arr, b => b.toString(16).padStart(2,'0')).join('');
}

function emailHtml(name, resetUrl) {
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#F1F0EC;font-family:system-ui,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 20px;">
<table width="560" cellpadding="0" cellspacing="0" style="background:#0B0B0B;border-radius:4px;overflow:hidden;">
<tr><td style="height:4px;background:#C6A13A;"></td></tr>
<tr><td style="padding:36px 40px 28px;">
<p style="font-family:Georgia,serif;font-size:22px;color:#F1F0EC;margin:0 0 8px;">Reset your password</p>
<p style="font-size:13px;color:#888;text-transform:uppercase;letter-spacing:.5px;margin:0 0 28px;">REVERENTIAL AV INTEGRATION</p>
<p style="font-size:15px;color:#B4B0A6;line-height:1.65;margin:0 0 24px;">
Hello ${name},<br><br>Click below to reset your Care Portal password.
This link expires in <strong style="color:#F1F0EC;">15 minutes</strong> and works once only.
</p>
<a href="${resetUrl}" style="display:inline-block;background:#C6A13A;color:#0B0B0B;padding:14px 32px;font-size:14px;font-weight:700;text-decoration:none;border-radius:2px;">Reset my password →</a>
<p style="font-size:12px;color:#555;margin:28px 0 0;">If you did not request this, ignore it safely.</p>
</td></tr>
<tr><td style="padding:16px 40px;border-top:1px solid #1c1c1c;">
<p style="font-size:11px;color:#444;margin:0;">© 2026 Reverential AV Integration Private Limited</p>
</td></tr></table></td></tr></table></body></html>`;
}

export async function onRequestPost({ request, env }) {
  let email;
  try { ({ email } = await request.json()); } catch { return new Response(JSON.stringify({ success:true }), { status:200, headers:{'Content-Type':'application/json'} }); }

  const ok = new Response(JSON.stringify({ success:true }), { status:200, headers:{'Content-Type':'application/json'} });
  if (!email) return ok;

  const client = await env.DB.prepare(
    'SELECT id, name, contact_name FROM clients WHERE email = ? AND active = 1'
  ).bind(email.toLowerCase().trim()).first();

  if (!client) return ok;

  await env.DB.prepare('UPDATE auth_tokens SET used = 1 WHERE client_id = ? AND used = 0').bind(client.id).run();

  const token     = generateToken();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
  await env.DB.prepare('INSERT INTO auth_tokens (id, client_id, token, expires_at) VALUES (?, ?, ?, ?)')
    .bind(crypto.randomUUID(), client.id, token, expiresAt).run();

  const siteUrl  = env.SITE_URL || 'https://www.reverentialav.in';
  const resetUrl = `${siteUrl}/set-password.html?token=${token}&mode=reset`;
  const name     = client.contact_name || client.name;

  try {
    await fetch('https://api.resend.com/emails', {
      method:'POST',
      headers:{ Authorization:`Bearer ${env.RESEND_API_KEY}`, 'Content-Type':'application/json' },
      body: JSON.stringify({ from:'Reverential Care <care@reverentialav.in>', to:email, subject:'Reset your Reverential Care Portal password', html:emailHtml(name, resetUrl) })
    });
  } catch(e) { console.error('Email failed:', e.message); }

  return ok;
}
