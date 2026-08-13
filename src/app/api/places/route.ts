import { NextResponse } from "next/server";
import placesData from "@/data/places.json";

export async function GET() {
  return NextResponse.json(placesData);
}
