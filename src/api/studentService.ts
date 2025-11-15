import { ApiService } from '../utils/ApiService';

export interface StudentListData {
  id: string;
  accountId: string;
  studentId: string;
  accountCode: string;
  username: string;
  email: string;
  phoneNumber: string | null;
  fullName: string | null;
  avatar: string | null;
  address: string | null;
  gender: number | null;
  dateOfBirth: string | null;
  role: number;
  createdAt: string;
  updatedAt: string;
}

export interface StudentDetail {
  id: string;
  accountId: string;
  studentId: string;
  accountCode: string;
  username: string;
  email: string;
  phoneNumber: string;
  fullName: string;
  avatar: string;
  address: string;
  gender: number;
  dateOfBirth: string;
  role: number;
  createdAt: string;
  updatedAt: string;
}

export const fetchStudentList = async (): Promise<StudentListData[]> => {
  try {
    const response = await ApiService.get<StudentListData[]>(
      '/api/Student/list',
    );
    if (response.result) {
      return response.result;
    }
    throw new Error('No student list data found.');
  } catch (error: any) {
    console.error('Failed to fetch student list:', error);
    throw error;
  }
};

export const getStudentById = async (
  studentId: string | number,
): Promise<StudentDetail> => {
  try {
    const response = await ApiService.get<StudentDetail>(
      `/api/Student/${studentId}`,
    );
    if (response.result) {
      return response.result;
    }
    throw new Error(`Student data not found for ID ${studentId}.`);
  } catch (error: any) {
    console.error(`Failed to fetch student ${studentId}:`, error);
    throw error;
  }
};
