// api/ping-db.js
export const config = { runtime: 'nodejs' };

let imported = false;
try {
  // Only import; no calls yet
  const mod = await import('@vercel/postgres');
  globalThis.__sql = mod.sql;
  imported = true;
} catch (e) {
  // swallow, we’ll show in response
  globalThis.__importErr = e;
}

export default async function handler(req, res) {
  if (globalThis.__importErr) {
    return res.status(500).json({
      ok: false,
      where: "import",
      error: globalThis.__importErr?.message || String(globalThis.__importErr)
    });
  }
  return res.status(200).json({ ok: true, step: "import-only", imported });
}


