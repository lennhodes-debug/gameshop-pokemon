import nodemailer from 'nodemailer';

// Initialize transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_PASSWORD,
  },
});

export interface OrderEmailData {
  customerEmail: string;
  customerName: string;
  orderNumber: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  discountCode?: string;
}

export interface ShippingEmailData {
  customerEmail: string;
  customerName: string;
  orderNumber: string;
  trackingCode: string;
  carrier: string; // 'PostNL', 'DHL', etc.
}

export interface ContactReplyData {
  customerEmail: string;
  customerName: string;
  subject: string;
  message: string;
  aiResponse: string;
}

export async function sendOrderConfirmation(data: OrderEmailData): Promise<void> {
  if (!process.env.GMAIL_EMAIL || !process.env.GMAIL_PASSWORD) {
    console.warn('Email not configured - skipping order confirmation email');
    return;
  }

  const itemsHtml = data.items
    .map(
      (item) =>
        `<tr><td>${item.name}</td><td>${item.quantity}x</td><td>€${item.price.toFixed(2)}</td></tr>`,
    )
    .join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #10b981;">Bedankt voor je bestelling!</h1>
      <p>Hallo ${data.customerName},</p>
      <p>Je bestelling is succesvol ontvangen. Hier zijn de details:</p>

      <h3>Ordernummer: <strong>${data.orderNumber}</strong></h3>

      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background-color: #f3f4f6;">
            <th style="padding: 10px; text-align: left;">Product</th>
            <th style="padding: 10px; text-align: center;">Aantal</th>
            <th style="padding: 10px; text-align: right;">Prijs</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div style="border-top: 1px solid #e5e7eb; padding-top: 15px;">
        <p style="display: flex; justify-content: space-between;">
          <span>Subtotaal:</span>
          <strong>€${data.subtotal.toFixed(2)}</strong>
        </p>
        <p style="display: flex; justify-content: space-between;">
          <span>Verzendkosten:</span>
          <strong>€${data.shipping.toFixed(2)}</strong>
        </p>
        ${
          data.discount > 0
            ? `<p style="display: flex; justify-content: space-between; color: #10b981;">
          <span>Korting (${data.discountCode}):</span>
          <strong>-€${data.discount.toFixed(2)}</strong>
        </p>`
            : ''
        }
        <p style="display: flex; justify-content: space-between; font-size: 18px; margin-top: 10px;">
          <span>Totaal:</span>
          <strong style="color: #10b981;">€${data.total.toFixed(2)}</strong>
        </p>
      </div>

      <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; margin-top: 20px;">
        <h3 style="margin-top: 0; color: #059669;">Wat nu?</h3>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>Je ontvangt binnenkort een verzendmail met track & trace</li>
          <li>Verwachte levertijd: 1-3 werkdagen</li>
          <li>Retour? Geen probleem: 14 dagen bedenktijd</li>
        </ul>
      </div>

      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">

      <p style="color: #6b7280; font-size: 12px;">
        Vragen? <a href="https://gameshopenter.nl/contact" style="color: #10b981; text-decoration: none;">Contact</a> •
        <a href="https://gameshopenter.nl/faq" style="color: #10b981; text-decoration: none;">FAQ</a> •
        <a href="https://gameshopenter.nl/retourbeleid" style="color: #10b981; text-decoration: none;">Retourbeleid</a>
      </p>
      <p style="color: #6b7280; font-size: 12px;">
        &copy; 2024 Gameshop Enter. Alle rechten voorbehouden.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.GMAIL_EMAIL,
    to: data.customerEmail,
    subject: `Bestellingsbevestiging #${data.orderNumber}`,
    html,
  });
}

export async function sendShippingNotification(data: ShippingEmailData): Promise<void> {
  if (!process.env.GMAIL_EMAIL || !process.env.GMAIL_PASSWORD) {
    console.warn('Email not configured - skipping shipping notification email');
    return;
  }

  const trackingUrl = `https://www.postnl.nl/en/tracking`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #10b981;">Je bestelling is onderweg!</h1>
      <p>Hallo ${data.customerName},</p>
      <p>Goed nieuws! Je bestelling is verzonden en onderweg naar jou.</p>

      <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
        <p style="margin: 0; font-size: 12px; color: #6b7280;">Volgnummer</p>
        <p style="margin: 10px 0 0 0; font-size: 24px; font-weight: bold; font-family: monospace; letter-spacing: 2px;">
          ${data.trackingCode}
        </p>
      </div>

      <a href="${trackingUrl}" style="display: block; background-color: #10b981; color: white; padding: 12px 20px; border-radius: 8px; text-align: center; text-decoration: none; font-weight: bold; margin: 20px 0;">
        Track & Trace →
      </a>

      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Jouw ordernummer:</h3>
        <p style="font-family: monospace; font-size: 16px; margin: 5px 0;">
          ${data.orderNumber}
        </p>
      </div>

      <div style="background-color: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; border-radius: 4px; margin: 20px 0;">
        <p style="margin: 0; font-weight: bold; color: #92400e;">💡 Tip:</p>
        <p style="margin: 5px 0 0 0; color: #78350f;">Voer je volgnummer in op de PostNL site voor real-time updates</p>
      </div>

      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">

      <p style="color: #6b7280; font-size: 12px;">
        Problemen met je verzending? <a href="https://gameshopenter.nl/contact" style="color: #10b981; text-decoration: none;">Neem contact op</a>
      </p>
      <p style="color: #6b7280; font-size: 12px;">
        &copy; 2024 Gameshop Enter
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.GMAIL_EMAIL,
    to: data.customerEmail,
    subject: `Je bestelling is verzonden (#${data.orderNumber})`,
    html,
  });
}

export async function sendContactReply(data: ContactReplyData): Promise<void> {
  if (!process.env.GMAIL_EMAIL || !process.env.GMAIL_PASSWORD) {
    console.warn('Email not configured - skipping contact reply email');
    return;
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #10b981;">Bedankt voor je bericht!</h1>
      <p>Hallo ${data.customerName},</p>
      <p>We hebben je bericht ontvangen. Hier is ons antwoord:</p>

      <div style="background-color: #f3f4f6; padding: 15px; border-left: 4px solid #10b981; border-radius: 4px; margin: 20px 0;">
        <p style="margin: 0; white-space: pre-wrap;">${data.aiResponse}</p>
      </div>

      <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
        Dit is een automatisch gegenereerd antwoord. Voor meer hulp, <a href="https://gameshopenter.nl/contact" style="color: #10b981;">stuur ons een bericht</a>.
      </p>
      <p style="color: #6b7280; font-size: 12px;">
        &copy; 2024 Gameshop Enter
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.GMAIL_EMAIL,
    to: data.customerEmail,
    subject: `Re: ${data.subject}`,
    html,
  });
}
