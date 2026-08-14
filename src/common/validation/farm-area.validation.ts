export const isValidFarmArea = (
  totalArea: number,
  arableArea: number,
  vegetationArea: number,
): boolean => arableArea + vegetationArea <= totalArea;
