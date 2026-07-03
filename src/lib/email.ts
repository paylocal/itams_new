import nodemailer from "nodemailer";

interface EmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Tao transporter 1 lan
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Trong development, log email thay vi gui that
const isDev = process.env.NODE_ENV !== "production";

export async function sendEmail({ to, subject, html, text }: EmailParams) {
  try {
    if (isDev || !process.env.SMTP_USER) {
      // Development: chi log
      console.log("=== EMAIL (DEV MODE) ===");
      console.log("To:", to);
      console.log("Subject:", subject);
      console.log("Body:");
      console.log(text || html.replace(/<[^>]+>/g, ""));
      console.log("=========================");
      return { success: true, dev: true };
    }

    // Production: gui that
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || "ITAMS <noreply@company.com>",
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
};
