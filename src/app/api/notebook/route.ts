import { NextResponse } from "next/server";
import notebookData from "@/data/notebook.json";

export async function GET() {
  return NextResponse.json(notebookData);
}
