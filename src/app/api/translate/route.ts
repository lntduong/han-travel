import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get("text");

  if (!text) {
    return NextResponse.json({ error: "No text provided" }, { status: 400 });
  }

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=vi&tl=zh-TW&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    if (!response.ok) {
      throw new Error(`Google Translate API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Parse the result
    // The format is: [[[ "Translated Text", "Original Text", null, null, 1 ]], null, "vi"]
    let translatedText = "";
    if (data && data[0]) {
      data[0].forEach((item: any) => {
        if (item[0]) translatedText += item[0];
      });
    }

    return NextResponse.json({ translation: translatedText });
  } catch (error: any) {
    console.error("Translation API Error:", error);
    return NextResponse.json({ error: "Lỗi dịch thuật: " + error.message }, { status: 500 });
  }
}
