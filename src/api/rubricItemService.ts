import { ApiResponse, ApiService } from '../utils/ApiService';

export interface RubricItemData {
  id: number;
  description: string;
  input: string;
  output: string;
  score: number;
  assessmentQuestionId: number;
  questionText: string;
  createdAt: string;
  updatedAt: string;
}

export interface RubricItemListResult {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  items: RubricItemData[];
}

export interface RubricItemListApiResponse {
  statusCode: number;
  isSuccess: boolean;
  errorMessages: any[];
  result: RubricItemListResult;
}

export interface RubricItemApiResponse {
  statusCode: number;
  isSuccess: boolean;
  errorMessages: any[];
  result: RubricItemData;
}

export interface GetRubricsParams {
  assessmentQuestionId?: number;
  pageNumber: number;
  pageSize: number;
}

export interface GetRubricsResponse {
  items: RubricItemData[];
  total: number;
}

export interface CreateRubricItemPayload {
  description: string;
  input: string;
  output: string;
  score: number;
  assessmentQuestionId: number;
}

export interface UpdateRubricItemPayload {
  description: string;
  input: string;
  output: string;
  score: number;
}

// Main service class matching web version
export class RubricItemService {
  async getRubricsForQuestion(
    params: GetRubricsParams,
  ): Promise<GetRubricsResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params.assessmentQuestionId) {
        queryParams.append('assessmentQuestionId', params.assessmentQuestionId.toString());
      }
      queryParams.append('pageNumber', params.pageNumber.toString());
      queryParams.append('pageSize', params.pageSize.toString());

      const response = await ApiService.get<RubricItemListResult>(
        `/api/RubricItem/page?${queryParams.toString()}`,
      );

      if (response.result) {
        return {
          items: response.result.items || [],
          total: response.result.totalCount || 0,
        };
      } else {
        return {
          items: [],
          total: 0,
        };
      }
    } catch (error: any) {
      // 404 is expected when question has no rubrics - return empty array
      if (error?.response?.status === 404 || error?.message?.includes('404')) {
        return {
          items: [],
          total: 0,
        };
      }
      console.error('Failed to fetch rubrics for question:', error);
      throw error;
    }
  }

  async createRubricItem(
    payload: CreateRubricItemPayload,
  ): Promise<RubricItemData> {
    const response = await ApiService.post<RubricItemData>(
      '/api/RubricItem/create',
      payload,
    );
    if (response.result) {
      return response.result;
    }
    throw new Error('Failed to create rubric item');
  }

  async updateRubricItem(
    rubricItemId: string | number,
    payload: UpdateRubricItemPayload,
  ): Promise<RubricItemData> {
    const response = await ApiService.put<RubricItemData>(
      `/api/RubricItem/${rubricItemId}`,
      payload,
    );
    if (response.result) {
      return response.result;
    }
    throw new Error('Failed to update rubric item');
  }

  async deleteRubricItem(rubricItemId: string | number): Promise<void> {
    await ApiService.delete(`/api/RubricItem/${rubricItemId}`);
  }
}

export const rubricItemService = new RubricItemService();

// Legacy function exports for backward compatibility
export const createRubricItem = async (
  data: CreateRubricItemPayload,
): Promise<ApiResponse<RubricItemData>> => {
  const result = await rubricItemService.createRubricItem(data);
  return {
    statusCode: 200,
    isSuccess: true,
    result,
    errorMessages: [],
  };
};

export const updateRubricItem = async (
  rubricItemId: number | string,
  data: UpdateRubricItemPayload,
): Promise<ApiResponse<RubricItemData>> => {
  const result = await rubricItemService.updateRubricItem(rubricItemId, data);
  return {
    statusCode: 200,
    isSuccess: true,
    result,
    errorMessages: [],
  };
};

export const deleteRubricItem = async (
  rubricItemId: number | string,
): Promise<ApiResponse<any>> => {
  await rubricItemService.deleteRubricItem(rubricItemId);
  return {
    statusCode: 200,
    isSuccess: true,
    result: null,
    errorMessages: [],
  };
};

// Use getRubricsForQuestion instead of deprecated endpoint
export const getRubricItemsByQuestionId = async (
  questionId: number | string,
): Promise<RubricItemData[]> => {
  try {
    const response = await rubricItemService.getRubricsForQuestion({
      assessmentQuestionId: Number(questionId),
      pageNumber: 1,
      pageSize: 1000,
    });
    return response.items || [];
  } catch (error: any) {
    // 404 is expected when question has no rubrics yet - return empty array
    if (error?.response?.status === 404 || error?.message?.includes('404')) {
      return [];
    }
    console.error(
      `Failed to fetch rubric items for question ${questionId}:`,
      error,
    );
    throw error;
  }
};

// Legacy function for backward compatibility
export const getRubricsForQuestion = async (
  params: {
    assessmentQuestionId: number;
    pageNumber: number;
    pageSize: number;
  },
): Promise<{
  items: RubricItemData[];
  total: number;
}> => {
  return await rubricItemService.getRubricsForQuestion(params);
};

// Legacy function - not used in web version, but kept for compatibility
export const getRubricItemById = async (
  rubricItemId: number | string,
): Promise<RubricItemData> => {
  try {
    const response = await ApiService.get<RubricItemData>(
      `/api/RubricItem/${rubricItemId}`,
    );
    if (response.result) {
      return response.result;
    } else {
      throw new Error('Rubric item data not found.');
    }
  } catch (error) {
    console.error(`Failed to fetch rubric item ${rubricItemId}:`, error);
    throw error;
  }
};

// Legacy function - not used in web version, but kept for compatibility
export const getAllRubricItems = async (): Promise<RubricItemData[]> => {
  try {
    const response = await ApiService.get<RubricItemData[]>(
      '/api/RubricItem/list',
    );

    if (response.result) {
      return response.result;
    } else {
      console.warn('getAllRubricItems: API returned no result array.');
      return [];
    }
  } catch (error) {
    console.error('Failed to fetch all rubric items:', error);
    throw error;
  }
};
