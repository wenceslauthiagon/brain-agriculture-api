/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `farm_crops` table. All the data in the column will be lost.
  - You are about to drop the column `farmId` on the `farm_crops` table. All the data in the column will be lost.
  - You are about to drop the column `arableArea` on the `farms` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `farms` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `farms` table. All the data in the column will be lost.
  - You are about to drop the column `producerId` on the `farms` table. All the data in the column will be lost.
  - You are about to drop the column `totalArea` on the `farms` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `farms` table. All the data in the column will be lost.
  - You are about to drop the column `vegetationArea` on the `farms` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `producers` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `producers` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `producers` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[farm_id,crop,harvest]` on the table `farm_crops` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `farm_id` to the `farm_crops` table without a default value. This is not possible if the table is not empty.
  - Added the required column `arable_area` to the `farms` table without a default value. This is not possible if the table is not empty.
  - Added the required column `producer_id` to the `farms` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_area` to the `farms` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `farms` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vegetation_area` to the `farms` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `producers` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ACTIVE', 'INACTIVE');

-- DropForeignKey
ALTER TABLE "farm_crops" DROP CONSTRAINT "farm_crops_farmId_fkey";

-- DropForeignKey
ALTER TABLE "farms" DROP CONSTRAINT "farms_producerId_fkey";

-- DropIndex
DROP INDEX "farm_crops_farmId_crop_harvest_key";

-- DropIndex
DROP INDEX "farm_crops_farmId_idx";

-- DropIndex
DROP INDEX "farms_producerId_idx";

-- AlterTable
ALTER TABLE "farm_crops" DROP COLUMN "deletedAt",
DROP COLUMN "farmId",
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "farm_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "farms" DROP COLUMN "arableArea",
DROP COLUMN "createdAt",
DROP COLUMN "deletedAt",
DROP COLUMN "producerId",
DROP COLUMN "totalArea",
DROP COLUMN "updatedAt",
DROP COLUMN "vegetationArea",
ADD COLUMN     "arable_area" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "producer_id" TEXT NOT NULL,
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "total_area" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "vegetation_area" DECIMAL(10,2) NOT NULL;

-- AlterTable
ALTER TABLE "producers" DROP COLUMN "createdAt",
DROP COLUMN "deletedAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "farm_crops_farm_id_idx" ON "farm_crops"("farm_id");

-- CreateIndex
CREATE UNIQUE INDEX "farm_crops_farm_id_crop_harvest_key" ON "farm_crops"("farm_id", "crop", "harvest");

-- CreateIndex
CREATE INDEX "farms_producer_id_idx" ON "farms"("producer_id");

-- AddForeignKey
ALTER TABLE "farms" ADD CONSTRAINT "farms_producer_id_fkey" FOREIGN KEY ("producer_id") REFERENCES "producers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "farm_crops" ADD CONSTRAINT "farm_crops_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
