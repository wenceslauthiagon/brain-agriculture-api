/*
  Warnings:

  - The values [COTTON] on the enum `Crop` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
-- no-op: keep original Crop enum values

-- AlterTable
ALTER TABLE "farm_crops" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "farms" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "producers" ADD COLUMN     "deletedAt" TIMESTAMP(3);
