// import { NextRequest, NextResponse } from "next/server";
// import { getCRMToken, findOrCreateConversation, createWhatsAppMessage } from "@/lib/crm";

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();

//     const change = body?.entry?.[0]?.changes?.[0]?.value;
//     const message = change?.messages?.[0];

//     if (!message) {
//       return NextResponse.json({ received: true });
//     }

//     const phone = message.from;
//     const name = change?.contacts?.[0]?.profile?.name || "Unknown";

//     console.log("📩 Incoming:", phone, name, message.type);

//     const token = await getCRMToken();
//     const conversationId = await findOrCreateConversation(token, phone, name);

//     let text = "";
//     let fileUrl = "";

//     // ============================================
//     // TEXT MESSAGE
//     // ============================================
//     if (message.type === "text") {
//       text = message.text.body;
//     }

//     // ============================================
//     // MEDIA MESSAGE (IMAGE / DOCUMENT / VIDEO)
//     // ============================================
//     if (
//       message.type === "document" ||
//       message.type === "image" ||
//       message.type === "video"
//     ) {
//       const mediaId =
//         message.document?.id ||
//         message.image?.id ||
//         message.video?.id;

//       const mimeType =
//         message.document?.mime_type ||
//         message.image?.mime_type ||
//         message.video?.mime_type;

//       const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN!;

//       // Generate proper extension
//       const extension = mimeType?.split("/")[1] || "bin";

//       // If document has filename use it, otherwise generate one
//       const fileName =
//         message.document?.filename ||
//         `${Date.now()}.${extension}`;

//       // STEP 1: Get media URL from Meta
//       const mediaRes = await fetch(
//         `https://graph.facebook.com/v18.0/${mediaId}`,
//         {
//           headers: {
//             Authorization: `Bearer ${WHATSAPP_TOKEN}`,
//           },
//         }
//       );

//       const mediaData = await mediaRes.json();

//       if (!mediaData.url) {
//         console.error("❌ Failed to get media URL:", mediaData);
//         return NextResponse.json({ received: true });
//       }

//       // STEP 2: Download actual file
//       const fileRes = await fetch(mediaData.url, {
//         headers: {
//           Authorization: `Bearer ${WHATSAPP_TOKEN}`,
//         },
//       });

//       const buffer = await fileRes.arrayBuffer();

//       // STEP 3: Save to /public/uploads/{phone}/
//       const fs = await import("fs");
//       const path = await import("path");

//       const uploadDir = path.join(
//         process.cwd(),
//         "public",
//         "uploads",
//         phone
//       );

//       if (!fs.existsSync(uploadDir)) {
//         fs.mkdirSync(uploadDir, { recursive: true });
//       }

//       const filePath = path.join(uploadDir, fileName);

//       fs.writeFileSync(filePath, Buffer.from(buffer));

//       fileUrl = `/uploads/${phone}/${fileName}`;
//       text = fileName;

//       console.log("📁 File saved:", fileUrl);
//     }

//     // ============================================
//     // SAVE IN CRM
//     // ============================================
//     await createWhatsAppMessage(
//       token,
//       conversationId!,
//       name,
//       phone,
//       text,
//       833680000, // Incoming
//       fileUrl
//     );

//     console.log("✅ Stored in CRM");

//     return NextResponse.json({ received: true });

//   } catch (error) {
//     console.error("Webhook Error:", error);
//     return NextResponse.json({ received: true });
//   }
// }




// import { NextRequest, NextResponse } from "next/server";
// import { getCRMToken, findOrCreateConversation, createWhatsAppMessage } from "@/lib/crm";

// export const dynamic = "force-dynamic"; // important for Vercel

// // ==================================================
// // ✅ GET — Meta Webhook Verification
// // ==================================================
// export async function GET(req: NextRequest) {
//   const { searchParams } = new URL(req.url);

//   const mode = searchParams.get("hub.mode");
//   const token = searchParams.get("hub.verify_token");
//   const challenge = searchParams.get("hub.challenge");

//   if (
//     mode === "subscribe" &&
//     token === process.env.WHATSAPP_VERIFY_TOKEN
//   ) {
//     return new Response(challenge || "", { status: 200 });
//   }

//   return new Response("Verification failed", { status: 403 });
// }

// // ==================================================
// // ✅ POST — Incoming WhatsApp Messages
// // ==================================================
// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();

//     const change = body?.entry?.[0]?.changes?.[0]?.value;
//     const message = change?.messages?.[0];

//     if (!message) {
//       return NextResponse.json({ received: true });
//     }

//     const phone = message.from;
//     const name = change?.contacts?.[0]?.profile?.name || "Unknown";

//     console.log("📩 Incoming:", phone, name, message.type);

//     const token = await getCRMToken();
//     const conversationId = await findOrCreateConversation(token, phone, name);

//     let text = "";
//     let fileUrl = "";

//     if (message.type === "text") {
//       text = message.text.body;
//     }

//     if (
//       message.type === "document" ||
//       message.type === "image" ||
//       message.type === "video"
//     ) {
//       const mediaId =
//         message.document?.id ||
//         message.image?.id ||
//         message.video?.id;

//       const mimeType =
//         message.document?.mime_type ||
//         message.image?.mime_type ||
//         message.video?.mime_type;

//       const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN!;

//       const extension = mimeType?.split("/")[1] || "bin";
//       const fileName =
//         message.document?.filename ||
//         `${Date.now()}.${extension}`;

//       const mediaRes = await fetch(
//         `https://graph.facebook.com/v18.0/${mediaId}`,
//         {
//           headers: {
//             Authorization: `Bearer ${WHATSAPP_TOKEN}`,
//           },
//         }
//       );

//       const mediaData = await mediaRes.json();

//       if (!mediaData.url) {
//         return NextResponse.json({ received: true });
//       }

//       const fileRes = await fetch(mediaData.url, {
//         headers: {
//           Authorization: `Bearer ${WHATSAPP_TOKEN}`,
//         },
//       });

//       const buffer = await fileRes.arrayBuffer();

//       const fs = await import("fs");
//       const path = await import("path");

//       const uploadDir = path.join(
//         process.cwd(),
//         "public",
//         "uploads",
//         phone
//       );

//       if (!fs.existsSync(uploadDir)) {
//         fs.mkdirSync(uploadDir, { recursive: true });
//       }

//       const filePath = path.join(uploadDir, fileName);

//       fs.writeFileSync(filePath, Buffer.from(buffer));

//       fileUrl = `/uploads/${phone}/${fileName}`;
//       text = fileName;
//     }

//     await createWhatsAppMessage(
//       token,
//       conversationId!,
//       name,
//       phone,
//       text,
//       833680000,
//       fileUrl
//     );

//     return NextResponse.json({ received: true });

//   } catch (error) {
//     console.error("Webhook Error:", error);
//     return NextResponse.json({ received: true });
//   }
// }




import { NextRequest, NextResponse } from "next/server";
import { getCRMToken, findOrCreateConversation, createWhatsAppMessage } from "@/lib/crm";
import { v2 as cloudinary } from "cloudinary";

export const dynamic = "force-dynamic";
export const runtime = "nodejs"; // required for cloudinary

// ===============================
// ✅ Cloudinary Config
// ===============================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// ==================================================
// ✅ GET — Meta Webhook Verification
// ==================================================
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (
    mode === "subscribe" &&
    token === process.env.WHATSAPP_VERIFY_TOKEN
  ) {
    return new Response(challenge || "", { status: 200 });
  }

  return new Response("Verification failed", { status: 403 });
}

// ==================================================
// ✅ POST — Incoming WhatsApp Messages
// ==================================================
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

    // ===============================
    // TEXT MESSAGE
    // ===============================
    if (message.type === "text") {
      text = message.text.body;
    }

    // ===============================
    // MEDIA MESSAGE
    // ===============================
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

      // 1️⃣ Get media URL from Meta
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
        return NextResponse.json({ received: true });
      }

      // 2️⃣ Download file buffer
      const fileRes = await fetch(mediaData.url, {
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        },
      });

      const arrayBuffer = await fileRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // 3️⃣ Upload directly to Cloudinary
      const uploadResult: any = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              resource_type: "auto",
              folder: `whatsapp/${phone}`,
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          )
          .end(buffer);
      });

      fileUrl = uploadResult.secure_url;

      // Optional: Use filename as message text
      text =
        message.document?.filename ||
        uploadResult.original_filename ||
        "Media file";
    }

    // ===============================
    // SEND TO CRM
    // ===============================
    await createWhatsAppMessage(
      token,
      conversationId!,
      name,
      phone,
      text,
      833680000,
      fileUrl
    );

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ received: true });
  }
}
