import { ApiResponse, ApiService } from '../utils/ApiService';

export interface CourseData {
  id: string;
  name: string;
  description: string;
  code: string;
  createdAt: string;
  updatedAt: string;
}

export interface CourseCrudPayload {
  name: string;
  description: string;
  code: string;
}
export const fetchCourseById = async (
  courseId: string,
): Promise<CourseData> => {
  try {
    const response = await ApiService.get<CourseData>(
      `/api/Course/${courseId}`,
    );
    if (response.result) return response.result;
    throw new Error(`Course data not found for ID ${courseId}.`);
  } catch (error: any) {
    console.error(`Failed to fetch course ${courseId}:`, error);
    throw error;
  }
};

export const createCourse = async (
  data: CourseCrudPayload,
): Promise<ApiResponse<CourseData>> => {
  return ApiService.post<CourseData>('/api/Course', data);
};

export const updateCourse = async (
  courseId: string | number,
  data: CourseCrudPayload,
): Promise<ApiResponse<any>> => {
  return ApiService.put(`/api/Course/${courseId}`, data);
};

export const deleteCourse = async (
  courseId: string | number,
): Promise<ApiResponse<any>> => {
  return ApiService.delete(`/api/Course/${courseId}`);
};
