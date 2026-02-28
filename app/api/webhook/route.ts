// import { NextRequest, NextResponse } from "next/server";
// import { getCRMToken, findOrCreateConversation, createWhatsAppMessage } from "@/lib/crm";
// import { v2 as cloudinary } from "cloudinary";

// export const dynamic = "force-dynamic";
// export const runtime = "nodejs";

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
//   api_key: process.env.CLOUDINARY_API_KEY!,
//   api_secret: process.env.CLOUDINARY_API_SECRET!,
// });

// // ==================================================
// // 🧠 SEAONE ECOSYSTEM SYSTEM PROMPT
// // ==================================================
// const SYSTEM_PROMPT = `You are the official WhatsApp AI assistant for Coneio Exim — the Coneio Exim Global Trade Ecosystem. Be professional, friendly, and thorough. Give COMPLETE responses — never cut off mid-sentence. Always finish your full reply.

// OUR 5 PLATFORMS:
// 1. coneio.com — Corporate & group identity platform
// 2. seaone.io — Smart Digital Freight Engine (origin → destination → best route + price)
// 3. seaonedigital.com — Global logistics partner & forwarder network (B2B)
// 4. dollarexim.com — Global granite & stone trade marketplace (slabs, tiles, Black Galaxy, Tan Brown, Kashmir White etc.)
// 5. silkroutex.com — AI-powered HSN classification & trade compliance intelligence

// ROUTING RULES (always mention the relevant platform URL):
// - Freight rates / shipping / logistics → seaone.io
// - Granite / stone products / export → dollarexim.com
// - HSN codes / trade compliance / customs → silkroutex.com
// - Forwarder / agent partnerships → seaonedigital.com
// - Company info / about us → coneio.com

// PRICING: Never give exact prices. For freight: ask origin, destination, cargo type. For granite: ask product, quantity, destination. Say team will reply in 24-48 hours.

// HANDOFF: Write HANDOFF_REQUIRED at the end ONLY if customer is angry/complaining, wants to negotiate a deal, or explicitly asks for a human.`;

// // ==================================================
// // 🔄 HANDOFF STATE
// // ==================================================
// const handoffState = new Map<string, boolean>();

// // ==================================================
// // 🤖 GET AI REPLY FROM GOOGLE GEMINI
// // ==================================================
// async function getAIReply(
//   customerMessage: string,
//   customerName: string,
//   phone: string
// ): Promise<{ reply: string; isHandoff: boolean }> {

//   if (handoffState.get(phone)) {
//     return {
//       reply: "Thank you for your patience 🙏 A Coneio Exim team member will connect with you shortly.\n\nMeanwhile:\n🔵 seaone.io — Freight rates\n🟠 dollarexim.com — Granite trade\n🟡 silkroutex.com — HSN & compliance\n🟢 coneio.com — About us",
//       isHandoff: false,
//     };
//   }

//   // Try models in order — fallback if one fails due to quota
//   // Models your project has quota for (based on AI Studio rate limit page)
//   const MODELS = [
//     "gemini-2.5-flash",
//     "gemini-2.5-flash-lite",
//     "gemini-2.0-flash-001",
//   ];

//   try {
//     console.log(`💬 Gemini [${customerName}]: "${customerMessage}"`);

//     let data: any = null;
//     let response: any = null;

//     for (const model of MODELS) {
//       response = await fetch(
//         `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             system_instruction: {
//               parts: [{ text: SYSTEM_PROMPT }],
//             },
//             contents: [
//               {
//                 role: "user",
//                 parts: [{ text: `My name is ${customerName}. ${customerMessage}` }],
//               },
//             ],
//             generationConfig: {
//               temperature: 0.7,
//               maxOutputTokens: 2048,
//               topP: 0.9,
//             },
//           }),
//         }
//       );

//       data = await response.json();
//       console.log(`📨 Model: ${model} | Status: ${response.status} | Response: ${JSON.stringify(data).substring(0, 150)}`);

//       if (response.ok && data?.candidates?.[0]?.content?.parts?.[0]?.text) {
//         console.log(`✅ Using model: ${model}`);
//         break; // found a working model
//       }

//       console.warn(`⚠️ Model ${model} failed (${data?.error?.code}): ${data?.error?.message?.substring(0, 80)}`);
//     }

//     if (!response.ok || !data?.candidates?.[0]?.content?.parts?.[0]?.text) {
//       console.error("❌ All Gemini models failed");
//       return {
//         reply: "Thank you for contacting Coneio Exim! 🙏 Please tell us what you need — freight rates, granite products, HSN codes, or logistics partnerships?",
//         isHandoff: false,
//       };
//     }

//     // ✅ For thinking models, parts may have multiple entries
//     // Find the text part (not thoughtSignature)
//     const parts = data?.candidates?.[0]?.content?.parts || [];
//     const rawReply: string = parts.find((p: any) => p.text && !p.thoughtSignature)?.text
//       || parts.find((p: any) => p.text)?.text
//       || "";

//     console.log(`📝 Parts count: ${parts.length}, types: ${parts.map((p:any) => Object.keys(p).join(',')).join(' | ')}`);

//     if (!rawReply) {
//       console.error("❌ Empty reply. Full response:", JSON.stringify(data));
//       return {
//         reply: "Thank you for your message! Our team will get back to you shortly. 🙏",
//         isHandoff: false,
//       };
//     }

//     console.log(`🤖 Reply: "${rawReply.substring(0, 150)}"`);

//     const isHandoff = rawReply.includes("HANDOFF_REQUIRED");
//     let cleanReply = rawReply.replace("HANDOFF_REQUIRED", "").trim();

//     if (isHandoff) {
//       cleanReply += "\n\n🤝 A Coneio Exim team member will personally connect with you shortly.";
//       handoffState.set(phone, true);
//       console.log(`🔀 Handoff: ${phone}`);
//     }

//     return { reply: cleanReply, isHandoff };

//   } catch (error) {
//     console.error("🔥 Gemini error:", error);
//     return {
//       reply: "Thank you for your message! Our team will get back to you shortly. 🙏",
//       isHandoff: false,
//     };
//   }
// }

// // ==================================================
// // 📤 SEND WHATSAPP MESSAGE
// // ==================================================
// async function sendWhatsAppReply(to: string, replyText: string) {
//   const res = await fetch(
//     `https://graph.facebook.com/v18.0/${process.env.PHONE_NUMBER_ID}/messages`,
//     {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
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
//   console.log("✅ Sent:", data?.messages?.[0]?.id || JSON.stringify(data));
//   return data;
// }

// // ==================================================
// // ✅ GET — Webhook Verification
// // ==================================================
// export async function GET(req: NextRequest) {
//   const { searchParams } = new URL(req.url);
//   const mode = searchParams.get("hub.mode");
//   const token = searchParams.get("hub.verify_token");
//   const challenge = searchParams.get("hub.challenge");

//   if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
//     return new Response(challenge || "", { status: 200 });
//   }
//   return new Response("Verification failed", { status: 403 });
// }

// // ==================================================
// // ✅ POST — Incoming Messages
// // ==================================================
// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     const change = body?.entry?.[0]?.changes?.[0]?.value;
//     const message = change?.messages?.[0];

//     if (!message) return NextResponse.json({ received: true });

//     const phone = message.from;
//     const name = change?.contacts?.[0]?.profile?.name || "Customer";

//     const crmToken = await getCRMToken();
//     const conversationId = await findOrCreateConversation(crmToken, phone, name);

//     let text = "";
//     let fileUrl = "";

//     if (message.type === "text") {
//       text = message.text.body;
//     }

//     if (["document", "image", "video"].includes(message.type)) {
//       const mediaId = message.document?.id || message.image?.id || message.video?.id;

//       const mediaRes = await fetch(
//         `https://graph.facebook.com/v18.0/${mediaId}`,
//         { headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` } }
//       );
//       const mediaData = await mediaRes.json();
//       if (!mediaData.url) return NextResponse.json({ received: true });

//       const fileRes = await fetch(mediaData.url, {
//         headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` },
//       });

//       const buffer = Buffer.from(await fileRes.arrayBuffer());
//       const originalFileName = message.document?.filename || `file_${Date.now()}`;
//       const fileNameWithoutExt = originalFileName.replace(/\.[^/.]+$/, "");

//       const uploadResult: any = await new Promise((resolve, reject) => {
//         cloudinary.uploader.upload_stream(
//           {
//             resource_type: "auto",
//             folder: `whatsapp/${phone}`,
//             public_id: fileNameWithoutExt,
//             use_filename: true,
//             unique_filename: false,
//             overwrite: true,
//           },
//           (error, result) => { if (error) reject(error); else resolve(result); }
//         ).end(buffer);
//       });

//       fileUrl = uploadResult.secure_url;
//       text = originalFileName;
//     }

//     await createWhatsAppMessage(crmToken, conversationId!, name, phone, text, 833680000, fileUrl);

//     if (message.type === "text" && text) {
//       const { reply } = await getAIReply(text, name, phone);
//       await sendWhatsAppReply(phone, reply);
//       await createWhatsAppMessage(crmToken, conversationId!, "Coneio Exim Bot", phone, reply, 833680001);
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
// 🧠 SEAONE ECOSYSTEM SYSTEM PROMPT
// ==================================================
const SYSTEM_PROMPT = `You are the official WhatsApp AI assistant for Coneio Global Trade Ecosystem. Be professional, friendly, and thorough. Give COMPLETE responses — never cut off mid-sentence.

OUR 5 PLATFORMS:
1. coneio.com — Corporate & group identity platform
2. seaone.io — Smart Digital Freight Engine (origin → destination → best route + price)
3. seaonedigital.com — Global logistics partner & forwarder network (B2B)
4. dollarexim.com — Global granite & stone trade marketplace (slabs, tiles, Black Galaxy, Tan Brown, Kashmir White etc.)
5. silkroutex.com — AI-powered HSN classification & trade compliance intelligence

ROUTING RULES (always mention the relevant platform URL):
- Freight rates / shipping / logistics → seaone.io
- Granite / stone products / export → dollarexim.com
- HSN codes / trade compliance / customs → silkroutex.com
- Forwarder / agent partnerships → seaonedigital.com
- Company info / about us → coneio.com

PRICING: Never give exact prices. For freight: ask origin, destination, cargo type. For granite: ask product, quantity, destination.

== CONVERSATION FLOW (CRITICAL) ==
You are collecting customer requirements through natural conversation. You have access to the full conversation history.

PHASE 1 — COLLECTING:
Ask for missing details one or two at a time (not all at once):
  - Granite/stone: product type → quantity → destination
  - Freight/logistics: origin → destination → cargo type + weight
  - HSN/compliance: product name → countries involved
  - Partnerships: company type → location

PHASE 2 — CONFIRM & CLOSE (trigger this when you have enough core details):
Once customer has given the key details (product/service + at least one more detail like quantity OR destination), send ONE confirmation message in this format:

"Thank you, [Name]! 🙏

We have received your enquiry:
[Use relevant emojis to list each detail they provided, e.g.]
📦 Product: Black Galaxy Granite
📐 Quantity: 500 sq ft  
🌍 Destination: UAE
🔢 HSN: 680233

Our Coneio Global Trade team will review your requirements and contact you within 24 hours with detailed pricing, availability, and next steps.

We look forward to working with you! 😊"

Then add REQUIREMENTS_COMPLETE at the very end (hidden marker, not shown to user).

PHASE 3 — AFTER CLOSING:
If customer sends another message after the closing:
- New question → answer it helpfully
- "ok", "thanks", "noted" → respond warmly: "You're welcome! Have a great day! 😊 Feel free to reach out anytime."
- New requirement → collect and send another confirmation

HANDOFF: Add HANDOFF_REQUIRED at end ONLY if customer is angry, wants to negotiate price, or asks for human.`;

// ==================================================
// 🔄 CONVERSATION STATE TRACKING
// ==================================================
const handoffState = new Map<string, boolean>();

// Stores last N messages per phone number for context
const conversationHistory = new Map<string, { role: string; text: string }[]>();

function addToHistory(phone: string, role: string, text: string) {
  const history = conversationHistory.get(phone) || [];
  history.push({ role, text });
  // Keep last 10 messages only
  if (history.length > 10) history.shift();
  conversationHistory.set(phone, history);
}

function getHistory(phone: string): { role: string; text: string }[] {
  return conversationHistory.get(phone) || [];
}

// ==================================================
// 🤖 GET AI REPLY FROM GOOGLE GEMINI
// ==================================================
async function getAIReply(
  customerMessage: string,
  customerName: string,
  phone: string
): Promise<{ reply: string; isHandoff: boolean }> {

  if (handoffState.get(phone)) {
    return {
      reply: "Our team has received your enquiry and will connect with you shortly. 🙏 If you have any other questions in the meantime, feel free to ask!",
      isHandoff: false,
    };
  }

  // Try models in order — fallback if one fails due to quota
  // Models your project has quota for (based on AI Studio rate limit page)
  const MODELS = [
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash-001",
  ];

  try {
    console.log(`💬 Gemini [${customerName}]: "${customerMessage}"`);

    let data: any = null;
    let response: any = null;

    for (const model of MODELS) {
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: SYSTEM_PROMPT }],
            },
            // ✅ Pass full conversation history for context
            contents: [
              // First message includes customer name for context
              {
                role: "user",
                parts: [{ text: `My name is ${customerName}.` }],
              },
              {
                role: "model",
                parts: [{ text: `Hello ${customerName}! Welcome to Coneio Global Trade Ecosystem. How can I assist you today?` }],
              },
              // Include previous conversation turns
              ...getHistory(phone).map(h => ({
                role: h.role === "bot" ? "model" : "user",
                parts: [{ text: h.text }],
              })),
              // Current message
              {
                role: "user",
                parts: [{ text: customerMessage }],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2048,
              topP: 0.9,
            },
          }),
        }
      );

      data = await response.json();
      console.log(`📨 Model: ${model} | Status: ${response.status} | Response: ${JSON.stringify(data).substring(0, 150)}`);

      if (response.ok && data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        console.log(`✅ Using model: ${model}`);
        break; // found a working model
      }

      console.warn(`⚠️ Model ${model} failed (${data?.error?.code}): ${data?.error?.message?.substring(0, 80)}`);
    }

    if (!response.ok || !data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error("❌ All Gemini models failed");
      return {
        reply: "Thank you for contacting Coneio Global Trade! 🙏 Please tell us what you need — freight rates, granite products, HSN codes, or logistics partnerships?",
        isHandoff: false,
      };
    }

    // ✅ For thinking models, parts may have multiple entries
    // Find the text part (not thoughtSignature)
    const parts = data?.candidates?.[0]?.content?.parts || [];
    const rawReply: string = parts.find((p: any) => p.text && !p.thoughtSignature)?.text
      || parts.find((p: any) => p.text)?.text
      || "";

    console.log(`📝 Parts count: ${parts.length}, types: ${parts.map((p:any) => Object.keys(p).join(',')).join(' | ')}`);

    if (!rawReply) {
      console.error("❌ Empty reply. Full response:", JSON.stringify(data));
      return {
        reply: "Thank you for your message! Our team will get back to you shortly. 🙏",
        isHandoff: false,
      };
    }

    console.log(`🤖 Reply: "${rawReply.substring(0, 150)}"`);

    const isHandoff = rawReply.includes("HANDOFF_REQUIRED");
    const isComplete = rawReply.includes("REQUIREMENTS_COMPLETE");

    let cleanReply = rawReply
      .replace("HANDOFF_REQUIRED", "")
      .replace("REQUIREMENTS_COMPLETE", "")
      .trim();

    if (isHandoff) {
      cleanReply += "\n\n🤝 A Coneio Global Trade team member will personally connect with you shortly.";
      handoffState.set(phone, true);
      console.log(`🔀 Handoff triggered for: ${phone}`);
    }

    if (isComplete) {
      console.log(`✅ Requirements confirmed for: ${phone}`);
      // Don't block further messages — just log it
    }

    return { reply: cleanReply, isHandoff };

  } catch (error) {
    console.error("🔥 Gemini error:", error);
    return {
      reply: "Thank you for your message! Our team will get back to you shortly. 🙏",
      isHandoff: false,
    };
  }
}

// ==================================================
// 📤 SEND WHATSAPP MESSAGE
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
  console.log("✅ Sent:", data?.messages?.[0]?.id || JSON.stringify(data));
  return data;
}

// ==================================================
// ✅ GET — Webhook Verification
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
// ✅ POST — Incoming Messages
// ==================================================
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const change = body?.entry?.[0]?.changes?.[0]?.value;
    const message = change?.messages?.[0];

    if (!message) return NextResponse.json({ received: true });

    const phone = message.from;
    const name = change?.contacts?.[0]?.profile?.name || "Customer";

    const crmToken = await getCRMToken();
    const conversationId = await findOrCreateConversation(crmToken, phone, name);

    let text = "";
    let fileUrl = "";

    if (message.type === "text") {
      text = message.text.body;
    }

    if (["document", "image", "video"].includes(message.type)) {
      const mediaId = message.document?.id || message.image?.id || message.video?.id;

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
        cloudinary.uploader.upload_stream(
          {
            resource_type: "auto",
            folder: `whatsapp/${phone}`,
            public_id: fileNameWithoutExt,
            use_filename: true,
            unique_filename: false,
            overwrite: true,
          },
          (error, result) => { if (error) reject(error); else resolve(result); }
        ).end(buffer);
      });

      fileUrl = uploadResult.secure_url;
      text = originalFileName;
    }

    await createWhatsAppMessage(crmToken, conversationId!, name, phone, text, 833680000, fileUrl);

    if (message.type === "text" && text) {
      // Save user message to history
      addToHistory(phone, "user", text);

      const { reply } = await getAIReply(text, name, phone);

      // Save bot reply to history
      addToHistory(phone, "bot", reply);

      await sendWhatsAppReply(phone, reply);
      await createWhatsAppMessage(crmToken, conversationId!, "Coneio Global Trade Bot", phone, reply, 833680001);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ received: true });
  }
}