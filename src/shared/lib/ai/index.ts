import { MockAiProvider } from "./mock-provider";
import type { AiProvider } from "./provider";

export * from "./provider";
export { MockAiProvider };

/**
 * Demo mode (NEXT_PUBLIC_DEMO_MODE=true) always uses the deterministic mock.
 * Live mode would call Next.js API routes (never the LLM vendor directly) —
 * the swap happens here, invisible to the UI.
 */
export function getAiProvider(): AiProvider {
  return new MockAiProvider();
}
