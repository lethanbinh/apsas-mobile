import { ApiResponse, ApiService } from '../utils/ApiService';

export interface ClassData {
  id: string;
  classCode: string;
  totalStudent: number;
  description: string | null;
  lecturerId: string;
  semesterId: string;
  semesterCourseId: string;
  createdAt: string;
  updatedAt: string;
  lecturerName: string;
  lecturerCode: string;
  courseName: string;
  courseCode: string;
  semesterName: string;
  studentCount: number;
}

interface ClassListResult {
  result: ClassData[];
}

type ClassListApiResponse = ApiResponse<ClassData[]>;

export const fetchClassList = async (): Promise<ClassData[]> => {
  try {
    const response = await ApiService.get<ClassData[]>('/api/Class/list');
    if (response.result) {
      return response.result;
    } else {
      throw new Error('No class list data found in the response result.');
    }
  } catch (error: any) {
    console.error('Failed to fetch class list:', error);
    throw error;
  }
};
