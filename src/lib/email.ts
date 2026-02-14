import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || 'gameshopenter@gmail.com',
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const FROM = '"Gameshop Enter" <gameshopenter@gmail.com>';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface OrderConfirmationData {
  to: string;
  orderNumber: string;
  customerName: string;
  items: OrderItem[];
  total: number;
  address: string;
  trackingCode?: string;
  trackingUrl?: string;
}

interface OrderNotificationData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  address: string;
  opmerkingen: string;
  items: { name: string; sku: string; quantity: number; price: number }[];
}

interface TrackTraceData {
  to: string;
  orderNumber: string;
  customerName: string;
  trackingCode: string;
  trackingUrl: string;
  items: OrderItem[];
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(price);
}

export async function sendOrderConfirmation(data: OrderConfirmationData): Promise<void> {
  if (!process.env.GMAIL_APP_PASSWORD) {
    console.warn('GMAIL_APP_PASSWORD niet ingesteld, e-mail wordt overgeslagen');
    return;
  }

  const itemsHtml = data.items
    .map(item => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;">${item.name}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;text-align:center;">${item.quantity}x</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;text-align:right;">${formatPrice(item.price)}</td>
      </tr>
    `)
    .join('');

  const html = `
    <div style="font-family:'Plus Jakarta Sans',system-ui,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;">
      <div style="background:linear-gradient(135deg,#10b981,#14b8a6);padding:32px;text-align:center;">
        <h1 style="color:white;margin:0;font-size:24px;">Bedankt voor je bestelling!</h1>
        <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;">Bestelnummer: <strong>${data.orderNumber}</strong></p>
      </div>
      <div style="padding:32px;">
        <p style="color:#334155;font-size:16px;">Hoi ${data.customerName},</p>
        <p style="color:#64748b;font-size:14px;">Je bestelling is ontvangen en betaald. We gaan je games zo snel mogelijk verzenden!</p>

        <table style="width:100%;border-collapse:collapse;margin:24px 0;">
          <thead>
            <tr style="background:#f8fafc;">
              <th style="padding:8px 12px;text-align:left;font-size:12px;color:#64748b;">Product</th>
              <th style="padding:8px 12px;text-align:center;font-size:12px;color:#64748b;">Aantal</th>
              <th style="padding:8px 12px;text-align:right;font-size:12px;color:#64748b;">Prijs</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding:12px;font-weight:bold;font-size:16px;">Totaal</td>
              <td style="padding:12px;font-weight:bold;font-size:16px;text-align:right;">${formatPrice(data.total)}</td>
            </tr>
          </tfoot>
        </table>

        <div style="background:#f8fafc;border-radius:12px;padding:16px;margin:16px 0;">
          <p style="margin:0 0 4px;font-size:12px;color:#64748b;font-weight:600;">Bezorgadres</p>
          <p style="margin:0;color:#334155;font-size:14px;">${data.address}</p>
        </div>

        <p style="color:#64748b;font-size:14px;">Je ontvangt een aparte e-mail met je track & trace code zodra je pakket is verzonden.</p>

        <div style="text-align:center;margin:32px 0 16px;">
          <a href="https://gameshopenter.nl/shop" style="display:inline-block;padding:12px 32px;background:linear-gradient(135deg,#10b981,#14b8a6);color:white;text-decoration:none;border-radius:12px;font-weight:bold;font-size:14px;">Verder winkelen</a>
        </div>
      </div>
      <div style="background:#f8fafc;padding:20px;text-align:center;border-top:1px solid #e2e8f0;">
        <p style="margin:0;color:#94a3b8;font-size:12px;">Gameshop Enter — Nintendo Games Specialist sinds 2018</p>
        <p style="margin:4px 0 0;color:#94a3b8;font-size:12px;">gameshopenter@gmail.com | KvK 93642474</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: FROM,
    to: data.to,
    subject: `Bevestiging bestelling ${data.orderNumber} — Gameshop Enter`,
    html,
  });
}

export async function sendOrderNotificationToOwner(data: OrderNotificationData): Promise<void> {
  if (!process.env.GMAIL_APP_PASSWORD) return;

  const itemsList = data.items
    .map(item => `• ${item.quantity}x ${item.name} (${item.sku}) — ${formatPrice(item.price)}`)
    .join('\n');

  const text = `
NIEUWE BESTELLING — ${data.orderNumber}

Klant: ${data.customerName}
E-mail: ${data.customerEmail}
Adres: ${data.address}
Totaal: ${formatPrice(data.total)}

Producten:
${itemsList}

${data.opmerkingen ? `Opmerkingen: ${data.opmerkingen}` : ''}

Ga naar je Mollie dashboard voor details.
  `.trim();

  await transporter.sendMail({
    from: FROM,
    to: process.env.GMAIL_USER || 'gameshopenter@gmail.com',
    subject: `Nieuwe bestelling ${data.orderNumber} — ${formatPrice(data.total)}`,
    text,
  });
}

export async function sendTrackTrace(data: TrackTraceData): Promise<void> {
  if (!process.env.GMAIL_APP_PASSWORD) return;

  const itemsHtml = data.items
    .map(item => `<li style="padding:4px 0;color:#334155;font-size:14px;">${item.quantity}x ${item.name}</li>`)
    .join('');

  const html = `
    <div style="font-family:'Plus Jakarta Sans',system-ui,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;">
      <div style="background:linear-gradient(135deg,#10b981,#14b8a6);padding:32px;text-align:center;">
        <h1 style="color:white;margin:0;font-size:24px;">Je pakket is onderweg!</h1>
        <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;">Bestelnummer: <strong>${data.orderNumber}</strong></p>
      </div>
      <div style="padding:32px;">
        <p style="color:#334155;font-size:16px;">Hoi ${data.customerName},</p>
        <p style="color:#64748b;font-size:14px;">Goed nieuws! Je bestelling is verzonden via PostNL. Hieronder vind je je track & trace code.</p>

        <div style="background:#f0fdf4;border:2px solid #86efac;border-radius:12px;padding:20px;text-align:center;margin:24px 0;">
          <p style="margin:0 0 4px;font-size:12px;color:#16a34a;font-weight:600;">Track & Trace Code</p>
          <p style="margin:0;font-size:20px;font-weight:bold;color:#15803d;letter-spacing:2px;">${data.trackingCode}</p>
        </div>

        <div style="text-align:center;margin:24px 0;">
          <a href="${data.trackingUrl}" style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#ea580c,#f97316);color:white;text-decoration:none;border-radius:12px;font-weight:bold;font-size:14px;">Volg je pakket bij PostNL</a>
        </div>

        <div style="background:#f8fafc;border-radius:12px;padding:16px;margin:24px 0;">
          <p style="margin:0 0 8px;font-size:12px;color:#64748b;font-weight:600;">Je bestelling</p>
          <ul style="margin:0;padding:0 0 0 16px;">${itemsHtml}</ul>
        </div>

        <p style="color:#64748b;font-size:14px;">Je pakket wordt binnen 1-3 werkdagen bezorgd. Vragen? Mail ons op <a href="mailto:gameshopenter@gmail.com" style="color:#10b981;">gameshopenter@gmail.com</a></p>
      </div>
      <div style="background:#f8fafc;padding:20px;text-align:center;border-top:1px solid #e2e8f0;">
        <p style="margin:0;color:#94a3b8;font-size:12px;">Gameshop Enter — Nintendo Games Specialist sinds 2018</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: FROM,
    to: data.to,
    subject: `Je pakket is onderweg! Track & Trace ${data.trackingCode} — Gameshop Enter`,
    html,
  });
}
