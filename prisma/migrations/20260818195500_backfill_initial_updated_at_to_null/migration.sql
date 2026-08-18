UPDATE "producers"
SET "updated_at" = NULL
WHERE "deleted_at" IS NULL
  AND "updated_at" IS NOT NULL
  AND "updated_at" = "created_at";

UPDATE "farms"
SET "updated_at" = NULL
WHERE "deleted_at" IS NULL
  AND "updated_at" IS NOT NULL
  AND "updated_at" = "created_at";

UPDATE "farm_crops"
SET "updated_at" = NULL
WHERE "deleted_at" IS NULL
  AND "updated_at" IS NOT NULL
  AND "updated_at" = "created_at";
