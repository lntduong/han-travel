import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    if (!Array.isArray(data)) {
      return NextResponse.json({ error: "Dữ liệu không hợp lệ (phải là Array JSON)" }, { status: 400 });
    }

    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    const token = process.env.GITHUB_TOKEN;
    const path = "src/data/notebook.json";

    if (!owner || !repo || !token) {
      return NextResponse.json({ error: "Lỗi cấu hình biến môi trường GITHUB trên server." }, { status: 500 });
    }

    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

    // 1. Lấy SHA hiện tại của file
    const getRes = await fetch(apiUrl, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/vnd.github.v3+json",
      },
      cache: "no-store"
    });

    let sha = undefined;
    if (getRes.ok) {
      const fileData = await getRes.json();
      sha = fileData.sha;
    } else if (getRes.status !== 404) {
      return NextResponse.json({ error: "Không thể lấy thông tin file từ GitHub. Mã lỗi: " + getRes.status }, { status: 500 });
    }

    // 2. Cập nhật (hoặc tạo mới) file với nội dung mới
    const contentToSave = JSON.stringify(data, null, 2);
    const base64Content = Buffer.from(contentToSave, 'utf-8').toString('base64');

    const updateRes = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: "Update notebook.json via Survival API",
        content: base64Content,
        sha: sha // Nếu file chưa tồn tại (404), sha undefined => GitHub sẽ tạo mới
      })
    });

    if (!updateRes.ok) {
      const errorText = await updateRes.text();
      return NextResponse.json({ error: "Lỗi khi lưu lên GitHub: " + errorText }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Đã đồng bộ thành công lên GitHub!" });

  } catch (error: any) {
    console.error("API Save Error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống: " + error.message }, { status: 500 });
  }
}
