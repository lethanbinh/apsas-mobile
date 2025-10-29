import { ApiResponse, ApiService } from '../utils/ApiService';

export interface CreateRubricItemPayload {
  description: string;
  input: string;
  output: string;
  score: number;
  assessmentQuestionId: number;
}
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
export interface UpdateRubricItemPayload {
  description: string;
  input: string;
  output: string;
  score: number;
}
export const createRubricItem = async (
  data: CreateRubricItemPayload,
): Promise<ApiResponse<RubricItemData>> => {
  return ApiService.post<RubricItemData>('/api/RubricItem/create', data);
};

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
export const updateRubricItem = async (
  rubricItemId: number | string,
  data: UpdateRubricItemPayload,
): Promise<ApiResponse<RubricItemData>> => {
  return ApiService.put<RubricItemData>(
    `/api/RubricItem/${rubricItemId}`,
    data,
  );
};

export const deleteRubricItem = async (
  rubricItemId: number | string,
): Promise<ApiResponse<any>> => {
  return ApiService.delete<any>(`/api/RubricItem/${rubricItemId}`);
};

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

export const getRubricItemsByQuestionId = async (
  questionId: number | string,
): Promise<RubricItemData[]> => {
  try {
    const response = await ApiService.get<RubricItemData[]>(
      `/api/RubricItem/question/${questionId}`,
    );

    if (response.result) {
      return response.result;
    } else {
      console.warn(
        `getRubricItemsByQuestionId: API returned no result array for questionId ${questionId}.`,
      );
      return [];
    }
  } catch (error) {
    console.error(
      `Failed to fetch rubric items for question ${questionId}:`,
      error,
    );
    throw error;
  }
};
