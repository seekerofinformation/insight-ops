/**
 * Deterministic PRNG (mulberry32). Mock data must be stable between
 * consumers and runs so demos, seeds and tests are reproducible.
 */
export declare function createRng(seed: number): () => number;
export type Rng = ReturnType<typeof createRng>;
export declare function randomInt(rng: Rng, min: number, max: number): number;
export declare function randomFloat(rng: Rng, min: number, max: number, decimals?: number): number;
export declare function pick<T>(rng: Rng, items: readonly T[]): T;
/** Seed derived from a string id, so each dataset gets its own stable stream. */
export declare function seedFromString(value: string): number;
//# sourceMappingURL=random.d.ts.map
