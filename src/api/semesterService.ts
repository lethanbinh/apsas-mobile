import { ApiResponse, ApiService } from '../utils/ApiService';
import { ClassDetailData } from './class';
import { CourseElementData } from './courseElementService';

export interface SemesterData {
  id: string;
  semesterCode: string;
  academicYear: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  note: string;
}

export interface SemesterCourseData {
  id: string;
  semesterId: string;
  courseId: string;
  createdByHODId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlanDetailStudentAccount {
  id: number;
  accountCode: string;
  username: string;
  email: string;
  phoneNumber: string | null;
  fullName: string | null;
  avatar: string | null;
}
export interface PlanDetailStudent {
  id: number;
  account: PlanDetailStudentAccount;
  enrollmentDate: string;
}

export interface PlanDetailLecturerAccount {
  id: number;
  accountCode: string;
  username: string;
  email: string;
  phoneNumber: string | null;
  fullName: string | null;
  avatar: string | null;
}
export interface PlanDetailLecturer {
  id: number;
  department: string;
  specialization: string;
  account: PlanDetailLecturerAccount | null;
}

export interface PlanDetailClass {
  id: number;
  classCode: string;
  totalStudent: number;
  description: string | null;
  lecturer: PlanDetailLecturer;
  students: PlanDetailStudent[];
}

export interface PlanDetailCourse {
  id: number;
  name: string;
  description: string;
  code: string;
}

export interface PlanDetailAssignRequest {
  id: number;
  message: string;
  createdAt: string;
  updatedAt: string;
  lecturer: PlanDetailLecturer;
  courseElement: CourseElementData;
}

export interface PlanDetailSemesterCourse {
  id: number;
  semesterId: number;
  courseId: number;
  createdByHODAccountCode: string;
  createdAt: string;
  updatedAt: string;
  course: PlanDetailCourse;
  courseElements: CourseElementData[];
  classes: ClassDetailData[];
  assignRequests: PlanDetailAssignRequest[];
}

export interface PlanDetailResult {
  id: number;
  semesterCode: string;
  academicYear: number;
  note: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  semesterCourses: PlanDetailSemesterCourse[];
}

export interface GetSemestersParams {
  pageNumber: number;
  pageSize: number;
}

export interface CreateSemesterPayload {
  semesterCode: string;
  academicYear: number;
  note: string;
  startDate: string;
  endDate: string;
}

export interface UpdateSemesterPayload {
  semesterCode: string;
  academicYear: number;
  note: string;
  startDate: string;
  endDate: string;
}

export const fetchSemesters = async (
  params: GetSemestersParams = { pageNumber: 1, pageSize: 100 },
): Promise<SemesterData[]> => {
  try {
    const response = await ApiService.get<SemesterData[]>(
      `/api/Semester?pageNumber=${params.pageNumber}&pageSize=${params.pageSize}`,
    );
    if (response.result) return response.result;
    throw new Error('No semester data found.');
  } catch (error: any) {
    console.error('Failed to fetch semesters:', error);
    throw error;
  }
};

export const fetchSemesterCourses = async (): Promise<SemesterCourseData[]> => {
  try {
    const response = await ApiService.get<SemesterCourseData[]>(
      '/api/semesterCourse?pageNumber=1&pageSize=5000',
    );
    if (response.result) return response.result;
    throw new Error('No semester course data found.');
  } catch (error: any) {
    console.error('Failed to fetch semester courses:', error);
    throw error;
  }
};

export const createSemesterCourse = async (data: {
  semesterId: string;
  courseId: string;
  createdByHODId: string;
}): Promise<ApiResponse<SemesterCourseData>> => {
  return ApiService.post<SemesterCourseData>('/api/SemesterCourse', data);
};

export const deleteSemesterCourse = async (
  semesterCourseId: string | number,
): Promise<ApiResponse<any>> => {
  return ApiService.delete(`/api/SemesterCourse/${semesterCourseId}`);
};

export const fetchSemesterPlanDetail = async (
  semesterCode: string,
): Promise<PlanDetailResult> => {
  try {
    const response = await ApiService.get<PlanDetailResult>(
      `/api/Semester/${semesterCode}/plan-detail`,
    );
    if (response.result) {
      return response.result;
    }
    throw new Error('No plan detail data found.');
  } catch (error: any) {
    console.error(
      `Failed to fetch plan detail for semester ${semesterCode}:`,
      error,
    );
    throw error;
  }
};

export const createSemester = async (
  payload: CreateSemesterPayload,
): Promise<ApiResponse<SemesterData>> => {
  return ApiService.post<SemesterData>('/api/Semester', payload);
};

export const updateSemester = async (
  semesterId: string | number,
  payload: UpdateSemesterPayload,
): Promise<ApiResponse<SemesterData>> => {
  return ApiService.put<SemesterData>(`/api/Semester/${semesterId}`, payload);
};

export const deleteSemester = async (
  semesterId: string | number,
): Promise<ApiResponse<any>> => {
  return ApiService.delete(`/api/Semester/${semesterId}`);
};
