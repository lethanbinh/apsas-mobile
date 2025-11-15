import { ApiResponse, ApiService } from '../utils/ApiService';

export interface GradingGroupSubmission {
  id: number;
  studentId: number;
  studentName: string;
  studentCode: string;
  gradingGroupId: number;
  submittedAt: string | null;
  status: number;
  lastGrade: number;
}

export interface GradingGroup {
  id: number;
  lecturerId: number;
  lecturerName: string | null;
  lecturerCode: string | null;
  assessmentTemplateId: number | null;
  assessmentTemplateName: string | null;
  assessmentTemplateDescription: string | null;
  assessmentTemplateType: number | null;
  createdAt: string;
  updatedAt: string;
  submissionCount: number;
  submissions: GradingGroupSubmission[];
}

export interface GetGradingGroupsParams {
  lecturerId?: number;
}

export const getGradingGroups = async (
  params: GetGradingGroupsParams = {},
): Promise<GradingGroup[]> => {
  try {
    let endpoint = '/api/GradingGroup/list';
    if (params.lecturerId !== undefined) {
      endpoint += `?lecturerId=${params.lecturerId}`;
    }
    
    const response = await ApiService.get<GradingGroup[]>(endpoint);
    if (response.result) return response.result;
    throw new Error('No grading group data found.');
  } catch (error: any) {
    console.error('Failed to fetch grading groups:', error);
    throw error;
  }
};

export const getGradingGroupById = async (
  id: number,
): Promise<GradingGroup> => {
  try {
    const response = await ApiService.get<GradingGroup>(
      `/api/GradingGroup/${id}`,
    );
    if (response.result) return response.result;
    throw new Error('Grading group not found.');
  } catch (error: any) {
    console.error(`Failed to fetch grading group ${id}:`, error);
    throw error;
  }
};

export interface CreateGradingGroupPayload {
  lecturerId: number;
  assessmentTemplateId: number | null;
}

export interface AssignSubmissionsResponse {
  gradingGroupId: number;
  createdSubmissionsCount: number;
  submissionIds: number[];
}

export const createGradingGroup = async (
  payload: CreateGradingGroupPayload,
): Promise<GradingGroup> => {
  try {
    const response = await ApiService.post<GradingGroup>(
      '/api/GradingGroup/create',
      payload,
    );
    if (response.result) return response.result;
    throw new Error('Failed to create grading group.');
  } catch (error: any) {
    console.error('Failed to create grading group:', error);
    throw error;
  }
};

export const deleteGradingGroup = async (id: number): Promise<void> => {
  try {
    await ApiService.delete<ApiResponse<any>>(`/api/GradingGroup/${id}`);
  } catch (error: any) {
    console.error(`Failed to delete grading group ${id}:`, error);
    throw error;
  }
};

export const addSubmissionsByFile = async (
  gradingGroupId: number,
  files: any[],
): Promise<AssignSubmissionsResponse> => {
  try {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('Files', file);
    });

    const response = await ApiService.post<AssignSubmissionsResponse>(
      `/api/GradingGroup/${gradingGroupId}/add-submissions`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    if (response.result) return response.result;
    throw new Error('Failed to add submissions by file.');
  } catch (error: any) {
    console.error('Failed to add submissions by file:', error);
    throw error;
  }
};

