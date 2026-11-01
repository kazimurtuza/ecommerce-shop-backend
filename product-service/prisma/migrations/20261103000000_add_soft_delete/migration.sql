ALTER TABLE "categories"
ADD COLUMN "deleted_at" TIMESTAMP(3);

ALTER TABLE "attributes"
ADD COLUMN "deleted_at" TIMESTAMP(3);

ALTER TABLE "attribute_values"
ADD COLUMN "deleted_at" TIMESTAMP(3);

CREATE TABLE IF NOT EXISTS "Brand" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "image" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Brand_slug_key" ON "Brand"("slug");

ALTER TABLE "Brand"
ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);
