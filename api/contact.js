// api/contact.js
export const config = { runtime: 'nodejs' };

import { sql } from '@vercel/postgres';

const { MAILCHIMP_API_KEY, MAILCHIMP_SERVER_PREFIX, MAILCHIMP_LIST_ID } = process.env;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // Robust JSON body parsing (works whether req.body is provided or not)
    let body = req.body;
    if (!body || typeof body === 'string') {
      const raw = await new Promise((resolve) => {
        let data = '';
        req.on('data', (c) => (data += c));
        req.on('end', () => resolve(data));
      });
      body = raw ? JSON.parse(raw) : {};
    }

    const name = (body.name || '').trim();
    const email = (body.email || '').trim();

    if (name.length < 2) return res.status(400).json({ message: 'Invalid name' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: 'Invalid email' });
    if (name.length > 100 || email.length > 255) return res.status(400).json({ message: 'Input too long' });

    // 1) DB insert
    await sql`
      INSERT INTO contacts (name, email)
      VALUES (${name}, ${email})
      ON CONFLICT (email) DO NOTHING
    `;

    // 2) Mailchimp mirror (best-effort; won't fail the request)
    if (MAILCHIMP_API_KEY && MAILCHIMP_SERVER_PREFIX && MAILCHIMP_LIST_ID) {
      try {
        const resp = await fetch(`https://${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/members`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `apikey ${MAILCHIMP_API_KEY}`,
          },
          body: JSON.stringify({
            email_address: email,
            status: 'pending',            // use 'subscribed' only if you have explicit consent
            merge_fields: { FNAME: name }
          }),
        });
        if (!resp.ok && resp.status !== 400) {
          const t = await resp.text().catch(() => '');
          console.error('Mailchimp error', resp.status, t);
        }
      } catch (mcErr) {
        console.error('Mailchimp fetch failed', mcErr);
      }
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Contact API error:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
