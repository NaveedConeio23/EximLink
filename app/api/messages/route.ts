import { NextRequest, NextResponse } from "next/server";
import { getCRMToken } from "@/lib/crm";

export async function GET(req: NextRequest) {
  const conversationId = req.nextUrl.searchParams.get("conversationId");

  if (!conversationId) {
    return NextResponse.json({ error: "Missing conversationId" }, { status: 400 });
  }

  const token = await getCRMToken();

  const res = await fetch(
    `${process.env.CRM_BASE_URL}/api/data/v9.2/cr89e_crmwhatsapps?$filter=_cr89e_conversation_value eq ${conversationId}&$orderby=cr89e_timestamp asc`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await res.json();
  return NextResponse.json(data.value);
}
