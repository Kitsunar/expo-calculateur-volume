// netlify/functions/send-quote.js
const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  const { recipients, subject, htmlContent } = body;
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.error('Missing BREVO_API_KEY');
    return { statusCode: 500, body: 'Configuration error' };
  }

  try {
    const resp = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify({
        sender: { name: 'PROVolume', email: 'no-reply@votre-domaine.com' },
        to: recipients.map(email => ({ email })),
        subject,
        htmlContent
      })
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error('Brevo error:', text);
      return { statusCode: 502, body: 'email_send_failed' };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true })
    };
  } catch (err) {
    console.error('Unhandled error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
