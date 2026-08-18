ALTER TABLE "farms"
ALTER COLUMN "updated_at" DROP NOT NULL;

ALTER TABLE "farm_crops"
ALTER COLUMN "updated_at" DROP NOT NULL;
