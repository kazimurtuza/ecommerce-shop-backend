ALTER TABLE "attribute_values"
ADD COLUMN "metadata" JSONB;

UPDATE "attribute_values"
SET "metadata" = jsonb_build_object('color_code', "color_code")
WHERE "color_code" IS NOT NULL;

ALTER TABLE "attribute_values"
DROP COLUMN "color_code";
