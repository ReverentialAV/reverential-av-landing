// POST /api/auth/set-password — self-contained, no imports

const COOKIE_NAME = 'rev_session';

function setCookie(name, value, days) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  return `${name}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Expires=${expires}`;
}

async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key  = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name:'PBKDF2', hash:'SHA-256', salt, iterations:100000 }, key, 256);
  const toHex = b => Array.from(new Uint8Array(b), x => x.toString(16).padStart(2,'0')).join('');
  return `${toHex(salt)}:${toHex(bits)}`;
}

export async function onRequestPost({ request, env }) {
  let token, password;
  try { ({ token, password } = await request.json()); }
  catch { return new Response(JSON.stringify({ error:'Invalid request' }), { status:400, headers:{'Content-Type':'application/json'} }); }

  if (!token || !password)
    return new Response(JSON.stringify({ error:'Token and password are required' }), { status:400, headers:{'Content-Type':'application/json'} });
  if (password.length < 8)
    return new Response(JSON.stringify({ error:'Password must be at least 8 characters' }), { status:400, headers:{'Content-Type':'application/json'} });

  const record = await env.DB.prepare(
    `SELECT t.id, t.client_id AS cid FROM auth_tokens t
     JOIN clients c ON c.id = t.client_id
     WHERE t.token = ? AND t.used = 0 AND t.expires_at > datetime('now') AND c.active = 1`
  ).bind(token).first();

  if (!record)
    return new Response(JSON.stringify({ error:'This link has expired or already been used.' }), { status:401, headers:{'Content-Type':'application/json'} });

  const hash = await hashPassword(password);
  await env.DB.prepare('UPDATE clients SET password_hash = ? WHERE id = ?').bind(hash, record.cid).run();
  await env.DB.prepare('UPDATE auth_tokens SET used = 1 WHERE id = ?').bind(record.id).run();

  const sessionId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 30 * 864e5).toISOString();
  await env.DB.prepare("INSERT INTO sessions (id, client_id, type, expires_at) VALUES (?, ?, 'client', ?)")
    .bind(sessionId, record.cid, expiresAt).run();

  return new Response(JSON.stringify({ success:true }), {
    status:200,
    headers:{ 'Content-Type':'application/json', 'Set-Cookie': setCookie(COOKIE_NAME, sessionId, 30) }
  });
}
