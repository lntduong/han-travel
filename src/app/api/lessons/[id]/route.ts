import { NextResponse } from "next/server";
import lessonsData from "@/data/lessons.json";
import { Lesson } from "@/types/lesson";

const lessons = lessonsData as Lesson[];
import { pinyin } from "pinyin-pro";

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const lesson = lessons.find(l => l.id === id);
  
  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  const finalLesson = {
    ...lesson,
    mainSentence: {
      ...lesson.mainSentence,
      pinyin: lesson.mainSentence.pinyin || pinyin(lesson.mainSentence.sentence)
    },
    dialogues: lesson.dialogues.map(dialogue => ({
      ...dialogue,
      pinyin: dialogue.pinyin || pinyin(dialogue.sentence)
    }))
  };

  return NextResponse.json(finalLesson);
}
