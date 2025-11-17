// Wrapper services to match web's class-based API
import {
  RubricItemData,
  rubricItemService as service,
  GetRubricsParams,
  GetRubricsResponse,
} from './rubricItemService';

// Alias types for compatibility
export type RubricItem = RubricItemData;

// Re-export the service directly from rubricItemService
export const rubricItemService = service;
