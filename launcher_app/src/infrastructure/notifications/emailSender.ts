import "dotenv/config";
import nodemailer from "nodemailer";

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn("[emailSender] SMTP no configurado (faltan SMTP_HOST, SMTP_USER, SMTP_PASS).");
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

const from = process.env.EMAIL_FROM || "Launcher <noreply@launcher.app>";

export async function sendEmail(
  to: string,
  subject: string,
  body: string,
): Promise<void> {
  const transporter = getTransporter();
  if (!transporter) return;

  await transporter.sendMail({
    from,
    to,
    subject,
    text: body,
  });
}
