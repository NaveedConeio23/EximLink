// import { NextRequest, NextResponse } from "next/server";

// // In-memory store: phone → agent has taken over (bot is OFF)
// // In production, store this in CRM/DB for persistence
// const agentModeMap = new Map<string, boolean>();

// export async function GET(req: NextRequest) {
//   const phone = req.nextUrl.searchParams.get("phone");
//   if (!phone) return NextResponse.json({ error: "phone required" }, { status: 400 });
//   return NextResponse.json({ agentMode: agentModeMap.get(phone) || false });
// }

// export async function POST(req: NextRequest) {
//   const { phone, agentMode } = await req.json();
//   if (!phone) return NextResponse.json({ error: "phone required" }, { status: 400 });
//   agentModeMap.set(phone, agentMode);
//   console.log(`🔀 Agent mode for ${phone}: ${agentMode ? "AGENT (bot OFF)" : "BOT (bot ON)"}`);
//   return NextResponse.json({ success: true, phone, agentMode });
// }

// // Export so webhook can import it
// export { agentModeMap };
















import { NextRequest, NextResponse } from "next/server";
import { agentModeMap } from "@/lib/agentMode";

export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get("phone");
  if (!phone) return NextResponse.json({ error: "phone required" }, { status: 400 });
  return NextResponse.json({ agentMode: agentModeMap.get(phone) || false });
}

export async function POST(req: NextRequest) {
  const { phone, agentMode } = await req.json();
  if (!phone) return NextResponse.json({ error: "phone required" }, { status: 400 });
  agentModeMap.set(phone, agentMode);
  console.log(`🔀 Agent mode for ${phone}: ${agentMode ? "AGENT (bot OFF)" : "BOT (bot ON)"}`);
  return NextResponse.json({ success: true, phone, agentMode });
}