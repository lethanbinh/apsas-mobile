import { ApiResponse, ApiService } from '../utils/ApiService';

interface CourseDetail {
  id: number;
  name: string;
  code: string;
  description: string;
}

interface SemesterDetail {
  id: number;
  semesterCode: string;
  academicYear: number;
  startDate: string;
  endDate: string;
}

interface SemesterCourseDetail {
  id: number;
  semesterId: number;
  courseId: number;
  createdByHODAccountCode: string;
  course: CourseDetail;
  semester: SemesterDetail;
}

export interface CourseElementData {
  id: number;
  name: string;
  description: string;
  weight: number;
  semesterCourseId: number;
  createdAt: string;
  updatedAt: string;
  semesterCourse?: SemesterCourseDetail;
}

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

export const fetchCourseElements = async (): Promise<CourseElementData[]> => {
  try {
    const response = await ApiService.get<CourseElementData[]>(
      '/api/CourseElements?pageNumber=1&pageSize=5000', // Đảm bảo URL chính xác
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
  const payloadToSend = {
    ...data,
    weight: data.weight / 100,
  };
  return ApiService.post<CourseElementData>(
    '/api/CourseElements',
    payloadToSend,
  );
};

export const updateCourseElement = async (
  courseElementId: string | number,
  data: CourseElementCrudPayload,
): Promise<ApiResponse<any>> => {
  const payloadToSend = {
    ...data,
    weight: data.weight / 100,
  };
  return ApiService.put(
    `/api/CourseElements/${courseElementId}`,
    payloadToSend,
  );
};

export const deleteCourseElement = async (
  courseElementId: string | number,
): Promise<ApiResponse<any>> => {
  return ApiService.delete(`/api/CourseElements/${courseElementId}`);
};
