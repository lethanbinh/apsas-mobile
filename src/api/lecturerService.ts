import { ApiService } from '../utils/ApiService';

export interface LecturerListData {
  accountId: number;
  lecturerId: string;
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
  department: string;
  specialization: string;
}

export const fetchLecturerList = async (): Promise<LecturerListData[]> => {
  try {
    const response = await ApiService.get<LecturerListData[]>(
      '/api/Lecturer/list',
    );
    if (response.result) return response.result;
    throw new Error('No Lecturer list data found.');
  } catch (error: any) {
    console.error('Failed to fetch Lecturer list:', error);
    throw error;
  }
};
