const fetch = require('node-fetch');        // ou sendgrid, brevo, etc.
exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  const body = JSON.parse(event.body);
  // … construisez votre HTML, appelez SendGrid/Brevo, etc.
  try {
    // exemple avec Brevo
    const resp = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY
      },
      body: JSON.stringify({
        sender: { name: 'PROVolume', email: 'no-reply@votre-domaine.com' },
        to: body.recipients.map(email => ({ email })),
        subject: '📩 Nouvelle demande de devis PROVolume',
        htmlContent: `<h2>…</h2>`, // votre HTML
      })
    });
    if (!resp.ok) throw new Error(await resp.text());
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
