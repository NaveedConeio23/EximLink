import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "GEMINI_API_KEY not set" }, { status: 500 });

  // Try models in order until one works
  const models = [
    "gemini-2.0-flash-lite",
    "gemini-2.0-flash",
    "gemini-2.5-flash",
    "gemini-flash-latest",
  ];

  for (const model of models) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: "Say: I am working!" }] }],
            generationConfig: { maxOutputTokens: 20 },
          }),
        }
      );
      const data = await res.json();
      if (res.ok && data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        return NextResponse.json({
          success: true,
          working_model: model,
          reply: data.candidates[0].content.parts[0].text,
        });
      }
      console.log(`❌ ${model} failed:`, data?.error?.message);
    } catch (e) {
      console.log(`❌ ${model} error:`, e);
    }
  }

  return NextResponse.json({ error: "All models failed — check your API key quota" }, { status: 500 });
}