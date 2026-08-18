import { ApiResponse } from '../interfaces/api-response.interface';

export const makeApiResponse = <T>(
  message: string,
  data: T,
): ApiResponse<T> => ({
  message,
  data,
});
