import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { Resend } from "resend";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

function getResendClient() {
  const key = process.env.RESEND_API_KEY;
  if (!key || key === "your_resend_api_key_here") return null;
  return new Resend(key);
}

function formatPrice(price) {
  return Number(price || 0).toLocaleString("vi-VN") + "đ";
}

function buildItemRow(item) {
  const lineTotal = (item.pricePerUnit || 0) * (item.quantity || 1);
  return `
    <tr>
      <td style="padding:16px 0;border-bottom:1px solid #e2e8f0;vertical-align:top;">
        <p style="margin:0 0 4px;font-size:15px;font-weight:600;color:#0f172a;">${item.serviceName}</p>
        <p style="margin:0;font-size:12px;color:#64748b;">${item.platformName} · ${item.serverName || ""}</p>
        <p style="margin:4px 0 0;font-size:11px;color:#94a3b8;word-break:break-all;">${item.url || ""}</p>
      </td>
      <td width="52" style="padding:16px 0;border-bottom:1px solid #e2e8f0;text-align:center;vertical-align:top;font-size:14px;color:#0f172a;">${(item.quantity || 1).toLocaleString("vi-VN")}</td>
      <td width="100" style="padding:16px 0;border-bottom:1px solid #e2e8f0;text-align:right;vertical-align:top;font-size:14px;font-weight:700;color:#7c3aed;white-space:nowrap;">${formatPrice(lineTotal)}</td>
    </tr>`;
}

export function buildOrderEmailHtml(order) {
  const { items = [], contact, id, createdAt, totalAmount } = order;

  let orderDate = "";
  let orderTime = "";
  if (createdAt) {
    const d = new Date(createdAt);
    orderDate = d.toLocaleDateString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    orderTime = d.toLocaleTimeString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const itemRows = items.map(buildItemRow).join("");

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Xác nhận đơn hàng UpLike</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px -4px rgba(0,0,0,0.10);">
          <tr>
            <td style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:40px 32px 36px;text-align:center;">
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 16px;">
                <tr>
                  <td style="background:rgba(255,255,255,0.22);border-radius:50%;width:56px;height:56px;text-align:center;vertical-align:middle;">
                    <span style="color:#ffffff;font-size:30px;font-weight:700;line-height:56px;">&#x2713;</span>
                  </td>
                </tr>
              </table>
              <h1 style="margin:0 0 5px;color:#ffffff;font-size:24px;font-weight:700;">UpLike</h1>
              <p style="margin:0;color:rgba(255,255,255,0.85);font-size:14px;">Xác nhận đơn hàng thành công</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <h2 style="margin:0 0 6px;font-size:18px;font-weight:700;color:#0f172a;">Cảm ơn bạn đã đặt hàng!</h2>
              <p style="margin:0 0 24px;color:#64748b;font-size:14px;line-height:1.6;">
                Đơn hàng của bạn đã được tiếp nhận và đang ở trạng thái <strong>Chờ xử lý</strong>.
                Admin sẽ cập nhật trạng thái khi bắt đầu xử lý đơn.
              </p>
              <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="padding-right:10px;">
                    <span style="display:inline-block;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:8px 12px;font-size:13px;">
                      Mã đơn: <strong style="color:#7c3aed;">#${id}</strong>
                    </span>
                  </td>
                  ${orderDate ? `
                  <td>
                    <span style="display:inline-block;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:8px 12px;font-size:13px;color:#64748b;">
                      ${orderTime} · ${orderDate}
                    </span>
                  </td>` : ""}
                </tr>
              </table>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;border-collapse:collapse;">
                <tr style="border-bottom:2px solid #e2e8f0;">
                  <th style="padding-bottom:12px;text-align:left;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;">Dịch vụ</th>
                  <th width="52" style="padding-bottom:12px;text-align:center;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;">SL</th>
                  <th width="100" style="padding-bottom:12px;text-align:right;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;">Giá</th>
                </tr>
                ${itemRows}
              </table>
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;margin-bottom:24px;">
                <tr>
                  <td style="padding:16px 20px;text-align:right;">
                    <span style="font-size:14px;color:#64748b;">Tổng cộng:&nbsp;</span>
                    <span style="font-size:21px;font-weight:800;color:#7c3aed;">${formatPrice(totalAmount)}</span>
                  </td>
                </tr>
              </table>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:12px;padding:18px 20px;">
                    <p style="margin:0;font-size:14px;color:#0f172a;line-height:1.7;">
                      Nếu chưa thanh toán, vui lòng hoàn tất thanh toán theo hướng dẫn trên website.
                      Cần hỗ trợ? Liên hệ Zalo hoặc hotline bên dưới.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background:#f8fafc;padding:20px 32px 24px;border-top:1px solid #e2e8f0;">
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
                <tr>
                  <td>
                    <a href="https://zalo.me/0877677863" style="display:inline-block;font-size:13px;font-weight:600;color:#7c3aed;text-decoration:none;background:#ede9fe;border:1px solid #ddd6fe;border-radius:8px;padding:8px 16px;">
                      Zalo hỗ trợ
                    </a>
                  </td>
                  <td align="right">
                    <a href="tel:0877677863" style="display:inline-block;font-size:13px;font-weight:600;color:#7c3aed;text-decoration:none;background:#ede9fe;border:1px solid #ddd6fe;border-radius:8px;padding:8px 16px;">
                      0877 677 863
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;">
                Email gửi tới <a href="mailto:${contact}" style="color:#7c3aed;font-weight:600;text-decoration:none;">${contact}</a> · UpLike
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function sendOrderConfirmationEmail(order) {
  const resend = getResendClient();
  if (!resend) {
    console.warn("RESEND_API_KEY not configured — skipping order confirmation email");
    return;
  }

  const contact = order.contact;
  if (!contact || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)) {
    return;
  }

  const from =
    process.env.ORDER_EMAIL_FROM || "Tạp hoá Account <orders@taphoaaccount.com>";
  const payload = {
    from,
    to: contact,
    subject: `Xác nhận đơn hàng #${order.id} - ${formatPrice(order.totalAmount)}`,
    html: buildOrderEmailHtml(order),
  };

  const cc = process.env.ORDER_EMAIL_CC || "taphoa.customer@gmail.com";
  const bcc = process.env.ORDER_EMAIL_BCC || "lvthang1202@gmail.com";
  if (cc) payload.cc = cc;
  if (bcc) payload.bcc = bcc;

  resend.emails.send(payload).catch((err) => {
    console.error("Failed to send order confirmation email:", err);
  });
}
