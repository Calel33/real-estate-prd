import { Resend } from "resend";
import { getEnv } from "@/lib/env";
import type { ContactFormInput } from "@/lib/schemas/contact-form";

let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(getEnv().RESEND_API_KEY);
  }
  return _resend;
}

export async function sendContactEmail(
  data: ContactFormInput,
): Promise<{ id: string }> {
  const resend = getResend();
  const env = getEnv();

  const { data: result, error } = await resend.emails.send({
    from: `Disrupt the Block <${env.RESEND_FROM_EMAIL}>`,
    to: env.ADMIN_NOTIFICATION_EMAIL ?? env.RESEND_FROM_EMAIL,
    subject: `New Contact Form Submission from ${data.name}`,
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
  <h2 style="color: #F2EAD3;">New Contact Form Submission</h2>
  <table style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 8px 0; color: #888; width: 80px;">Name:</td>
      <td style="padding: 8px 0;">${escapeHtml(data.name)}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; color: #888;">Email:</td>
      <td style="padding: 8px 0;">${escapeHtml(data.email)}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; color: #888; vertical-align: top;">Message:</td>
      <td style="padding: 8px 0; white-space: pre-wrap;">${escapeHtml(data.message)}</td>
    </tr>
  </table>
  <hr style="border: none; border-top: 1px solid #333; margin: 24px 0;">
  <p style="color: #666; font-size: 12px;">
    This message was submitted via the Disrupt the Block contact form.
  </p>
</body>
</html>`,
  });

  if (error) {
    throw new Error(`Resend API error: ${error.message}`);
  }

  if (!result?.id) {
    throw new Error("Resend returned no email ID");
  }

  return { id: result.id };
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
