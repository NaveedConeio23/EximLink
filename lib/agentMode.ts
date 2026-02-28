// Shared singleton using globalThis — persists across hot reloads in dev
// In production use Redis/DB for multi-instance support

const g = globalThis as any;

if (!g.__agentModeMap) {
  g.__agentModeMap = new Map<string, boolean>();
  console.log("✅ agentModeMap singleton created");
}

export const agentModeMap: Map<string, boolean> = g.__agentModeMap;

export function setAgentMode(phone: string, value: boolean) {
  agentModeMap.set(phone, value);
  console.log(`🔀 agentModeMap.set(${phone}, ${value}) — map size: ${agentModeMap.size}`);
}

export function getAgentMode(phone: string): boolean {
  const val = agentModeMap.get(phone) || false;
  console.log(`👁️ agentModeMap.get(${phone}) = ${val} — map size: ${agentModeMap.size}`);
  return val;
}