import { ApiResponse, ApiService } from '../utils/ApiService';

export interface ClassData {
  id: string;
  classCode: string;
  totalStudent: string;
  description: string | null;
  lecturerId: string;
  semesterCourseId: string;
  createdAt: string;
  updatedAt: string;
  lecturerName: string;
  lecturerCode: string;
  courseName: string;
  courseCode: string;
  semesterName: string;
  studentCount: string;
}

export interface ClassCrudPayload {
  classCode: string;
  totalStudent: number;
  description: string | null;
  lecturerId: string | number;
  semesterCourseId: string | number;
}

// --- FUNCTIONS ---

export const fetchClassList = async (): Promise<ClassData[]> => {
  try {
    const response = await ApiService.get<ClassData[]>('/api/Class/list');
    if (response.result) return response.result;
    throw new Error('No class list data found.');
  } catch (error: any) {
    console.error('Failed to fetch class list:', error);
    throw error;
  }
};

export const createClass = async (
  data: ClassCrudPayload,
): Promise<ApiResponse<ClassData>> => {
  return ApiService.post<ClassData>('/api/Class/create', data);
};

export const updateClass = async (
  classId: string | number,
  data: ClassCrudPayload,
): Promise<ApiResponse<any>> => {
  return ApiService.put(`/api/Class/${classId}`, data);
};

export const deleteClass = async (
  classId: string | number,
): Promise<ApiResponse<any>> => {
  return ApiService.delete(`/api/Class/${classId}`);
};
