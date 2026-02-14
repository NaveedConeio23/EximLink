import { NextResponse } from "next/server";
import { getCRMToken } from "@/lib/crm";

export async function GET() {
  const token = await getCRMToken();

  const res = await fetch(
    `${process.env.CRM_BASE_URL}/api/data/v9.2/cr89e_crmconversations?$orderby=createdon desc`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await res.json();
  return NextResponse.json(data.value);
}
