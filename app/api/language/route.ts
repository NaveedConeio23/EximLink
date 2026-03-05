import { NextRequest, NextResponse } from "next/server";
import { setLanguage, getLanguage } from "@/lib/languageMode";

export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get("phone");
  if (!phone) return NextResponse.json({ error: "phone required" }, { status: 400 });
  const language = getLanguage(phone);
  return NextResponse.json({ language });
}

export async function POST(req: NextRequest) {
  const { phone, language } = await req.json();
  if (!phone) return NextResponse.json({ error: "phone required" }, { status: 400 });
  setLanguage(phone, language);
  return NextResponse.json({ success: true, phone, language });
}