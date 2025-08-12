// api/contact.js
export const config = { runtime: 'nodejs' };

export default async function handler(req, res) {
  // 1) Method guard
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // 2) Robust JSON body parsing
  let body = req.body;
  try {
    if (!body || typeof body === 'string') {
      const raw = await new Promise((resolve) => {
        let data = '';
        req.on('data', (c) => (data += c));
        req.on('end', () => resolve(data));
      });
      body = raw ? JSON.parse(raw) : {};
    }
  } catch (e) {
    console.error('Body parse error:', e);
    return res.status(400).json({ message: 'Invalid JSON' });
  }

  const name = (body?.name || '').trim();
  const email = (body?.email || '').trim();

  // 3) Validation
  if (name.length < 2) return res.status(400).json({ message: 'Invalid name' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: 'Invalid email' });
  if (name.length > 100 || email.length > 255) return res.status(400).json({ message: 'Input too long' });

  // 4) Import Postgres client inside the handler
  let sql;
  try {
    ({ sql } = await import('@vercel/postgres'));
  } catch (e) {
    console.error('Import @vercel/postgres failed:', e);
    return res.status(500).json({ message: 'Server DB client error' });
  }

  // 5) Insert into DB
  try {
    await sql`
      INSERT INTO contacts (name, email)
      VALUES (${name}, ${email})
      ON CONFLICT (email) DO NOTHING
    `;
  } catch (e) {
    console.error('DB insert error:', e);
    // Most common: relation not found (wrong DB/branch) or unique constraint details
    return res.status(500).json({ message: 'Database error' });
  }

  // 6) Best-effort Mailchimp mirror (won’t fail the request)
  try {
    const { MAILCHIMP_API_KEY, MAILCHIMP_SERVER_PREFIX, MAILCHIMP_LIST_ID } = process.env;
    if (MAILCHIMP_API_KEY && MAILCHIMP_SERVER_PREFIX && MAILCHIMP_LIST_ID) {
      const resp = await fetch(`https://${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `apikey ${MAILCHIMP_API_KEY}`,
        },
        body: JSON.stringify({
          email_address: email,
          status: 'pending', // use 'subscribed' if you have explicit consent
          merge_fields: { FNAME: name },
        }),
      });

      if (!resp.ok && resp.status !== 400) {
        const txt = await resp.text().catch(() => '');
        console.error('Mailchimp error', resp.status, txt);
      }
    }
  } catch (e) {
    console.error('Mailchimp call failed:', e);
    // ignored intentionally
  }

  // 7) Success
  return res.status(200).json({ ok: true });
}
