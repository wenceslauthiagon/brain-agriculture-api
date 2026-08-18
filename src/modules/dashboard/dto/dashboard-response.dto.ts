export type DashboardByStateItemDto = {
  state: string;
  farms: number;
  total_area: number;
};

export type DashboardByCropItemDto = {
  crop: string;
  farms: number;
};

export type DashboardResponseDto = {
  total_farms: number;
  total_hectares: number;
  land_use: {
    arable_area: number;
    vegetation_area: number;
  };
  charts: {
    by_state: DashboardByStateItemDto[];
    by_crop: DashboardByCropItemDto[];
  };
};
