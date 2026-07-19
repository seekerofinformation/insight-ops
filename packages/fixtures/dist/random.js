/**
 * Deterministic PRNG (mulberry32). Mock data must be stable between
 * consumers and runs so demos, seeds and tests are reproducible.
 */
export function createRng(seed) {
    let state = seed;
    return function next() {
        state |= 0;
        state = (state + 0x6d2b79f5) | 0;
        let t = Math.imul(state ^ (state >>> 15), 1 | state);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
export function randomInt(rng, min, max) {
    return Math.floor(rng() * (max - min + 1)) + min;
}
export function randomFloat(rng, min, max, decimals = 2) {
    return Number((rng() * (max - min) + min).toFixed(decimals));
}
export function pick(rng, items) {
    const item = items[Math.floor(rng() * items.length)];
    if (item === undefined)
        throw new Error("pick() called with an empty array");
    return item;
}
/** Seed derived from a string id, so each dataset gets its own stable stream. */
export function seedFromString(value) {
    let hash = 2166136261;
    for (let i = 0; i < value.length; i++) {
        hash ^= value.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
}
//# sourceMappingURL=random.js.map