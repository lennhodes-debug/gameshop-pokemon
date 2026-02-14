import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || 'gameshopenter@gmail.com',
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const FROM = '"Gameshop Enter" <gameshopenter@gmail.com>';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gameshopenter.nl';

// ─── Shared email wrapper ────────────────────────────────────────────────

function emailWrapper(content: string, preheader?: string): string {
  return `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Gameshop Enter</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Segoe UI','Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  ${preheader ? `<div style="display:none;font-size:1px;color:#f1f5f9;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}</div>` : ''}
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f1f5f9;">
    <tr>
      <td align="center" style="padding:24px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;width:100%;">
          <!-- Logo -->
          <tr>
            <td align="center" style="padding:0 0 24px;">
              <a href="${SITE_URL}" style="text-decoration:none;display:inline-block;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:8px 16px;background:linear-gradient(135deg,#10b981,#14b8a6);border-radius:12px;">
                      <span style="color:#ffffff;font-size:20px;font-weight:800;letter-spacing:-0.5px;">Gameshop</span>
                      <span style="color:rgba(255,255,255,0.85);font-size:20px;font-weight:300;margin-left:4px;">Enter</span>
                    </td>
                  </tr>
                </table>
              </a>
            </td>
          </tr>
          <!-- Content card -->
          <tr>
            <td style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:32px 24px 8px;text-align:center;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding:0 0 16px;">
                    <a href="${SITE_URL}/shop" style="color:#10b981;font-size:13px;font-weight:600;text-decoration:none;margin:0 10px;">Shop</a>
                    <span style="color:#cbd5e1;">|</span>
                    <a href="${SITE_URL}/faq" style="color:#10b981;font-size:13px;font-weight:600;text-decoration:none;margin:0 10px;">FAQ</a>
                    <span style="color:#cbd5e1;">|</span>
                    <a href="${SITE_URL}/contact" style="color:#10b981;font-size:13px;font-weight:600;text-decoration:none;margin:0 10px;">Contact</a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:0 0 8px;">
                    <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.6;">
                      Gameshop Enter — Nintendo Games Specialist<br/>
                      KvK 93642474
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <a href="mailto:gameshopenter@gmail.com" style="color:#64748b;font-size:12px;text-decoration:none;">gameshopenter@gmail.com</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(price);
}

function greenButton(text: string, href: string): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:0 auto;">
      <tr>
        <td align="center" style="background:linear-gradient(135deg,#10b981,#14b8a6);border-radius:12px;">
          <a href="${href}" target="_blank" style="display:inline-block;padding:14px 36px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;letter-spacing:0.3px;">${text}</a>
        </td>
      </tr>
    </table>`;
}

// ─── Interfaces ──────────────────────────────────────────────────────────

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

interface NewsletterWelcomeData {
  to: string;
  discountCode: string;
}

// ─── Order Confirmation ──────────────────────────────────────────────────

export async function sendOrderConfirmation(data: OrderConfirmationData): Promise<void> {
  if (!process.env.GMAIL_APP_PASSWORD) {
    console.warn('GMAIL_APP_PASSWORD niet ingesteld, e-mail wordt overgeslagen');
    return;
  }

  const itemsHtml = data.items
    .map(item => `
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;color:#334155;font-size:14px;">${item.name}</td>
        <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;text-align:center;color:#64748b;font-size:14px;">${item.quantity}x</td>
        <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;text-align:right;color:#334155;font-size:14px;font-weight:600;">${formatPrice(item.price)}</td>
      </tr>
    `)
    .join('');

  const content = `
    <!-- Header banner -->
    <td style="background:linear-gradient(135deg,#10b981 0%,#14b8a6 50%,#06b6d4 100%);padding:40px 32px;text-align:center;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td align="center" style="padding:0 0 12px;">
            <div style="display:inline-block;width:56px;height:56px;background:rgba(255,255,255,0.2);border-radius:50%;line-height:56px;text-align:center;">
              <span style="font-size:28px;">&#10003;</span>
            </div>
          </td>
        </tr>
        <tr>
          <td align="center">
            <h1 style="color:#ffffff;margin:0 0 4px;font-size:24px;font-weight:800;">Bedankt voor je bestelling!</h1>
            <p style="color:rgba(255,255,255,0.85);margin:0;font-size:14px;">Bestelnummer: <strong>${data.orderNumber}</strong></p>
          </td>
        </tr>
      </table>
    </td>
    </tr><tr>
    <td style="padding:32px;">
      <p style="color:#334155;font-size:16px;margin:0 0 4px;">Hoi ${data.customerName},</p>
      <p style="color:#64748b;font-size:14px;line-height:1.6;margin:0 0 24px;">
        Geweldig! Je bestelling is ontvangen en betaald. We gaan je games zo snel mogelijk verzenden.
        Je ontvangt een aparte e-mail met je track &amp; trace code zodra je pakket onderweg is.
      </p>

      <!-- Order items table -->
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
        <thead>
          <tr style="background:#f8fafc;">
            <th style="padding:10px 16px;text-align:left;font-size:11px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Product</th>
            <th style="padding:10px 16px;text-align:center;font-size:11px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Aantal</th>
            <th style="padding:10px 16px;text-align:right;font-size:11px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Prijs</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
        <tfoot>
          <tr style="background:#f0fdf4;">
            <td colspan="2" style="padding:14px 16px;font-weight:800;font-size:16px;color:#334155;">Totaal</td>
            <td style="padding:14px 16px;font-weight:800;font-size:16px;text-align:right;color:#10b981;">${formatPrice(data.total)}</td>
          </tr>
        </tfoot>
      </table>

      <!-- Address -->
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:24px 0;">
        <tr>
          <td style="background:#f8fafc;border-radius:12px;padding:16px 20px;">
            <p style="margin:0 0 4px;font-size:11px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Bezorgadres</p>
            <p style="margin:0;color:#334155;font-size:14px;line-height:1.5;">${data.address}</p>
          </td>
        </tr>
      </table>

      <!-- CTA -->
      <div style="text-align:center;margin:32px 0 8px;">
        ${greenButton('Verder winkelen', `${SITE_URL}/shop`)}
      </div>
    </td>
  `;

  const html = emailWrapper(content, `Bedankt! Je bestelling ${data.orderNumber} is bevestigd.`);

  await transporter.sendMail({
    from: FROM,
    to: data.to,
    subject: `Bevestiging bestelling ${data.orderNumber} — Gameshop Enter`,
    html,
  });
}

// ─── Owner Notification ──────────────────────────────────────────────────

export async function sendOrderNotificationToOwner(data: OrderNotificationData): Promise<void> {
  if (!process.env.GMAIL_APP_PASSWORD) return;

  const itemsHtml = data.items
    .map(item => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#334155;">${item.name}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;font-size:11px;color:#94a3b8;font-family:monospace;">${item.sku}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;text-align:center;font-size:13px;color:#64748b;">${item.quantity}x</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;text-align:right;font-size:13px;color:#334155;font-weight:600;">${formatPrice(item.price)}</td>
      </tr>
    `)
    .join('');

  const content = `
    <td style="background:#1e293b;padding:24px 32px;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td>
            <span style="display:inline-block;padding:4px 10px;background:#f59e0b;color:#1e293b;border-radius:6px;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1px;">Nieuwe bestelling</span>
            <h2 style="color:#ffffff;margin:8px 0 0;font-size:20px;">${data.orderNumber}</h2>
          </td>
          <td align="right" style="vertical-align:top;">
            <span style="color:#10b981;font-size:24px;font-weight:800;">${formatPrice(data.total)}</span>
          </td>
        </tr>
      </table>
    </td>
    </tr><tr>
    <td style="padding:24px 32px;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 20px;">
        <tr>
          <td width="50%" style="padding:12px 16px;background:#f8fafc;border-radius:10px 0 0 10px;">
            <p style="margin:0 0 2px;font-size:11px;color:#64748b;font-weight:700;text-transform:uppercase;">Klant</p>
            <p style="margin:0;font-size:14px;color:#334155;font-weight:600;">${data.customerName}</p>
            <a href="mailto:${data.customerEmail}" style="font-size:12px;color:#10b981;text-decoration:none;">${data.customerEmail}</a>
          </td>
          <td width="50%" style="padding:12px 16px;background:#f8fafc;border-radius:0 10px 10px 0;border-left:2px solid #ffffff;">
            <p style="margin:0 0 2px;font-size:11px;color:#64748b;font-weight:700;text-transform:uppercase;">Adres</p>
            <p style="margin:0;font-size:13px;color:#334155;line-height:1.4;">${data.address}</p>
          </td>
        </tr>
      </table>

      ${data.opmerkingen ? `
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 20px;">
          <tr>
            <td style="padding:12px 16px;background:#fef3c7;border-radius:10px;border-left:4px solid #f59e0b;">
              <p style="margin:0 0 2px;font-size:11px;color:#92400e;font-weight:700;">OPMERKINGEN</p>
              <p style="margin:0;font-size:13px;color:#78350f;">${data.opmerkingen}</p>
            </td>
          </tr>
        </table>
      ` : ''}

      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;">
        <thead>
          <tr style="background:#f8fafc;">
            <th style="padding:8px 12px;text-align:left;font-size:10px;color:#64748b;font-weight:700;text-transform:uppercase;">Product</th>
            <th style="padding:8px 12px;text-align:left;font-size:10px;color:#64748b;font-weight:700;text-transform:uppercase;">SKU</th>
            <th style="padding:8px 12px;text-align:center;font-size:10px;color:#64748b;font-weight:700;text-transform:uppercase;">Qty</th>
            <th style="padding:8px 12px;text-align:right;font-size:10px;color:#64748b;font-weight:700;text-transform:uppercase;">Prijs</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>

      <div style="text-align:center;margin:24px 0 0;">
        ${greenButton('Open Admin Panel', `${SITE_URL}/admin`)}
      </div>
    </td>
  `;

  const html = emailWrapper(content, `Nieuwe bestelling ${data.orderNumber} — ${formatPrice(data.total)}`);

  await transporter.sendMail({
    from: FROM,
    to: process.env.GMAIL_USER || 'gameshopenter@gmail.com',
    subject: `Nieuwe bestelling ${data.orderNumber} — ${formatPrice(data.total)}`,
    html,
  });
}

// ─── Track & Trace ───────────────────────────────────────────────────────

export async function sendTrackTrace(data: TrackTraceData): Promise<void> {
  if (!process.env.GMAIL_APP_PASSWORD) return;

  const itemsHtml = data.items
    .map(item => `
      <tr>
        <td style="padding:6px 0;color:#334155;font-size:14px;">${item.quantity}x ${item.name}</td>
      </tr>
    `)
    .join('');

  const content = `
    <!-- Header banner -->
    <td style="background:linear-gradient(135deg,#ea580c 0%,#f97316 50%,#fb923c 100%);padding:40px 32px;text-align:center;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td align="center" style="padding:0 0 12px;">
            <div style="display:inline-block;width:56px;height:56px;background:rgba(255,255,255,0.2);border-radius:50%;line-height:56px;text-align:center;">
              <span style="font-size:28px;">&#128230;</span>
            </div>
          </td>
        </tr>
        <tr>
          <td align="center">
            <h1 style="color:#ffffff;margin:0 0 4px;font-size:24px;font-weight:800;">Je pakket is onderweg!</h1>
            <p style="color:rgba(255,255,255,0.85);margin:0;font-size:14px;">Bestelnummer: <strong>${data.orderNumber}</strong></p>
          </td>
        </tr>
      </table>
    </td>
    </tr><tr>
    <td style="padding:32px;">
      <p style="color:#334155;font-size:16px;margin:0 0 4px;">Hoi ${data.customerName},</p>
      <p style="color:#64748b;font-size:14px;line-height:1.6;margin:0 0 24px;">
        Goed nieuws! Je bestelling is ingepakt en verzonden via PostNL.
        Met onderstaande code kun je je pakket volgen.
      </p>

      <!-- Track & Trace box -->
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="background:#fff7ed;border:2px solid #fed7aa;border-radius:14px;padding:24px;text-align:center;">
            <p style="margin:0 0 6px;font-size:11px;color:#c2410c;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Track &amp; Trace Code</p>
            <p style="margin:0;font-size:22px;font-weight:800;color:#9a3412;letter-spacing:3px;font-family:monospace;">${data.trackingCode}</p>
          </td>
        </tr>
      </table>

      <!-- PostNL button -->
      <div style="text-align:center;margin:24px 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" align="center">
          <tr>
            <td align="center" style="background:linear-gradient(135deg,#ea580c,#f97316);border-radius:12px;">
              <a href="${data.trackingUrl}" target="_blank" style="display:inline-block;padding:14px 36px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;">Volg je pakket bij PostNL</a>
            </td>
          </tr>
        </table>
      </div>

      <!-- Items -->
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:24px 0 0;">
        <tr>
          <td style="background:#f8fafc;border-radius:12px;padding:16px 20px;">
            <p style="margin:0 0 8px;font-size:11px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Je bestelling</p>
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
              ${itemsHtml}
            </table>
          </td>
        </tr>
      </table>

      <p style="color:#94a3b8;font-size:13px;margin:24px 0 0;line-height:1.5;text-align:center;">
        Je pakket wordt binnen 1-3 werkdagen bezorgd.<br/>
        Vragen? Mail ons op <a href="mailto:gameshopenter@gmail.com" style="color:#10b981;text-decoration:none;font-weight:600;">gameshopenter@gmail.com</a>
      </p>
    </td>
  `;

  const html = emailWrapper(content, `Je pakket is onderweg! Track & trace: ${data.trackingCode}`);

  await transporter.sendMail({
    from: FROM,
    to: data.to,
    subject: `Je pakket is onderweg! Track & Trace ${data.trackingCode} — Gameshop Enter`,
    html,
  });
}

// ─── Newsletter Welcome ──────────────────────────────────────────────────

export async function sendNewsletterWelcome(data: NewsletterWelcomeData): Promise<void> {
  if (!process.env.GMAIL_APP_PASSWORD) return;

  const content = `
    <!-- Header banner -->
    <td style="background:linear-gradient(135deg,#10b981 0%,#14b8a6 50%,#06b6d4 100%);padding:40px 32px;text-align:center;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td align="center" style="padding:0 0 12px;">
            <div style="display:inline-block;width:56px;height:56px;background:rgba(255,255,255,0.2);border-radius:50%;line-height:56px;text-align:center;">
              <span style="font-size:28px;">&#127918;</span>
            </div>
          </td>
        </tr>
        <tr>
          <td align="center">
            <h1 style="color:#ffffff;margin:0 0 4px;font-size:24px;font-weight:800;">Welkom bij de club!</h1>
            <p style="color:rgba(255,255,255,0.85);margin:0;font-size:14px;">Je bent aangemeld voor de Gameshop Enter nieuwsbrief</p>
          </td>
        </tr>
      </table>
    </td>
    </tr><tr>
    <td style="padding:32px;">
      <p style="color:#334155;font-size:16px;margin:0 0 8px;font-weight:600;">Bedankt voor je aanmelding!</p>
      <p style="color:#64748b;font-size:14px;line-height:1.6;margin:0 0 24px;">
        Als welkomstcadeau krijg je <strong style="color:#10b981;">10% korting</strong> op je eerstvolgende bestelling.
        Gebruik onderstaande code bij het afrekenen:
      </p>

      <!-- Discount code box -->
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="background:linear-gradient(135deg,#f0fdf4,#ecfdf5);border:2px dashed #86efac;border-radius:14px;padding:28px;text-align:center;">
            <p style="margin:0 0 8px;font-size:12px;color:#16a34a;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Jouw kortingscode</p>
            <p style="margin:0 0 8px;font-size:28px;font-weight:800;color:#15803d;letter-spacing:4px;font-family:monospace;">${data.discountCode}</p>
            <p style="margin:0;font-size:13px;color:#22c55e;font-weight:600;">10% korting op je volgende bestelling</p>
          </td>
        </tr>
      </table>

      <!-- What to expect -->
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:28px 0;">
        <tr>
          <td style="background:#f8fafc;border-radius:12px;padding:20px;">
            <p style="margin:0 0 12px;font-size:14px;color:#334155;font-weight:700;">Wat kun je verwachten?</p>
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
              <tr><td style="padding:4px 0;font-size:13px;color:#64748b;line-height:1.5;">&#x2713;&nbsp;&nbsp;Nieuwe aanwinsten &amp; zeldzame vondsten</td></tr>
              <tr><td style="padding:4px 0;font-size:13px;color:#64748b;line-height:1.5;">&#x2713;&nbsp;&nbsp;Exclusieve kortingsacties</td></tr>
              <tr><td style="padding:4px 0;font-size:13px;color:#64748b;line-height:1.5;">&#x2713;&nbsp;&nbsp;Early access bij nieuwe drops</td></tr>
              <tr><td style="padding:4px 0;font-size:13px;color:#64748b;line-height:1.5;">&#x2713;&nbsp;&nbsp;Tips voor verzamelaars</td></tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- CTA -->
      <div style="text-align:center;margin:8px 0;">
        ${greenButton('Bekijk de shop', `${SITE_URL}/shop`)}
      </div>
    </td>
  `;

  const html = emailWrapper(content, `Welkom! Hier is je 10% kortingscode: ${data.discountCode}`);

  await transporter.sendMail({
    from: FROM,
    to: data.to,
    subject: `Welkom! Hier is je 10% korting — Gameshop Enter`,
    html,
  });
}
