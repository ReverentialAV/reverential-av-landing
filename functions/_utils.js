// ============================================================
// Shared utilities — Reverential Portal Pages Functions
// ============================================================

export const COOKIE_NAME       = 'rev_session';
export const ADMIN_COOKIE_NAME = 'rev_admin';
export const SESSION_DAYS      = 30;

// ── Response helpers ─────────────────────────────────────────

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json' },
  });
}
export function error(message, status = 400) {
  return json({ error: message }, status);
}
export function redirect(url) {
  return Response.redirect(url, 302);
}

// ── Cookie helpers ───────────────────────────────────────────

export function parseCookies(request) {
  const header = request.headers.get('Cookie') || '';
  return Object.fromEntries(
    header.split(';').map(c => {
      const [k, ...v] = c.trim().split('=');
      return [k, v.join('=')];
    })
  );
}
export function setCookie(name, value, days) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  return `${name}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Expires=${expires}`;
}
export function clearCookie(name) {
  return `${name}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

// ── Password hashing (PBKDF2 — no external library) ──────────

export async function hashPassword(password) {
  const enc  = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key  = await crypto.subtle.importKey(
    'raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 100000 },
    key, 256
  );
  const toHex = buf => Array.from(new Uint8Array(buf), b => b.toString(16).padStart(2,'0')).join('');
  return `${toHex(salt)}:${toHex(bits)}`;
}

export async function verifyPassword(password, stored) {
  if (!stored) return false;
  const [saltHex, hashHex] = stored.split(':');
  const salt = new Uint8Array(saltHex.match(/.{2}/g).map(b => parseInt(b, 16)));
  const enc  = new TextEncoder();
  const key  = await crypto.subtle.importKey(
    'raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 100000 },
    key, 256
  );
  const newHash = Array.from(new Uint8Array(bits), b => b.toString(16).padStart(2,'0')).join('');
  return newHash === hashHex;
}

// ── Session validation ───────────────────────────────────────

export async function getClientSession(request, env) {
  const cookies = parseCookies(request);
  const sid     = cookies[COOKIE_NAME];
  if (!sid) return null;
  const session = await env.DB.prepare(
    `SELECT s.*, c.id AS client_id, c.name AS client_name,
            c.email, c.plan, c.contact_name
     FROM sessions s
     JOIN clients c ON c.id = s.client_id
     WHERE s.id = ? AND s.type = 'client'
       AND s.expires_at > datetime('now')
       AND c.active = 1`
  ).bind(sid).first();
  return session || null;
}
export async function requireClientSession(request, env) {
  const session = await getClientSession(request, env);
  if (!session) throw new AuthError();
  return session;
}
export async function getAdminSession(request, env) {
  const cookies = parseCookies(request);
  const sid     = cookies[ADMIN_COOKIE_NAME];
  if (!sid) return null;
  const session = await env.DB.prepare(
    `SELECT * FROM sessions WHERE id = ? AND type = 'admin'
       AND expires_at > datetime('now')`
  ).bind(sid).first();
  return session || null;
}
export async function requireAdminSession(request, env) {
  const session = await getAdminSession(request, env);
  if (!session) throw new AuthError('Admin access required', 401);
  return session;
}

// ── Token generator ──────────────────────────────────────────

export function generateToken(bytes = 32) {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
}

// ── Create session ───────────────────────────────────────────

export async function createSession(env, clientId, type = 'client', days = SESSION_DAYS) {
  const sessionId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + days * 864e5).toISOString();
  await env.DB.prepare(
    `INSERT INTO sessions (id, client_id, type, expires_at) VALUES (?, ?, ?, ?)`
  ).bind(sessionId, clientId, type, expiresAt).run();
  return sessionId;
}

// ── Auth error ───────────────────────────────────────────────

export class AuthError extends Error {
  constructor(msg = 'Unauthorised', status = 401) {
    super(msg); this.status = status;
  }
}

// ── Email templates ──────────────────────────────────────────

function emailShell(content) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F1F0EC;font-family:system-ui,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0">
  <tr><td align="center" style="padding:40px 20px;">
    <table width="560" cellpadding="0" cellspacing="0"
           style="background:#0B0B0B;border-radius:4px;overflow:hidden;">
      <tr><td style="height:4px;background:#C6A13A;"></td></tr>
      <tr><td style="padding:36px 40px 28px;">${content}</td></tr>
      <tr><td style="padding:16px 40px;border-top:1px solid #1c1c1c;">
        <p style="font-size:11px;color:#444;margin:0;">
          © 2026 Reverential AV Integration Private Limited · reverentialav.in
        </p>
      </td></tr>
    </table>
  </td></tr>
</table></body></html>`;
}

export function inviteEmail(name, setPasswordUrl) {
  return emailShell(`
    <p style="font-family:Georgia,serif;font-size:22px;color:#F1F0EC;font-weight:400;margin:0 0 8px;">
      Welcome to your Care Portal</p>
    <p style="font-size:13px;color:#888;letter-spacing:.5px;text-transform:uppercase;margin:0 0 28px;">
      REVERENTIAL AV INTEGRATION</p>
    <p style="font-size:15px;color:#B4B0A6;line-height:1.65;margin:0 0 24px;">
      Hello ${name},<br><br>
      Your Reverential Care Portal is ready. Click below to set your password
      and access your service history, documents and support tickets.
      This link expires in <strong style="color:#F1F0EC;">48 hours</strong>.
    </p>
    <a href="${setPasswordUrl}"
       style="display:inline-block;background:#C6A13A;color:#0B0B0B;padding:14px 32px;
              font-size:14px;font-weight:700;text-decoration:none;border-radius:2px;">
      Set my password →
    </a>
    <p style="font-size:12px;color:#555;margin:28px 0 0;line-height:1.6;">
      If you didn't expect this, ignore it safely.<br>
      Questions? <a href="tel:+919962232223" style="color:#C6A13A;">+91 99622 32223</a>
    </p>`);
}

export function resetEmail(name, resetUrl) {
  return emailShell(`
    <p style="font-family:Georgia,serif;font-size:22px;color:#F1F0EC;font-weight:400;margin:0 0 8px;">
      Reset your password</p>
    <p style="font-size:13px;color:#888;letter-spacing:.5px;text-transform:uppercase;margin:0 0 28px;">
      REVERENTIAL AV INTEGRATION</p>
    <p style="font-size:15px;color:#B4B0A6;line-height:1.65;margin:0 0 24px;">
      Hello ${name},<br><br>
      We received a request to reset your Care Portal password.
      Click below to choose a new one.
      This link expires in <strong style="color:#F1F0EC;">15 minutes</strong> and works once only.
    </p>
    <a href="${resetUrl}"
       style="display:inline-block;background:#C6A13A;color:#0B0B0B;padding:14px 32px;
              font-size:14px;font-weight:700;text-decoration:none;border-radius:2px;">
      Reset my password →
    </a>
    <p style="font-size:12px;color:#555;margin:28px 0 0;line-height:1.6;">
      If you didn't request this, ignore it — your password has not changed.<br>
      Questions? <a href="tel:+919962232223" style="color:#C6A13A;">+91 99622 32223</a>
    </p>`);
}

// ── Resend email sender ───────────────────────────────────────

export async function sendEmail(env, { to, subject, html }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Reverential Care <care@reverentialav.in>',
      to, subject, html,
    }),
  });
  if (!res.ok) throw new Error(`Resend error ${res.status}: ${await res.text()}`);
  return res.json();
}
