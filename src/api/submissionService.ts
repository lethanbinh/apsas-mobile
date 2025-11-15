import { ApiResponse, ApiService } from '../utils/ApiService';

export interface SubmissionFile {
  id: number;
  name: string;
  submissionUrl: string;
}

export interface Submission {
  id: number;
  examSessionId?: number;
  classAssessmentId?: number;
  studentId: number;
  studentName: string;
  studentCode: string;
  gradingGroupId?: number;
  lecturerName?: string;
  submittedAt: string;
  status: number;
  lastGrade: number;
  submissionFile: SubmissionFile | null;
  createdAt: string;
  updatedAt: string;
}

export interface GetSubmissionsParams {
  examSessionId?: number;
  classAssessmentId?: number;
  classId?: number;
  excludeLecturerId?: number;
  studentId?: number;
  gradingGroupId?: number;
  status?: number;
}

export const getSubmissionList = async (
  params: GetSubmissionsParams = {},
): Promise<Submission[]> => {
  try {
    let endpoint = '/api/Submission/list?';
    const queryParams: string[] = [];
    
    if (params.examSessionId !== undefined) {
      queryParams.push(`examSessionId=${params.examSessionId}`);
    }
    if (params.classAssessmentId !== undefined) {
      queryParams.push(`classAssessmentId=${params.classAssessmentId}`);
    }
    if (params.classId !== undefined) {
      queryParams.push(`classId=${params.classId}`);
    }
    if (params.excludeLecturerId !== undefined) {
      queryParams.push(`excludeLecturerId=${params.excludeLecturerId}`);
    }
    if (params.studentId !== undefined) {
      queryParams.push(`studentId=${params.studentId}`);
    }
    if (params.gradingGroupId !== undefined) {
      queryParams.push(`gradingGroupId=${params.gradingGroupId}`);
    }
    if (params.status !== undefined) {
      queryParams.push(`status=${params.status}`);
    }
    
    endpoint += queryParams.join('&');
    
    const response = await ApiService.get<Submission[]>(endpoint);
    if (response.result) return response.result;
    throw new Error('No submission data found.');
  } catch (error: any) {
    console.error('Failed to fetch submission list:', error);
    throw error;
  }
};

export const updateSubmissionGrade = async (
  submissionId: number,
  grade: number,
): Promise<ApiResponse<Submission>> => {
  return ApiService.put<Submission>(`/api/Submission/${submissionId}/grade`, {
    grade,
  });
};

export interface CreateSubmissionPayload {
  classAssessmentId: number;
  fileUrl: string;
  fileName: string;
}

export const createSubmission = async (
  payload: CreateSubmissionPayload,
): Promise<ApiResponse<Submission>> => {
  return ApiService.post<Submission>('/api/Submission/create', payload);
};

export const deleteSubmission = async (id: number): Promise<void> => {
  try {
    await ApiService.delete<ApiResponse<any>>(`/api/Submission/${id}`);
  } catch (error: any) {
    console.error(`Failed to delete submission ${id}:`, error);
    throw error;
  }
};

