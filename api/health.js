export const config = { runtime: 'nodejs' };

export default function handler(req, res) {
  res.status(200).json({
    ok: true,
    have: {
      POSTGRES_URL: !!process.env.POSTGRES_URL,
      MAILCHIMP_API_KEY: !!process.env.MAILCHIMP_API_KEY,
      MAILCHIMP_SERVER_PREFIX: !!process.env.MAILCHIMP_SERVER_PREFIX,
      MAILCHIMP_LIST_ID: !!process.env.MAILCHIMP_LIST_ID,
    },
  });
}

