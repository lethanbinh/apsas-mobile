import { ApiResponse, ApiService } from '../utils/ApiService';

export interface LecturerAccount {
  id: number;
  accountCode: string;
  username: string;
  email: string;
  phoneNumber: string;
  fullName: string;
  avatar: string;
}

export interface Lecturer {
  id: number;
  department: string;
  specialization: string;
  account: LecturerAccount;
}

export interface CourseElement {
  id: number;
  name: string;
  description: string;
  weight: number;
}

export interface PlanDetailAssignRequestInitial {
  id: number;
  message: string;
  createdAt: string;
  updatedAt: string;
  lecturer: Lecturer;
  courseElement: CourseElement;
}

export interface AssignRequestData {
  id: number;
  message: string;
  status: number;
  assignedAt: string;
  courseElementId: string;
  assignedLecturerId: string;
  assignedByHODId: string;
  createdAt: string;
  updatedAt: string;
  courseElementName: string;
  courseElementDescription: string;
  courseName: string;
  semesterName: string;
  assignedLecturerName: string;
  assignedLecturerDepartment: string;
  assignedByHODName: string;
}

export interface AssignRequestPaginatedResult {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  items: AssignRequestData[];
}

export interface AssignRequestCreatePayload {
  message: string | null;
  courseElementId: string | number;
  assignedLecturerId: string | number;
  assignedByHODId: string | number;
  status: number;
  assignedAt: string; // <-- Thêm trường này
}

export interface AssignRequestUpdatePayload {
  message: string | null;
  courseElementId: string | number; // <-- Thêm trường này
  assignedLecturerId: string | number;
  assignedByHODId: string | number; // <-- Thêm trường này
  status: number;
  assignedAt: string; // <-- Thêm trường này
}

export const fetchAssignRequestList = async (
  semesterCode?: string | null,
  lecturerId?: string | number | null,
  pageNumber: number = 1,
  pageSize: number = 10,
  assignedByHODId?: number | null,
): Promise<AssignRequestPaginatedResult> => {
  try {
    let endpoint = `/api/assignRequest/list?pageNumber=${pageNumber}&pageSize=${pageSize}`;
    if (semesterCode) {
      endpoint += `&semesterCode=${semesterCode}`;
    }
    if (lecturerId) {
      endpoint += `&lecturerId=${lecturerId}`;
    }
    if (assignedByHODId) {
      endpoint += `&assignedByHODId=${assignedByHODId}`;
    }

    const response = await ApiService.get<AssignRequestPaginatedResult>(
      endpoint,
    );

    if (response.result) {
      return response.result;
    }
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