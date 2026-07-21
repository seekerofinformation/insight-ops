// @vitest-environment node

import { describe, expect, it } from "vitest";
import type { ListDatasetsQuery } from "@insightops/contracts";
import {
  buildDatasetOrderBy,
  buildDatasetWhere,
  mapDataset,
} from "../src/modules/catalog/dataset-repository.js";

const query: ListDatasetsQuery = {
  page: 1,
  pageSize: 20,
  sortBy: "qualityScore",
  sortOrder: "desc",
  q: "Energy",
  domain: "Energy",
  sourceType: "API",
  accessLevel: "Restricted",
  minQuality: 80,
};

describe("Prisma dataset query mapping", () => {
  it("builds an injection-safe Prisma where object", () => {
    expect(buildDatasetWhere(query)).toEqual({
      domain: "ENERGY",
      sourceType: "API",
      accessLevel: "RESTRICTED",
      qualityScore: { gte: 80 },
      searchText: { contains: "energy" },
    });
    expect(buildDatasetOrderBy(query)).toEqual([{ qualityScore: "desc" }, { id: "asc" }]);
  });

  it("maps database enums and dates to the public contract", () => {
    const result = mapDataset({
      id: "energy",
      name: "Energy",
      description: "Telemetry",
      domain: "ENERGY",
      sourceType: "API",
      owner: "Platform",
      rowCount: 10,
      qualityScore: 90,
      freshness: "Now",
      sensitivity: "MEDIUM",
      accessLevel: "RESTRICTED",
      tags: ["energy"],
      searchText: "energy telemetry platform energy",
      updatedAt: new Date("2026-07-06T08:52:00Z"),
    });

    expect(result).toMatchObject({
      domain: "Energy",
      sourceType: "API",
      sensitivity: "Medium",
      accessLevel: "Restricted",
      updatedAt: "2026-07-06T08:52:00.000Z",
    });
  });
});
