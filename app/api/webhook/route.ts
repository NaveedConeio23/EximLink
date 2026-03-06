// import { NextRequest, NextResponse } from "next/server";
// import { getCRMToken, findOrCreateConversation, createWhatsAppMessage } from "@/lib/crm";
// import { v2 as cloudinary } from "cloudinary";
// import { getAgentMode, setAgentMode } from "@/lib/agentMode";
// import { getLanguage, setLanguage } from "@/lib/languageMode";

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
// const SYSTEM_PROMPT = `You are the official WhatsApp AI assistant for Coneio Exim Pvt Ltd. Be professional, friendly, and thorough. Give COMPLETE responses — never cut off mid-sentence.

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

// PRICING: Never give exact prices. For freight: ask origin, destination, cargo type. For granite: ask product, quantity, destination.

// == CONVERSATION FLOW (CRITICAL) ==
// You are collecting customer requirements through natural conversation. You have access to the full conversation history.

// PHASE 1 — COLLECTING:
// Ask for missing details one or two at a time (not all at once):
//   - Granite/stone: product type → quantity → destination
//   - Freight/logistics: origin → destination → cargo type + weight
//   - HSN/compliance: product name → countries involved
//   - Partnerships: company type → location

// PHASE 2 — CONFIRM & CLOSE (trigger this when you have enough core details):
// Once customer has given the key details (product/service + at least one more detail like quantity OR destination), send ONE confirmation message in this format:

// "Thank you, [Name]! 🙏

// We have received your enquiry:
// [Use relevant emojis to list each detail they provided, e.g.]
// 📦 Product: Black Galaxy Granite
// 📐 Quantity: 500 sq ft  
// 🌍 Destination: UAE
// 🔢 HSN: 680233

// Our Coneio Exim Pvt Ltd. team will review your requirements and contact you within 24 hours with detailed pricing, availability, and next steps.

// We look forward to working with you! 😊"

// Then add REQUIREMENTS_COMPLETE at the very end (hidden marker, not shown to user).

// PHASE 3 — AFTER CLOSING:
// If customer sends another message after the closing:
// - New question → answer it helpfully
// - "ok", "thanks", "noted" → respond warmly: "You're welcome! Have a great day! 😊 Feel free to reach out anytime."
// - New requirement → collect and send another confirmation

// HANDOFF: Add HANDOFF_REQUIRED at end ONLY if customer is angry, wants to negotiate price, or asks for human.`;

// // ==================================================
// // 🔄 CONVERSATION STATE TRACKING
// // ==================================================
// const handoffState = new Map<string, boolean>();

// // Tracks detected language per phone (auto-detected from first message)
// const detectedLanguage = new Map<string, string>();

// // Agent mode: shared singleton so webhook + agent-mode API read the same state

// // Stores last N messages per phone number for context
// const conversationHistory = new Map<string, { role: string; text: string }[]>();

// function addToHistory(phone: string, role: string, text: string) {
//   const history = conversationHistory.get(phone) || [];
//   history.push({ role, text });
//   // Keep last 10 messages only
//   if (history.length > 10) history.shift();
//   conversationHistory.set(phone, history);
// }

// function getHistory(phone: string): { role: string; text: string }[] {
//   return conversationHistory.get(phone) || [];
// }

// // ==================================================
// // 🤖 GET AI REPLY FROM GOOGLE GEMINI
// // ==================================================
// async function getAIReply(
//   customerMessage: string,
//   customerName: string,
//   phone: string,
//   forcedLanguage: string = "auto"
// ): Promise<{ reply: string; isHandoff: boolean }> {

//   if (handoffState.get(phone)) {
//     return {
//       reply: "Our team has received your enquiry and will connect with you shortly. 🙏 If you have any other questions in the meantime, feel free to ask!",
//       isHandoff: false,
//     };
//   }

//   const GROQ_MODELS = [
//     "llama-3.3-70b-versatile",
//     "llama-3.1-8b-instant",
//     "mixtral-8x7b-32768",
//   ];

//   const GROQ_KEYS = [
//     process.env.GROQ_API_KEY,
//     process.env.GROQ_API_KEY_2,
//     process.env.GROQ_API_KEY_3,
//   ].filter(Boolean) as string[];

//   const GEMINI_KEYS = [
//     process.env.GEMINI_API_KEY,
//     process.env.GEMINI_API_KEY_2,
//   ].filter(Boolean) as string[];

//   try {
//     console.log(`💬 AI Reply [${customerName}]: "${customerMessage}"`);

//     const historyMessages: { role: string; content: string }[] = [];
//     const history = getHistory(phone);
//     for (const h of history) {
//       historyMessages.push({
//         role: h.role === "bot" ? "assistant" : "user",
//         content: h.text,
//       });
//     }

//     let rawReply = "";

//     // ─── Try Groq first ───────────────────
//     if (GROQ_KEYS.length > 0) {
//       outer_groq: for (const apiKey of GROQ_KEYS) {
//         for (const model of GROQ_MODELS) {
//           try {
//             const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
//               method: "POST",
//               headers: {
//                 "Content-Type": "application/json",
//                 "Authorization": `Bearer ${apiKey}`,
//               },
//               body: JSON.stringify({
//                 model,
//                 messages: [
//                   { role: "system", content: SYSTEM_PROMPT + `\n\nCustomer name: ${customerName}` },
//                   ...historyMessages,
//                   { role: "user", content: customerMessage },
//                 ],
//                 temperature: 0.7,
//                 max_tokens: 1024,
//               }),
//             });

//             const data = await res.json();
//             console.log(`📨 Groq model: ${model} | Status: ${res.status} | ${JSON.stringify(data).substring(0, 120)}`);

//             if (res.ok && data?.choices?.[0]?.message?.content) {
//               rawReply = data.choices[0].message.content.trim();
//               console.log(`✅ Groq success: ${model}`);
//               break outer_groq;
//             }

//             const errMsg = data?.error?.message?.substring(0, 80) || "unknown";
//             console.warn(`⚠️ Groq ${model} failed: ${errMsg}`);

//             if (data?.error?.code === "invalid_api_key") break;
//           } catch (e) {
//             console.warn(`⚠️ Groq fetch error: ${e}`);
//           }
//         }
//       }
//     }

//     // ─── Fallback to Gemini ───
//     if (!rawReply && GEMINI_KEYS.length > 0) {
//       outer_gemini: for (const apiKey of GEMINI_KEYS) {
//         for (const model of ["gemini-2.5-flash", "gemini-2.0-flash-001"]) {
//           try {
//             const geminiTurns: { role: string; parts: { text: string }[] }[] = [];
//             for (const h of history) {
//               const role = h.role === "bot" ? "model" : "user";
//               if (geminiTurns.length > 0 && geminiTurns[geminiTurns.length - 1].role === role) {
//                 geminiTurns[geminiTurns.length - 1].parts[0].text += " " + h.text;
//               } else {
//                 geminiTurns.push({ role, parts: [{ text: h.text }] });
//               }
//             }
//             if (geminiTurns.length === 0 || geminiTurns[geminiTurns.length - 1].role === "model") {
//               geminiTurns.push({ role: "user", parts: [{ text: `[${customerName}] ${customerMessage}` }] });
//             } else {
//               geminiTurns[geminiTurns.length - 1].parts[0].text += " " + customerMessage;
//             }

//             const res = await fetch(
//               `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
//               {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({
//                   system_instruction: { parts: [{ text: SYSTEM_PROMPT + `

// Customer name: ${customerName}

// == LANGUAGE RULES (CRITICAL) ==
// ${forcedLanguage === "auto"
//   ? "Detect the customer's language and reply in the SAME language always."
//   : `Always reply in ${forcedLanguage} as set by the agent.`
// }` }] },
//                   contents: geminiTurns,
//                   generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
//                 }),
//               }
//             );

//             const data = await res.json();
//             console.log(`📨 Gemini model: ${model} | Status: ${res.status}`);

//             if (res.ok && data?.candidates?.[0]?.content?.parts?.[0]?.text) {
//               const parts = data.candidates[0].content.parts;
//               rawReply = (parts.find((p: any) => p.text && !p.thoughtSignature) || parts[0])?.text?.trim() || "";
//               if (rawReply) { console.log(`✅ Gemini fallback success: ${model}`); break outer_gemini; }
//             }

//             const errMsg = data?.error?.message || "";
//             console.warn(`⚠️ Gemini ${model} failed: ${errMsg.substring(0, 80)}`);
//             if (errMsg.includes("expired") || errMsg.includes("invalid")) break;
//           } catch (e) {
//             console.warn(`⚠️ Gemini fetch error: ${e}`);
//           }
//         }
//       }
//     }

//     if (!rawReply) {
//       console.error("❌ All AI providers failed — staying silent");
//       return { reply: "", isHandoff: false };
//     }

//     console.log(`🤖 Reply: "${rawReply.substring(0, 150)}"`);

//     const isHandoff = rawReply.includes("HANDOFF_REQUIRED");
//     const isComplete = rawReply.includes("REQUIREMENTS_COMPLETE");

//     let cleanReply = rawReply
//       .replace("HANDOFF_REQUIRED", "")
//       .replace("REQUIREMENTS_COMPLETE", "")
//       .trim();

//     if (isHandoff) {
//       cleanReply += "\n\n🤝 A Coneio Exim Pvt Ltd team member will personally connect with you shortly.";
//       handoffState.set(phone, true);
//       console.log(`🔀 Handoff triggered for: ${phone}`);
//     }

//     if (isComplete) {
//       console.log(`✅ Requirements confirmed for: ${phone}`);
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
//     `https://graph.facebook.com/v19.0/${process.env.PHONE_NUMBER_ID}/messages`,
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

//     if (["document", "image", "video", "sticker"].includes(message.type)) {
//       const mediaId = message.document?.id || message.image?.id || message.video?.id || message.sticker?.id;

//       const mimeType: string =
//         message.document?.mime_type ||
//         message.image?.mime_type ||
//         message.video?.mime_type ||
//         message.sticker?.mime_type ||
//         "application/octet-stream";

//       // WhatsApp GIF picker sends type="video", mime="video/mp4", animated=true
//       // Actual .gif file sends type="image", mime="image/gif"
//       const isGif =
//         mimeType === "image/gif" ||
//         (message.type === "video" && message.video?.animated === true);

//       console.log(`📥 Media: type=${message.type} mime=${mimeType} isGif=${isGif} animated=${message.video?.animated}`);

//       try {
//         // Step 1: get download URL from WhatsApp
//         const mediaRes = await fetch(
//           `https://graph.facebook.com/v19.0/${mediaId}`,
//           { headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` } }
//         );
//         const mediaData = await mediaRes.json();
//         if (!mediaData.url) {
//           console.error(`❌ WhatsApp returned no URL for media ${mediaId}:`, JSON.stringify(mediaData));
//           return NextResponse.json({ received: true });
//         }

//         // Step 2: download the bytes
//         const fileRes = await fetch(mediaData.url, {
//           headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` },
//         });
//         const buffer = Buffer.from(await fileRes.arrayBuffer());
//         console.log(`📦 Downloaded ${Math.round(buffer.length / 1024)}KB`);

//         const mimeToExt: Record<string, string> = {
//           "image/gif": ".gif", "image/jpeg": ".jpg", "image/jpg": ".jpg",
//           "image/png": ".png", "image/webp": ".webp", "video/mp4": ".mp4",
//           "video/3gpp": ".3gp", "audio/ogg": ".ogg", "audio/mpeg": ".mp3",
//           "application/pdf": ".pdf",
//         };
//         const ext = mimeToExt[mimeType] || "";

//         // Upload everything to Cloudinary — GIFs/mp4-animated upload as video/mp4
//         // Dashboard detects .mp4 from Cloudinary URL and plays inline with autoplay+loop
//         const publicId = `${message.type}_${Date.now()}`;
//         const uploadResult: any = await new Promise((resolve, reject) => {
//           cloudinary.uploader.upload_stream(
//             { resource_type: "auto", folder: `whatsapp/${phone}`, public_id: publicId, overwrite: true },
//             (error, result) => {
//               if (error) { console.error("❌ Cloudinary error:", error); reject(error); }
//               else resolve(result);
//             }
//           ).end(buffer);
//         });
//         fileUrl = uploadResult.secure_url;
//         text = isGif ? "gif" : (message.document?.filename || `${message.type}_${Date.now()}${ext}`);
//         console.log(`✅ Uploaded to Cloudinary: ${fileUrl}`);
//       } catch (uploadErr) {
//         console.error("❌ Media upload failed:", uploadErr);
//         // Don't save an empty record — return early
//         return NextResponse.json({ received: true });
//       }
//     }

//     await createWhatsAppMessage(crmToken, conversationId!, name, phone, text, 833680000, fileUrl);

//     if (message.type === "text" && text) {
//       // ✅ Check if agent has taken over — if yes, bot stays SILENT
//       if (getAgentMode(phone)) {
//         console.log(`🔇 Agent mode ON for ${phone} — bot is silent, agent handles this chat`);
//         return NextResponse.json({ received: true });
//       }

//       // Save user message to history
//       addToHistory(phone, "user", text);

//       const forcedLang = getLanguage(phone);
//       const { reply } = await getAIReply(text, name, phone, forcedLang);

//       // Empty reply = API key issue, stay silent
//       if (!reply || !reply.trim()) {
//         console.log("🔇 Empty reply — not sending anything (check API key)");
//         return NextResponse.json({ received: true });
//       }

//       // If handoff triggered by AI, also set agent mode
//       if (reply.includes("A Coneio Exim Pvt Ltd team member will personally connect")) {
//         setAgentMode(phone, true);
//         console.log(`🔀 Handoff detected — setting agent mode ON for ${phone}`);
//       }

//       // Save bot reply to history
//       addToHistory(phone, "bot", reply);

//       await sendWhatsAppReply(phone, reply);
//       await createWhatsAppMessage(crmToken, conversationId!, "Coneio Bot", phone, reply, 833680001);
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
import { getAgentMode, setAgentMode } from "@/lib/agentMode";
import { getLanguage, setLanguage } from "@/lib/languageMode";

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
const SYSTEM_PROMPT = `You are the official WhatsApp AI assistant for Coneio Exim Pvt Ltd. Be professional, friendly, and thorough. Give COMPLETE responses — never cut off mid-sentence.

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

Our Coneio Exim Pvt Ltd. team will review your requirements and contact you within 24 hours with detailed pricing, availability, and next steps.

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

// Tracks detected language per phone (auto-detected from first message)
const detectedLanguage = new Map<string, string>();

// Agent mode: shared singleton so webhook + agent-mode API read the same state

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
  phone: string,
  forcedLanguage: string = "auto"
): Promise<{ reply: string; isHandoff: boolean }> {

  if (handoffState.get(phone)) {
    return {
      reply: "Our team has received your enquiry and will connect with you shortly. 🙏 If you have any other questions in the meantime, feel free to ask!",
      isHandoff: false,
    };
  }

  const GROQ_MODELS = [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "mixtral-8x7b-32768",
  ];

  const GROQ_KEYS = [
    process.env.GROQ_API_KEY,
    process.env.GROQ_API_KEY_2,
    process.env.GROQ_API_KEY_3,
  ].filter(Boolean) as string[];

  const GEMINI_KEYS = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_2,
  ].filter(Boolean) as string[];

  try {
    console.log(`💬 AI Reply [${customerName}]: "${customerMessage}"`);

    const historyMessages: { role: string; content: string }[] = [];
    const history = getHistory(phone);
    for (const h of history) {
      historyMessages.push({
        role: h.role === "bot" ? "assistant" : "user",
        content: h.text,
      });
    }

    let rawReply = "";

    // ─── Try Groq first ───────────────────
    if (GROQ_KEYS.length > 0) {
      outer_groq: for (const apiKey of GROQ_KEYS) {
        for (const model of GROQ_MODELS) {
          try {
            const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
              },
              body: JSON.stringify({
                model,
                messages: [
                  { role: "system", content: SYSTEM_PROMPT + `

Customer name: ${customerName}

== LANGUAGE INSTRUCTION (HIGHEST PRIORITY) ==
${forcedLanguage === "auto"
  ? `DETECT the language of the customer's latest message and reply in THAT EXACT SAME language.
- Customer writes Hindi → you reply in Hindi
- Customer writes Arabic → you reply in Arabic  
- Customer writes Telugu → you reply in Telugu
- Customer writes Tamil → you reply in Tamil
- Customer writes Urdu → you reply in Urdu
- Customer writes Turkish → you reply in Turkish
- Customer writes Persian → you reply in Persian
- Customer writes any other language → reply in that language
- Customer writes English → reply in English
DO NOT reply in English if the customer wrote in another language.`
  : `ALWAYS reply in ${forcedLanguage}. Do NOT use any other language.`
}` },
                  ...historyMessages,
                  { role: "user", content: customerMessage },
                ],
                temperature: 0.7,
                max_tokens: 1024,
              }),
            });

            const data = await res.json();
            console.log(`📨 Groq model: ${model} | Status: ${res.status} | ${JSON.stringify(data).substring(0, 120)}`);

            if (res.ok && data?.choices?.[0]?.message?.content) {
              rawReply = data.choices[0].message.content.trim();
              console.log(`✅ Groq success: ${model}`);
              break outer_groq;
            }

            const errMsg = data?.error?.message?.substring(0, 80) || "unknown";
            console.warn(`⚠️ Groq ${model} failed: ${errMsg}`);

            if (data?.error?.code === "invalid_api_key") break;
          } catch (e) {
            console.warn(`⚠️ Groq fetch error: ${e}`);
          }
        }
      }
    }

    // ─── Fallback to Gemini ───
    if (!rawReply && GEMINI_KEYS.length > 0) {
      outer_gemini: for (const apiKey of GEMINI_KEYS) {
        for (const model of ["gemini-2.5-flash", "gemini-2.0-flash-001"]) {
          try {
            const geminiTurns: { role: string; parts: { text: string }[] }[] = [];
            for (const h of history) {
              const role = h.role === "bot" ? "model" : "user";
              if (geminiTurns.length > 0 && geminiTurns[geminiTurns.length - 1].role === role) {
                geminiTurns[geminiTurns.length - 1].parts[0].text += " " + h.text;
              } else {
                geminiTurns.push({ role, parts: [{ text: h.text }] });
              }
            }
            if (geminiTurns.length === 0 || geminiTurns[geminiTurns.length - 1].role === "model") {
              geminiTurns.push({ role: "user", parts: [{ text: `[${customerName}] ${customerMessage}` }] });
            } else {
              geminiTurns[geminiTurns.length - 1].parts[0].text += " " + customerMessage;
            }

            const res = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  system_instruction: { parts: [{ text: SYSTEM_PROMPT + `

Customer name: ${customerName}

== LANGUAGE INSTRUCTION (HIGHEST PRIORITY) ==
${forcedLanguage === "auto"
  ? `DETECT the language of the customer's message and reply in THAT EXACT language. If they write Hindi, reply Hindi. If Arabic, reply Arabic. If Telugu, reply Telugu. Never reply in English if the customer wrote in another language.`
  : `ALWAYS reply in ${forcedLanguage}. Do NOT use any other language.`
}` }] },
                  contents: geminiTurns,
                  generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
                }),
              }
            );

            const data = await res.json();
            console.log(`📨 Gemini model: ${model} | Status: ${res.status}`);

            if (res.ok && data?.candidates?.[0]?.content?.parts?.[0]?.text) {
              const parts = data.candidates[0].content.parts;
              rawReply = (parts.find((p: any) => p.text && !p.thoughtSignature) || parts[0])?.text?.trim() || "";
              if (rawReply) { console.log(`✅ Gemini fallback success: ${model}`); break outer_gemini; }
            }

            const errMsg = data?.error?.message || "";
            console.warn(`⚠️ Gemini ${model} failed: ${errMsg.substring(0, 80)}`);
            if (errMsg.includes("expired") || errMsg.includes("invalid")) break;
          } catch (e) {
            console.warn(`⚠️ Gemini fetch error: ${e}`);
          }
        }
      }
    }

    if (!rawReply) {
      console.error("❌ All AI providers failed — staying silent");
      return { reply: "", isHandoff: false };
    }

    console.log(`🤖 Reply: "${rawReply.substring(0, 150)}"`);

    const isHandoff = rawReply.includes("HANDOFF_REQUIRED");
    const isComplete = rawReply.includes("REQUIREMENTS_COMPLETE");

    let cleanReply = rawReply
      .replace("HANDOFF_REQUIRED", "")
      .replace("REQUIREMENTS_COMPLETE", "")
      .trim();

    if (isHandoff) {
      cleanReply += "\n\n🤝 A Coneio Exim Pvt Ltd team member will personally connect with you shortly.";
      handoffState.set(phone, true);
      console.log(`🔀 Handoff triggered for: ${phone}`);
    }

    if (isComplete) {
      console.log(`✅ Requirements confirmed for: ${phone}`);
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
    `https://graph.facebook.com/v19.0/${process.env.PHONE_NUMBER_ID}/messages`,
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

    if (["document", "image", "video", "sticker"].includes(message.type)) {
      const mediaId = message.document?.id || message.image?.id || message.video?.id || message.sticker?.id;

      const mimeType: string =
        message.document?.mime_type ||
        message.image?.mime_type ||
        message.video?.mime_type ||
        message.sticker?.mime_type ||
        "application/octet-stream";

      // WhatsApp GIF picker sends type="video", mime="video/mp4", animated=true
      // Actual .gif file sends type="image", mime="image/gif"
      const isGif =
        mimeType === "image/gif" ||
        (message.type === "video" && message.video?.animated === true);

      console.log(`📥 Media: type=${message.type} mime=${mimeType} isGif=${isGif} animated=${message.video?.animated}`);

      try {
        // Step 1: get download URL from WhatsApp
        const mediaRes = await fetch(
          `https://graph.facebook.com/v19.0/${mediaId}`,
          { headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` } }
        );
        const mediaData = await mediaRes.json();
        if (!mediaData.url) {
          console.error(`❌ WhatsApp returned no URL for media ${mediaId}:`, JSON.stringify(mediaData));
          return NextResponse.json({ received: true });
        }

        // Step 2: download the bytes
        const fileRes = await fetch(mediaData.url, {
          headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` },
        });
        const buffer = Buffer.from(await fileRes.arrayBuffer());
        console.log(`📦 Downloaded ${Math.round(buffer.length / 1024)}KB`);

        const mimeToExt: Record<string, string> = {
          "image/gif": ".gif", "image/jpeg": ".jpg", "image/jpg": ".jpg",
          "image/png": ".png", "image/webp": ".webp", "video/mp4": ".mp4",
          "video/3gpp": ".3gp", "audio/ogg": ".ogg", "audio/mpeg": ".mp3",
          "application/pdf": ".pdf",
        };
        const ext = mimeToExt[mimeType] || "";

        // Upload everything to Cloudinary — GIFs/mp4-animated upload as video/mp4
        // Dashboard detects .mp4 from Cloudinary URL and plays inline with autoplay+loop
        const publicId = `${message.type}_${Date.now()}`;
        const uploadResult: any = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { resource_type: "auto", folder: `whatsapp/${phone}`, public_id: publicId, overwrite: true },
            (error, result) => {
              if (error) { console.error("❌ Cloudinary error:", error); reject(error); }
              else resolve(result);
            }
          ).end(buffer);
        });
        fileUrl = uploadResult.secure_url;
        text = isGif ? "gif" : (message.document?.filename || `${message.type}_${Date.now()}${ext}`);
        console.log(`✅ Uploaded to Cloudinary: ${fileUrl}`);
      } catch (uploadErr) {
        console.error("❌ Media upload failed:", uploadErr);
        // Don't save an empty record — return early
        return NextResponse.json({ received: true });
      }
    }

    await createWhatsAppMessage(crmToken, conversationId!, name, phone, text, 833680000, fileUrl);

    if (message.type === "text" && text) {
      // ✅ Check if agent has taken over — if yes, bot stays SILENT
      if (getAgentMode(phone)) {
        console.log(`🔇 Agent mode ON for ${phone} — bot is silent, agent handles this chat`);
        return NextResponse.json({ received: true });
      }

      // Save user message to history
      addToHistory(phone, "user", text);

      const forcedLang = getLanguage(phone);
      const { reply } = await getAIReply(text, name, phone, forcedLang);

      // Empty reply = API key issue, stay silent
      if (!reply || !reply.trim()) {
        console.log("🔇 Empty reply — not sending anything (check API key)");
        return NextResponse.json({ received: true });
      }

      // If handoff triggered by AI, also set agent mode
      if (reply.includes("A Coneio Exim Pvt Ltd team member will personally connect")) {
        setAgentMode(phone, true);
        console.log(`🔀 Handoff detected — setting agent mode ON for ${phone}`);
      }

      // Save bot reply to history
      addToHistory(phone, "bot", reply);

      await sendWhatsAppReply(phone, reply);
      await createWhatsAppMessage(crmToken, conversationId!, "Coneio Bot", phone, reply, 833680001);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ received: true });
  }
}