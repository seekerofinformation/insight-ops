import { createRng, pick, randomFloat, randomInt, seedFromString } from "./random.js";
const DISTRICTS = ["North", "South", "East", "West", "Central", "Harbor", "Airport"];
const ZONES = ["Zone A", "Zone B", "Zone C", "Zone D", "Zone E"];
const CATEGORIES = ["theft", "accident", "fire", "medical", "disturbance"];
const SEVERITIES = ["low", "medium", "high", "critical"];
const MERCHANTS = ["Acme Retail", "TransitPay", "GridMart", "NovaFuel", "CityParking"];
const CHANNELS = ["web", "pos", "mobile", "atm"];
const ROADS = ["A1", "B7", "Ring Rd", "Main St", "Dock Ave", "Hwy 12"];
const UNITS = ["Unit 12", "Unit 7", "Unit 3", "Unit 21", "Unit 9"];
const OUTCOMES = ["resolved", "escalated", "cancelled", "transferred"];
const BASE_TIME_MS = Date.parse("2026-07-06T09:00:00Z");
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
function generateValue(rng, column, rowIndex) {
    // ~nullable columns get a small share of missing values (drives quality metrics UX)
    if (column.nullable && rng() < 0.04)
        return null;
    switch (column.type) {
        case "boolean":
            return rng() < 0.5;
        case "datetime":
            return new Date(BASE_TIME_MS - Math.floor(rng() * WEEK_MS)).toISOString();
        case "number": {
            const name = column.name;
            if (name.includes("pct") || name.includes("battery"))
                return randomInt(rng, 0, 100);
            if (name.includes("score"))
                return randomFloat(rng, 0, 100, 1);
            if (name.includes("level"))
                return randomInt(rng, 0, 10);
            if (name.includes("amount"))
                return randomFloat(rng, 1, 12_000);
            if (name.includes("kwh"))
                return randomFloat(rng, 0.1, 450);
            if (name.includes("voltage"))
                return randomFloat(rng, 210, 245, 1);
            if (name.includes("speed"))
                return randomInt(rng, 5, 120);
            if (name.includes("min"))
                return randomInt(rng, 1, 90);
            if (name.includes("count"))
                return randomInt(rng, 0, 25);
            return randomFloat(rng, 0, 1000);
        }
        case "string": {
            const name = column.name;
            if (name.endsWith("_id"))
                return `${name.replace("_id", "")}-${100000 + rowIndex}`;
            if (name === "district")
                return pick(rng, DISTRICTS);
            if (name === "zone")
                return pick(rng, ZONES);
            if (name === "category")
                return pick(rng, CATEGORIES);
            if (name === "severity")
                return pick(rng, SEVERITIES);
            if (name === "merchant")
                return pick(rng, MERCHANTS);
            if (name === "channel")
                return pick(rng, CHANNELS);
            if (name === "road")
                return pick(rng, ROADS);
            if (name === "unit")
                return pick(rng, UNITS);
            if (name === "outcome")
                return pick(rng, OUTCOMES);
            return `value-${randomInt(rng, 1, 9999)}`;
        }
    }
}
const rowsCache = new Map();
/**
 * Generates a stable set of mock rows for a dataset schema.
 * Cached per dataset: AgGrid gets the same array identity on re-fetches.
 */
export function generateRows(schema, count) {
    const cacheKey = `${schema.datasetId}:${count}`;
    const cached = rowsCache.get(cacheKey);
    if (cached)
        return cached;
    const rng = createRng(seedFromString(schema.datasetId));
    const rows = new Array(count);
    for (let i = 0; i < count; i++) {
        const row = {};
        for (const column of schema.columns) {
            row[column.name] = generateValue(rng, column, i);
        }
        rows[i] = row;
    }
    rowsCache.set(cacheKey, rows);
    return rows;
}
//# sourceMappingURL=rows.js.map