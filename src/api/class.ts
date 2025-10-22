import { ApiService, ApiResponse } from '../utils/ApiService';

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

export interface SemesterData {
  id: string;
  semesterCode: string;
  academicYear: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

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

export const fetchSemesterList = async (): Promise<SemesterData[]> => {
  try {
    const response = await ApiService.get<SemesterData[]>('/api/Semester');
    if (response.result) {
      return response.result;
    } else {
      throw new Error('No semester list data found in the response result.');
    }
  } catch (error: any) {
    console.error('Failed to fetch semester list:', error);
    throw error;
  }
};
