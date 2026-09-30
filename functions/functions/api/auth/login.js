// POST /api/auth/login — self-contained, no imports

const COOKIE_NAME = 'rev_session';

function setCookie(name, value, days) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  return `${name}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Expires=${expires}`;
}

async function verifyPassword(password, stored) {
  if (!stored) return false;
  const [saltHex, hashHex] = stored.split(':');
  const salt = new Uint8Array(saltHex.match(/.{2}/g).map(b => parseInt(b, 16)));
  const key  = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name:'PBKDF2', hash:'SHA-256', salt, iterations:100000 }, key, 256);
  const newHash = Array.from(new Uint8Array(bits), b => b.toString(16).padStart(2,'0')).join('');
  return newHash === hashHex;
}

export async function onRequestPost({ request, env }) {
  let email, password, remember;
  try { ({ email, password, remember } = await request.json()); }
  catch { return new Response(JSON.stringify({ error:'Invalid request' }), { status:400, headers:{'Content-Type':'application/json'} }); }

  if (!email || !password)
    return new Response(JSON.stringify({ error:'Email and password are required' }), { status:400, headers:{'Content-Type':'application/json'} });

  const client = await env.DB.prepare(
    'SELECT id, password_hash, active FROM clients WHERE email = ?'
  ).bind(email.toLowerCase().trim()).first();

  if (!client || !client.active || !client.password_hash)
    return new Response(JSON.stringify({ error:'Incorrect email or password' }), { status:401, headers:{'Content-Type':'application/json'} });

  const valid = await verifyPassword(password, client.password_hash);
  if (!valid)
    return new Response(JSON.stringify({ error:'Incorrect email or password' }), { status:401, headers:{'Content-Type':'application/json'} });

  const days      = remember ? 30 : 1;
  const sessionId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + days * 864e5).toISOString();
  await env.DB.prepare("INSERT INTO sessions (id, client_id, type, expires_at) VALUES (?, ?, 'client', ?)")
    .bind(sessionId, client.id, expiresAt).run();

  return new Response(JSON.stringify({ success:true }), {
    status:200,
    headers:{ 'Content-Type':'application/json', 'Set-Cookie': setCookie(COOKIE_NAME, sessionId, days) }
  });
}
