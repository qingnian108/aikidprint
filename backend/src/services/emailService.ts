import nodemailer from 'nodemailer';

// 创建邮件传输器
const createTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    console.warn('⚠️ SMTP credentials not configured');
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });
};

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType: string;
  }>;
}

/**
 * 发送邮件
 */
export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  const transporter = createTransporter();
  
  if (!transporter) {
    console.error('❌ Email transporter not configured');
    return false;
  }

  try {
    const info = await transporter.sendMail({
      from: `"DuckLearn" <${process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      attachments: options.attachments
    });

    console.log('✅ Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    return false;
  }
};

/**
 * 发送 Weekly Pack 邮件
 */
export const sendWeeklyPackEmail = async (
  to: string,
  childName: string,
  theme: string,
  weekNumber: number,
  pdfBuffer: Buffer
): Promise<boolean> => {
  const themeEmoji: Record<string, string> = {
    dinosaur: '🦕',
    space: '🚀',
    ocean: '🐠',
    safari: '🦁',
    unicorn: '🦄',
    vehicles: '🚗'
  };

  const emoji = themeEmoji[theme] || '📚';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Comic Sans MS', cursive, sans-serif; background: #FFF9E6; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; border: 4px solid #333; padding: 30px; }
        .header { text-align: center; margin-bottom: 20px; }
        .title { font-size: 28px; font-weight: bold; color: #333; margin: 0; }
        .subtitle { color: #666; font-size: 14px; }
        .emoji { font-size: 60px; margin: 20px 0; }
        .content { text-align: center; }
        .highlight { background: #FFE066; padding: 15px; border-radius: 10px; border: 2px solid #333; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #888; font-size: 12px; }
        .btn { display: inline-block; background: #90EE90; color: #333; padding: 12px 24px; border-radius: 10px; border: 3px solid #333; text-decoration: none; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="title">🎉 ${childName}'s Weekly Pack is Ready!</h1>
          <p class="subtitle">Week ${weekNumber} • ${theme.charAt(0).toUpperCase() + theme.slice(1)} Theme</p>
        </div>
        
        <div class="content">
          <div class="emoji">${emoji}</div>
          
          <div class="highlight">
            <p style="margin: 0; font-size: 16px;">
              <strong>15 fun learning pages</strong> are attached to this email!
            </p>
          </div>
          
          <p>Print them out and enjoy learning together! 🖨️</p>
          
          <p style="margin-top: 30px;">
            <a href="https://ducklearn.com/dashboard" class="btn">
              View More in Dashboard →
            </a>
          </p>
        </div>
        
        <div class="footer">
          <p>You're receiving this because you enabled Weekly Delivery.</p>
          <p>To change settings, visit your Dashboard.</p>
          <p>© ${new Date().getFullYear()} DuckLearn - Making Learning Fun!</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: `${emoji} ${childName}'s Week ${weekNumber} Learning Pack is Ready!`,
    html,
    attachments: [{
      filename: `${childName}_Week${weekNumber}_${theme}.pdf`,
      content: pdfBuffer,
      contentType: 'application/pdf'
    }]
  });
};

export default { sendEmail, sendWeeklyPackEmail };
