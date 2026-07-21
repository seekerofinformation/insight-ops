-- Add indexed, paginated sample rows for the Dataset Explorer.
CREATE TABLE "DatasetRecord" (
    "id" TEXT NOT NULL,
    "datasetId" TEXT NOT NULL,
    "ordinal" INTEGER NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "DatasetRecord_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DatasetRecord_datasetId_ordinal_key"
    ON "DatasetRecord"("datasetId", "ordinal");

CREATE INDEX "Dataset_domain_idx" ON "Dataset"("domain");
CREATE INDEX "Dataset_sourceType_idx" ON "Dataset"("sourceType");
CREATE INDEX "Dataset_accessLevel_idx" ON "Dataset"("accessLevel");
CREATE INDEX "Dataset_qualityScore_idx" ON "Dataset"("qualityScore");

ALTER TABLE "Dataset" ADD COLUMN "searchText" TEXT NOT NULL DEFAULT '';
UPDATE "Dataset"
SET "searchText" = LOWER(CONCAT_WS(' ', "name", "description", "owner", ARRAY_TO_STRING("tags", ' ')));
ALTER TABLE "Dataset" ALTER COLUMN "searchText" DROP DEFAULT;

ALTER TABLE "DatasetRecord"
    ADD CONSTRAINT "DatasetRecord_datasetId_fkey"
    FOREIGN KEY ("datasetId") REFERENCES "Dataset"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Preserve deterministic schema-column ordering for API consumers.
ALTER TABLE "DatasetColumn" ADD COLUMN "ordinal" INTEGER;
WITH ranked_columns AS (
    SELECT "id", ROW_NUMBER() OVER (PARTITION BY "datasetId" ORDER BY "name", "id") - 1 AS ordinal
    FROM "DatasetColumn"
)
UPDATE "DatasetColumn"
SET "ordinal" = ranked_columns.ordinal
FROM ranked_columns
WHERE "DatasetColumn"."id" = ranked_columns."id";
ALTER TABLE "DatasetColumn" ALTER COLUMN "ordinal" SET NOT NULL;
CREATE UNIQUE INDEX "DatasetColumn_datasetId_ordinal_key"
    ON "DatasetColumn"("datasetId", "ordinal");
