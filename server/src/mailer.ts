import nodemailer, { Transporter } from "nodemailer";

type MailerEnv = {
  SMTP_HOST?: string;
  SMTP_PORT?: string;
  SMTP_SECURE?: string;
  SMTP_USER?: string;
  SMTP_PASS?: string;
  SMTP_FROM?: string;
  SMTP_FROM_NAME?: string;
  SMTP_TIMEOUT_MS?: string;
};

let transporter: Transporter | null = null;

function resetTransporter() {
  transporter = null;
}

function envBool(value: string | undefined): boolean | undefined {
  if (value == null) return undefined;
  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "y"].includes(normalized)) return true;
  if (["0", "false", "no", "n"].includes(normalized)) return false;
  return undefined;
}

function getTransporter() {
  if (transporter) return transporter;

  const env = process.env as MailerEnv;

  const host = env.SMTP_HOST ?? "mail.privateemail.com";
  const port = Number(env.SMTP_PORT ?? "465");
  const secure = envBool(env.SMTP_SECURE) ?? port === 465;
  const user = env.SMTP_USER;
  const pass = env.SMTP_PASS;
  const timeoutMs = Number(env.SMTP_TIMEOUT_MS ?? "10000");

  if (!user || !pass) {
    throw new Error("Missing SMTP_USER/SMTP_PASS env vars");
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    pool: true,
    maxConnections: 2,
    maxMessages: 50,
    // Avoid long-hanging requests when SMTP is blocked by host network policy
    connectionTimeout: timeoutMs,
    greetingTimeout: timeoutMs,
    socketTimeout: timeoutMs,
    // For STARTTLS (587), require TLS upgrade after connecting
    ...(secure ? {} : { requireTLS: true }),
    auth: { user, pass },
  });

  return transporter;
}

export async function sendPasswordResetEmail(params: {
  to: string;
  resetUrl: string;
}) {
  const env = process.env as MailerEnv;
  const fromAddress = env.SMTP_FROM ?? env.SMTP_USER;
  const fromName = env.SMTP_FROM_NAME ?? "LOGs Online";

  if (!fromAddress) {
    throw new Error("Missing SMTP_FROM (or SMTP_USER)");
  }

  const subject = "Reset your LOGs Online password";
  const text = `You requested a password reset.\n\nReset link: ${params.resetUrl}\n\nIf you did not request this, you can ignore this email.`;
  const html = `
    <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; line-height: 1.5;">
      <h2 style="margin: 0 0 12px 0;">Reset your password</h2>
      <p style="margin: 0 0 12px 0;">You requested a password reset for your LOGs Online account.</p>
      <p style="margin: 0 0 16px 0;">
        <a href="${params.resetUrl}" style="display: inline-block; padding: 10px 14px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 8px;">Reset Password</a>
      </p>
      <p style="margin: 0 0 8px 0;">If the button doesn’t work, copy and paste this link:</p>
      <p style="margin: 0 0 16px 0;"><a href="${params.resetUrl}">${params.resetUrl}</a></p>
      <p style="margin: 0; color: #6b7280;">If you did not request this, you can safely ignore this email.</p>
    </div>
  `;

  const tx = getTransporter();

  const mail = {
    from: `${fromName} <${fromAddress}>`,
    to: params.to,
    subject,
    text,
    html,
  };

  const isTransient = (err: unknown) => {
    const code = typeof err === "object" && err !== null && "code" in err ? (err as any).code : undefined;
    return code === "ETIMEDOUT" || code === "ECONNRESET" || code === "EAI_AGAIN";
  };

  // Retry once on transient network errors (common on some hosts with SMTP)
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const transporterNow = getTransporter();
      await transporterNow.sendMail(mail);
      return;
    } catch (err) {
      if (attempt >= 2 || !isTransient(err)) throw err;
      resetTransporter();
      await new Promise((r) => setTimeout(r, 500));
    }
  }
}
