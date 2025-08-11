// api/contact.js
import { sql } from '@vercel/postgres';

const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY; // e.g. 'usX-...'
const MAILCHIMP_SERVER_PREFIX = process.env.MAILCHIMP_SERVER_PREFIX; // e.g. 'us21'
const MAILCHIMP_LIST_ID = process.env.MAILCHIMP_LIST_ID; // your Audience ID

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { name, email } = req.body || {};
    if (!name || name.trim().length < 2) return res.status(400).json({ message: 'Invalid name' });
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: 'Invalid email' });
    if (name.length > 100 || email.length > 255) return res.status(400).json({ message: 'Input too long' });

    // 1) Store in Postgres
    await sql`
      INSERT INTO contacts (name, email)
      VALUES (${name.trim()}, ${email.trim()})
      ON CONFLICT (email) DO NOTHING
    `;

    // 2) Mirror to Mailchimp (optional but recommended)
    if (MAILCHIMP_API_KEY && MAILCHIMP_SERVER_PREFIX && MAILCHIMP_LIST_ID) {
      await fetch(`https://${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `apikey ${MAILCHIMP_API_KEY}`,
        },
        body: JSON.stringify({
          email_address: email.trim(),
          status: 'pending', // 'pending' = double opt-in; use 'subscribed' if you have explicit consent already
          merge_fields: { FNAME: name.trim() }
        })
      }).catch(() => {}); // don’t fail the whole request if Mailchimp call hiccups
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Contact API error:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

