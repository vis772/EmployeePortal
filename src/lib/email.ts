/**
 * Email Service
 * Handles sending emails for password reset and other notifications
 */

import nodemailer from 'nodemailer';

// Create transporter - in production, use real SMTP settings
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  try {
    // In development, just log the email
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('📧 Email would be sent (SMTP not configured):');
      console.log('  To:', options.to);
      console.log('  Subject:', options.subject);
      console.log('  Body:', options.text || options.html.substring(0, 200) + '...');
      return true;
    }

    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'Nova Creations <noreply@novacreations.com>',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

export function generatePasswordResetEmail(resetUrl: string): { subject: string; html: string; text: string } {
  const subject = 'Reset Your Nova Creations Password';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #6495ED 0%, #4169E1 100%); padding: 32px; text-align: center; border-radius: 12px 12px 0 0;">
                  <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Nova Creations</h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 32px;">
                  <h2 style="color: #1e293b; margin: 0 0 16px 0; font-size: 24px;">Reset Your Password</h2>
                  <p style="color: #475569; margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">
                    We received a request to reset your password. Click the button below to create a new password:
                  </p>
                  
                  <table role="presentation" style="margin: 32px 0;">
                    <tr>
                      <td>
                        <a href="${resetUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #6495ED 0%, #4169E1 100%); color: white; text-decoration: none; font-weight: bold; font-size: 16px; border-radius: 8px;">
                          Reset Password
                        </a>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="color: #475569; margin: 0 0 16px 0; font-size: 14px; line-height: 1.6;">
                    This link will expire in <strong>1 hour</strong> for security reasons.
                  </p>
                  
                  <p style="color: #475569; margin: 0 0 16px 0; font-size: 14px; line-height: 1.6;">
                    If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
                  </p>
                  
                  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">
                  
                  <p style="color: #94a3b8; margin: 0; font-size: 12px; line-height: 1.6;">
                    If the button above doesn't work, copy and paste this link into your browser:<br>
                    <a href="${resetUrl}" style="color: #6495ED; word-break: break-all;">${resetUrl}</a>
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f8fafc; padding: 24px 32px; text-align: center; border-radius: 0 0 12px 12px;">
                  <p style="color: #94a3b8; margin: 0; font-size: 12px;">
                    © ${new Date().getFullYear()} Nova Creations. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
  
  const text = `
Reset Your Password

We received a request to reset your password for your Nova Creations account.

Click here to reset your password: ${resetUrl}

This link will expire in 1 hour for security reasons.

If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.

© ${new Date().getFullYear()} Nova Creations
  `;

  return { subject, html, text };
}

