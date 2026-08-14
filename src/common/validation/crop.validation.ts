import { Crop } from '@prisma/client';

const CROP_ALIASES: Record<string, Crop> = {
  SOJA: Crop.SOYBEAN,
  SOYBEAN: Crop.SOYBEAN,
  MILHO: Crop.CORN,
  CORN: Crop.CORN,
  ALGODAO: Crop.C,
  ALGODÃO: Crop.C,
  COTTON: Crop.OTTON,
  COFFEE: Crop.COFFEE,
  CAFE: Crop.COFFEE,
  CAFÉ: Crop.COFFEE,
  CANA: Crop.SUGARCANE,
  SUGARCANE: Crop.SUGARCANE,
};

const normalizeValue = (value: string): string =>
  value
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

export const normalizeCrop = (crop: string): Crop | null => {
  const normalized = normalizeValue(crop);
  return CROP_ALIASES[normalized] ?? null;
};
