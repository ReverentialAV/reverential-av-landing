import {
  json, error, redirect,
  parseCookies, setCookie, clearCookie,
  requireAdminSession, AuthError,
  ADMIN_COOKIE_NAME, SESSION_DAYS,
  sendEmail, inviteEmail, resetEmail, generateToken
} from '../../_utils.js';

// ── Admin Router ─────────────────────────────────────────────
// All /api/admin/* routes.
// Login and logout are public; everything else requires admin session.

export async function onRequest(context) {
  const { request, env, params } = context;
  const path   = (params.path || []).join('/');
  const method = request.method;

  // ── POST /api/admin/login ─────────────────────────────────
  if (path === 'login' && method === 'POST') {
    const { secret } = await request.json();
    if (!secret || secret !== env.ADMIN_SECRET) {
      return error('Invalid credentials', 401);
    }
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 1 * 864e5).toISOString(); // 1 day
    // Admin sessions stored under a dummy client_id we never use
    await env.DB.prepare(
      `INSERT INTO sessions (id, client_id, type, expires_at)
       VALUES (?, 'admin', 'admin', ?)`
    ).bind(sessionId, expiresAt).run();

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie':   setCookie(ADMIN_COOKIE_NAME, sessionId, 1),
      },
    });
  }

  // ── POST /api/admin/logout ────────────────────────────────
  if (path === 'logout' && method === 'POST') {
    const cookies = parseCookies(request);
    const sid     = cookies[ADMIN_COOKIE_NAME];
    if (sid) await env.DB.prepare("DELETE FROM sessions WHERE id = ? AND type = 'admin'").bind(sid).run();
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie':   clearCookie(ADMIN_COOKIE_NAME),
      },
    });
  }

  // All other routes require admin session
  try {
    await requireAdminSession(request, env);
  } catch (e) {
    return error('Admin access required. Please sign in.', 401);
  }

  try {

    // ══════════════════════════════════════════════════════════
    // CLIENTS
    // ══════════════════════════════════════════════════════════

    // GET /api/admin/clients
    if (path === 'clients' && method === 'GET') {
      const { results } = await env.DB.prepare(
        `SELECT c.*,
           (SELECT COUNT(*) FROM tickets t WHERE t.client_id = c.id AND t.status != 'resolved') AS open_tickets,
           (SELECT COUNT(*) FROM invoices i WHERE i.client_id = c.id AND i.status = 'unpaid') AS unpaid_invoices,
           (SELECT visit_date FROM service_visits v WHERE v.client_id = c.id ORDER BY visit_date DESC LIMIT 1) AS last_visit
         FROM clients c ORDER BY c.name`
      ).all();
      return json({ clients: results });
    }

    // POST /api/admin/clients — create client + send invite
    if (path === 'clients' && method === 'POST') {
      const { name, email, contact_name, phone, plan, address, city, notes } = await request.json();
      if (!name || !email) return error('name and email are required');

      const id = crypto.randomUUID();
      await env.DB.prepare(
        `INSERT INTO clients (id, name, email, contact_name, phone, plan, address, city, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(id, name, email.toLowerCase().trim(), contact_name || null,
             phone || null, plan || 'standard', address || null, city || null, notes || null).run();

      // Send magic link invite
      const token     = generateToken(32);
      const expiresAt = new Date(Date.now() + 48 * 3600 * 1000).toISOString(); // 48h for first invite
      await env.DB.prepare(
        'INSERT INTO auth_tokens (id, client_id, token, expires_at) VALUES (?, ?, ?, ?)'
      ).bind(crypto.randomUUID(), id, token, expiresAt).run();

      const siteUrl  = env.SITE_URL || 'https://www.reverentialav.in';
      const inviteUrl = `${siteUrl}/set-password.html?token=${token}&mode=invite`;
      await sendEmail(env, {
        to:      email,
        subject: 'Welcome to your Reverential Care Portal — set your password',
        html:    inviteEmail(contact_name || name, inviteUrl),
      });

      return json({ success: true, id }, 201);
    }

    // GET /api/admin/clients/:id — full client detail
    if (path.match(/^clients\/[^/]+$/) && method === 'GET') {
      const clientId = path.split('/')[1];
      const [client, visits, tickets, docs, invoices, equipment] = await Promise.all([
        env.DB.prepare('SELECT * FROM clients WHERE id = ?').bind(clientId).first(),
        env.DB.prepare('SELECT * FROM service_visits WHERE client_id = ? ORDER BY visit_date DESC').bind(clientId).all(),
        env.DB.prepare('SELECT * FROM tickets WHERE client_id = ? ORDER BY created_at DESC').bind(clientId).all(),
        env.DB.prepare('SELECT id, name, doc_type, size_bytes, uploaded_at FROM documents WHERE client_id = ? ORDER BY uploaded_at DESC').bind(clientId).all(),
        env.DB.prepare('SELECT * FROM invoices WHERE client_id = ? ORDER BY issued_date DESC').bind(clientId).all(),
        env.DB.prepare('SELECT * FROM equipment WHERE client_id = ? ORDER BY category').bind(clientId).all(),
      ]);
      if (!client) return error('Client not found', 404);
      return json({ client, visits: visits.results, tickets: tickets.results, documents: docs.results, invoices: invoices.results, equipment: equipment.results });
    }

    // PUT /api/admin/clients/:id — update client
    if (path.match(/^clients\/[^/]+$/) && method === 'PUT') {
      const clientId = path.split('/')[1];
      const { name, contact_name, phone, plan, address, city, notes, active } = await request.json();
      await env.DB.prepare(
        `UPDATE clients SET name=?, contact_name=?, phone=?, plan=?, address=?, city=?, notes=?, active=?
         WHERE id=?`
      ).bind(name, contact_name||null, phone||null, plan||'standard',
             address||null, city||null, notes||null, active===false?0:1, clientId).run();
      return json({ success: true });
    }

    // POST /api/admin/clients/:id/invite — resend magic link
    if (path.match(/^clients\/[^/]+\/invite$/) && method === 'POST') {
      const clientId = path.split('/')[1];
      const client   = await env.DB.prepare('SELECT * FROM clients WHERE id = ? AND active = 1').bind(clientId).first();
      if (!client) return error('Client not found', 404);

      await env.DB.prepare('UPDATE auth_tokens SET used = 1 WHERE client_id = ? AND used = 0').bind(clientId).run();
      const token     = generateToken(32);
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      await env.DB.prepare('INSERT INTO auth_tokens (id, client_id, token, expires_at) VALUES (?, ?, ?, ?)').bind(crypto.randomUUID(), clientId, token, expiresAt).run();

      const siteUrl  = env.SITE_URL || 'https://www.reverentialav.in';
      const inviteUrl = `${siteUrl}/set-password.html?token=${token}&mode=invite`;
      await sendEmail(env, {
        to:      client.email,
        subject: 'Set up your Reverential Care Portal',
        html:    inviteEmail(client.contact_name || client.name, inviteUrl),
      });
      return json({ success: true });
    }

    // ══════════════════════════════════════════════════════════
    // SERVICE VISITS
    // ══════════════════════════════════════════════════════════

    // POST /api/admin/clients/:id/visits
    if (path.match(/^clients\/[^/]+\/visits$/) && method === 'POST') {
      const clientId = path.split('/')[1];
      const { visit_date, visit_type, engineer, summary, work_done, duration_hours, next_visit } = await request.json();
      if (!visit_date) return error('visit_date is required');

      const id = crypto.randomUUID();
      await env.DB.prepare(
        `INSERT INTO service_visits (id, client_id, visit_date, visit_type, engineer, summary, work_done, duration_hours, next_visit)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(id, clientId, visit_date, visit_type||'preventive',
             engineer||'Thomas Jeffrin', summary||null, work_done||null,
             duration_hours||null, next_visit||null).run();
      return json({ success: true, id }, 201);
    }

    // ══════════════════════════════════════════════════════════
    // TICKETS
    // ══════════════════════════════════════════════════════════

    // GET /api/admin/tickets — all open tickets
    if (path === 'tickets' && method === 'GET') {
      const { results } = await env.DB.prepare(
        `SELECT t.*, c.name AS client_name FROM tickets t
         JOIN clients c ON c.id = t.client_id
         ORDER BY t.created_at DESC`
      ).all();
      return json({ tickets: results });
    }

    // PUT /api/admin/tickets/:id — update status/resolution
    if (path.match(/^tickets\/[^/]+$/) && method === 'PUT') {
      const ticketId = path.split('/')[1];
      const { status, resolution } = await request.json();
      const resolvedAt = status === 'resolved' ? new Date().toISOString() : null;
      await env.DB.prepare(
        `UPDATE tickets SET status=?, resolution=?, resolved_at=?, updated_at=datetime('now') WHERE id=?`
      ).bind(status, resolution||null, resolvedAt, ticketId).run();
      return json({ success: true });
    }

    // ══════════════════════════════════════════════════════════
    // DOCUMENTS (upload to R2)
    // ══════════════════════════════════════════════════════════

    // POST /api/admin/clients/:id/documents
    if (path.match(/^clients\/[^/]+\/documents$/) && method === 'POST') {
      const clientId = path.split('/')[1];
      const form     = await request.formData();
      const file     = form.get('file');
      const name     = form.get('name') || file.name;
      const docType  = form.get('doc_type') || 'general';

      if (!file) return error('No file uploaded');

      const ext    = file.name.split('.').pop() || 'pdf';
      const r2Key  = `documents/${clientId}/${crypto.randomUUID()}.${ext}`;
      const bytes  = await file.arrayBuffer();

      await env.R2_BUCKET.put(r2Key, bytes, {
        httpMetadata: { contentType: file.type || 'application/pdf' },
      });

      const id = crypto.randomUUID();
      await env.DB.prepare(
        `INSERT INTO documents (id, client_id, name, doc_type, r2_key, size_bytes, mime_type)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).bind(id, clientId, name, docType, r2Key, bytes.byteLength, file.type || 'application/pdf').run();

      return json({ success: true, id }, 201);
    }

    // DELETE /api/admin/documents/:id
    if (path.match(/^documents\/[^/]+$/) && method === 'DELETE') {
      const docId = path.split('/')[1];
      const doc   = await env.DB.prepare('SELECT r2_key FROM documents WHERE id = ?').bind(docId).first();
      if (!doc) return error('Not found', 404);
      await env.R2_BUCKET.delete(doc.r2_key);
      await env.DB.prepare('DELETE FROM documents WHERE id = ?').bind(docId).run();
      return json({ success: true });
    }

    // ══════════════════════════════════════════════════════════
    // INVOICES
    // ══════════════════════════════════════════════════════════

    // POST /api/admin/clients/:id/invoices
    if (path.match(/^clients\/[^/]+\/invoices$/) && method === 'POST') {
      const clientId = path.split('/')[1];
      const form     = await request.formData();
      const file     = form.get('file'); // optional PDF
      const invoice_number = form.get('invoice_number');
      const amount_inr     = parseFloat(form.get('amount_inr') || 0);
      const gst_inr        = parseFloat(form.get('gst_inr') || 0);
      const status         = form.get('status') || 'unpaid';
      const description    = form.get('description') || null;
      const issued_date    = form.get('issued_date');
      const due_date       = form.get('due_date') || null;

      if (!invoice_number || !issued_date) return error('invoice_number and issued_date are required');

      let r2Key = null;
      if (file && file.size > 0) {
        r2Key     = `invoices/${clientId}/${invoice_number}.pdf`;
        const bytes = await file.arrayBuffer();
        await env.R2_BUCKET.put(r2Key, bytes, {
          httpMetadata: { contentType: 'application/pdf' },
        });
      }

      const id = crypto.randomUUID();
      await env.DB.prepare(
        `INSERT INTO invoices (id, client_id, invoice_number, amount_inr, gst_inr, status, description, issued_date, due_date, r2_key)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(id, clientId, invoice_number, amount_inr, gst_inr, status, description, issued_date, due_date, r2Key).run();

      return json({ success: true, id }, 201);
    }

    // PUT /api/admin/invoices/:id — mark paid etc
    if (path.match(/^invoices\/[^/]+$/) && method === 'PUT') {
      const invId             = path.split('/')[1];
      const { status, paid_date } = await request.json();
      await env.DB.prepare(
        'UPDATE invoices SET status=?, paid_date=? WHERE id=?'
      ).bind(status, paid_date||null, invId).run();
      return json({ success: true });
    }

    // ══════════════════════════════════════════════════════════
    // EQUIPMENT
    // ══════════════════════════════════════════════════════════

    // POST /api/admin/clients/:id/equipment
    if (path.match(/^clients\/[^/]+\/equipment$/) && method === 'POST') {
      const clientId = path.split('/')[1];
      const { category, make, model, serial_number, install_date, warranty_expiry, condition, location, notes } = await request.json();
      if (!model) return error('model is required');
      const id = crypto.randomUUID();
      await env.DB.prepare(
        `INSERT INTO equipment (id, client_id, category, make, model, serial_number, install_date, warranty_expiry, condition, location, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(id, clientId, category||'audio', make||null, model, serial_number||null,
             install_date||null, warranty_expiry||null, condition||'good', location||null, notes||null).run();
      return json({ success: true, id }, 201);
    }

    // PUT /api/admin/equipment/:id
    if (path.match(/^equipment\/[^/]+$/) && method === 'PUT') {
      const eqId = path.split('/')[1];
      const { condition, notes, warranty_expiry } = await request.json();
      await env.DB.prepare(
        'UPDATE equipment SET condition=?, notes=?, warranty_expiry=? WHERE id=?'
      ).bind(condition, notes||null, warranty_expiry||null, eqId).run();
      return json({ success: true });
    }

    // ══════════════════════════════════════════════════════════
    // STATS
    // ══════════════════════════════════════════════════════════

    // GET /api/admin/stats
    if (path === 'stats' && method === 'GET') {
      const [clients, openTickets, unpaidInvoices, recentVisits] = await Promise.all([
        env.DB.prepare('SELECT COUNT(*) AS n FROM clients WHERE active = 1').first(),
        env.DB.prepare("SELECT COUNT(*) AS n FROM tickets WHERE status != 'resolved'").first(),
        env.DB.prepare("SELECT COUNT(*) AS n, SUM(amount_inr+gst_inr) AS total FROM invoices WHERE status='unpaid'").first(),
        env.DB.prepare("SELECT v.*, c.name AS client_name FROM service_visits v JOIN clients c ON c.id=v.client_id ORDER BY v.visit_date DESC LIMIT 5").all(),
      ]);
      return json({
        activeClients:  clients?.n || 0,
        openTickets:    openTickets?.n || 0,
        unpaidInvoices: unpaidInvoices?.n || 0,
        unpaidAmount:   unpaidInvoices?.total || 0,
        recentVisits:   recentVisits.results,
      });
    }

    return error('Not found', 404);

  } catch (e) {
    if (e instanceof AuthError) return error(e.message, e.status);
    console.error('Admin API error:', e.message, e.stack);
    return error('Server error — check console for details', 500);
  }
}
