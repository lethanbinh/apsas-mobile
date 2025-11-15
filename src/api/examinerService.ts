import { ApiService, ApiResponse } from '../utils/ApiService';

export interface Examiner {
  accountId: string;
  examinerId: string;
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

export interface ExaminerListApiResponse {
  statusCode: number;
  isSuccess: boolean;
  errorMessages: any[];
  result: Examiner[];
}

export interface ExaminerApiResponse {
  statusCode: number;
  isSuccess: boolean;
  errorMessages: any[];
  result: Examiner;
}

export interface CreateExaminerPayload {
  username: string;
  password?: string;
  email: string;
  phoneNumber: string;
  fullName: string;
  avatar: string;
  address: string;
  gender: number;
  dateOfBirth: string;
  role: string; // "teacher"
}

export class ExaminerService {
  async getExaminerList(): Promise<Examiner[]> {
    try {
      const response = await ApiService.get<Examiner[]>(
        '/api/Examiner/list',
      );
      if (response.result) {
        return response.result;
      }
      return [];
    } catch (error: any) {
      // Handle 404 gracefully - endpoint might not exist yet
      if (error?.response?.status === 404 || error?.message?.includes('404')) {
        console.warn('Examiner list endpoint not found (404). Returning empty array.');
        return [];
      }
      // For other errors, log and return empty array
      console.error('Failed to fetch examiner list:', error);
      return [];
    }
  }

  async createExaminer(payload: CreateExaminerPayload): Promise<Examiner> {
    const response = await ApiService.post<Examiner>(
      '/api/Examiner/create',
      payload,
    );
    if (response.result) {
      return response.result;
    }
    throw new Error('Failed to create examiner.');
  }
}

export const examinerService = new ExaminerService();

