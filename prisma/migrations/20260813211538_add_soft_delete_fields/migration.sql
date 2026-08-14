/*
  Warnings:

  - The values [COTTON] on the enum `Crop` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Crop_new" AS ENUM ('SOYBEAN', 'CORN', 'C', 'OTTON', 'COFFEE', 'SUGARCANE');
ALTER TABLE "farm_crops" ALTER COLUMN "crop" TYPE "Crop_new" USING ("crop"::text::"Crop_new");
ALTER TYPE "Crop" RENAME TO "Crop_old";
ALTER TYPE "Crop_new" RENAME TO "Crop";
DROP TYPE "public"."Crop_old";
COMMIT;

-- AlterTable
ALTER TABLE "farm_crops" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "farms" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "producers" ADD COLUMN     "deletedAt" TIMESTAMP(3);
