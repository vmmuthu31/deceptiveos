import { getAdminUserEmails } from '@/server/security/auth';
import { BeaconEvent, SessionEvent } from '@/shared/types';
import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = Number(process.env.SMTP_PORT) || 587;
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = (process.env.SMTP_PASS || '').replace(/\s+/g, '');
const SMTP_FROM = process.env.SMTP_FROM || (SMTP_USER ? `CipherNest Security <${SMTP_USER}>` : 'CipherNest Security <alerts@ciphernest.ai>');

function createTransporter() {
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
}


export async function getDynamicAlertRecipients(overrideEmail?: string): Promise<string[]> {
  if (overrideEmail && overrideEmail.trim().length > 0) {
    return [overrideEmail.trim()];
  }
  return await getAdminUserEmails();
}

export async function sendTestAlertEmail(toEmail?: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const recipients = await getDynamicAlertRecipients(toEmail);
  const transporter = createTransporter();

  try {
    const info = await transporter.sendMail({
      from: SMTP_FROM,
      to: recipients.join(', '),
      subject: '🚨 [CipherNest] Security Alert Engine Test Notification',
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 24px; border-radius: 12px; color: #0f172a;">
          <h2 style="color: #2563eb; margin-top: 0;">CipherNest Security Alert System</h2>
          <p style="font-size: 14px; color: #475569;">
            This is a verified test notification confirming your <strong>Nodemailer SMTP Integration</strong> is operational.
          </p>
          <div style="background-color: #ffffff; padding: 16px; border: 1px solid #e2e8f0; border-radius: 8px; font-family: monospace; font-size: 12px;">
            <p><strong>Status:</strong> OPERATIONAL</p>
            <p><strong>SMTP Server:</strong> ${SMTP_HOST}:${SMTP_PORT}</p>
            <p><strong>Sender:</strong> ${SMTP_FROM}</p>
            <p><strong>Dynamic Admin Recipients:</strong> ${recipients.join(', ')}</p>
          </div>
          <p style="font-size: 11px; color: #94a3b8; margin-top: 20px;">
            CipherNest Adversarial AI Defense Engine • Dynamic Admin Recipient Alert Engine
          </p>
        </div>
      `,
    });

    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    return { success: false, error: error.message || 'SMTP Connection Error' };
  }
}

export async function sendHoneypotBreachEmail(event: SessionEvent): Promise<boolean> {
  const recipients = await getDynamicAlertRecipients();
  const transporter = createTransporter();

  try {
    await transporter.sendMail({
      from: SMTP_FROM,
      to: recipients.join(', '),
      subject: `🚨 [CRITICAL ALERT] Honeypot Breach on ${event.honeypotName}`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 24px; border-radius: 12px; color: #0f172a;">
          <h2 style="color: #ef4444; margin-top: 0;">🚨 Critical Honeypot Breach Detected</h2>
          <p style="font-size: 14px; color: #475569;">
            An incident was trapped on decoy container <strong>${event.honeypotName}</strong>.
          </p>
          <div style="background-color: #ffffff; padding: 16px; border: 1px solid #e2e8f0; border-radius: 8px; font-family: monospace; font-size: 12px;">
            <p><strong>Honeypot:</strong> ${event.honeypotName}</p>
            <p><strong>Attacker IP:</strong> ${event.attackerIp} (${event.location})</p>
            <p><strong>Incident Type:</strong> ${event.kind.toUpperCase()}</p>
            <p><strong>Payload:</strong> ${event.payload}</p>
            <p><strong>Timestamp:</strong> ${new Date(event.timestamp).toLocaleString()}</p>
            <p><strong>Dispatched To:</strong> ${recipients.join(', ')}</p>
          </div>
        </div>
      `,
    });
    return true;
  } catch {
    return false;
  }
}

export async function sendBeaconCallbackEmail(beacon: BeaconEvent): Promise<boolean> {
  const recipients = await getDynamicAlertRecipients();
  const transporter = createTransporter();

  try {
    await transporter.sendMail({
      from: SMTP_FROM,
      to: recipients.join(', '),
      subject: `⚠️ [CANARY ALERT] Watermark Beacon Triggered: ${beacon.documentTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 24px; border-radius: 12px; color: #0f172a;">
          <h2 style="color: #f59e0b; margin-top: 0;">⚠️ Steganographic Watermark Beacon Triggered</h2>
          <p style="font-size: 14px; color: #475569;">
            A watermarked document was exfiltrated and opened on an external network.
          </p>
          <div style="background-color: #ffffff; padding: 16px; border: 1px solid #e2e8f0; border-radius: 8px; font-family: monospace; font-size: 12px;">
            <p><strong>Document Title:</strong> ${beacon.documentTitle}</p>
            <p><strong>Watermark Token:</strong> ${beacon.watermarkToken}</p>
            <p><strong>Exfiltration IP:</strong> ${beacon.sourceIp} (${beacon.location})</p>
            <p><strong>User Agent:</strong> ${beacon.userAgent}</p>
            <p><strong>Dispatched To:</strong> ${recipients.join(', ')}</p>
          </div>
        </div>
      `,
    });
    return true;
  } catch {
    return false;
  }
}

export async function sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
  const transporter = createTransporter();
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

  try {
    await transporter.sendMail({
      from: SMTP_FROM,
      to: email,
      subject: '🔐 [CipherNest] Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 28px; border-radius: 12px; color: #0f172a; max-width: 540px; margin: 0 auto; border: 1px solid #e2e8f0;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #2563eb; margin: 0; font-size: 20px; text-transform: uppercase;">CIPHER<span style="color: #0f172a;">NEST</span></h2>
            <p style="font-size: 11px; color: #64748b; margin-top: 4px; font-family: monospace;">ADVERSARIAL AI DEFENSE ENGINE</p>
          </div>
          <h3 style="color: #0f172a; margin-top: 0; font-size: 16px;">Password Reset Request</h3>
          <p style="font-size: 14px; color: #475569; line-height: 1.5;">
            We received a request to reset your CipherNest account password. Click the button below to specify a new password. This link is valid for <strong>1 hour</strong>.
          </p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${resetUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 10px; font-weight: bold; font-size: 13px; text-decoration: none; display: inline-block;">
              Reset Password Now →
            </a>
          </div>
          <div style="background-color: #ffffff; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-family: monospace; font-size: 11px; color: #64748b; word-break: break-all;">
            Direct Link: ${resetUrl}
          </div>
          <p style="font-size: 11px; color: #94a3b8; margin-top: 24px; text-align: center;">
            If you did not request a password reset, you can safely ignore this email.
          </p>
        </div>
      `,
    });
    return true;
  } catch (err: any) {
    console.error('Password Reset Nodemailer Error:', err?.message || err);
    return false;
  }
}

export async function sendRegistrationOTPEmail(email: string, otpCode: string): Promise<boolean> {
  const transporter = createTransporter();

  try {
    const info = await transporter.sendMail({
      from: SMTP_FROM,
      to: email,
      subject: `🔑 [CipherNest] ${otpCode} is your Email Verification Code`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 28px; border-radius: 12px; color: #0f172a; max-width: 540px; margin: 0 auto; border: 1px solid #e2e8f0;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #2563eb; margin: 0; font-size: 20px; text-transform: uppercase;">CIPHER<span style="color: #0f172a;">NEST</span></h2>
            <p style="font-size: 11px; color: #64748b; margin-top: 4px; font-family: monospace;">ADVERSARIAL AI DEFENSE ENGINE</p>
          </div>
          <h3 style="color: #0f172a; margin-top: 0; font-size: 16px;">Verify Your Email Address</h3>
          <p style="font-size: 14px; color: #475569; line-height: 1.5;">
            Thank you for registering a Security Analyst account on CipherNest. Enter the 6-digit verification code below to complete your registration:
          </p>
          <div style="text-align: center; margin: 24px 0;">
            <div style="background-color: #2563eb; color: #ffffff; padding: 14px 28px; border-radius: 12px; font-weight: bold; font-size: 28px; letter-spacing: 8px; display: inline-block; font-family: monospace;">
              ${otpCode}
            </div>
          </div>
          <p style="font-size: 12px; color: #64748b; text-align: center;">
            This code is valid for <strong>10 minutes</strong>.
          </p>
          <p style="font-size: 11px; color: #94a3b8; margin-top: 24px; text-align: center;">
            If you did not register for a CipherNest account, please ignore this email.
          </p>
        </div>
      `,
    });
    console.log(`[CipherNest Email Sent Successfully]: Message ID ${info.messageId} to ${email}`);
    return true;
  } catch (err: any) {
    console.error('Registration OTP Nodemailer Error:', err?.message || err);
    return false;
  }
}


