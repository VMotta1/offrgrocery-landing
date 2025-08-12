import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  try {
    const r = await sql`select current_database() as db, current_user as usr`;
    res.status(200).json({ ok: true, db: r.rows[0] });
  } catch (e) {
    console.error('DB ping failed:', e);
    res.status(500).json({ ok: false, error: 'DB_ERROR' });
  }
}
