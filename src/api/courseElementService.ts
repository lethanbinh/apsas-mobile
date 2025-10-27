import { ApiResponse, ApiService } from '../utils/ApiService';

export interface CourseElementData {
  id: string;
  name: string;
  description: string;
  weight: number;
  semesterCourseId: string;
  createdAt: string;
  updatedAt: string;
}

// Ghi chú: PlanDetailCourseElement là một type cũ, có vẻ đã được thay thế
// bằng CourseElementData trong response PlanDetail mới.
export interface PlanDetailCourseElement {
  id: string;
  name: string;
  description: string;
  weight: number;
}

export interface CourseElementCrudPayload {
  name: string;
  description: string;
  weight: number;
  semesterCourseId: string | number;
}

// --- FUNCTIONS ---

export const fetchCourseElements = async (): Promise<CourseElementData[]> => {
  try {
    const response = await ApiService.get<CourseElementData[]>(
      '/api/courseElements?pageNumber=1&pageSize=5000',
    );
    if (response.result) {
      return response.result;
    }
    throw new Error('No course elements data found.');
  } catch (error: any) {
    console.error('Failed to fetch course elements:', error);
    throw error;
  }
};

export const fetchCourseElementById = async (
  elementId: string,
): Promise<CourseElementData> => {
  try {
    const response = await ApiService.get<CourseElementData>(
      `/api/CourseElements/${elementId}`,
    );
    if (response.result) {
      return response.result;
    }
    throw new Error(`Course element data not found for ID ${elementId}.`);
  } catch (error: any) {
    console.error(`Failed to fetch course element ${elementId}:`, error);
    throw error;
  }
};

export const createCourseElement = async (
  data: CourseElementCrudPayload,
): Promise<ApiResponse<CourseElementData>> => {
  return ApiService.post<CourseElementData>('/api/CourseElements', data);
};

export const updateCourseElement = async (
  courseElementId: string | number,
  data: CourseElementCrudPayload,
): Promise<ApiResponse<any>> => {
  return ApiService.put(`/api/CourseElements/${courseElementId}`, data);
};

export const deleteCourseElement = async (
  courseElementId: string | number,
): Promise<ApiResponse<any>> => {
  return ApiService.delete(`/api/CourseElements/${courseElementId}`);
};
