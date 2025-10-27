import { ApiService, ApiResponse } from '../utils/ApiService';

export interface ClassResponse {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  items: ClassData[];
}

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

export interface ClassDetailLecturerAccount {
  id: number;
  accountCode: string;
  username: string;
  email: string;
  phoneNumber: string;
  fullName: string;
  avatar: string;
}

export interface ClassDetailLecturer {
  id: number;
  department: string;
  specialization: string;
  account: ClassDetailLecturerAccount;
}

export interface ClassDetailStudentAccount {
  id: number;
  accountCode: string;
  username: string;
  email: string;
  phoneNumber: string;
  fullName: string;
  avatar: string;
}

export interface ClassDetailStudent {
  id: number;
  account: ClassDetailStudentAccount;
  enrollmentDate: string;
}

export interface ClassDetailData {
  id: number;
  classCode: string;
  totalStudent: number;
  description: string;
  lecturer: ClassDetailLecturer;
  students: ClassDetailStudent[];
}

export const fetchClassList = async (): Promise<ClassData[]> => {
  try {
    const response = await ApiService.get<ClassResponse>('/api/Class/list');
    if (response.result) {
      return response.result.items;
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

export const fetchClassById = async (classId: string): Promise<ClassData> => {
  try {
    const response = await ApiService.get<ClassData>(`/api/Class/${classId}`);
    if (response.result) {
      return response.result;
    } else {
      throw new Error('Class data not found.');
    }
  } catch (error: any) {
    console.error(`Failed to fetch class ${classId}:`, error);
    throw error;
  }
};
