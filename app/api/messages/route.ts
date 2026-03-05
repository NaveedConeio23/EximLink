// import { NextRequest, NextResponse } from "next/server";
// import { getCRMToken } from "@/lib/crm";

// export async function GET(req: NextRequest) {
//   const conversationId = req.nextUrl.searchParams.get("conversationId");

//   if (!conversationId) {
//     return NextResponse.json({ error: "Missing conversationId" }, { status: 400 });
//   }

//   const token = await getCRMToken();

//   const res = await fetch(
//     `${process.env.CRM_BASE_URL}/api/data/v9.2/cr89e_crmwhatsapps?$filter=_cr89e_conversation_value eq ${conversationId}&$orderby=cr89e_timestamp asc`,
//     {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     }
//   );

//   const data = await res.json();
//   return NextResponse.json(data.value);
// }















import { NextRequest, NextResponse } from "next/server";
import { getCRMToken } from "@/lib/crm";

export async function GET(req: NextRequest) {
  const conversationId = req.nextUrl.searchParams.get("conversationId");

  if (!conversationId) {
    return NextResponse.json({ error: "Missing conversationId" }, { status: 400 });
  }

  const token = await getCRMToken();

  // Explicitly select all fields including cr89e_fileurl to ensure they are returned
  // (Dataverse sometimes omits null/empty fields without explicit $select)
  const fields = [
    "cr89e_crmwhatsappid",
    "cr89e_messagetext",
    "cr89e_fileurl",
    "cr89e_filename",
    "cr89e_direction",
    "cr89e_timestamp",
    "cr89e_name",
    "cr89e_phonenumber",
  ].join(",");

  const res = await fetch(
    `${process.env.CRM_BASE_URL}/api/data/v9.2/cr89e_crmwhatsapps?$filter=_cr89e_conversation_value eq ${conversationId}&$orderby=cr89e_timestamp asc&$select=${fields}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await res.json();

  // Filter out messages that have no content (empty text AND no file) —
  // these are corrupted records from failed uploads, nothing to show
  const messages = (data.value || []).filter(
    (m: any) => m.cr89e_messagetext || m.cr89e_fileurl
  );

  return NextResponse.json(messages);
}