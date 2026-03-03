import { NextRequest, NextResponse } from "next/server";
import {
  getCRMToken,
  findOrCreateConversation,
  createWhatsAppMessage,
} from "@/lib/crm";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      // ✅ Detailed logging so you can diagnose auth failures in terminal
      console.error("❌ send-message 401: No valid session cookie found.");
      console.error("   Make sure the browser has a valid 'token' cookie.");
      console.error("   If this keeps happening after login, the cookie may have");
      console.error("   no maxAge set (session cookie lost on server restart).");
      console.error("   Fix: update login/route.ts to add maxAge: 60*60*24*7");
      return NextResponse.json({ error: "Unauthorized — please log out and log back in" }, { status: 401 });
    }
    console.log("✅ send-message: authenticated as", user.firstName, user.lastName);

    const formData = await req.formData();
    const toRaw = formData.get("to") as string;
    const message = formData.get("message") as string;
    const file = formData.get("file") as File | null;

    if (!toRaw) {
      return NextResponse.json({ error: "Phone required" }, { status: 400 });
    }

    // ✅ FIX 1: Strip ALL non-digits so the phone matches exactly what
    // findOrCreateConversation stores in CRM (it also does replace(/\D/g, ""))
    // This prevents a duplicate conversation being created on every agent send,
    // which caused the message to save to the WRONG conversationId and disappear.
    const to = toRaw.replace(/\D/g, "");

    const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN!;
    const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID!;

    let metaResponseData: any = null;
    let sentText = message || "";

    // ===============================
    // SEND TEXT MESSAGE
    // ===============================
    if (message && !file) {
      // ✅ FIX 2: Use v19.0 to match the rest of the codebase (crm.ts uses v19.0)
      const res = await fetch(
        `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${WHATSAPP_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to,
            type: "text",
            text: { body: message },
          }),
        },
      );

      metaResponseData = await res.json();
      console.log("Meta Text Response:", metaResponseData);

      if (!res.ok) {
        console.error("❌ WhatsApp text send failed:", metaResponseData);
      }
    }

    // ===============================
    // SEND FILE MESSAGE
    // ===============================
    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());

      const form = new FormData();
      form.append("messaging_product", "whatsapp");
      form.append(
        "file",
        new Blob([buffer], { type: file.type || "application/pdf" }),
        file.name,
      );

      const uploadRes = await fetch(
        `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/media`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          },
          body: form,
        },
      );

      const uploadData = await uploadRes.json();
      console.log("Meta Upload Response:", uploadData);

      if (!uploadData.id) {
        return NextResponse.json(
          { error: "Media upload failed", meta: uploadData },
          { status: 500 },
        );
      }

      const sendRes = await fetch(
        `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${WHATSAPP_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to,
            type: "document",
            document: {
              id: uploadData.id,
              filename: file.name,
            },
          }),
        },
      );

      const sendData = await sendRes.json();
      console.log("Meta File Send Response:", sendData);

      sentText = file.name;
    }

    // ===============================
    // SAVE TO CRM
    // ===============================
    const token = await getCRMToken();

    // ✅ FIX 3: `to` is now fully normalized (digits only), so findOrCreateConversation
    // will correctly find the EXISTING conversation instead of creating a duplicate.
    const conversationId = await findOrCreateConversation(token, to, to);

    if (!conversationId) {
      console.error("❌ Could not find or create conversation for:", to);
      return NextResponse.json({ error: "Conversation not found" }, { status: 500 });
    }

    await createWhatsAppMessage(
      token,
      conversationId,
      `${user.firstName} ${user.lastName}`,
      to,
      sentText,
      833680001, // outbound direction
    );

    return NextResponse.json({ success: true, meta: metaResponseData });
  } catch (error) {
    console.error("SEND MESSAGE ERROR:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}