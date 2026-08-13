import { NextResponse } from "next/server";
import webpush from "web-push";

// Lấy VAPID keys từ biến môi trường
const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY!;

webpush.setVapidDetails(
  "mailto:han-travel@example.com",
  publicVapidKey,
  privateVapidKey
);

export async function GET(request: Request) {
  // Xác thực token cron job của Vercel (bảo mật)
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    const token = process.env.GITHUB_TOKEN;

    if (!owner || !repo || !token) {
      throw new Error("Lỗi cấu hình GITHUB.");
    }

    // Lấy dữ liệu notebook
    const notebookRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/src/data/notebook.json`,
      { headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github.v3+json" }, cache: "no-store" }
    );
    if (!notebookRes.ok) throw new Error("Không thể đọc notebook.json");
    
    const notebookData = await notebookRes.json();
    const notebookContent = Buffer.from(notebookData.content, 'base64').toString('utf-8');
    const notebookItems = JSON.parse(notebookContent);

    if (!notebookItems || notebookItems.length === 0) {
      return NextResponse.json({ message: "Không có câu nào trong sổ tay để nhắc." });
    }

    // Chọn ngẫu nhiên 1 câu
    const randomItem = notebookItems[Math.floor(Math.random() * notebookItems.length)];

    // Lấy danh sách subscriptions
    const subRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/src/data/subscriptions.json`,
      { headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github.v3+json" }, cache: "no-store" }
    );
    if (!subRes.ok) {
      return NextResponse.json({ message: "Không có ai đăng ký nhận thông báo." });
    }
    
    const subData = await subRes.json();
    const subContent = Buffer.from(subData.content, 'base64').toString('utf-8');
    const subscriptions = JSON.parse(subContent);

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ message: "Không có ai đăng ký nhận thông báo." });
    }

    const payload = JSON.stringify({
      title: "HanTravel - Nhắc nhở 🎒",
      body: `Bạn có nhớ câu này không:\n${randomItem.vi}\n${randomItem.zh}`,
    });

    const sendPromises = subscriptions.map((subscription: any) =>
      webpush.sendNotification(subscription, payload).catch((err) => {
        console.error("Lỗi khi gửi cho 1 user:", err);
      })
    );

    await Promise.all(sendPromises);

    return NextResponse.json({ success: true, message: `Đã gửi thông báo tới ${subscriptions.length} máy.` });
  } catch (error: any) {
    console.error("Cron Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
