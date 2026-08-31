import nodemailer from 'nodemailer';

export interface SmtpConfig {
  host?: string;
  port?: number;
  secure?: boolean;
  user?: string;
  pass?: string;
  fromName?: string;
  fromEmail?: string;
}

export interface EmailAttachmentPayload {
  id?: string;
  name: string;
  size?: number;
  type?: string;
  dataUrl?: string; // base64 data url
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  body: string;
  isHtml?: boolean;
  cc?: string;
  bcc?: string;
  attachments?: EmailAttachmentPayload[];
  smtpConfig?: SmtpConfig;
}

// Helper to resolve effective SMTP configuration from params, env variables, or default
export function getEffectiveSmtpConfig(customConfig?: SmtpConfig): SmtpConfig {
  const host = customConfig?.host || process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = customConfig?.port ? Number(customConfig.port) : (process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 465);
  const secure = customConfig?.secure !== undefined ? Boolean(customConfig.secure) : (port === 465);
  const user = customConfig?.user || process.env.SMTP_USER || process.env.GMAIL_USER || '';
  const pass = customConfig?.pass || process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || '';
  const fromName = customConfig?.fromName || process.env.SMTP_FROM_NAME || 'ADCS';
  const fromEmail = customConfig?.fromEmail || process.env.SMTP_FROM || 'info@theadcs.com';

  return {
    host,
    port,
    secure,
    user,
    pass,
    fromName,
    fromEmail,
  };
}

// Convert Base64 data URL to buffer for nodemailer
function parseAttachment(att: EmailAttachmentPayload) {
  if (!att.dataUrl || !att.dataUrl.includes('base64,')) {
    return {
      filename: att.name,
      content: att.dataUrl || '',
      contentType: att.type || 'application/octet-stream',
    };
  }

  const parts = att.dataUrl.split('base64,');
  const base64Data = parts[1];
  const buffer = Buffer.from(base64Data, 'base64');

  return {
    filename: att.name,
    content: buffer,
    contentType: att.type || 'application/octet-stream',
  };
}

// Primary send email handler
export async function sendEmailViaSmtp(options: SendEmailOptions) {
  const config = getEffectiveSmtpConfig(options.smtpConfig);

  // Check if credentials are present
  if (!config.user || !config.pass) {
    return {
      success: false,
      delivered: false,
      method: 'not_configured',
      error: 'SMTP credentials (username and password/app password) are not configured yet.',
      details: 'Please enter your SMTP details or Gmail App Password in Settings > Email & SMTP Configuration, or configure SMTP_USER and SMTP_PASS environment variables.',
      configSummary: {
        host: config.host,
        port: config.port,
        userProvided: Boolean(config.user),
        passProvided: Boolean(config.pass),
      },
    };
  }

  try {
    // Create Nodemailer Transporter
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure, // true for 465, false for 587
      auth: {
        user: config.user,
        pass: config.pass,
      },
      tls: {
        rejectUnauthorized: false, // Prevents self-signed cert blocks on custom corporate mail servers
      },
    });

    // Format attachments
    const mailAttachments = (options.attachments || []).map(parseAttachment);

    // Format HTML or plain text body with clean ADCS signature and no-reply automated notice
    const noReplyNoticeHtml = `
      <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 11px; color: #64748b; line-height: 1.6;">
        <div style="font-weight: 700; color: #0f172a; margin-bottom: 2px;">ADCS</div>
        <div>This is an automated notification. Please do not reply directly to this email as incoming replies to this address are not monitored.</div>
      </div>
    `;

    const noReplyNoticeText = `\n\n----------------------------------------\nADCS\nPlease do not reply directly to this email. This is an automated notification.`;

    const isHtml = options.isHtml || options.body.includes('<p>') || options.body.includes('<div>') || options.body.includes('<br>');
    const htmlBody = isHtml
      ? (options.body.includes('do not reply') ? options.body : `${options.body}${noReplyNoticeHtml}`)
      : `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #1e293b; white-space: pre-wrap;">${options.body}</div>${noReplyNoticeHtml}`;

    const textBody = options.body.includes('do not reply')
      ? options.body
      : `${options.body}${noReplyNoticeText}`;

    // Sender header: Always show "ADCS" as the display name and info@theadcs.com as the email
    const senderDisplayName = config.fromName || 'ADCS';
    const effectiveFromEmail = config.fromEmail || 'info@theadcs.com';
    const fromHeader = `"${senderDisplayName}" <${effectiveFromEmail}>`;

    const info = await transporter.sendMail({
      from: fromHeader,
      sender: fromHeader,
      replyTo: `"${senderDisplayName}" <${effectiveFromEmail}>`,
      to: options.to,
      cc: options.cc || undefined,
      bcc: options.bcc || undefined,
      subject: options.subject,
      text: textBody,
      html: htmlBody,
      attachments: mailAttachments,
    });

    console.log('✅ Real email dispatched via SMTP successfully:', info.messageId);

    return {
      success: true,
      delivered: true,
      method: 'smtp',
      messageId: info.messageId,
      accepted: info.accepted,
      response: info.response,
      recipient: options.to,
      timestamp: new Date().toISOString(),
    };
  } catch (err: any) {
    console.error('❌ SMTP Dispatch Error:', err);
    return {
      success: false,
      delivered: false,
      method: 'smtp_failed',
      error: err.message || 'Failed to dispatch email via SMTP server',
      details: err.code === 'EAUTH' 
        ? 'Invalid SMTP credentials. If using Gmail, make sure to use a 16-character Google App Password (not your normal Google login password).' 
        : err.message,
    };
  }
}

// Test SMTP connection verification
export async function verifySmtpConnection(customConfig?: SmtpConfig) {
  const config = getEffectiveSmtpConfig(customConfig);

  if (!config.user || !config.pass) {
    return {
      success: false,
      error: 'SMTP username and app password are required to test connection.',
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    await transporter.verify();
    return {
      success: true,
      message: `SMTP connection verified successfully with ${config.host}:${config.port} (${config.user})`,
      host: config.host,
      port: config.port,
      user: config.user,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to connect to SMTP server',
      details: err.code === 'EAUTH'
        ? 'Authentication failed. If using Gmail, please generate a 16-character App Password at myaccount.google.com/apppasswords.'
        : err.message,
    };
  }
}
