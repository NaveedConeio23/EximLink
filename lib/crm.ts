// =====================================
// 🔐 GET CRM ACCESS TOKEN
// =====================================
export async function getCRMToken() {
  const response = await fetch(
    `https://login.microsoftonline.com/${process.env.CRM_TENANT_ID}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.CRM_CLIENT_ID!,
        client_secret: process.env.CRM_CLIENT_SECRET!,
        grant_type: "client_credentials",
        scope: `${process.env.CRM_BASE_URL}/.default`,
      }),
    }
  );

  const data = await response.json();

  if (!data.access_token) {
    console.error("❌ CRM Token Error:", data);
    throw new Error("Failed to get CRM token");
  }

  return data.access_token;
}

// =====================================
// 🔎 FIND OR CREATE CONVERSATION
// =====================================
export async function findOrCreateConversation(
  token: string,
  phoneRaw: string,
  customerName: string
) {
  const phone = phoneRaw.replace(/\D/g, "");

  const searchRes = await fetch(
    `${process.env.CRM_BASE_URL}/api/data/v9.2/cr89e_crmconversations?$filter=cr89e_phonenumber eq '${phone}'`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  const searchData = await searchRes.json();

  if (searchData.value?.length > 0) {
    return searchData.value[0].cr89e_crmconversationid;
  }

  const createRes = await fetch(
    `${process.env.CRM_BASE_URL}/api/data/v9.2/cr89e_crmconversations`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cr89e_name: customerName,
        cr89e_phonenumber: phone,
      }),
    }
  );

  if (!createRes.ok) {
    console.error("❌ Conversation Create Error:", await createRes.text());
    return null;
  }

  const entityUrl = createRes.headers.get("OData-EntityId");
  return entityUrl?.match(/\(([^)]+)\)/)?.[1] || null;
}

// =====================================
// 💬 CREATE MESSAGE
// =====================================
export async function createWhatsAppMessage(
  token: string,
  conversationId: string,
  senderName: string,
  phoneNumber: string,
  messageText: string,
  directionValue: number,
  fileUrl?: string
) {
  const payload = {
    cr89e_name: senderName,
    cr89e_phonenumber: phoneNumber,
    cr89e_messagetext: messageText || "",
    cr89e_direction: directionValue,
    cr89e_timestamp: new Date().toISOString(),
    cr89e_fileurl: fileUrl || null,
    "cr89e_Conversation@odata.bind":
      `/cr89e_crmconversations(${conversationId})`,
  };

  const response = await fetch(
    `${process.env.CRM_BASE_URL}/api/data/v9.2/cr89e_crmwhatsapps`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    console.error("❌ Message Create Error:", await response.text());
    throw new Error("Failed to create message");
  }

  console.log("✅ Message stored in CRM");
}
