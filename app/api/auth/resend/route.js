import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getAuthUsers, saveAuthUsers } from '../../../../lib/mockData';

export async function POST(req) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ success: false, message: 'Missing email' }, { status: 400 });

  const users = await getAuthUsers();
  const user = users.find((u) => String(u.email || '').toLowerCase() === String(email || '').toLowerCase());
  if (!user) return NextResponse.json({ success: false, message: 'No pending registration for this email' }, { status: 404 });
  if (user.verified) return NextResponse.json({ success: true, message: 'Already verified' });

  const now = Date.now();
  const MIN_INTERVAL = 60 * 1000; // 1 minute between resends
  if (user.otpSentAt && now - Number(user.otpSentAt) < MIN_INTERVAL) {
    return NextResponse.json({ success: false, message: 'Please wait before requesting another code.' }, { status: 429 });
  }

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const otpHash = await bcrypt.hash(otp, 10);
  const otpExpires = now + 10 * 60 * 1000; // 10 minutes

  user.otpHash = otpHash;
  user.otpExpires = otpExpires;
  user.otpSentAt = now;
  if (process.env.NODE_ENV !== 'production') user.lastOtp = otp;

  await saveAuthUsers(users);

  const smtpConfigured = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[DEV OTP RESEND] ${user.email} -> ${otp}`);
  }

  let previewUrl;
  try {
    const nodemailer = await import('nodemailer');
    let transporter;
    if (smtpConfigured) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
    } else {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: { user: testAccount.user, pass: testAccount.pass },
      });
    }

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@example.com',
      to: user.email,
      subject: 'Your verification code',
      text: `Your verification code is ${otp}. It expires in 10 minutes.`,
    });

    if (!smtpConfigured) {
      try {
        previewUrl = nodemailer.getTestMessageUrl(info);
        console.log('[DEV EMAIL PREVIEW]', previewUrl);
      } catch (e) {}
    }
  } catch (e) {
    console.error('Failed to send OTP email:', e?.message || e);
  }

  const responseData = {
    success: true,
    message: smtpConfigured
      ? 'If SMTP is configured, the OTP was resent to the provided email.'
      : 'SMTP is not configured. OTP is generated in development only and will be auto-filled in the OTP box.',
    otp: !smtpConfigured && process.env.NODE_ENV !== 'production' ? otp : null,
  };

  return NextResponse.json(responseData);
}
