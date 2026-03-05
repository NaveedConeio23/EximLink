// Shared singleton — same pattern as agentMode.ts
// Stores preferred language per phone number
// "auto" means detect from customer's message automatically

const g = globalThis as any;

if (!g.__languageMap) {
  g.__languageMap = new Map<string, string>();
  console.log("✅ languageMap singleton created");
}

export const languageMap: Map<string, string> = g.__languageMap;

export function setLanguage(phone: string, lang: string) {
  languageMap.set(phone, lang);
  console.log(`🌐 languageMap.set(${phone}, ${lang})`);
}

export function getLanguage(phone: string): string {
  return languageMap.get(phone) || "auto";
}