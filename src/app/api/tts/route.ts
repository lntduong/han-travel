import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const text = req.nextUrl.searchParams.get("text");
  const lang = req.nextUrl.searchParams.get("lang") || "zh-TW";
  
  if (!text) {
    return NextResponse.json({ error: "No text provided" }, { status: 400 });
  }

  try {
    // client=tw-ob là endpoint của Google Translate App, ổn định nhất
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encodeURIComponent(text)}`;
    
    const response = await fetch(url, {
      headers: {
        // Cần fake User-Agent để Google không chặn bot
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });

    if (!response.ok) {
      throw new Error(`Google TTS API responded with status: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    
    // Trả file MP3 trực tiếp về cho frontend
    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=31536000", // Cache 1 năm
      },
    });
  } catch (error) {
    console.error("TTS Proxy error:", error);
    return NextResponse.json({ error: "Failed to generate audio" }, { status: 500 });
  }
}
