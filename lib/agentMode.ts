// Shared singleton — imported by both webhook/route.ts and agent-mode/route.ts
// This ensures both routes read/write the SAME map instance

const globalForAgentMode = globalThis as unknown as {
  agentModeMap: Map<string, boolean>;
};

if (!globalForAgentMode.agentModeMap) {
  globalForAgentMode.agentModeMap = new Map<string, boolean>();
}

export const agentModeMap = globalForAgentMode.agentModeMap;