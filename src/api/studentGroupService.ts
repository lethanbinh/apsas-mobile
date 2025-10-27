// --- INTERFACES ---

import { ApiResponse, ApiService } from '../utils/ApiService';

export interface StudentGroupData {
  id: string;
  enrollmentDate: string;
  description: string | null;
  classId: string;
  studentId: string;
  createdAt: string;
  updatedAt: string;
  classCode: string;
  studentName: string;
  studentCode: string;
}

export interface StudentGroupCreatePayload {
  classId: string | number;
  studentId: string | number;
  description: string | null;
  enrollmentDate: string; // ISO String
}
export interface StudentGroupUpdatePayload {
  description: string | null;
}

// --- FUNCTIONS ---

export const fetchStudentGroupList = async (): Promise<StudentGroupData[]> => {
  try {
    const response = await ApiService.get<StudentGroupData[]>(
      '/api/StudentGroup/list',
    );
    if (response.result) return response.result;
    throw new Error('No student group data found.');
  } catch (error: any) {
    console.error('Failed to fetch student group list:', error);
    throw error;
  }
};

export const createStudentEnrollment = async (
  data: StudentGroupCreatePayload,
): Promise<ApiResponse<StudentGroupData>> => {
  return ApiService.post<StudentGroupData>('/api/StudentGroup/create', data);
};

export const updateStudentEnrollment = async (
  studentGroupId: string | number,
  data: StudentGroupUpdatePayload,
): Promise<ApiResponse<any>> => {
  return ApiService.put(`/api/StudentGroup/${studentGroupId}`, data);
};

export const deleteStudentEnrollment = async (
  studentGroupId: string | number,
): Promise<ApiResponse<any>> => {
  return ApiService.delete(`/api/StudentGroup/${studentGroupId}`);
};
