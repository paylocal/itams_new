import nodemailer from "nodemailer";
import { prisma } from "./prisma";

interface EmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export type EmailConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
  replyTo: string;
  enabled: boolean;
};

const defaultConfig: EmailConfig = {
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  user: process.env.SMTP_USER || "",
  pass: process.env.SMTP_PASS || "",
  from: process.env.SMTP_FROM || "ITAMS <noreply@company.com>",
  replyTo: process.env.SMTP_REPLY_TO || "",
  enabled: process.env.EMAIL_ENABLED === "true" || !!process.env.SMTP_USER,
};

export async function loadEmailConfig(): Promise<EmailConfig> {
  try {
    const rows = await prisma.$queryRaw<{ key: string; value: string }[]>`
      SELECT [key], [value] FROM [dbo].[AppConfig]
      WHERE [key] IN ('SMTP_HOST','SMTP_PORT','SMTP_SECURE','SMTP_USER','SMTP_PASS','SMTP_FROM','SMTP_REPLY_TO','EMAIL_ENABLED')
    `;
    const map = new Map(rows.map((r) => [r.key, r.value]));
    return {
      host: map.get("SMTP_HOST") || defaultConfig.host,
      port: parseInt(map.get("SMTP_PORT") || String(defaultConfig.port)),
      secure: (map.get("SMTP_SECURE") || "false") === "true",
      user: map.get("SMTP_USER") || defaultConfig.user,
      pass: map.get("SMTP_PASS") || defaultConfig.pass,
      from: map.get("SMTP_FROM") || defaultConfig.from,
      replyTo: map.get("SMTP_REPLY_TO") || defaultConfig.replyTo,
      enabled: (map.get("EMAIL_ENABLED") || "false") === "true",
    };
  } catch (e) {
    console.error("Load email config error:", e);
    return defaultConfig;
  }
}

export async function sendEmail({ to, subject, html, text }: EmailParams) {
  const config = await loadEmailConfig();

  try {
    if (!config.enabled || !config.user) {
      console.log("=== EMAIL (DEV MODE) ===");
      console.log("To:", to);
      console.log("Subject:", subject);
      console.log("Body:");
      console.log(text || html.replace(/<[^>]+>/g, ""));
      console.log("=========================");
      return { success: true, dev: true };
    }

    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });

    const info = await transporter.sendMail({
      from: config.from,
      replyTo: config.replyTo || undefined,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]+>/g, ""),
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Email error:", error);
    return { success: false, error };
  }
}

// Template cac email
export const emailTemplates = {
  requestCreated: (data: {
    requestNumber: string;
    title: string;
    requesterName: string;
    managerName: string;
    url: string;
    locale?: string;
  }) => {
    const isVi = data.locale !== "en";
    return {
      subject: isVi
        ? `[ITAMS] Yeu cau moi can duyet: ${data.requestNumber}`
        : `[ITAMS] New request needs approval: ${data.requestNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #3b82f6, #1e40af); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0;">ITAMS - ${isVi ? "Yeu cau moi" : "New Request"}</h2>
          </div>
          <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb;">
            <p>${isVi ? `Xin chao ${data.managerName},` : `Hi ${data.managerName},`}</p>
            <p>${isVi
              ? `${data.requesterName} vua tao yeu cau moi can ban duyet:`
              : `${data.requesterName} has created a new request that needs your approval:`}</p>
            <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
              <p><strong>${isVi ? "Ma yeu cau" : "Request No"}:</strong> ${data.requestNumber}</p>
              <p><strong>${isVi ? "Tieu de" : "Title"}:</strong> ${data.title}</p>
            </div>
            <a href="${data.url}" style="display: inline-block; background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px;">
              ${isVi ? "Xem va duyet" : "View & Approve"}
            </a>
            <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
              ${isVi ? "Link co hieu luc trong 24 gio." : "Link valid for 24 hours."}
            </p>
          </div>
        </div>
      `,
    };
  },

  requestApproved: (data: {
    requestNumber: string;
    title: string;
    nextApproverName: string;
    role: string;
    url: string;
    locale?: string;
  }) => {
    const isVi = data.locale !== "en";
    return {
      subject: isVi
        ? `[ITAMS] ${data.requestNumber} can buoc ${data.role} duyet`
        : `[ITAMS] ${data.requestNumber} needs ${data.role} approval`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #3b82f6, #1e40af); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0;">ITAMS</h2>
          </div>
          <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb;">
            <p>${isVi ? `Xin chao ${data.nextApproverName},` : `Hi ${data.nextApproverName},`}</p>
            <p>${isVi ? `Yeu cau ${data.requestNumber} can ban duyet o buoc tiep theo.` : `Request ${data.requestNumber} needs your approval.`}</p>
            <a href="${data.url}" style="display: inline-block; background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px;">
              ${isVi ? "Xem chi tiet" : "View Details"}
            </a>
          </div>
        </div>
      `,
    };
  },

  requestRejected: (data: {
    requestNumber: string;
    title: string;
    requesterName: string;
    reason: string;
    url: string;
    locale?: string;
  }) => {
    const isVi = data.locale !== "en";
    return {
      subject: isVi
        ? `[ITAMS] Yeu cau ${data.requestNumber} bi tu choi`
        : `[ITAMS] Request ${data.requestNumber} rejected`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ef4444, #b91c1c); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0;">ITAMS</h2>
          </div>
          <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb;">
            <p>${isVi ? `Xin chao ${data.requesterName},` : `Hi ${data.requesterName},`}</p>
            <p>${isVi ? "Yeu cau cua ban da bi tu choi." : "Your request has been rejected."}</p>
            <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #ef4444;">
              <p><strong>${isVi ? "Ma yeu cau" : "Request"}:</strong> ${data.requestNumber}</p>
              <p><strong>${isVi ? "Tieu de" : "Title"}:</strong> ${data.title}</p>
              <p><strong>${isVi ? "Ly do" : "Reason"}:</strong> ${data.reason}</p>
            </div>
            <a href="${data.url}" style="display: inline-block; background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px;">
              ${isVi ? "Xem va sua lai" : "View & Edit"}
            </a>
          </div>
        </div>
      `,
    };
  },

  requestCompleted: (data: {
    requestNumber: string;
    title: string;
    requesterName: string;
    url: string;
    locale?: string;
  }) => {
    const isVi = data.locale !== "en";
    return {
      subject: isVi
        ? `[ITAMS] Yeu cau ${data.requestNumber} da hoan thanh`
        : `[ITAMS] Request ${data.requestNumber} completed`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10b981, #047857); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0;">ITAMS</h2>
          </div>
          <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb;">
            <p>${isVi ? `Chuc mung ${data.requesterName}!` : `Congratulations ${data.requesterName}!`}</p>
            <p>${isVi ? "Yeu cau cua ban da hoan thanh." : "Your request has been completed."}</p>
            <a href="${data.url}" style="display: inline-block; background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px;">
              ${isVi ? "Xem chi tiet" : "View Details"}
            </a>
          </div>
        </div>
      `,
    };
  },

  poCreated: (data: {
    poNumber: string;
    supplierName: string;
    totalAmount: number;
    purchaserName: string;
    url: string;
    locale?: string;
  }) => {
    const isVi = data.locale !== "en";
    return {
      subject: isVi
        ? `[ITAMS] PO moi ${data.poNumber} cho IT`
        : `[ITAMS] New PO ${data.poNumber} for IT`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0;">ITAMS - ${isVi ? "Don mua hang moi" : "New Purchase Order"}</h2>
          </div>
          <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb;">
            <p>${isVi ? "Co don mua hang moi:" : "There is a new purchase order:"}</p>
            <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
              <p><strong>${isVi ? "Ma PO" : "PO No"}:</strong> ${data.poNumber}</p>
              <p><strong>${isVi ? "Nha cung cap" : "Supplier"}:</strong> ${data.supplierName}</p>
              <p><strong>${isVi ? "Tong tien" : "Total"}:</strong> ${data.totalAmount.toLocaleString("vi-VN")} d</p>
              <p><strong>${isVi ? "Nguoi tao" : "Created by"}:</strong> ${data.purchaserName}</p>
            </div>
            <a href="${data.url}" style="display: inline-block; background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px;">
              ${isVi ? "Xem chi tiet" : "View Details"}
            </a>
          </div>
        </div>
      `,
    };
  },

  passwordReset: (data: {
    name: string;
    email: string;
    password: string;
    url: string;
    locale?: string;
    mustChangePassword?: boolean;
  }) => {
    const isVi = data.locale !== "en";
    return {
      subject: isVi
        ? `[ITAMS] Mat khau tai khoan cua ban da duoc dat lai`
        : `[ITAMS] Your account password has been reset`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #3b82f6, #1e40af); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0;">ITAMS - ${isVi ? "Mat khau moi" : "New Password"}</h2>
          </div>
          <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb;">
            <p>${isVi ? `Xin chao ${data.name},` : `Hi ${data.name},`}</p>
            <p>${isVi
              ? "Mat khau tai khoan cua ban da duoc dat lai. Vui long dang nhap bang thong tin ben duoi:"
              : "Your account password has been reset. Please log in with the following information:"}</p>
            <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
              <p><strong>${isVi ? "Email" : "Email"}:</strong> ${data.email}</p>
              <p><strong>${isVi ? "Mat khau moi" : "New password"}:</strong> ${data.password}</p>
            </div>
            <a href="${data.url}" style="display: inline-block; background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px;">
              ${isVi ? "Dang nhap" : "Login"}
            </a>
            ${data.mustChangePassword
              ? `<p style="color: #ef4444; font-weight: bold; margin-top: 20px;">${isVi ? "Luu y: Ban se duoc yeu cau doi mat khau ngay sau khi dang nhap." : "Note: You will be required to change your password immediately after login."}</p>`
              : ""}
            <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
              ${isVi ? "Vui long khong chia se mat khau nay voi nguoi khac." : "Please do not share this password with anyone."}
            </p>
          </div>
        </div>
      `,
    };
  },
};
