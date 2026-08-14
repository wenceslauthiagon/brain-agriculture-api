export const ERROR_MESSAGES = {
  DATABASE_CONNECTION_UNAVAILABLE: 'Database connection unavailable',
  INTERNAL_SERVER_ERROR: 'Internal server error',
  AN_UNEXPECTED_ERROR_OCCURRED: 'An unexpected error occurred',
  INVALID_DOCUMENT: 'CPF or CNPJ is invalid',
  PRODUCER_DOCUMENT_ALREADY_EXISTS: 'Producer document already exists',
  PRODUCER_NOT_FOUND: 'Producer not found',
  FARM_NOT_FOUND: 'Farm not found',
  FARM_AREA_INVALID:
    'Arable area plus vegetation area cannot exceed total area',
  CROP_ALREADY_REGISTERED: 'Crop already registered for the farm and harvest',
  INVALID_CROP: 'Crop is invalid',
} as const;
