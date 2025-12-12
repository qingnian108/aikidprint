import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

async function testEmail() {
  console.log('📧 Testing email configuration...\n');
  
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  console.log('Configuration:');
  console.log(`  Host: ${host}`);
  console.log(`  Port: ${port}`);
  console.log(`  User: ${user}`);
  console.log(`  Pass: ${pass ? '****' + pass.slice(-4) : 'NOT SET'}`);
  console.log('');

  if (!user || !pass) {
    console.error('❌ SMTP credentials not configured!');
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });

  try {
    // 验证连接
    console.log('🔗 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful!\n');

    // 发送测试邮件
    console.log('📤 Sending test email...');
    const info = await transporter.sendMail({
      from: `"DuckLearn Test" <${user}>`,
      to: user, // 发给自己
      subject: '🎉 DuckLearn Email Test - Success!',
      html: `
        <div style="font-family: sans-serif; padding: 20px; background: #FFF9E6;">
          <h1 style="color: #333;">🦆 Email Configuration Works!</h1>
          <p>If you're seeing this email, your SMTP configuration is correct.</p>
          <p>Time: ${new Date().toLocaleString()}</p>
          <hr>
          <p style="color: #888; font-size: 12px;">This is a test email from DuckLearn backend.</p>
        </div>
      `
    });

    console.log('✅ Test email sent successfully!');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`\n📬 Check your inbox at: ${user}`);
  } catch (error: any) {
    console.error('❌ Email test failed:', error.message);
    if (error.code === 'EAUTH') {
      console.error('\n💡 Tip: Make sure you are using an App Password, not your regular Gmail password.');
    }
    process.exit(1);
  }
}

testEmail();
