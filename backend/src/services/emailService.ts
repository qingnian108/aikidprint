import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

interface EmailOptions {
  to: string;
  childName: string;
  weekNumber: number;
  theme: string;
  pdfBuffer: Buffer;
}

class EmailService {
  private transporter: Transporter | null = null;

  /**
   * Initialize email transporter
   */
  async initialize() {
    // Configure with your email service (Gmail, SendGrid, etc.)
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    // Verify connection
    try {
      await this.transporter.verify();
      console.log('✅ Email service initialized');
    } catch (error) {
      console.error('❌ Email service initialization failed:', error);
    }
  }

  /**
   * Send weekly pack email
   */
  async sendWeeklyPack(options: EmailOptions) {
    if (!this.transporter) {
      await this.initialize();
    }

    const { to, childName, weekNumber, theme, pdfBuffer } = options;

    const mailOptions = {
      from: `"AI Kid Print" <${process.env.SMTP_USER}>`,
      to,
      subject: `📦 ${childName}'s Week ${weekNumber} Learning Pack is Ready!`,
      html: this.generateWeeklyPackHTML(childName, weekNumber, theme),
      attachments: [
        {
          filename: `${childName}-Week-${weekNumber}-${theme}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    try {
      const info = await this.transporter!.sendMail(mailOptions);
      console.log(`✅ Email sent to ${to}: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error(`❌ Failed to send email to ${to}:`, error);
      throw error;
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(to: string, childName: string) {
    if (!this.transporter) {
      await this.initialize();
    }

    const mailOptions = {
      from: `"AI Kid Print" <${process.env.SMTP_USER}>`,
      to,
      subject: `🎉 Welcome to AI Kid Print, ${childName}'s Family!`,
      html: this.generateWelcomeHTML(childName)
    };

    try {
      const info = await this.transporter!.sendMail(mailOptions);
      console.log(`✅ Welcome email sent to ${to}`);
      return info;
    } catch (error) {
      console.error(`❌ Failed to send welcome email:`, error);
      throw error;
    }
  }

  /**
   * Send subscription confirmation
   */
  async sendSubscriptionConfirmation(to: string, plan: string, nextBillingDate: string) {
    if (!this.transporter) {
      await this.initialize();
    }

    const mailOptions = {
      from: `"AI Kid Print" <${process.env.SMTP_USER}>`,
      to,
      subject: '✅ Subscription Confirmed - AI Kid Print Pro',
      html: this.generateSubscriptionHTML(plan, nextBillingDate)
    };

    try {
      const info = await this.transporter!.sendMail(mailOptions);
      console.log(`✅ Subscription confirmation sent to ${to}`);
      return info;
    } catch (error) {
      console.error(`❌ Failed to send subscription confirmation:`, error);
      throw error;
    }
  }

  /**
   * Generate HTML for weekly pack email
   */
  private generateWeeklyPackHTML(childName: string, weekNumber: number, theme: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
          body {
            font-family: 'Quicksand', 'Comic Sans MS', 'Arial Rounded MT', Arial, sans-serif;
            background-color: #fcfbf7;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border: 4px solid #000;
            border-radius: 16px;
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #ffd60a 0%, #7bd3ea 100%);
            padding: 40px 20px;
            text-align: center;
            border-bottom: 4px solid #000;
          }
          .header h1 {
            margin: 0;
            font-size: 32px;
            font-weight: bold;
            color: #000;
          }
          .content {
            padding: 40px 20px;
          }
          .emoji {
            font-size: 64px;
            text-align: center;
            margin: 20px 0;
          }
          .button {
            display: inline-block;
            background: #a1e44d;
            color: #000;
            padding: 16px 32px;
            text-decoration: none;
            font-weight: bold;
            border: 3px solid #000;
            border-radius: 12px;
            margin: 20px 0;
          }
          .footer {
            background: #f5f5f5;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 2px solid #e0e0e0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📦 Weekly Pack Ready!</h1>
          </div>
          <div class="content">
            <div class="emoji">🎉</div>
            <h2 style="text-align: center; color: #000;">Hi ${childName}'s Family!</h2>
            <p style="font-size: 18px; line-height: 1.6; color: #333;">
              Your <strong>Week ${weekNumber}</strong> learning pack is ready! This week's theme is <strong>${theme}</strong>.
            </p>
            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              The PDF is attached to this email. Simply download, print, and watch ${childName} learn and have fun!
            </p>
            <div style="text-align: center;">
              <a href="https://aikidprint.com/dashboard" class="button">
                View in Dashboard →
              </a>
            </div>
            <hr style="border: none; border-top: 2px dashed #e0e0e0; margin: 30px 0;">
            <h3 style="color: #000;">📝 This Week's Activities:</h3>
            <ul style="font-size: 16px; line-height: 1.8; color: #333;">
              <li>Letter of the Week</li>
              <li>Number Practice</li>
              <li>Counting Fun</li>
              <li>Pattern Games</li>
              <li>Coloring Page</li>
              <li>Achievement Certificate</li>
            </ul>
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              <strong>💡 Tip:</strong> Use eco mode on your printer to save ink!
            </p>
          </div>
          <div class="footer">
            <p>© 2024 AI Kid Print. All rights reserved.</p>
            <p>
              <a href="https://aikidprint.com/dashboard" style="color: #7bd3ea;">Manage Settings</a> | 
              <a href="https://aikidprint.com/unsubscribe" style="color: #7bd3ea;">Unsubscribe</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate HTML for welcome email
   */
  private generateWelcomeHTML(childName: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'Quicksand', 'Comic Sans MS', 'Arial Rounded MT', Arial, sans-serif; background: #fcfbf7; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border: 4px solid #000; border-radius: 16px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #ffd60a, #a1e44d); padding: 40px 20px; text-align: center; border-bottom: 4px solid #000; }
          .content { padding: 40px 20px; }
          .button { display: inline-block; background: #7bd3ea; color: #000; padding: 16px 32px; text-decoration: none; font-weight: bold; border: 3px solid #000; border-radius: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 36px;">🎉 Welcome to AI Kid Print!</h1>
          </div>
          <div class="content">
            <h2>Hi ${childName}'s Family!</h2>
            <p style="font-size: 18px; line-height: 1.6;">
              We're thrilled to have you join our community of 10,000+ families making learning fun and personalized!
            </p>
            <p style="font-size: 16px; line-height: 1.6;">
              Here's what you can do next:
            </p>
            <ul style="font-size: 16px; line-height: 1.8;">
              <li>Generate your first personalized worksheet</li>
              <li>Set up weekly auto-delivery</li>
              <li>Explore our themed packs</li>
            </ul>
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://aikidprint.com/weekly-pack" class="button">
                Create First Pack →
              </a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate HTML for subscription confirmation
   */
  private generateSubscriptionHTML(plan: string, nextBillingDate: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'Quicksand', 'Comic Sans MS', 'Arial Rounded MT', Arial, sans-serif; background: #fcfbf7; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border: 4px solid #000; border-radius: 16px; padding: 40px; }
          .badge { background: #ffd60a; border: 2px solid #000; padding: 8px 16px; border-radius: 20px; display: inline-block; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>✅ Subscription Confirmed!</h1>
          <p style="font-size: 18px;">
            You're now a <span class="badge">👑 ${plan} Member</span>
          </p>
          <p style="font-size: 16px; line-height: 1.6;">
            Your subscription is active and you now have access to all premium features!
          </p>
          <p style="font-size: 14px; color: #666;">
            Next billing date: <strong>${nextBillingDate}</strong>
          </p>
        </div>
      </body>
      </html>
    `;
  }
}

export default new EmailService();
