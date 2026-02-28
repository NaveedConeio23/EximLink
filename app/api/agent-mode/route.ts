import { NextRequest, NextResponse } from "next/server";
import { setAgentMode, getAgentMode } from "@/lib/agentMode";

export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get("phone");
  if (!phone) return NextResponse.json({ error: "phone required" }, { status: 400 });
  const agentMode = getAgentMode(phone);
  return NextResponse.json({ agentMode });
}

export async function POST(req: NextRequest) {
  const { phone, agentMode } = await req.json();
  if (!phone) return NextResponse.json({ error: "phone required" }, { status: 400 });
  setAgentMode(phone, agentMode);
  return NextResponse.json({ success: true, phone, agentMode });
}
