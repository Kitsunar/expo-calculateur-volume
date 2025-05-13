// api/send-quote.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  // 🔐 Vérification de la clé d'API Brevo
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.error('❌ BREVO_API_KEY non définie');
    return res.status(500).json({ error: 'no_api_key' });
  }

  const {
    recipients,       // array d'emails ou string
    sexe,
    fname,
    lname,
    phone,
    email,
    depart,
    arrivee,
    formule,
    dateType,
    dateFixe,
    periodeDeb,
    periodeFin,
  } = req.body;

  // 🏗 Construction du HTML
  const htmlContent = `
    <h2>📩 Nouvelle demande de devis PROVolume</h2>
    <p><strong>Client :</strong> ${sexe} ${fname} ${lname}</p>
    <p><strong>Téléphone :</strong> ${phone}</p>
    <p><strong>Email :</strong> <a href="mailto:${email}">${email}</a></p>
    <hr/>
    <h3>🚚 Départ</h3>
    <p>${depart.adresse}, ${depart.ville} (${depart.cp}) – ${depart.pays}</p>
    <p><strong>Type logement :</strong> ${depart.type}</p>
    <!-- …autres champs conditionnels du départ… -->
    <hr/>
    <h3>🏡 Arrivée</h3>
    <p>${arrivee.adresse}, ${arrivee.ville} (${arrivee.cp}) – ${arrivee.pays}</p>
    <p><strong>Type logement :</strong> ${arrivee.type}</p>
    <!-- …autres champs conditionnels de l'arrivée… -->
    <hr/>
    <p><strong>Formule :</strong> ${formule}</p>
    <p><strong>Date :</strong> ${
      dateType === 'Date fixe'
        ? new Date(dateFixe).toLocaleDateString()
        : `Du ${new Date(periodeDeb).toLocaleDateString()} au ${new Date(periodeFin).toLocaleDateString()}`
    }</p>
  `;

  // 📧 Préparation de la liste des destinataires
  const toList = Array.isArray(recipients)
    ? recipients.map(addr => ({ email: addr }))
    : [{ email: recipients }];

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        sender: { name: 'PROVolume', email: 'no-reply@votre-domaine.com' },
        to: toList,
        subject: '📩 Nouvelle demande de devis PROVolume',
        htmlContent,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Brevo API error:', errText);
      return res.status(500).json({ error: 'brevo_error', details: errText });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Fetch error:', err);
    return res.status(500).json({ error: 'send_error', details: err.message || err });
  }
}
