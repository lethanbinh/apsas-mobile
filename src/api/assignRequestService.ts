import { ApiResponse, ApiService } from '../utils/ApiService';

export interface AssignRequestData {
  id: string;
  message: string;
  courseElementId: string;
  assignedByHODId: string;
  createdAt: string;
  updatedAt: string;
  courseElementName: string;
  courseElementDescription: string;
  courseName: string;
  semesterName: string;
  assignedLecturerId: string;
  assignedLecturerName: string;
  assignedLecturerDepartment: string;
  assignedByHODName: string;
}

export interface AssignRequestCreatePayload {
  message: string | null;
  courseElementId: string | number;
  assignedLecturerId: string | number;
  assignedByHODId: string | number;
}

export interface AssignRequestUpdatePayload {
  message: string | null;
  assignedLecturerId: string | number;
}

// --- FUNCTIONS ---

export const fetchAssignRequestList = async (): Promise<
  AssignRequestData[]
> => {
  try {
    const response = await ApiService.get<AssignRequestData[]>(
      '/api/assignRequest/list',
    );
    if (response.result) return response.result;
    throw new Error('No assign request data found.');
  } catch (error: any) {
    console.error('Failed to fetch assign request list:', error);
    throw error;
  }
};

export const createAssignRequest = async (
  data: AssignRequestCreatePayload,
): Promise<ApiResponse<AssignRequestData>> => {
  return ApiService.post<AssignRequestData>('/api/AssignRequest/create', data);
};

export const updateAssignRequest = async (
  assignRequestId: string | number,
  data: AssignRequestUpdatePayload,
): Promise<ApiResponse<any>> => {
  return ApiService.put(`/api/AssignRequest/${assignRequestId}`, data);
};

export const deleteAssignRequest = async (
  assignRequestId: string | number,
): Promise<ApiResponse<any>> => {
  return ApiService.delete(`/api/AssignRequest/${assignRequestId}`);
};
