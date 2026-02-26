// // =====================================
// // 🔐 GET CRM ACCESS TOKEN
// // =====================================
// export async function getCRMToken() {
//   const response = await fetch(
//     `https://login.microsoftonline.com/${process.env.CRM_TENANT_ID}/oauth2/v2.0/token`,
//     {
//       method: "POST",
//       headers: { "Content-Type": "application/x-www-form-urlencoded" },
//       body: new URLSearchParams({
//         client_id: process.env.CRM_CLIENT_ID!,
//         client_secret: process.env.CRM_CLIENT_SECRET!,
//         grant_type: "client_credentials",
//         scope: `${process.env.CRM_BASE_URL}/.default`,
//       }),
//     }
//   );

//   const data = await response.json();

//   if (!data.access_token) {
//     console.error("❌ CRM Token Error:", data);
//     throw new Error("Failed to get CRM token");
//   }

//   return data.access_token;
// }

// // =====================================
// // 🔎 FIND OR CREATE CONVERSATION
// // =====================================
// export async function findOrCreateConversation(
//   token: string,
//   phoneRaw: string,
//   customerName: string
// ) {
//   const phone = phoneRaw.replace(/\D/g, "");

//   const searchRes = await fetch(
//     `${process.env.CRM_BASE_URL}/api/data/v9.2/cr89e_crmconversations?$filter=cr89e_phonenumber eq '${phone}'`,
//     {
//       headers: { Authorization: `Bearer ${token}` },
//     }
//   );

//   const searchData = await searchRes.json();

//   if (searchData.value?.length > 0) {
//     return searchData.value[0].cr89e_crmconversationid;
//   }

//   const createRes = await fetch(
//     `${process.env.CRM_BASE_URL}/api/data/v9.2/cr89e_crmconversations`,
//     {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         cr89e_name: customerName,
//         cr89e_phonenumber: phone,
//       }),
//     }
//   );

//   if (!createRes.ok) {
//     console.error("❌ Conversation Create Error:", await createRes.text());
//     return null;
//   }

//   const entityUrl = createRes.headers.get("OData-EntityId");
//   return entityUrl?.match(/\(([^)]+)\)/)?.[1] || null;
// }

// // =====================================
// // 💬 CREATE MESSAGE
// // =====================================
// export async function createWhatsAppMessage(
//   token: string,
//   conversationId: string,
//   senderName: string,
//   phoneNumber: string,
//   messageText: string,
//   directionValue: number,
//   fileUrl?: string
// ) {
//   const payload = {
//     cr89e_name: senderName,
//     cr89e_phonenumber: phoneNumber,
//     cr89e_messagetext: messageText || "",
//     cr89e_direction: directionValue,
//     cr89e_timestamp: new Date().toISOString(),
//     cr89e_fileurl: fileUrl || null,
//     "cr89e_Conversation@odata.bind":
//       `/cr89e_crmconversations(${conversationId})`,
//   };

//   const response = await fetch(
//     `${process.env.CRM_BASE_URL}/api/data/v9.2/cr89e_crmwhatsapps`,
//     {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(payload),
//     }
//   );

//   if (!response.ok) {
//     console.error("❌ Message Create Error:", await response.text());
//     throw new Error("Failed to create message");
//   }

//   console.log("✅ Message stored in CRM");
// }







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
// 📤 SEND WHATSAPP TEMPLATE
// =====================================
async function sendWelcomeTemplate(
  phoneRaw: string,
  customerName: string,
  crmToken: string,
  conversationId: string
) {
  try {
    if (!process.env.PHONE_NUMBER_ID || !process.env.WHATSAPP_TOKEN) {
      console.error("❌ WhatsApp ENV variables missing");
      return;
    }

    const phone = phoneRaw.replace(/\D/g, "");

    // ✅ Sanitize name — must be non-empty string, no special chars
    const safeName = (customerName || "")
      .trim()
      .replace(/[^a-zA-Z0-9 ]/g, "") // remove special chars
      .trim()
      || "Customer"; // final fallback if empty after cleaning

    console.log("🚀 Sending welcome template to:", phone, "| Name:", safeName);

    const response = await fetch(
      `https://graph.facebook.com/v19.0/${process.env.PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: phone,
          type: "template",
          template: {
            name: "welcome_message",
            language: { code: "en" },
            components: [
              {
                type: "body",
                parameters: [
                  {
                    type: "text",
                    parameter_name: "customer_name",
                    text: safeName,
                  },
                ],
              },
              {
                type: "button",
                sub_type: "url",
                index: "0",
                parameters: [
                  {
                    type: "text",
                    text: "home", // ✅ the dynamic part appended to your button URL
                  },
                ],
              },
            ],
          },
        }),
      }
    );

    const data = await response.json();
    console.log("📨 WhatsApp API Response:", data);

    if (!response.ok) {
      console.error("❌ Template Send Error:", data);
      return;
    }

    console.log("✅ Welcome template sent successfully");

    // ✅ Save welcome message to CRM so it shows in dashboard
    const welcomeText = `Hello ${customerName} 👋\n\nWelcome to Coneio Exim.\n\nThank you for reaching out to us. We operate across multiple global platforms including:\n\n• Dollarexim – Cross-border trade solutions\n• SeaOne – Global B2B marketplace\n• SeaOne Digital – Digital growth & technology services\n• Coneio – Granite import & export via shipping\n\nOur team has received your enquiry and will get back to you shortly.\n\nKindly share your specific requirement for faster assistance.`;

    await createWhatsAppMessage(
      crmToken,
      conversationId,
      "Coneio Bot",
      phone,
      welcomeText,
      833680001, // outgoing direction
    );

  } catch (error) {
    console.error("🔥 WhatsApp Template Error:", error);
  }
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

  // ✅ If exists → return existing (DO NOT SEND TEMPLATE)
  if (searchData.value?.length > 0) {
    return searchData.value[0].cr89e_crmconversationid;
  }

  // ✅ If NOT exists → create new conversation
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
  const conversationId =
    entityUrl?.match(/\(([^)]+)\)/)?.[1] || null;

  // 🔥 ONLY WHEN NEW CONVERSATION CREATED → send welcome template + save to CRM
  if (conversationId) {
    await sendWelcomeTemplate(phone, customerName, token, conversationId);
  }

  return conversationId;
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
