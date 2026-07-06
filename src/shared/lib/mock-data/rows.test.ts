import { describe, expect, it } from "vitest";
import { MOCK_DATASETS, MOCK_QUALITY, MOCK_SCHEMAS } from "./datasets";
import { generateRows } from "./rows";
import { createRng, seedFromString } from "./random";

describe("mock data integrity", () => {
  it("has a schema and quality metrics for every dataset", () => {
    for (const dataset of MOCK_DATASETS) {
      expect(MOCK_SCHEMAS[dataset.id], `schema for ${dataset.id}`).toBeDefined();
      expect(MOCK_QUALITY[dataset.id], `quality for ${dataset.id}`).toBeDefined();
    }
  });
});

describe("generateRows", () => {
  const schema = MOCK_SCHEMAS["smart-city-traffic-events"]!;

  it("generates the requested number of rows with all schema columns", () => {
    const rows = generateRows(schema, 500);
    expect(rows).toHaveLength(500);
    for (const column of schema.columns) {
      expect(rows[0]).toHaveProperty(column.name);
    }
  });

  it("is deterministic and cached: same call returns the same array", () => {
    const first = generateRows(schema, 500);
    const second = generateRows(schema, 500);
    expect(second).toBe(first);
  });

  it("never puts nulls into non-nullable columns", () => {
    const rows = generateRows(schema, 1000);
    const required = schema.columns.filter((c) => !c.nullable).map((c) => c.name);
    for (const row of rows) {
      for (const name of required) {
        expect(row[name], name).not.toBeNull();
      }
    }
  });
});

describe("createRng", () => {
  it("produces identical sequences for identical seeds", () => {
    const a = createRng(seedFromString("x"));
    const b = createRng(seedFromString("x"));
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });
});
