// All /api/admin/* routes — self-contained, no imports

const ADMIN_COOKIE = 'rev_admin';

function parseCookies(request) {
  const header = request.headers.get('Cookie') || '';
  return Object.fromEntries(header.split(';').map(c => {
    const [k,...v] = c.trim().split('='); return [k,v.join('=')];
  }));
}
function setCookie(name, value, days) {
  return `${name}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Expires=${new Date(Date.now()+days*864e5).toUTCString()}`;
}
function clearCookie(name) { return `${name}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`; }
function ok(data, status=200) { return new Response(JSON.stringify(data), { status, headers:{'Content-Type':'application/json'} }); }
function err(msg, status=400) { return new Response(JSON.stringify({ error:msg }), { status, headers:{'Content-Type':'application/json'} }); }

function generateToken() {
  const arr = new Uint8Array(32); crypto.getRandomValues(arr);
  return Array.from(arr, b => b.toString(16).padStart(2,'0')).join('');
}

async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key  = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name:'PBKDF2', hash:'SHA-256', salt, iterations:100000 }, key, 256);
  const toHex = b => Array.from(new Uint8Array(b), x => x.toString(16).padStart(2,'0')).join('');
  return `${toHex(salt)}:${toHex(bits)}`;
}

async function sendInvite(env, email, name, token, mode='invite') {
  const siteUrl = env.SITE_URL || 'https://www.reverentialav.in';
  const url     = `${siteUrl}/set-password.html?token=${token}&mode=${mode}`;
  const subject = mode === 'invite' ? 'Welcome to your Reverential Care Portal — set your password' : 'Reset your Reverential Care Portal password';
  const html    = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#F1F0EC;font-family:system-ui,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 20px;">
<table width="560" cellpadding="0" cellspacing="0" style="background:#0B0B0B;border-radius:4px;overflow:hidden;">
<tr><td style="height:4px;background:#C6A13A;"></td></tr>
<tr><td style="padding:36px 40px 28px;">
<p style="font-family:Georgia,serif;font-size:22px;color:#F1F0EC;margin:0 0 28px;">${mode==='invite'?'Welcome to your Care Portal':'Reset your password'}</p>
<p style="font-size:15px;color:#B4B0A6;line-height:1.65;margin:0 0 24px;">Hello ${name},<br><br>
${mode==='invite'?'Your Reverential Care Portal is ready. Click below to set your password.':'Click below to choose a new password. This link expires in 15 minutes.'}
</p>
<a href="${url}" style="display:inline-block;background:#C6A13A;color:#0B0B0B;padding:14px 32px;font-size:14px;font-weight:700;text-decoration:none;border-radius:2px;">
${mode==='invite'?'Set my password →':'Reset my password →'}
</a>
</td></tr>
<tr><td style="padding:16px 40px;border-top:1px solid #1c1c1c;">
<p style="font-size:11px;color:#444;margin:0;">© 2026 Reverential AV Integration Private Limited</p>
</td></tr></table></td></tr></table></body></html>`;
  await fetch('https://api.resend.com/emails', {
    method:'POST',
    headers:{ Authorization:`Bearer ${env.RESEND_API_KEY}`, 'Content-Type':'application/json' },
    body: JSON.stringify({ from:'Reverential Care <care@reverentialav.in>', to:email, subject, html })
  });
}

async function checkAdmin(request, env) {
  const sid = parseCookies(request)[ADMIN_COOKIE];
  if (!sid) return false;
  const s = await env.DB.prepare("SELECT id FROM sessions WHERE id=? AND type='admin' AND expires_at>datetime('now')").bind(sid).first();
  return !!s;
}

export async function onRequest({ request, env, params }) {
  const path   = (params.path || []).join('/');
  const method = request.method;

  // ── Public: login / logout ───────────────────────────────
  if (path === 'login' && method === 'POST') {
    const { secret } = await request.json();
    if (!secret || secret !== env.ADMIN_SECRET) return err('Invalid credentials', 401);
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 864e5).toISOString();
    await env.DB.prepare("INSERT INTO sessions (id, client_id, type, expires_at) VALUES (?, 'admin', 'admin', ?)")
      .bind(sessionId, expiresAt).run();
    return new Response(JSON.stringify({ success:true }), {
      status:200,
      headers:{ 'Content-Type':'application/json', 'Set-Cookie': setCookie(ADMIN_COOKIE, sessionId, 1) }
    });
  }

  if (path === 'logout' && method === 'POST') {
    const sid = parseCookies(request)[ADMIN_COOKIE];
    if (sid) await env.DB.prepare("DELETE FROM sessions WHERE id=? AND type='admin'").bind(sid).run();
    return new Response(JSON.stringify({ success:true }), {
      status:200,
      headers:{ 'Content-Type':'application/json', 'Set-Cookie': clearCookie(ADMIN_COOKIE) }
    });
  }

  // ── All other routes require admin session ───────────────
  if (!(await checkAdmin(request, env))) return err('Admin access required', 401);

  try {
    // Stats
    if (path === 'stats' && method === 'GET') {
      const [clients, tickets, invoices, visits] = await Promise.all([
        env.DB.prepare('SELECT COUNT(*) AS n FROM clients WHERE active=1').first(),
        env.DB.prepare("SELECT COUNT(*) AS n FROM tickets WHERE status!='resolved'").first(),
        env.DB.prepare("SELECT COUNT(*) AS n, SUM(amount_inr+gst_inr) AS total FROM invoices WHERE status='unpaid'").first(),
        env.DB.prepare("SELECT v.*,c.name AS client_name FROM service_visits v JOIN clients c ON c.id=v.client_id ORDER BY v.visit_date DESC LIMIT 5").all(),
      ]);
      return ok({ activeClients:clients?.n||0, openTickets:tickets?.n||0, unpaidInvoices:invoices?.n||0, unpaidAmount:invoices?.total||0, recentVisits:visits.results });
    }

    // Clients list
    if (path === 'clients' && method === 'GET') {
      const { results } = await env.DB.prepare(
        `SELECT c.*,
          (SELECT COUNT(*) FROM tickets t WHERE t.client_id=c.id AND t.status!='resolved') AS open_tickets,
          (SELECT COUNT(*) FROM invoices i WHERE i.client_id=c.id AND i.status='unpaid') AS unpaid_invoices,
          (SELECT visit_date FROM service_visits v WHERE v.client_id=c.id ORDER BY visit_date DESC LIMIT 1) AS last_visit
         FROM clients c ORDER BY c.name`
      ).all();
      return ok({ clients:results });
    }

    // Create client
    if (path === 'clients' && method === 'POST') {
      const { name, email, contact_name, phone, plan, address, city, notes } = await request.json();
      if (!name || !email) return err('name and email are required');
      const id = crypto.randomUUID();
      await env.DB.prepare('INSERT INTO clients (id,name,email,contact_name,phone,plan,address,city,notes) VALUES (?,?,?,?,?,?,?,?,?)')
        .bind(id, name, email.toLowerCase().trim(), contact_name||null, phone||null, plan||'standard', address||null, city||null, notes||null).run();
      const token     = generateToken();
      const expiresAt = new Date(Date.now() + 48*3600*1000).toISOString();
      await env.DB.prepare('INSERT INTO auth_tokens (id,client_id,token,expires_at) VALUES (?,?,?,?)')
        .bind(crypto.randomUUID(), id, token, expiresAt).run();
      try { await sendInvite(env, email, contact_name||name, token, 'invite'); } catch(e) { console.error('Invite email failed:', e.message); }
      return ok({ success:true, id }, 201);
    }

    // Client detail
    if (path.match(/^clients\/[^/]+$/) && method === 'GET') {
      const clientId = path.split('/')[1];
      const [client, visits, tickets, docs, invoices, equipment] = await Promise.all([
        env.DB.prepare('SELECT * FROM clients WHERE id=?').bind(clientId).first(),
        env.DB.prepare('SELECT * FROM service_visits WHERE client_id=? ORDER BY visit_date DESC').bind(clientId).all(),
        env.DB.prepare('SELECT * FROM tickets WHERE client_id=? ORDER BY created_at DESC').bind(clientId).all(),
        env.DB.prepare('SELECT id,name,doc_type,size_bytes,uploaded_at FROM documents WHERE client_id=? ORDER BY uploaded_at DESC').bind(clientId).all(),
        env.DB.prepare('SELECT * FROM invoices WHERE client_id=? ORDER BY issued_date DESC').bind(clientId).all(),
        env.DB.prepare('SELECT * FROM equipment WHERE client_id=? ORDER BY category').bind(clientId).all(),
      ]);
      if (!client) return err('Not found', 404);
      return ok({ client, visits:visits.results, tickets:tickets.results, documents:docs.results, invoices:invoices.results, equipment:equipment.results });
    }

    // Update client
    if (path.match(/^clients\/[^/]+$/) && method === 'PUT') {
      const clientId = path.split('/')[1];
      const { name, contact_name, phone, plan, address, city, notes, active } = await request.json();
      await env.DB.prepare('UPDATE clients SET name=?,contact_name=?,phone=?,plan=?,address=?,city=?,notes=?,active=? WHERE id=?')
        .bind(name, contact_name||null, phone||null, plan||'standard', address||null, city||null, notes||null, active===false?0:1, clientId).run();
      return ok({ success:true });
    }

    // Resend invite
    if (path.match(/^clients\/[^/]+\/invite$/) && method === 'POST') {
      const clientId = path.split('/')[1];
      const client   = await env.DB.prepare('SELECT * FROM clients WHERE id=? AND active=1').bind(clientId).first();
      if (!client) return err('Not found', 404);
      await env.DB.prepare('UPDATE auth_tokens SET used=1 WHERE client_id=? AND used=0').bind(clientId).run();
      const token     = generateToken();
      const expiresAt = new Date(Date.now() + 48*3600*1000).toISOString();
      await env.DB.prepare('INSERT INTO auth_tokens (id,client_id,token,expires_at) VALUES (?,?,?,?)').bind(crypto.randomUUID(), clientId, token, expiresAt).run();
      await sendInvite(env, client.email, client.contact_name||client.name, token, 'invite');
      return ok({ success:true });
    }

    // Add visit
    if (path.match(/^clients\/[^/]+\/visits$/) && method === 'POST') {
      const clientId = path.split('/')[1];
      const { visit_date, visit_type, engineer, summary, work_done, duration_hours, next_visit } = await request.json();
      if (!visit_date) return err('visit_date is required');
      const id = crypto.randomUUID();
      await env.DB.prepare('INSERT INTO service_visits (id,client_id,visit_date,visit_type,engineer,summary,work_done,duration_hours,next_visit) VALUES (?,?,?,?,?,?,?,?,?)')
        .bind(id, clientId, visit_date, visit_type||'preventive', engineer||'Thomas Jeffrin', summary||null, work_done||null, duration_hours||null, next_visit||null).run();
      return ok({ success:true, id }, 201);
    }

    // All tickets
    if (path === 'tickets' && method === 'GET') {
      const { results } = await env.DB.prepare("SELECT t.*,c.name AS client_name FROM tickets t JOIN clients c ON c.id=t.client_id ORDER BY t.created_at DESC").all();
      return ok({ tickets:results });
    }

    // Update ticket
    if (path.match(/^tickets\/[^/]+$/) && method === 'PUT') {
      const { status, resolution } = await request.json();
      const resolvedAt = status==='resolved' ? new Date().toISOString() : null;
      await env.DB.prepare("UPDATE tickets SET status=?,resolution=?,resolved_at=?,updated_at=datetime('now') WHERE id=?")
        .bind(status, resolution||null, resolvedAt, path.split('/')[1]).run();
      return ok({ success:true });
    }

    // Upload document
    if (path.match(/^clients\/[^/]+\/documents$/) && method === 'POST') {
      const clientId = path.split('/')[1];
      const form     = await request.formData();
      const file     = form.get('file');
      if (!file) return err('No file uploaded');
      const name    = form.get('name') || file.name;
      const docType = form.get('doc_type') || 'general';
      const ext     = file.name.split('.').pop() || 'pdf';
      const r2Key   = `documents/${clientId}/${crypto.randomUUID()}.${ext}`;
      const bytes   = await file.arrayBuffer();
      await env.R2_BUCKET.put(r2Key, bytes, { httpMetadata:{ contentType:file.type||'application/pdf' } });
      const id = crypto.randomUUID();
      await env.DB.prepare('INSERT INTO documents (id,client_id,name,doc_type,r2_key,size_bytes,mime_type) VALUES (?,?,?,?,?,?,?)')
        .bind(id, clientId, name, docType, r2Key, bytes.byteLength, file.type||'application/pdf').run();
      return ok({ success:true, id }, 201);
    }

    // Delete document
    if (path.match(/^documents\/[^/]+$/) && method === 'DELETE') {
      const doc = await env.DB.prepare('SELECT r2_key FROM documents WHERE id=?').bind(path.split('/')[1]).first();
      if (!doc) return err('Not found', 404);
      await env.R2_BUCKET.delete(doc.r2_key);
      await env.DB.prepare('DELETE FROM documents WHERE id=?').bind(path.split('/')[1]).run();
      return ok({ success:true });
    }

    // Add invoice
    if (path.match(/^clients\/[^/]+\/invoices$/) && method === 'POST') {
      const clientId = path.split('/')[1];
      const form     = await request.formData();
      const file     = form.get('file');
      const invoice_number = form.get('invoice_number');
      const amount_inr     = parseFloat(form.get('amount_inr')||0);
      const gst_inr        = parseFloat(form.get('gst_inr')||0);
      const status         = form.get('status')||'unpaid';
      const description    = form.get('description')||null;
      const issued_date    = form.get('issued_date');
      const due_date       = form.get('due_date')||null;
      if (!invoice_number || !issued_date) return err('invoice_number and issued_date are required');
      let r2Key = null;
      if (file && file.size > 0) {
        r2Key = `invoices/${clientId}/${invoice_number}.pdf`;
        const bytes = await file.arrayBuffer();
        await env.R2_BUCKET.put(r2Key, bytes, { httpMetadata:{ contentType:'application/pdf' } });
      }
      const id = crypto.randomUUID();
      await env.DB.prepare('INSERT INTO invoices (id,client_id,invoice_number,amount_inr,gst_inr,status,description,issued_date,due_date,r2_key) VALUES (?,?,?,?,?,?,?,?,?,?)')
        .bind(id, clientId, invoice_number, amount_inr, gst_inr, status, description, issued_date, due_date, r2Key).run();
      return ok({ success:true, id }, 201);
    }

    // Mark invoice paid
    if (path.match(/^invoices\/[^/]+$/) && method === 'PUT') {
      const { status, paid_date } = await request.json();
      await env.DB.prepare('UPDATE invoices SET status=?,paid_date=? WHERE id=?').bind(status, paid_date||null, path.split('/')[1]).run();
      return ok({ success:true });
    }

    // Add equipment
    if (path.match(/^clients\/[^/]+\/equipment$/) && method === 'POST') {
      const clientId = path.split('/')[1];
      const { category, make, model, serial_number, install_date, warranty_expiry, condition, location, notes } = await request.json();
      if (!model) return err('model is required');
      const id = crypto.randomUUID();
      await env.DB.prepare('INSERT INTO equipment (id,client_id,category,make,model,serial_number,install_date,warranty_expiry,condition,location,notes) VALUES (?,?,?,?,?,?,?,?,?,?,?)')
        .bind(id, clientId, category||'audio', make||null, model, serial_number||null, install_date||null, warranty_expiry||null, condition||'good', location||null, notes||null).run();
      return ok({ success:true, id }, 201);
    }

    // Update equipment
    if (path.match(/^equipment\/[^/]+$/) && method === 'PUT') {
      const { condition, notes, warranty_expiry } = await request.json();
      await env.DB.prepare('UPDATE equipment SET condition=?,notes=?,warranty_expiry=? WHERE id=?').bind(condition, notes||null, warranty_expiry||null, path.split('/')[1]).run();
      return ok({ success:true });
    }

    return err('Not found', 404);
  } catch(e) {
    console.error('Admin error:', e.message);
    return err('Server error', 500);
  }
}
