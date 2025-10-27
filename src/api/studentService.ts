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
