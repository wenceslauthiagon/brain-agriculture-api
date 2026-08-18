export const isValidFarmArea = (
  totalArea: number | string,
  arableArea: number | string,
  vegetationArea: number | string,
): boolean => {
  const total = Number(totalArea);
  const arable = Number(arableArea);
  const vegetation = Number(vegetationArea);

  if ([total, arable, vegetation].some((value) => !Number.isFinite(value))) {
    return false;
  }

  return arable + vegetation <= total;
};
