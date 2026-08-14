import { Crop, Prisma, Status } from '@prisma/client';

export interface FarmCropResponse {
  id: string;
  crop: Crop;
  harvest: string;
  farmId: string;
  deletedAt: Date | null;
}

export interface FarmResponse {
  id: string;
  name: string;
  city: string;
  state: string;
  totalArea: Prisma.Decimal;
  arableArea: Prisma.Decimal;
  vegetationArea: Prisma.Decimal;
  producerId: string;
  status: Status;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  crops?: FarmCropResponse[];
}

export interface ProducerResponse {
  id: string;
  document: string;
  name: string;
  status: Status;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  farms?: FarmResponse[];
}
