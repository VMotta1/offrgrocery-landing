// api/ping-db.js
export const config = { runtime: 'nodejs' };

export default async function handler(req, res) {
  try {
    return res.status(200).json({ ok: true, step: "no-db" });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
}

