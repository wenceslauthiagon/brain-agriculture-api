import { Crop, Prisma, Status } from '@prisma/client';

export interface FarmCropResponse {
  id: string;
  crop: Crop;
  harvest: string;
  farmId: string;
  createdAt: Date;
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
  updatedAt: Date | null;
  crops?: FarmCropResponse[];
}

export interface ProducerResponse {
  id: string;
  document: string;
  name: string;
  status: Status;
  createdAt: Date;
  updatedAt: Date | null;
  farms?: FarmResponse[];
}

export interface ProducersListResponse {
  records: ProducerResponse[];
  page: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
}
