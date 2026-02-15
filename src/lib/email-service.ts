import nodemailer from 'nodemailer';
import type { Transporter, SendMailOptions } from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export interface OrderConfirmationData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  shipping: number;
  total: number;
  shippingAddress: {
    street: string;
    number: string;
    postcode: string;
    city: string;
  };
  paymentMethod: string;
  timestamp: string;
}

export interface WelcomeEmailData {
  email: string;
  discountCode: string;
  discountPercentage: number;
}

export interface AbandonedCartData {
  customerEmail: string;
  customerName: string;
  cartItems: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  cartTotal: number;
  cartUrl: string;
  reminderType: 'first' | 'second' | 'third'; // 5min, 24h, 72h
}

interface EmailStatus {
  messageId: string;
  timestamp: string;
  status: 'sent' | 'failed' | 'pending';
  error?: string;
}

class EmailService {
  private transporter: Transporter | null = null;
  private emailQueue: Map<string, EmailStatus> = new Map();
  private maxRetries = 3;
  private retryDelay = 5000; // 5 seconds

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    // In development, use Ethereal test account
    // In production, use Gmail SMTP or other service
    if (process.env.NODE_ENV === 'production') {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });
    } else {
      // Development: log emails to console
      this.transporter = nodemailer.createTransport({
        host: 'localhost',
        port: 1025,
        secure: false,
      });
    }
  }

  async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.transporter) {
      return { success: false, error: 'Email transporter not initialized' };
    }

    try {
      const mailOptions: SendMailOptions = {
        from: `Gameshop Enter <${process.env.GMAIL_USER || 'noreply@gameshopenter.nl'}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || 'Dit is een HTML e-mail. Zet uw e-mailclient op HTML-modus.',
        replyTo: options.replyTo || 'gameshopenter@gmail.com',
      };

      const result = await this.transporter.sendMail(mailOptions);

      // Track email status
      const messageId = result.messageId || `local-${Date.now()}`;
      this.emailQueue.set(messageId, {
        messageId,
        timestamp: new Date().toISOString(),
        status: 'sent',
      });

      return { success: true, messageId };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Email send error:', errorMessage);

      return { success: false, error: errorMessage };
    }
  }

  async sendOrderConfirmation(data: OrderConfirmationData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const html = this.generateOrderConfirmationHTML(data);

    return this.sendEmail({
      to: data.customerEmail,
      subject: `Bestelbevestiging - ${data.orderNumber}`,
      html,
      text: `Bedankt voor je bestelling ${data.orderNumber}. Je zult binnenkort een track & trace e-mail ontvangen.`,
    });
  }

  async sendWelcomeEmail(data: WelcomeEmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const html = this.generateWelcomeEmailHTML(data);

    return this.sendEmail({
      to: data.email,
      subject: 'Welkom bij Gameshop Enter - Je kortingscode!',
      html,
      text: `Welkom! Je ontvangt ${data.discountPercentage}% korting met code: ${data.discountCode}`,
    });
  }

  async sendAbandonedCartEmail(data: AbandonedCartData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const html = this.generateAbandonedCartHTML(data);
    const delayText = {
      first: '5 minuten geleden',
      second: '24 uur geleden',
      third: '72 uur geleden',
    }[data.reminderType];

    return this.sendEmail({
      to: data.customerEmail,
      subject: `Je hebt iets in je winkelwagen laten liggen!`,
      html,
      text: `Hoi ${data.customerName}, je liet ${data.cartItems.length} item(s) achter in je winkelwagen ${delayText}.`,
    });
  }

  private generateOrderConfirmationHTML(data: OrderConfirmationData): string {
    const itemsHTML = data.items
      .map(
        (item) =>
          `<tr>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">€${item.price.toFixed(2)}</td>
        </tr>`
      )
      .join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981, #14b8a6); color: white; padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 20px; }
          .order-number { font-size: 24px; font-weight: bold; margin: 10px 0; }
          .content { background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          .summary { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .summary-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
          .summary-row.total { font-weight: bold; font-size: 18px; border-bottom: none; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div>Gameshop Enter</div>
            <div class="order-number">${data.orderNumber}</div>
            <div>Bedankt voor je bestelling!</div>
          </div>

          <div class="content">
            <h2>Hallo ${data.customerName},</h2>
            <p>Je bestelling is succesvol ontvangen. Hier is een overzicht van je bestelling:</p>

            <table>
              <thead>
                <tr style="background: #e5e7eb;">
                  <th style="padding: 10px; text-align: left;">Product</th>
                  <th style="padding: 10px; text-align: center;">Aantal</th>
                  <th style="padding: 10px; text-align: right;">Prijs</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHTML}
              </tbody>
            </table>

            <div class="summary">
              <div class="summary-row">
                <span>Subtotaal:</span>
                <span>€${data.subtotal.toFixed(2)}</span>
              </div>
              <div class="summary-row">
                <span>Verzending:</span>
                <span>€${data.shipping.toFixed(2)}</span>
              </div>
              <div class="summary-row total">
                <span>Totaal:</span>
                <span>€${data.total.toFixed(2)}</span>
              </div>
            </div>

            <h3>Verzendadres:</h3>
            <p>
              ${data.shippingAddress.street} ${data.shippingAddress.number}<br>
              ${data.shippingAddress.postcode} ${data.shippingAddress.city}
            </p>

            <h3>Betaalmethode:</h3>
            <p>${data.paymentMethod}</p>

            <p><strong>Je ontvangt binnenkort een e-mail met de verzendgegevens en track-and-trace code.</strong></p>
          </div>

          <div class="footer">
            <p>Vragen? Neem contact op: gameshopenter@gmail.com</p>
            <p>&copy; ${new Date().getFullYear()} Gameshop Enter. Alle rechten voorbehouden.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateWelcomeEmailHTML(data: WelcomeEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981, #14b8a6); color: white; padding: 30px; text-align: center; border-radius: 8px; margin-bottom: 20px; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .discount-box { background: white; padding: 20px; border-radius: 8px; border: 2px solid #10b981; text-align: center; margin: 15px 0; }
          .discount-code { font-size: 32px; font-weight: bold; color: #10b981; font-family: monospace; margin: 10px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welkom bij Gameshop Enter!</h1>
            <p>Dé Pokémon specialist van Nederland</p>
          </div>

          <div class="content">
            <h2>Hallo,</h2>
            <p>Bedankt dat je je aanmeldt voor onze nieuwsbrief! Je ontvangt van ons de nieuwste aanbiedingen en updates over retro Nintendo games.</p>

            <p><strong>Als welkomstcadeautje krijg je ${data.discountPercentage}% korting op je eerste aankoop!</strong></p>

            <div class="discount-box">
              <div>Je kortingscode:</div>
              <div class="discount-code">${data.discountCode}</div>
              <div style="color: #666; font-size: 14px;">Gebruik deze code bij het afrekenen</div>
            </div>

            <p>Deze kortingscode is eenmalig geldig op je eerste bestelling.</p>

            <p><strong>Waarom kiezen voor Gameshop Enter?</strong></p>
            <ul>
              <li>Originele Pokémon games</li>
              <li>Persoonlijk getest en gecontroleerd</li>
              <li>Snelle verzending (PostNL)</li>
              <li>3000+ tevreden klanten</li>
              <li>5.0 sterren review rating</li>
            </ul>

            <p>Veel plezier met shoppen!</p>
          </div>

          <div class="footer">
            <p>Gameshop Enter | gameshopenter@gmail.com</p>
            <p>&copy; ${new Date().getFullYear()} Gameshop Enter. Alle rechten voorbehouden.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateAbandonedCartHTML(data: AbandonedCartData): string {
    const itemsHTML = data.cartItems
      .map(
        (item) =>
          `<tr>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">€${item.price.toFixed(2)}</td>
        </tr>`
      )
      .join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f97316, #fb923c); color: white; padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 20px; }
          .content { background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          .total-box { background: white; padding: 15px; border-radius: 8px; text-align: right; font-size: 18px; font-weight: bold; margin: 15px 0; }
          .cta-button { display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 8px; margin: 15px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Je hebt iets vergeten!</h2>
          </div>

          <div class="content">
            <h2>Hallo ${data.customerName},</h2>
            <p>Je liet enkele items in je winkelwagen liggen. Je kunt je aankoop nog altijd afmaken:</p>

            <table>
              <thead>
                <tr style="background: #e5e7eb;">
                  <th style="padding: 10px; text-align: left;">Product</th>
                  <th style="padding: 10px; text-align: center;">Aantal</th>
                  <th style="padding: 10px; text-align: right;">Prijs</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHTML}
              </tbody>
            </table>

            <div class="total-box">
              Totaal: €${data.cartTotal.toFixed(2)}
            </div>

            <p style="text-align: center;">
              <a href="${data.cartUrl}" class="cta-button">Afmaken aankoop</a>
            </p>

            <p style="color: #666; font-size: 14px;">Deze items liggen nog 7 dagen in je winkelwagen.</p>
          </div>

          <div class="footer">
            <p>Vragen? Neem contact op: gameshopenter@gmail.com</p>
            <p>&copy; ${new Date().getFullYear()} Gameshop Enter. Alle rechten voorbehouden.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getEmailStatus(messageId: string): EmailStatus | null {
    return this.emailQueue.get(messageId) || null;
  }

  getAllEmailStatuses(): EmailStatus[] {
    return Array.from(this.emailQueue.values());
  }

  clearOldEmails(olderThanHours: number = 24) {
    const cutoffTime = Date.now() - olderThanHours * 60 * 60 * 1000;
    const keysToDelete: string[] = [];

    this.emailQueue.forEach((status, key) => {
      if (new Date(status.timestamp).getTime() < cutoffTime) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => this.emailQueue.delete(key));
    return keysToDelete.length;
  }
}

// Export singleton instance
export const emailService = new EmailService();
