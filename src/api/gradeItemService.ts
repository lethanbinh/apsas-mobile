import { ApiResponse, ApiService } from '../utils/ApiService';

export interface GradeItemData {
  id: number;
  score: number;
  comments: string;
  gradingSessionId: number;
  rubricItemId: number;
  rubricItemDescription: string;
  rubricItemMaxScore: number;
  questionText?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GradeItemListResult {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  items: GradeItemData[];
}

export interface GradeItemApiResponse {
  statusCode: number;
  isSuccess: boolean;
  errorMessages: any[];
  result: GradeItemData;
}

export interface GradeItemListApiResponse {
  statusCode: number;
  isSuccess: boolean;
  errorMessages: any[];
  result: GradeItemListResult;
}

export interface CreateGradeItemPayload {
  gradingSessionId: number;
  rubricItemId: number;
  score: number;
  comments: string;
}

export interface UpdateGradeItemPayload {
  score: number;
  comments: string;
}

export interface GetGradeItemsParams {
  pageNumber?: number;
  pageSize?: number;
  gradingSessionId?: number;
  rubricItemId?: number;
}

export class GradeItemService {
  /**
   * Create a new grade item
   * @param payload - Grade item creation payload
   * @returns Created grade item
   */
  async createGradeItem(
    payload: CreateGradeItemPayload,
  ): Promise<GradeItemData> {
    const response = await ApiService.post<GradeItemData>(
      '/api/GradeItem/create',
      payload,
    );
    if (response.result) {
      return response.result;
    }
    throw new Error('Failed to create grade item');
  }

  /**
   * Get a grade item by ID
   * @param gradeItemId - Grade item ID
   * @returns Grade item
   */
  async getGradeItem(gradeItemId: number): Promise<GradeItemData> {
    const response = await ApiService.get<GradeItemData>(
      `/api/GradeItem/${gradeItemId}`,
    );
    if (response.result) {
      return response.result;
    }
    throw new Error('Grade item not found');
  }

  /**
   * Update a grade item
   * @param gradeItemId - Grade item ID
   * @param payload - Update payload (score and comments)
   * @returns Updated grade item
   */
  async updateGradeItem(
    gradeItemId: number,
    payload: UpdateGradeItemPayload,
  ): Promise<GradeItemData> {
    const response = await ApiService.put<GradeItemData>(
      `/api/GradeItem/${gradeItemId}`,
      payload,
    );
    if (response.result) {
      return response.result;
    }
    throw new Error('Failed to update grade item');
  }

  /**
   * Delete a grade item
   * @param gradeItemId - Grade item ID
   */
  async deleteGradeItem(gradeItemId: number): Promise<void> {
    await ApiService.delete(`/api/GradeItem/${gradeItemId}`);
  }

  /**
   * Get paginated list of grade items
   * @param params - Query parameters for filtering and pagination
   * @returns Paginated grade items
   */
  async getGradeItems(
    params?: GetGradeItemsParams,
  ): Promise<GradeItemListResult> {
    const queryParams = new URLSearchParams();
    if (params?.pageNumber) {
      queryParams.append('pageNumber', params.pageNumber.toString());
    }
    if (params?.pageSize) {
      queryParams.append('pageSize', params.pageSize.toString());
    }
    if (params?.gradingSessionId) {
      queryParams.append('gradingSessionId', params.gradingSessionId.toString());
    }
    if (params?.rubricItemId) {
      queryParams.append('rubricItemId', params.rubricItemId.toString());
    }

    const response = await ApiService.get<GradeItemListResult>(
      `/api/GradeItem/page?${queryParams.toString()}`,
    );
    if (response.result) {
      return response.result;
    }
    return {
      currentPage: 1,
      pageSize: 10,
      totalCount: 0,
      totalPages: 0,
      items: [],
    };
  }
}

export const gradeItemService = new GradeItemService();

// Legacy function exports for backward compatibility
export const createGradeItem = async (
  data: CreateGradeItemPayload,
): Promise<ApiResponse<GradeItemData>> => {
  const result = await gradeItemService.createGradeItem(data);
  return {
    statusCode: 200,
    isSuccess: true,
    result,
    errorMessages: [],
  };
};

export const updateGradeItem = async (
  gradeItemId: number,
  data: UpdateGradeItemPayload,
): Promise<ApiResponse<GradeItemData>> => {
  const result = await gradeItemService.updateGradeItem(gradeItemId, data);
  return {
    statusCode: 200,
    isSuccess: true,
    result,
    errorMessages: [],
  };
};

export const deleteGradeItem = async (
  gradeItemId: number,
): Promise<ApiResponse<any>> => {
  await gradeItemService.deleteGradeItem(gradeItemId);
  return {
    statusCode: 200,
    isSuccess: true,
    result: null,
    errorMessages: [],
  };
};

export const getGradeItemById = async (
  gradeItemId: number,
): Promise<GradeItemData> => {
  return await gradeItemService.getGradeItem(gradeItemId);
};

export const getGradeItems = async (
  params?: GetGradeItemsParams,
): Promise<GradeItemListResult> => {
  return await gradeItemService.getGradeItems(params);
};

