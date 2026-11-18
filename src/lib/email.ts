import nodemailer from "nodemailer";

type PasswordResetEmail = {
  to: string;
  url: string;
};

export async function sendPasswordResetEmail({ to, url }: PasswordResetEmail) {
  const host = process.env.SMTP_HOST;
  if (!host) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SMTP_HOST must be configured in production");
    }

    console.info(`[development only] Password reset link for ${to}: ${url}`);
    return;
  }

  const port = Number(process.env.SMTP_PORT ?? "587");
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("SMTP_PORT must be a valid TCP port");
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASSWORD
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          }
        : undefined,
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM ?? "Finance App <no-reply@example.com>",
    to,
    subject: "Reset your Finance App password",
    text: `Use this one-time link to reset your password. It expires soon.\n\n${url}\n\nIf you did not request this, you can ignore this email.`,
  });
}
