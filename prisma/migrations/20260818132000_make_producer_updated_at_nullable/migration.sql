-- Producer updated_at should be null until first meaningful update
ALTER TABLE "producers"
ALTER COLUMN "updated_at" DROP NOT NULL;