-- CreateEnum
CREATE TYPE "Crop" AS ENUM ('SOYBEAN', 'CORN', 'COTTON', 'COFFEE', 'SUGARCANE');

-- CreateTable
CREATE TABLE "producers" (
    "id" TEXT NOT NULL,
    "document" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "producers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "farms" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" VARCHAR(2) NOT NULL,
    "totalArea" DECIMAL(10,2) NOT NULL,
    "arableArea" DECIMAL(10,2) NOT NULL,
    "vegetationArea" DECIMAL(10,2) NOT NULL,
    "producerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "farms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "farm_crops" (
    "id" TEXT NOT NULL,
    "crop" "Crop" NOT NULL,
    "harvest" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,

    CONSTRAINT "farm_crops_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "producers_document_key" ON "producers"("document");

-- CreateIndex
CREATE INDEX "farms_producerId_idx" ON "farms"("producerId");

-- CreateIndex
CREATE INDEX "farms_state_idx" ON "farms"("state");

-- CreateIndex
CREATE INDEX "farm_crops_farmId_idx" ON "farm_crops"("farmId");

-- CreateIndex
CREATE UNIQUE INDEX "farm_crops_farmId_crop_harvest_key" ON "farm_crops"("farmId", "crop", "harvest");

-- AddForeignKey
ALTER TABLE "farms" ADD CONSTRAINT "farms_producerId_fkey" FOREIGN KEY ("producerId") REFERENCES "producers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "farm_crops" ADD CONSTRAINT "farm_crops_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
