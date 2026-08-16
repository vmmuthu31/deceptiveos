import { BeaconEvent, SessionEvent } from '@/shared/types';
import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = Number(process.env.SMTP_PORT) || 587;
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const SMTP_FROM = process.env.SMTP_FROM || 'CipherNest Security <alerts@ciphernest.ai>';
const ALERT_EMAIL_RECIPIENT = process.env.ALERT_EMAIL_RECIPIENT || 'secops@company.com';

function createTransporter() {
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

export async function sendTestAlertEmail(toEmail?: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const recipient = toEmail || ALERT_EMAIL_RECIPIENT;
  const transporter = createTransporter();

  try {
    const info = await transporter.sendMail({
      from: SMTP_FROM,
      to: recipient,
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
            <p><strong>Recipient:</strong> ${recipient}</p>
          </div>
          <p style="font-size: 11px; color: #94a3b8; margin-top: 20px;">
            CipherNest Adversarial AI Defense Engine • Air-Gap Audit Log Verified
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
  const transporter = createTransporter();

  try {
    await transporter.sendMail({
      from: SMTP_FROM,
      to: ALERT_EMAIL_RECIPIENT,
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
  const transporter = createTransporter();

  try {
    await transporter.sendMail({
      from: SMTP_FROM,
      to: ALERT_EMAIL_RECIPIENT,
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
          </div>
        </div>
      `,
    });
    return true;
  } catch {
    return false;
  }
}
