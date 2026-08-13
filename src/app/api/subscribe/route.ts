import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const subscription = await request.json();

    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    const token = process.env.GITHUB_TOKEN;
    const path = "src/data/subscriptions.json";

    if (!owner || !repo || !token) {
      return NextResponse.json({ error: "Lỗi cấu hình GITHUB trên server." }, { status: 500 });
    }

    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

    // 1. Fetch current subscriptions
    const getRes = await fetch(apiUrl, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/vnd.github.v3+json",
      },
      cache: "no-store"
    });

    let sha = undefined;
    let currentSubscriptions = [];

    if (getRes.ok) {
      const fileData = await getRes.json();
      sha = fileData.sha;
      const contentStr = Buffer.from(fileData.content, 'base64').toString('utf-8');
      currentSubscriptions = JSON.parse(contentStr);
    } else if (getRes.status !== 404) {
      return NextResponse.json({ error: "Không thể lấy thông tin file từ GitHub." }, { status: 500 });
    }

    // Check if subscription already exists (by endpoint)
    const exists = currentSubscriptions.find((sub: any) => sub.endpoint === subscription.endpoint);
    if (!exists) {
      currentSubscriptions.push(subscription);
    }

    // 2. Save updated subscriptions
    const contentToSave = JSON.stringify(currentSubscriptions, null, 2);
    const base64Content = Buffer.from(contentToSave, 'utf-8').toString('base64');

    const updateRes = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: "Add push subscription",
        content: base64Content,
        sha: sha
      })
    });

    if (!updateRes.ok) {
      return NextResponse.json({ error: "Lỗi khi lưu lên GitHub." }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Đã đăng ký nhận thông báo!" });
  } catch (error: any) {
    console.error("Subscription Error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống: " + error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { endpoint } = await request.json();

    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    const token = process.env.GITHUB_TOKEN;
    const path = "src/data/subscriptions.json";

    if (!owner || !repo || !token) {
      return NextResponse.json({ error: "Lỗi cấu hình GITHUB trên server." }, { status: 500 });
    }

    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

    const getRes = await fetch(apiUrl, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/vnd.github.v3+json",
      },
      cache: "no-store"
    });

    if (!getRes.ok) {
      return NextResponse.json({ success: true }); // Ignore if not found
    }

    const fileData = await getRes.json();
    const sha = fileData.sha;
    const contentStr = Buffer.from(fileData.content, 'base64').toString('utf-8');
    let currentSubscriptions = JSON.parse(contentStr);

    // Remove subscription
    currentSubscriptions = currentSubscriptions.filter((sub: any) => sub.endpoint !== endpoint);

    const contentToSave = JSON.stringify(currentSubscriptions, null, 2);
    const base64Content = Buffer.from(contentToSave, 'utf-8').toString('base64');

    const updateRes = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: "Remove push subscription",
        content: base64Content,
        sha: sha
      })
    });

    if (!updateRes.ok) {
      return NextResponse.json({ error: "Lỗi khi xoá trên GitHub." }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Đã huỷ nhận thông báo!" });
  } catch (error: any) {
    console.error("Unsubscribe Error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống: " + error.message }, { status: 500 });
  }
}
