// @vitest-environment node

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import YAML from "yaml";

interface OpenApiParameter {
  $ref?: string;
  name?: string;
}

interface OpenApiDocument {
  paths: Record<string, { get?: { parameters?: OpenApiParameter[] } }>;
  components: {
    parameters: Record<string, { name: string }>;
    schemas: Record<string, { required?: string[] }>;
  };
}

const document = YAML.parse(
  readFileSync(new URL("../docs/api/openapi.yaml", import.meta.url), "utf8"),
) as OpenApiDocument;

function parameterNames(path: string): string[] {
  return (document.paths[path]?.get?.parameters ?? [])
    .map((parameter) => {
      if (parameter.name) return parameter.name;
      const key = parameter.$ref?.split("/").at(-1);
      return key ? document.components.parameters[key]?.name : undefined;
    })
    .filter((name): name is string => Boolean(name));
}

describe("dataset OpenAPI conformance", () => {
  it("documents every implemented dataset endpoint", () => {
    expect(Object.keys(document.paths)).toEqual(
      expect.arrayContaining([
        "/datasets",
        "/datasets/{datasetId}",
        "/datasets/{datasetId}/schema",
        "/datasets/{datasetId}/quality",
        "/datasets/{datasetId}/rows",
      ]),
    );
  });

  it("documents catalog filters, sorting and pagination", () => {
    expect(parameterNames("/datasets")).toEqual(
      expect.arrayContaining([
        "page",
        "pageSize",
        "q",
        "domain",
        "sourceType",
        "accessLevel",
        "minQuality",
        "sortBy",
        "sortOrder",
      ]),
    );
    expect(parameterNames("/datasets/{datasetId}/rows")).toEqual(["page", "pageSize", "sortOrder"]);
  });

  it("requires pagination metadata in list responses", () => {
    expect(document.components.schemas.DatasetListResponse?.required).toEqual(["data", "meta"]);
    expect(document.components.schemas.RowsResponse?.required).toEqual(["data", "meta"]);
  });
});
