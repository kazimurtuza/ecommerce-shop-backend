DO $$
BEGIN
    IF to_regclass('public.brands') IS NULL AND to_regclass('public."Brand"') IS NOT NULL THEN
        ALTER TABLE "Brand" RENAME TO "brands";
    END IF;
END $$;

ALTER TABLE "categories"
ALTER COLUMN "status" DROP DEFAULT,
ALTER COLUMN "status" TYPE INTEGER USING CASE lower("status")
    WHEN 'active' THEN 1
    WHEN 'inactive' THEN 2
    WHEN 'draft' THEN 3
    ELSE 1
END,
ALTER COLUMN "status" SET DEFAULT 1;

ALTER TABLE "brands"
ALTER COLUMN "status" DROP DEFAULT,
ALTER COLUMN "status" TYPE INTEGER USING CASE lower("status")
    WHEN 'active' THEN 1
    WHEN 'inactive' THEN 2
    WHEN 'draft' THEN 3
    ELSE 1
END,
ALTER COLUMN "status" SET DEFAULT 1;
