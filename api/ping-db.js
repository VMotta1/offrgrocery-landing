// api/ping-db.js
export const config = { runtime: 'nodejs' };

export default async function handler(req, res) {
  let sql;
  // 1) Import inside handler so a failed import won't crash the function at load time
  try {
    ({ sql } = await import('@vercel/postgres'));
  } catch (e) {
    return res.status(500).json({
      ok: false,
      where: 'import',
      error: e?.message || String(e),
    });
  }

  // 2) Try a trivial query (no schema required)
  try {
    const r = await sql`select current_database() as db, current_user as usr`;
    return res.status(200).json({ ok: true, db: r.rows[0] });
  } catch (e) {
    return res.status(500).json({
      ok: false,
      where: 'query',
      error: e?.message || String(e),
      code: e?.code || null,
    });
  }
}


