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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const to = formData.get("to") as string;
    const message = formData.get("message") as string;
    const file = formData.get("file") as File | null;

    if (!to) {
      return NextResponse.json({ error: "Phone required" }, { status: 400 });
    }

    const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN!;
    const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID!;

    let metaResponseData: any = null;
    let sentText = message || "";

    // ===============================
    // SEND TEXT MESSAGE
    // ===============================
    if (message && !file) {
      const res = await fetch(
        `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
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
        `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/media`,
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
        `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
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
    const conversationId = await findOrCreateConversation(token, to, to);

    await createWhatsAppMessage(
      token,
      conversationId!,
      `${user.firstName} ${user.lastName}`,
      to,
      sentText,
      833680001,
    );

    return NextResponse.json({ success: true, meta: metaResponseData });
  } catch (error) {
    console.error("SEND MESSAGE ERROR:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
