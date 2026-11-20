export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'POST required' });
  const { name, email, message } = request.body || {};
  if (!name || !email || !message) return response.status(400).json({ error: 'Name, email, and message are required.' });
  if (!process.env.RESEND_API_KEY || !process.env.CONTACT_EMAIL) return response.status(503).json({ error: 'Email delivery is not configured.' });
  const delivery = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from: 'PLAIN website <onboarding@resend.dev>', to: [process.env.CONTACT_EMAIL], reply_to: email, subject: `PLAIN enterprise enquiry from ${name}`, text: `Name: ${name}\nEmail: ${email}\n\n${message}` }) });
  if (!delivery.ok) return response.status(502).json({ error: 'Email provider rejected the message.' });
  return response.status(200).json({ ok: true });
}
