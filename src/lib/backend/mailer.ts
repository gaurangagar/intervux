import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

const transporter = nodemailer.createTransport({
  host: "smtp.example.com",
  port: 587,
  secure: false, // use STARTTLS (upgrade connection to TLS after connecting)
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
} as SMTPTransport.Options);

interface InviteEmailProps {
  toEmail: string;
  hostName: string;
  joinLink: string;
}

interface Ratings {
  problemSolving: number;
  communication: number;
  codeQuality: number;
  timeManagement: number;
  overallImpression: number;
}

interface ReportEmailProps {
  toEmail: string;
  candidateName: string;
  hostName: string;
  problem: string;
  ratings: Ratings;
  aiReport: string;
}

export async function sendInviteEmail({
  toEmail,
  hostName,
  joinLink,
}: InviteEmailProps) {
  const mailOptions = {
    from: `"Intervux Platform" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: `${hostName} has invited you to a private coding interview on Intervux`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Intervux Interview Invitation</title>
        </head>
        <body style="margin:0;padding:0;background-color:#0f172a;font-family:'Segoe UI',Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a;padding:40px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color:#1e293b;border-radius:16px;overflow:hidden;">
                  
                  <tr>
                    <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6,#ec4899);padding:40px 48px;text-align:center;">
                      <p style="margin:0 0 8px 0;font-size:13px;font-weight:600;letter-spacing:2px;color:rgba(255,255,255,0.8);text-transform:uppercase;">
                        You have been invited
                      </p>
                      <h1 style="margin:0;font-size:36px;font-weight:900;color:#ffffff;">
                        Intervux
                      </h1>
                      <p style="margin:8px 0 0 0;font-size:15px;color:rgba(255,255,255,0.8);">
                        Real-Time Collaborative Interview Platform
                      </p>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:48px;">
                      <p style="font-size:16px;color:#94a3b8;">
                        Hello,
                      </p>

                      <p style="font-size:18px;color:#e2e8f0;line-height:1.7;">
                        <strong style="color:#a78bfa;">${hostName}</strong>
                        has invited you to participate in a
                        <strong> private coding interview session</strong>
                        on the Intervux platform.
                      </p>

                      <div style="background-color:#0f172a;border:1px solid #334155;border-left:4px solid #6366f1;border-radius:10px;padding:20px 24px;margin:32px 0;">
                        <p style="font-size:13px;font-weight:700;color:#6366f1;text-transform:uppercase;">
                          What to expect
                        </p>

                        <ul style="color:#94a3b8;line-height:1.8;">
                          <li>A real-time coding challenge</li>
                          <li>Live video call with your interviewer</li>
                          <li>Full-screen mode required</li>
                          <li>AI-generated performance report after the session</li>
                        </ul>
                      </div>

                      <div style="text-align:center;margin:32px 0;">
                        <a
                          href="${joinLink}"
                          style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;text-decoration:none;font-size:16px;font-weight:700;padding:16px 40px;border-radius:12px;"
                        >
                          🚀 Join Interview Session
                        </a>
                      </div>

                      <p style="font-size:13px;color:#475569;">
                        If you cannot click the button, copy and paste this link:
                        <br />
                        <a href="${joinLink}" style="color:#6366f1;">
                          ${joinLink}
                        </a>
                      </p>
                    </td>
                  </tr>

                  <tr>
                    <td style="background:#0f172a;padding:24px;text-align:center;">
                      <p style="font-size:12px;color:#334155;">
                        © ${new Date().getFullYear()} Intervux Platform
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Invite email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error(error);

    throw new Error(
      `Failed to send invite email: ${error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

export async function sendReportEmail({
  toEmail,
  candidateName,
  hostName,
  problem,
  ratings,
  aiReport,
}: ReportEmailProps) {
  const paramLabels: Record<string, string> = {
    problemSolving: "🧠 Problem Solving",
    communication: "🗣️ Communication",
    codeQuality: "💻 Code Quality",
    timeManagement: "⏱️ Time Management",
    overallImpression: "⭐ Overall Impression",
  };

  const ratingRows = Object.entries(ratings)
    .map(([key, value]) => {
      const stars = "★".repeat(value) + "☆".repeat(5 - value);

      const color =
        value >= 4
          ? "#22c55e"
          : value === 3
            ? "#f59e0b"
            : "#ef4444";

      return `
        <tr>
          <td style="padding:10px 16px;color:#94a3b8;border-bottom:1px solid #1e293b;">
            ${paramLabels[key] ?? key}
          </td>

          <td style="padding:10px 16px;text-align:right;border-bottom:1px solid #1e293b;">
            <span style="color:${color};font-size:16px;">
              ${stars}
            </span>
            <span style="color:#64748b;font-size:12px;margin-left:8px;">
              ${value}/5
            </span>
          </td>
        </tr>
      `;
    })
    .join("");

  const mailOptions = {
    from: `"Intervux Platform" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: `Your Intervux Interview Performance Report — ${problem}`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;background-color:#0f172a;font-family:'Segoe UI',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
          <tr>
            <td align="center">

              <table width="600" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:16px;overflow:hidden;">

                <tr>
                  <td style="background:linear-gradient(135deg,#059669,#0891b2,#6366f1);padding:40px;text-align:center;">
                    <h1 style="margin:0;color:#fff;">Intervux</h1>
                    <p style="color:rgba(255,255,255,0.8);">
                      AI-Powered Interview Analysis
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:48px;">

                    <h2 style="color:#fff;">
                      Hello, ${candidateName}! 👋
                    </h2>

                    <p style="color:#94a3b8;">
                      Your interview session with
                      <strong style="color:#a78bfa;">${hostName}</strong>
                      has concluded.
                    </p>

                    <table
                      width="100%"
                      cellpadding="0"
                      cellspacing="0"
                      style="background:#0f172a;border:1px solid #334155;border-radius:10px;margin-top:24px;"
                    >
                      ${ratingRows}
                    </table>

                    <div style="background:#0f172a;border-left:4px solid #6366f1;border-radius:10px;padding:24px;margin-top:32px;">
                      <p style="color:#cbd5e1;white-space:pre-line;">
                        ${aiReport}
                      </p>
                    </div>

                  </td>
                </tr>

              </table>

            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Report email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error(error);

    throw new Error(
      `Failed to send report email: ${error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}