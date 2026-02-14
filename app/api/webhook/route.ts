import { NextRequest, NextResponse } from "next/server";
import { getCRMToken, findOrCreateConversation, createWhatsAppMessage } from "@/lib/crm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const change = body?.entry?.[0]?.changes?.[0]?.value;
    const message = change?.messages?.[0];

    if (!message) {
      return NextResponse.json({ received: true });
    }

    const phone = message.from;
    const name = change?.contacts?.[0]?.profile?.name || "Unknown";

    console.log("📩 Incoming:", phone, name, message.type);

    const token = await getCRMToken();
    const conversationId = await findOrCreateConversation(token, phone, name);

    let text = "";
    let fileUrl = "";

    // ============================================
    // TEXT MESSAGE
    // ============================================
    if (message.type === "text") {
      text = message.text.body;
    }

    // ============================================
    // MEDIA MESSAGE (IMAGE / DOCUMENT / VIDEO)
    // ============================================
    if (
      message.type === "document" ||
      message.type === "image" ||
      message.type === "video"
    ) {
      const mediaId =
        message.document?.id ||
        message.image?.id ||
        message.video?.id;

      const mimeType =
        message.document?.mime_type ||
        message.image?.mime_type ||
        message.video?.mime_type;

      const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN!;

      // Generate proper extension
      const extension = mimeType?.split("/")[1] || "bin";

      // If document has filename use it, otherwise generate one
      const fileName =
        message.document?.filename ||
        `${Date.now()}.${extension}`;

      // STEP 1: Get media URL from Meta
      const mediaRes = await fetch(
        `https://graph.facebook.com/v18.0/${mediaId}`,
        {
          headers: {
            Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          },
        }
      );

      const mediaData = await mediaRes.json();

      if (!mediaData.url) {
        console.error("❌ Failed to get media URL:", mediaData);
        return NextResponse.json({ received: true });
      }

      // STEP 2: Download actual file
      const fileRes = await fetch(mediaData.url, {
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        },
      });

      const buffer = await fileRes.arrayBuffer();

      // STEP 3: Save to /public/uploads/{phone}/
      const fs = await import("fs");
      const path = await import("path");

      const uploadDir = path.join(
        process.cwd(),
        "public",
        "uploads",
        phone
      );

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, fileName);

      fs.writeFileSync(filePath, Buffer.from(buffer));

      fileUrl = `/uploads/${phone}/${fileName}`;
      text = fileName;

      console.log("📁 File saved:", fileUrl);
    }

    // ============================================
    // SAVE IN CRM
    // ============================================
    await createWhatsAppMessage(
      token,
      conversationId!,
      name,
      phone,
      text,
      833680000, // Incoming
      fileUrl
    );

    console.log("✅ Stored in CRM");

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ received: true });
  }
}
