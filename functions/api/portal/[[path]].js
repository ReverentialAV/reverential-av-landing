// All /api/portal/* routes — self-contained, no imports

const COOKIE_NAME = 'rev_session';

function parseCookies(request) {
  const header = request.headers.get('Cookie') || '';
  return Object.fromEntries(header.split(';').map(c => {
    const [k, ...v] = c.trim().split('='); return [k, v.join('=')];
  }));
}

function ok(data) { return new Response(JSON.stringify(data), { status:200, headers:{'Content-Type':'application/json'} }); }
function err(msg, status=400) { return new Response(JSON.stringify({ error:msg }), { status, headers:{'Content-Type':'application/json'} }); }

async function getSession(request, env) {
  const sid = parseCookies(request)[COOKIE_NAME];
  if (!sid) return null;
  return await env.DB.prepare(
    `SELECT s.client_id, c.name AS client_name, c.email, c.plan, c.contact_name
     FROM sessions s JOIN clients c ON c.id = s.client_id
     WHERE s.id = ? AND s.type = 'client' AND s.expires_at > datetime('now') AND c.active = 1`
  ).bind(sid).first() || null;
}

export async function onRequest({ request, env, params }) {
  const path   = (params.path || []).join('/');
  const method = request.method;
  const siteUrl = env.SITE_URL || 'https://www.reverentialav.in';

  const session = await getSession(request, env);
  if (!session) {
    if ((request.headers.get('Accept') || '').includes('text/html'))
      return Response.redirect(`${siteUrl}/login.html?error=session`, 302);
    return err('Session expired. Please sign in again.', 401);
  }

  const cid = session.client_id;

  try {
    if (path === 'dashboard' && method === 'GET') {
      const [client, openTickets, nextVisit, unpaidInv] = await Promise.all([
        env.DB.prepare('SELECT * FROM clients WHERE id = ?').bind(cid).first(),
        env.DB.prepare("SELECT COUNT(*) AS n FROM tickets WHERE client_id = ? AND status != 'resolved'").bind(cid).first(),
        env.DB.prepare("SELECT next_visit FROM service_visits WHERE client_id = ? AND next_visit >= date('now') ORDER BY next_visit ASC LIMIT 1").bind(cid).first(),
        env.DB.prepare("SELECT COUNT(*) AS n, SUM(amount_inr+gst_inr) AS total FROM invoices WHERE client_id = ? AND status='unpaid'").bind(cid).first(),
      ]);
      return ok({ client, stats:{ openTickets:openTickets?.n||0, nextVisit:nextVisit?.next_visit||null, unpaidInvoices:unpaidInv?.n||0, unpaidAmount:unpaidInv?.total||0 } });
    }

    if (path === 'history' && method === 'GET') {
      const { results } = await env.DB.prepare('SELECT * FROM service_visits WHERE client_id = ? ORDER BY visit_date DESC').bind(cid).all();
      return ok({ visits:results });
    }

    if (path === 'tickets' && method === 'GET') {
      const { results } = await env.DB.prepare('SELECT * FROM tickets WHERE client_id = ? ORDER BY created_at DESC').bind(cid).all();
      return ok({ tickets:results });
    }

    if (path === 'tickets' && method === 'POST') {
      const { title, description, priority='normal' } = await request.json();
      if (!title) return err('Title is required');
      const id = crypto.randomUUID();
      await env.DB.prepare('INSERT INTO tickets (id, client_id, title, description, priority) VALUES (?, ?, ?, ?, ?)')
        .bind(id, cid, title, description||null, priority).run();
      return new Response(JSON.stringify({ success:true, id }), { status:201, headers:{'Content-Type':'application/json'} });
    }

    if (path === 'documents' && method === 'GET') {
      const { results } = await env.DB.prepare('SELECT id, name, doc_type, size_bytes, uploaded_at FROM documents WHERE client_id = ? ORDER BY uploaded_at DESC').bind(cid).all();
      return ok({ documents:results });
    }

    if (path.startsWith('documents/') && path.endsWith('/download') && method === 'GET') {
      const docId = path.split('/')[1];
      const doc   = await env.DB.prepare('SELECT * FROM documents WHERE id = ? AND client_id = ?').bind(docId, cid).first();
      if (!doc) return err('Not found', 404);
      const obj = await env.R2_BUCKET.get(doc.r2_key);
      if (!obj) return err('File not available', 404);
      return new Response(obj.body, { headers:{ 'Content-Type':doc.mime_type||'application/pdf', 'Content-Disposition':`attachment; filename="${doc.name}"`, 'Cache-Control':'private,no-store' } });
    }

    if (path === 'invoices' && method === 'GET') {
      const { results } = await env.DB.prepare('SELECT id,invoice_number,amount_inr,gst_inr,status,description,issued_date,due_date,paid_date FROM invoices WHERE client_id = ? ORDER BY issued_date DESC').bind(cid).all();
      return ok({ invoices:results });
    }

    if (path.startsWith('invoices/') && path.endsWith('/download') && method === 'GET') {
      const inv = await env.DB.prepare('SELECT * FROM invoices WHERE id = ? AND client_id = ? AND r2_key IS NOT NULL').bind(path.split('/')[1], cid).first();
      if (!inv) return err('Not found', 404);
      const obj = await env.R2_BUCKET.get(inv.r2_key);
      if (!obj) return err('File not found', 404);
      return new Response(obj.body, { headers:{ 'Content-Type':'application/pdf', 'Content-Disposition':`attachment; filename="Invoice-${inv.invoice_number}.pdf"`, 'Cache-Control':'private,no-store' } });
    }

    if (path === 'equipment' && method === 'GET') {
      const { results } = await env.DB.prepare('SELECT * FROM equipment WHERE client_id = ? ORDER BY category,make,model').bind(cid).all();
      return ok({ equipment:results });
    }

    return err('Not found', 404);
  } catch(e) {
    console.error('Portal error:', e.message);
    return err('Server error', 500);
  }
}
