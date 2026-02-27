// // import { NextRequest, NextResponse } from "next/server";
// // import { getCRMToken, findOrCreateConversation, createWhatsAppMessage } from "@/lib/crm";
// // import { v2 as cloudinary } from "cloudinary";

// // export const dynamic = "force-dynamic";
// // export const runtime = "nodejs"; // required for cloudinary

// // // ===============================
// // // ✅ Cloudinary Config
// // // ===============================
// // cloudinary.config({
// //   cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
// //   api_key: process.env.CLOUDINARY_API_KEY!,
// //   api_secret: process.env.CLOUDINARY_API_SECRET!,
// // });

// // // ==================================================
// // // ✅ GET — Meta Webhook Verification
// // // ==================================================
// // export async function GET(req: NextRequest) {
// //   const { searchParams } = new URL(req.url);

// //   const mode = searchParams.get("hub.mode");
// //   const token = searchParams.get("hub.verify_token");
// //   const challenge = searchParams.get("hub.challenge");

// //   if (
// //     mode === "subscribe" &&
// //     token === process.env.WHATSAPP_VERIFY_TOKEN
// //   ) {
// //     return new Response(challenge || "", { status: 200 });
// //   }

// //   return new Response("Verification failed", { status: 403 });
// // }

// // // ==================================================
// // // ✅ POST — Incoming WhatsApp Messages
// // // ==================================================
// // export async function POST(req: NextRequest) {
// //   try {
// //     const body = await req.json();

// //     const change = body?.entry?.[0]?.changes?.[0]?.value;
// //     const message = change?.messages?.[0];

// //     if (!message) {
// //       return NextResponse.json({ received: true });
// //     }

// //     const phone = message.from;
// //     const name = change?.contacts?.[0]?.profile?.name || "Unknown";

// //     console.log("📩 Incoming:", phone, name, message.type);

// //     const token = await getCRMToken();
// //     const conversationId = await findOrCreateConversation(token, phone, name);

// //     let text = "";
// //     let fileUrl = "";

// //     // ===============================
// //     // TEXT MESSAGE
// //     // ===============================
// //     if (message.type === "text") {
// //       text = message.text.body;
// //     }

// //     // ===============================
// //     // MEDIA MESSAGE
// //     // ===============================
// //     if (
// //       message.type === "document" ||
// //       message.type === "image" ||
// //       message.type === "video"
// //     ) {
// //       const mediaId =
// //         message.document?.id ||
// //         message.image?.id ||
// //         message.video?.id;

// //       const mimeType =
// //         message.document?.mime_type ||
// //         message.image?.mime_type ||
// //         message.video?.mime_type;

// //       const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN!;

// //       // 1️⃣ Get media URL from Meta
// //       const mediaRes = await fetch(
// //         `https://graph.facebook.com/v18.0/${mediaId}`,
// //         {
// //           headers: {
// //             Authorization: `Bearer ${WHATSAPP_TOKEN}`,
// //           },
// //         }
// //       );

// //       const mediaData = await mediaRes.json();

// //       if (!mediaData.url) {
// //         return NextResponse.json({ received: true });
// //       }

// //       // 2️⃣ Download file buffer
// //       const fileRes = await fetch(mediaData.url, {
// //         headers: {
// //           Authorization: `Bearer ${WHATSAPP_TOKEN}`,
// //         },
// //       });

// //       const arrayBuffer = await fileRes.arrayBuffer();
// //       const buffer = Buffer.from(arrayBuffer);

// //       // 3️⃣ Upload directly to Cloudinary
// //       const uploadResult: any = await new Promise((resolve, reject) => {
// //         cloudinary.uploader
// //           .upload_stream(
// //             {
// //               resource_type: "auto",
// //               folder: `whatsapp/${phone}`,
// //             },
// //             (error, result) => {
// //               if (error) reject(error);
// //               else resolve(result);
// //             }
// //           )
// //           .end(buffer);
// //       });

// //       fileUrl = uploadResult.secure_url;

// //       // Optional: Use filename as message text
// //       text =
// //         message.document?.filename ||
// //         uploadResult.original_filename ||
// //         "Media file";
// //     }

// //     // ===============================
// //     // SEND TO CRM
// //     // ===============================
// //     await createWhatsAppMessage(
// //       token,
// //       conversationId!,
// //       name,
// //       phone,
// //       text,
// //       833680000,
// //       fileUrl
// //     );

// //     return NextResponse.json({ received: true });

// //   } catch (error) {
// //     console.error("Webhook Error:", error);
// //     return NextResponse.json({ received: true });
// //   }
// // }











// import { NextRequest, NextResponse } from "next/server";
// import { getCRMToken, findOrCreateConversation, createWhatsAppMessage } from "@/lib/crm";
// import { v2 as cloudinary } from "cloudinary";

// export const dynamic = "force-dynamic";
// export const runtime = "nodejs";

// // Cloudinary config
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
//   api_key: process.env.CLOUDINARY_API_KEY!,
//   api_secret: process.env.CLOUDINARY_API_SECRET!,
// });

// // ==================================================
// // ✅ GET — Meta Webhook Verification
// // ==================================================
// export async function GET(req: NextRequest) {
//   const { searchParams } = new URL(req.url);

//   const mode = searchParams.get("hub.mode");
//   const token = searchParams.get("hub.verify_token");
//   const challenge = searchParams.get("hub.challenge");

//   if (mode === "subscribe" && token === process.env.WHATSAPP_TOKEN) {
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

//     const token = await getCRMToken();
//     const conversationId = await findOrCreateConversation(token, phone, name);

//     let text = "";
//     let fileUrl = "";

//     // ================= TEXT =================
//     if (message.type === "text") {
//       text = message.text.body;
//     }

//     // ================= MEDIA =================
//     if (
//       message.type === "document" ||
//       message.type === "image" ||
//       message.type === "video"
//     ) {
//       const mediaId =
//         message.document?.id ||
//         message.image?.id ||
//         message.video?.id;

//       const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN!;

//       // 1️⃣ Get media URL
//       const mediaRes = await fetch(
//         `https://graph.facebook.com/v18.0/${mediaId}`,
//         {
//           headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` },
//         }
//       );

//       const mediaData = await mediaRes.json();
//       if (!mediaData.url) return NextResponse.json({ received: true });

//       // 2️⃣ Download file
//       const fileRes = await fetch(mediaData.url, {
//         headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` },
//       });

//       const buffer = Buffer.from(await fileRes.arrayBuffer());

//       // 3️⃣ Extract original filename
//       const originalFileName =
//         message.document?.filename ||
//         `file_${Date.now()}`;

//       const fileNameWithoutExt = originalFileName.replace(/\.[^/.]+$/, "");

//       // 4️⃣ Upload to Cloudinary with same name
//       const uploadResult: any = await new Promise((resolve, reject) => {
//         cloudinary.uploader
//           .upload_stream(
//             {
//               resource_type: "auto",
//               folder: `whatsapp/${phone}`,
//               public_id: fileNameWithoutExt,
//               use_filename: true,
//               unique_filename: false,
//               overwrite: true,
//             },
//             (error, result) => {
//               if (error) reject(error);
//               else resolve(result);
//             }
//           )
//           .end(buffer);
//       });

//       fileUrl = uploadResult.secure_url;
//       text = originalFileName;
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












// import { NextRequest, NextResponse } from "next/server";
// import { getCRMToken, findOrCreateConversation, createWhatsAppMessage } from "@/lib/crm";
// import { v2 as cloudinary } from "cloudinary";

// export const dynamic = "force-dynamic";
// export const runtime = "nodejs";

// // Cloudinary config
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
//   api_key: process.env.CLOUDINARY_API_KEY!,
//   api_secret: process.env.CLOUDINARY_API_SECRET!,
// });

// // ==================================================
// // 🤖 AUTO-REPLY RULES
// // Add your rules here:
// //   - "exact": must match the full message (case-insensitive)
// //   - "keyword": triggers if the message CONTAINS this word/phrase
// // ==================================================
// const AUTO_REPLY_RULES: { type: "exact" | "keyword"; match: string; reply: string }[] = [
//   // ── Greetings ──
//   { type: "exact",   match: "hi",           reply: "Hello! 👋 from Coneio Team. How can we help you today?" },
//   { type: "exact",   match: "hello",        reply: "Hi there! 👋 How can we assist you?" },
//   { type: "exact",   match: "hey",          reply: "Hey! 👋 How can we help you today?" },
//   { type: "exact",   match: "good morning", reply: "Good morning! ☀️ How can we assist you today?" },
//   { type: "exact",   match: "good evening", reply: "Good evening! 🌙 How can we help you?" },

//   // ── Price / Quote ──
//   { type: "keyword", match: "price",        reply: "Thank you for your interest! 💼 Please share the product details and quantity, and our team will send you a quote shortly." },
//   { type: "keyword", match: "quote",        reply: "Sure! Please provide the product name, quantity, and destination so we can prepare your quote. 📋" },
//   { type: "keyword", match: "rate",         reply: "We'd be happy to share our rates! Please tell us the product and quantity you need. 📦" },
//   { type: "keyword", match: "cost",         reply: "For pricing details, please share the product name and required quantity. Our team will get back to you. 💰" },

//   // ── Order / Delivery ──
//   { type: "keyword", match: "order",        reply: "To place an order, please share the product name, quantity, and delivery address. We'll confirm availability shortly. ✅" },
//   { type: "keyword", match: "delivery",     reply: "Delivery timelines depend on the destination and product. Please share the details and we'll confirm ASAP. 🚚" },
//   { type: "keyword", match: "shipping",     reply: "We ship globally! 🌍 Please share the destination and order details so we can provide shipping info." },
//   { type: "keyword", match: "track",        reply: "To track your order, please share your order ID or phone number and we'll check the status for you. 📍" },

//   // ── Support ──
//   { type: "keyword", match: "help",         reply: "We're here to help! 🙌 Please describe your query and our team will assist you." },
//   { type: "keyword", match: "support",      reply: "Our support team is available. Please share your issue and we'll resolve it as soon as possible. 🛠️" },
//   { type: "keyword", match: "problem",      reply: "We're sorry to hear that! 😟 Please describe the issue and we'll look into it right away." },
//   { type: "keyword", match: "issue",        reply: "Please describe the issue you're facing and we'll do our best to resolve it quickly. 🔧" },

//   // ── Product Info ──
//   { type: "keyword", match: "product",      reply: "We offer a wide range of export products. Please specify what you're looking for and we'll share full details. 📦" },
//   { type: "keyword", match: "catalog",      reply: "We'd love to share our product catalog! Please share your email address and we'll send it over. 📄" },
//   { type: "keyword", match: "sample",       reply: "Samples may be available depending on the product. Please share what you need and our team will confirm. 🎁" },

//   // ── Business ──
//   { type: "keyword", match: "invoice",      reply: "For invoice requests, please share your order details or order ID. 🧾" },
//   { type: "keyword", match: "payment",      reply: "We accept multiple payment methods. Please share your order details and our team will guide you through payment. 💳" },
//   { type: "keyword", match: "certificate",  reply: "For certificates (COA, COO, etc.), please share the product name and order ID. Our team will arrange it. 📜" },

//   // ── Common Short Replies ──
//   { type: "exact",   match: "ok",           reply: "Got it! Let us know if you need anything else. 👍" },
//   { type: "exact",   match: "okay",         reply: "Understood! Feel free to reach out if you have more questions. 😊" },
//   { type: "exact",   match: "thanks",       reply: "You're welcome! 😊 Have a great day!" },
//   { type: "exact",   match: "thank you",    reply: "You're welcome! 🙏 We're always here to help." },
//   { type: "exact",   match: "bye",          reply: "Goodbye! 👋 Have a wonderful day. Feel free to reach out anytime." },
// ];

// // ==================================================
// // 🔍 MATCH AUTO-REPLY — checks exact first, then keyword
// // ==================================================
// function getAutoReply(incomingText: string): string | null {
//   const lower = incomingText.trim().toLowerCase();

//   // 1. Check exact matches first
//   for (const rule of AUTO_REPLY_RULES) {
//     if (rule.type === "exact" && lower === rule.match.toLowerCase()) {
//       return rule.reply;
//     }
//   }

//   // 2. Check keyword matches
//   for (const rule of AUTO_REPLY_RULES) {
//     if (rule.type === "keyword" && lower.includes(rule.match.toLowerCase())) {
//       return rule.reply;
//     }
//   }

//   return null;
// }

// // ==================================================
// // 📤 SEND WHATSAPP TEXT MESSAGE
// // ==================================================
// async function sendWhatsAppReply(to: string, replyText: string) {
//   const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN!;
//   const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID!;

//   const res = await fetch(
//     `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
//     {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${WHATSAPP_TOKEN}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         messaging_product: "whatsapp",
//         to,
//         type: "text",
//         text: { body: replyText },
//       }),
//     }
//   );

//   const data = await res.json();
//   console.log("🤖 Auto-reply sent:", data);
//   return data;
// }

// // ==================================================
// // ✅ GET — Meta Webhook Verification
// // ==================================================
// export async function GET(req: NextRequest) {
//   const { searchParams } = new URL(req.url);

//   const mode = searchParams.get("hub.mode");
//   const token = searchParams.get("hub.verify_token");
//   const challenge = searchParams.get("hub.challenge");

//   // ✅ FIXED: now uses WHATSAPP_VERIFY_TOKEN (separate from WHATSAPP_TOKEN)
//   if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
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

//     const token = await getCRMToken();
//     const conversationId = await findOrCreateConversation(token, phone, name);

//     let text = "";
//     let fileUrl = "";

//     // ================= TEXT =================
//     if (message.type === "text") {
//       text = message.text.body;
//     }

//     // ================= MEDIA =================
//     if (
//       message.type === "document" ||
//       message.type === "image" ||
//       message.type === "video"
//     ) {
//       const mediaId =
//         message.document?.id ||
//         message.image?.id ||
//         message.video?.id;

//       const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN!;

//       const mediaRes = await fetch(
//         `https://graph.facebook.com/v18.0/${mediaId}`,
//         {
//           headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` },
//         }
//       );

//       const mediaData = await mediaRes.json();
//       if (!mediaData.url) return NextResponse.json({ received: true });

//       const fileRes = await fetch(mediaData.url, {
//         headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` },
//       });

//       const buffer = Buffer.from(await fileRes.arrayBuffer());

//       const originalFileName =
//         message.document?.filename ||
//         `file_${Date.now()}`;

//       const fileNameWithoutExt = originalFileName.replace(/\.[^/.]+$/, "");

//       const uploadResult: any = await new Promise((resolve, reject) => {
//         cloudinary.uploader
//           .upload_stream(
//             {
//               resource_type: "auto",
//               folder: `whatsapp/${phone}`,
//               public_id: fileNameWithoutExt,
//               use_filename: true,
//               unique_filename: false,
//               overwrite: true,
//             },
//             (error, result) => {
//               if (error) reject(error);
//               else resolve(result);
//             }
//           )
//           .end(buffer);
//       });

//       fileUrl = uploadResult.secure_url;
//       text = originalFileName;
//     }

//     // ================= SAVE INCOMING TO CRM =================
//     await createWhatsAppMessage(
//       token,
//       conversationId!,
//       name,
//       phone,
//       text,
//       833680000, // incoming direction
//       fileUrl
//     );

//     // ================= AUTO-REPLY =================
//     if (message.type === "text" && text) {
//       const autoReply = getAutoReply(text);

//       if (autoReply) {
//         console.log(`🤖 Auto-reply triggered for: "${text}" → "${autoReply}"`);

//         // Send reply via WhatsApp
//         await sendWhatsAppReply(phone, autoReply);

//         // Save auto-reply to CRM as outgoing message
//         await createWhatsAppMessage(
//           token,
//           conversationId!,
//           "ConeioExim Bot",
//           phone,
//           autoReply,
//           833680001, // outgoing direction
//         );
//       }
//     }

//     return NextResponse.json({ received: true });

//   } catch (error) {
//     console.error("Webhook Error:", error);
//     return NextResponse.json({ received: true });
//   }
// }

































// import { NextRequest, NextResponse } from "next/server";
// import { getCRMToken, findOrCreateConversation, createWhatsAppMessage } from "@/lib/crm";
// import { v2 as cloudinary } from "cloudinary";

// export const dynamic = "force-dynamic";
// export const runtime = "nodejs";

// // Cloudinary config
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
//   api_key: process.env.CLOUDINARY_API_KEY!,
//   api_secret: process.env.CLOUDINARY_API_SECRET!,
// });

// // ==================================================
// // 🤖 AUTO-REPLY RULES
// // Add your rules here:
// //   - "exact": must match the full message (case-insensitive)
// //   - "keyword": triggers if the message CONTAINS this word/phrase
// // ==================================================
// const AUTO_REPLY_RULES: { type: "exact" | "keyword"; match: string; reply: string }[] = [
//   // ── Greetings ──
//   { type: "exact",   match: "hi",           reply: "Hello! 👋 Welcome to ConeioExim. How can we help you today?" },
//   { type: "exact",   match: "hello",        reply: "Hi there! 👋 How can we assist you?" },
//   { type: "exact",   match: "hey",          reply: "Hey! 👋 How can we help you today?" },
//   { type: "exact",   match: "good morning", reply: "Good morning! ☀️ How can we assist you today?" },
//   { type: "exact",   match: "good evening", reply: "Good evening! 🌙 How can we help you?" },

//   // ── Price / Quote ──
//   { type: "keyword", match: "price",        reply: "Thank you for your interest! 💼 Please share the product details and quantity, and our team will send you a quote shortly." },
//   { type: "keyword", match: "quote",        reply: "Sure! Please provide the product name, quantity, and destination so we can prepare your quote. 📋" },
//   { type: "keyword", match: "rate",         reply: "We'd be happy to share our rates! Please tell us the product and quantity you need. 📦" },
//   { type: "keyword", match: "cost",         reply: "For pricing details, please share the product name and required quantity. Our team will get back to you. 💰" },

//   // ── Order / Delivery ──
//   { type: "keyword", match: "order",        reply: "To place an order, please share the product name, quantity, and delivery address. We'll confirm availability shortly. ✅" },
//   { type: "keyword", match: "delivery",     reply: "Delivery timelines depend on the destination and product. Please share the details and we'll confirm ASAP. 🚚" },
//   { type: "keyword", match: "shipping",     reply: "We ship globally! 🌍 Please share the destination and order details so we can provide shipping info." },
//   { type: "keyword", match: "track",        reply: "To track your order, please share your order ID or phone number and we'll check the status for you. 📍" },

//   // ── Support ──
//   { type: "keyword", match: "help",         reply: "We're here to help! 🙌 Please describe your query and our team will assist you." },
//   { type: "keyword", match: "support",      reply: "Our support team is available. Please share your issue and we'll resolve it as soon as possible. 🛠️" },
//   { type: "keyword", match: "problem",      reply: "We're sorry to hear that! 😟 Please describe the issue and we'll look into it right away." },
//   { type: "keyword", match: "issue",        reply: "Please describe the issue you're facing and we'll do our best to resolve it quickly. 🔧" },

//   // ── Product Info ──
//   { type: "keyword", match: "product",      reply: "We offer a wide range of export products. Please specify what you're looking for and we'll share full details. 📦" },
//   { type: "keyword", match: "catalog",      reply: "We'd love to share our product catalog! Please share your email address and we'll send it over. 📄" },
//   { type: "keyword", match: "sample",       reply: "Samples may be available depending on the product. Please share what you need and our team will confirm. 🎁" },

//   // ── Business ──
//   { type: "keyword", match: "invoice",      reply: "For invoice requests, please share your order details or order ID. 🧾" },
//   { type: "keyword", match: "payment",      reply: "We accept multiple payment methods. Please share your order details and our team will guide you through payment. 💳" },
//   { type: "keyword", match: "certificate",  reply: "For certificates (COA, COO, etc.), please share the product name and order ID. Our team will arrange it. 📜" },

//   // ── Common Short Replies ──
//   { type: "exact",   match: "ok",           reply: "Got it! Let us know if you need anything else. 👍" },
//   { type: "exact",   match: "okay",         reply: "Understood! Feel free to reach out if you have more questions. 😊" },
//   { type: "exact",   match: "thanks",       reply: "You're welcome! 😊 Have a great day!" },
//   { type: "exact",   match: "thank you",    reply: "You're welcome! 🙏 We're always here to help." },
//   { type: "exact",   match: "bye",          reply: "Goodbye! 👋 Have a wonderful day. Feel free to reach out anytime." },
// ];

// // ==================================================
// // 🔍 MATCH AUTO-REPLY
// // - "exact" rules: match the word/phrase ANYWHERE in the sentence (case-insensitive)
// //   e.g. "hi there!" will match exact rule "hi"
// // - "keyword" rules: also match anywhere in sentence
// // - Returns FIRST match only (exact rules checked before keyword rules)
// // ==================================================
// function getAutoReply(incomingText: string): string | null {
//   const lower = incomingText.trim().toLowerCase();

//   // 1. Check exact rules first — word must appear anywhere in sentence
//   for (const rule of AUTO_REPLY_RULES) {
//     if (rule.type === "exact") {
//       // Match as a whole word anywhere in the sentence
//       const regex = new RegExp(`\\b${rule.match.toLowerCase()}\\b`);
//       if (regex.test(lower)) {
//         return rule.reply;
//       }
//     }
//   }

//   // 2. Check keyword rules — phrase appears anywhere in sentence
//   for (const rule of AUTO_REPLY_RULES) {
//     if (rule.type === "keyword" && lower.includes(rule.match.toLowerCase())) {
//       return rule.reply;
//     }
//   }

//   return null;
// }

// // ==================================================
// // 📤 SEND WHATSAPP TEXT MESSAGE
// // ==================================================
// async function sendWhatsAppReply(to: string, replyText: string) {
//   const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN!;
//   const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID!;

//   const res = await fetch(
//     `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
//     {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${WHATSAPP_TOKEN}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         messaging_product: "whatsapp",
//         to,
//         type: "text",
//         text: { body: replyText },
//       }),
//     }
//   );

//   const data = await res.json();
//   console.log("🤖 Auto-reply sent:", data);
//   return data;
// }

// // ==================================================
// // ✅ GET — Meta Webhook Verification
// // ==================================================
// export async function GET(req: NextRequest) {
//   const { searchParams } = new URL(req.url);

//   const mode = searchParams.get("hub.mode");
//   const token = searchParams.get("hub.verify_token");
//   const challenge = searchParams.get("hub.challenge");

//   // ✅ FIXED: now uses WHATSAPP_VERIFY_TOKEN (separate from WHATSAPP_TOKEN)
//   if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
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

//     const token = await getCRMToken();
//     const conversationId = await findOrCreateConversation(token, phone, name);

//     let text = "";
//     let fileUrl = "";

//     // ================= TEXT =================
//     if (message.type === "text") {
//       text = message.text.body;
//     }

//     // ================= MEDIA =================
//     if (
//       message.type === "document" ||
//       message.type === "image" ||
//       message.type === "video"
//     ) {
//       const mediaId =
//         message.document?.id ||
//         message.image?.id ||
//         message.video?.id;

//       const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN!;

//       const mediaRes = await fetch(
//         `https://graph.facebook.com/v18.0/${mediaId}`,
//         {
//           headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` },
//         }
//       );

//       const mediaData = await mediaRes.json();
//       if (!mediaData.url) return NextResponse.json({ received: true });

//       const fileRes = await fetch(mediaData.url, {
//         headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` },
//       });

//       const buffer = Buffer.from(await fileRes.arrayBuffer());

//       const originalFileName =
//         message.document?.filename ||
//         `file_${Date.now()}`;

//       const fileNameWithoutExt = originalFileName.replace(/\.[^/.]+$/, "");

//       const uploadResult: any = await new Promise((resolve, reject) => {
//         cloudinary.uploader
//           .upload_stream(
//             {
//               resource_type: "auto",
//               folder: `whatsapp/${phone}`,
//               public_id: fileNameWithoutExt,
//               use_filename: true,
//               unique_filename: false,
//               overwrite: true,
//             },
//             (error, result) => {
//               if (error) reject(error);
//               else resolve(result);
//             }
//           )
//           .end(buffer);
//       });

//       fileUrl = uploadResult.secure_url;
//       text = originalFileName;
//     }

//     // ================= SAVE INCOMING TO CRM =================
//     await createWhatsAppMessage(
//       token,
//       conversationId!,
//       name,
//       phone,
//       text,
//       833680000, // incoming direction
//       fileUrl
//     );

//     // ================= AUTO-REPLY =================
//     if (message.type === "text" && text) {
//       const autoReply = getAutoReply(text);

//       if (autoReply) {
//         console.log(`🤖 Auto-reply triggered for: "${text}" → "${autoReply}"`);

//         // Send reply via WhatsApp
//         await sendWhatsAppReply(phone, autoReply);

//         // Save auto-reply to CRM as outgoing message
//         await createWhatsAppMessage(
//           token,
//           conversationId!,
//           "ConeioExim Bot",
//           phone,
//           autoReply,
//           833680001, // outgoing direction
//         );
//       }
//     }

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
export const runtime = "nodejs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// ==================================================
// 🧠 BUSINESS SYSTEM PROMPT — Full company knowledge
// ==================================================
const SYSTEM_PROMPT = `You are a smart, friendly WhatsApp customer support assistant for Coneio Exim Pvt Ltd.

== ABOUT THE COMPANY ==
Coneio Exim Pvt Ltd is a global export/import company operating across multiple platforms:

1. **Dollarexim** (dollarexim.com) — Cross-border trade solutions. Helps businesses with international trade, import/export documentation, and global sourcing.

2. **SeaOne** (seaone.com) — Global B2B marketplace connecting buyers and sellers worldwide for bulk trade.

3. **SeaOne Digital** (seaonedigital.com) — Digital growth & technology services including web development, digital marketing, and tech solutions for businesses.

4. **SilkRouteX** (silkroutex.com) — International trade and logistics platform connecting suppliers across Asia and beyond.

5. **Coneio** (coneioexim.com) — Granite import & export via shipping. Specializes in granite slabs, tiles, and stone products sourced from India and exported globally.

== PRODUCTS WE SELL ==
- Granite slabs, tiles, and stone products (various colors and finishes)
- Export goods across multiple categories via our platforms
- B2B trade services and sourcing solutions

== PRICING & QUOTES ==
- We do NOT share fixed prices on WhatsApp — prices depend on product type, quantity, destination, and current market rates
- Always ask for: product name, quantity (in sq ft, sq m, or tonnes), destination country, and preferred delivery timeline
- Then tell them our team will prepare a formal quote and send it within 24-48 hours

== SHIPPING & DELIVERY ==
- We ship globally to all major countries
- Typical delivery: 15-30 days for sea freight, 3-7 days for air freight
- We handle all documentation: Bill of Lading, Certificate of Origin, Packing List, Commercial Invoice
- Minimum order quantities vary by product

== HOW TO RESPOND ==
- Be warm, professional, and concise
- Use relevant emojis sparingly
- Always collect required info (product, quantity, destination) before promising a quote
- If someone asks for something very specific like exact prices, negotiation, complaints, or urgent order issues — trigger handoff (see below)
- Keep replies under 200 words
- Reply in the same language the customer uses

== HANDOFF TRIGGER ==
If the customer asks any of the following, you MUST include the exact phrase "HANDOFF_REQUIRED" at the very END of your response (after your message):
- Exact/final pricing or price negotiation
- Specific order complaints or disputes  
- Urgent shipment issues
- Legal or contract matters
- Requests to speak to a manager or specific person
- Any question you genuinely cannot answer confidently

== LIMITED MODE ==
If you are told the conversation is in LIMITED MODE, only respond with:
"Thank you for your patience 🙏 Our team member will get back to you shortly. For urgent queries, you can also reach us at our websites: dollarexim.com | seaone.com | coneioexim.com"
Do not answer any other questions in limited mode.`;

// ==================================================
// 🔄 IN-MEMORY HANDOFF STATE
// Tracks which phone numbers are in limited mode
// In production you could store this in a DB/Redis
// ==================================================
const handoffState = new Map<string, boolean>();

// ==================================================
// 🤖 GET AI REPLY FROM HUGGINGFACE (Mistral-7B)
// ==================================================
async function getAIReply(
  customerMessage: string,
  customerName: string,
  phone: string
): Promise<{ reply: string; isHandoff: boolean }> {
  const isLimited = handoffState.get(phone) || false;

  // Build Mistral instruct-format prompt
  const prompt = isLimited
    ? `<s>[INST] ${SYSTEM_PROMPT}\n\n[LIMITED MODE] Customer says: "${customerMessage}" [/INST]`
    : `<s>[INST] ${SYSTEM_PROMPT}\n\nCustomer name: ${customerName}\nCustomer message: "${customerMessage}" [/INST]`;

  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 300,       // reply length
            temperature: 0.7,          // creativity (0=strict, 1=creative)
            top_p: 0.9,
            do_sample: true,
            return_full_text: false,   // only return new generated text, not the prompt
          },
        }),
      }
    );

    const data = await response.json();

    // HuggingFace returns an array: [{ generated_text: "..." }]
    if (!response.ok || !Array.isArray(data)) {
      console.error("❌ HuggingFace Error:", data);
      return {
        reply: "Thank you for reaching out! Our team will get back to you shortly. 🙏",
        isHandoff: false,
      };
    }

    const rawReply: string = data[0]?.generated_text || "";

    if (!rawReply) {
      return {
        reply: "Thank you for your message! Our team will get back to you shortly. 🙏",
        isHandoff: false,
      };
    }

    // Check if AI triggered handoff
    const isHandoff = rawReply.includes("HANDOFF_REQUIRED");

    // Clean reply — remove handoff marker and any leftover prompt artifacts
    let cleanReply = rawReply
      .replace("HANDOFF_REQUIRED", "")
      .replace(/^\s*\[\/INST\]\s*/g, "")  // remove any leaked prompt tags
      .trim();

    // If handoff triggered, append the handoff message
    if (isHandoff) {
      cleanReply += "\n\n🤝 One of our team members will personally connect with you shortly to assist you further.";
      handoffState.set(phone, true); // switch to limited mode
      console.log(`🔀 Handoff triggered for: ${phone}`);
    }

    return { reply: cleanReply, isHandoff };

  } catch (error) {
    console.error("🔥 HuggingFace fetch error:", error);
    return {
      reply: "Thank you for your message! Our team will get back to you shortly. 🙏",
      isHandoff: false,
    };
  }
}

}

// ==================================================
// 📤 SEND WHATSAPP TEXT MESSAGE
// ==================================================
async function sendWhatsAppReply(to: string, replyText: string) {
  const res = await fetch(
    `https://graph.facebook.com/v18.0/${process.env.PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: replyText },
      }),
    }
  );

  const data = await res.json();
  console.log("🤖 AI reply sent:", data?.messages?.[0]?.id || data);
  return data;
}

// ==================================================
// ✅ GET — Meta Webhook Verification
// ==================================================
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
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
    const name = change?.contacts?.[0]?.profile?.name || "Customer";

    const crmToken = await getCRMToken();
    const conversationId = await findOrCreateConversation(crmToken, phone, name);

    let text = "";
    let fileUrl = "";

    // ================= TEXT =================
    if (message.type === "text") {
      text = message.text.body;
    }

    // ================= MEDIA =================
    if (
      message.type === "document" ||
      message.type === "image" ||
      message.type === "video"
    ) {
      const mediaId =
        message.document?.id ||
        message.image?.id ||
        message.video?.id;

      const mediaRes = await fetch(
        `https://graph.facebook.com/v18.0/${mediaId}`,
        { headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` } }
      );

      const mediaData = await mediaRes.json();
      if (!mediaData.url) return NextResponse.json({ received: true });

      const fileRes = await fetch(mediaData.url, {
        headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` },
      });

      const buffer = Buffer.from(await fileRes.arrayBuffer());
      const originalFileName = message.document?.filename || `file_${Date.now()}`;
      const fileNameWithoutExt = originalFileName.replace(/\.[^/.]+$/, "");

      const uploadResult: any = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              resource_type: "auto",
              folder: `whatsapp/${phone}`,
              public_id: fileNameWithoutExt,
              use_filename: true,
              unique_filename: false,
              overwrite: true,
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          )
          .end(buffer);
      });

      fileUrl = uploadResult.secure_url;
      text = originalFileName;
    }

    // ================= SAVE INCOMING TO CRM =================
    await createWhatsAppMessage(
      crmToken,
      conversationId!,
      name,
      phone,
      text,
      833680000, // incoming
      fileUrl
    );

    // ================= AI REPLY (text messages only) =================
    if (message.type === "text" && text) {
      console.log(`💬 Message from ${name} (${phone}): "${text}"`);

      const { reply, isHandoff } = await getAIReply(text, name, phone);

      console.log(`🤖 AI reply: "${reply.substring(0, 80)}..."`);
      if (isHandoff) console.log(`🔀 Conversation ${phone} switched to LIMITED MODE`);

      // Send reply via WhatsApp
      await sendWhatsAppReply(phone, reply);

      // Save AI reply to CRM as outgoing
      await createWhatsAppMessage(
        crmToken,
        conversationId!,
        "EximLink Bot",
        phone,
        reply,
        833680001, // outgoing
      );
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ received: true });
  }
}