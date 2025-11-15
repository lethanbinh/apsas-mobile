import { ApiResponse, ApiService } from '../utils/ApiService';

export interface CreateClassAssessmentPayload {
  classId: number;
  assessmentTemplateId: number;
  startAt: string;
  endAt: string;
}

export interface ClassAssessment {
  id: number;
  classId: number;
  assessmentTemplateId: number;
  assessmentTemplateName: string;
  assessmentTemplateDescription: string;
  courseElementId: number;
  courseElementName: string;
  startAt: string;
  endAt: string;
  createdAt: string;
  updatedAt: string;
  enrollmentCode: string;
  classCode: string;
  courseName: string;
  lecturerName: string;
  students: any[];
  submissionCount: string;
  status: number;
}

export interface ClassAssessmentPaginatedResult {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  items: ClassAssessment[];
}

export interface GetClassAssessmentsParams {
  classId?: number;
  assessmentTemplateId?: number;
  lecturerId?: number;
  studentId?: number;
  status?: string;
  pageNumber: number;
  pageSize: number;
}

export const getClassAssessments = async (
  params: GetClassAssessmentsParams,
): Promise<ClassAssessmentPaginatedResult> => {
  try {
    let endpoint = `/api/ClassAssessment/list?pageNumber=${params.pageNumber}&pageSize=${params.pageSize}`;
    
    if (params.classId !== undefined) {
      endpoint += `&classId=${params.classId}`;
    }
    if (params.assessmentTemplateId !== undefined) {
      endpoint += `&assessmentTemplateId=${params.assessmentTemplateId}`;
    }
    if (params.lecturerId !== undefined) {
      endpoint += `&lecturerId=${params.lecturerId}`;
    }
    if (params.studentId !== undefined) {
      endpoint += `&studentId=${params.studentId}`;
    }
    if (params.status !== undefined) {
      endpoint += `&status=${params.status}`;
    }
    
    const response = await ApiService.get<ClassAssessmentPaginatedResult>(
      endpoint,
    );
    if (response.result) return response.result;
    throw new Error('No class assessment data found.');
  } catch (error: any) {
    console.error('Failed to fetch class assessments:', error);
    throw error;
  }
};

export const createClassAssessment = async (
  payload: CreateClassAssessmentPayload,
): Promise<ApiResponse<ClassAssessment>> => {
  return ApiService.post<ClassAssessment>(
    '/api/ClassAssessment/create',
    payload,
  );
};

export const updateClassAssessment = async (
  classAssessmentId: string | number,
  payload: CreateClassAssessmentPayload,
): Promise<ApiResponse<ClassAssessment>> => {
  return ApiService.put<ClassAssessment>(
    `/api/ClassAssessment/${classAssessmentId}`,
    payload,
  );
};

