// api/mc-check.js
export const config = { runtime: 'nodejs' };

export default async function handler(req, res) {
  const { MAILCHIMP_API_KEY, MAILCHIMP_SERVER_PREFIX, MAILCHIMP_LIST_ID } = process.env;
  const basic = 'Basic ' + Buffer.from('anystring:' + MAILCHIMP_API_KEY).toString('base64');

  const result = { ok: true, checks: {} };

  try {
    // 1) Auth sanity
    const ping = await fetch(`https://${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/ping`, {
      headers: { Authorization: basic }
    });
    result.checks.ping = { status: ping.status, ok: ping.ok, text: await ping.text() };
  } catch (e) {
    result.checks.ping = { ok: false, error: String(e) };
  }

  try {
    // 2) List sanity
    const list = await fetch(`https://${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}`, {
      headers: { Authorization: basic }
    });
    result.checks.list = { status: list.status, ok: list.ok, text: await list.text() };
  } catch (e) {
    result.checks.list = { ok: false, error: String(e) };
  }

  return res.status(200).json(result);
}
