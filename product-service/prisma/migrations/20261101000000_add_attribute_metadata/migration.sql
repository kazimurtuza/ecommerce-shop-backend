ALTER TABLE "attributes"
ADD COLUMN "slug" TEXT,
ADD COLUMN "input_type" TEXT NOT NULL DEFAULT 'select';

WITH normalized AS (
    SELECT
        "id",
        COALESCE(
            NULLIF(trim(BOTH '-' FROM lower(regexp_replace(trim("name"), '[^a-zA-Z0-9]+', '-', 'g'))), ''),
            'attribute'
        ) AS "slug_base"
    FROM "attributes"
), ranked AS (
    SELECT
        "id",
        "slug_base",
        COUNT(*) OVER (PARTITION BY "slug_base") AS "slug_count",
        ROW_NUMBER() OVER (PARTITION BY "slug_base" ORDER BY "id") AS "slug_rank"
    FROM normalized
)
UPDATE "attributes" AS attribute
SET "slug" = CASE
    WHEN ranked."slug_count" = 1 THEN ranked."slug_base"
    ELSE ranked."slug_base" || '-' || left(attribute."id"::text, 8)
END
FROM ranked
WHERE attribute."id" = ranked."id";

ALTER TABLE "attributes"
ALTER COLUMN "slug" SET NOT NULL;

CREATE UNIQUE INDEX "attributes_slug_key" ON "attributes"("slug");

ALTER TABLE "attribute_values"
ADD COLUMN "color_code" TEXT;
