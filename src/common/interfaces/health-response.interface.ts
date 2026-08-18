import { SUCCESS_MESSAGES } from '../constants/messages/success-messages.constants';

export interface HealthResponse {
  status: typeof SUCCESS_MESSAGES.HEALTH_STATUS_OK;
  service: typeof SUCCESS_MESSAGES.HEALTH_SERVICE_NAME;
  environment: string;
  timestamp: string;
  uptime: number;
  checks: {
    database:
      | typeof SUCCESS_MESSAGES.HEALTH_DATABASE_STATUS_UP
      | typeof SUCCESS_MESSAGES.HEALTH_DATABASE_STATUS_DOWN;
  };
}
