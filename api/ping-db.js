// api/ping-db.js
import { sql } from '@vercel/postgres';

// Ensure Node runtime (not Edge)
export const config = { runtime: 'nodejs18.x' };

export default async function handler(req, res) {
  try {
    const r = await sql`select current_database() as db, current_user as usr`;
    return res.status(200).json({ ok: true, db: r.rows[0] });
  } catch (e) {
    // Show the error so we know what's wrong
    return res.status(500).json({
      ok: false,
      error: e?.message || String(e),
      code: e?.code || null,
    });
  }
}

