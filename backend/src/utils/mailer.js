import nodemailer from "nodemailer";

// Email is optional. A missing mail server must not block bookings, orders, or password-reset responses.
export async function sendMail({ to, subject, text }) {
  if (!process.env.SMTP_HOST) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[mail skipped] To: ${to}\nSubject: ${subject}\n${text}`);
    }
    return { sent: false };
  }

  try {
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    });
    await transport.sendMail({
      from: process.env.MAIL_FROM || "BookEasy ET <noreply@bookeasy.et>",
      to,
      subject,
      text,
    });
    return { sent: true };
  } catch (err) {
    console.error("email failed:", err.message);
    return { sent: false };
  }
}
