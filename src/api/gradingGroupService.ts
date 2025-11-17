import { ApiResponse, ApiService } from '../utils/ApiService';
import { Platform } from 'react-native';
import RNBlobUtil from 'react-native-blob-util';
import { BACKEND_API_URL } from '@env';
import { SecureStorage } from '../utils/SecureStorage';

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
  files: Array<{ uri: string; name: string; type: string }>,
): Promise<AssignSubmissionsResponse> => {
  const token = await SecureStorage.getCredentials('authToken');
  if (!token) {
    throw new Error('No auth token found for upload.');
  }

  const url = `${BACKEND_API_URL}/api/GradingGroup/${gradingGroupId}/add-submissions`;

  try {
    // Build form data array with multiple files
    const formDataArray: any[] = [];
    files.forEach((file) => {
      const filePath = Platform.OS === 'android' 
        ? file.uri 
        : file.uri.replace('file://', '');
      formDataArray.push({
        name: 'Files',
        filename: file.name,
        type: file.type || 'application/zip',
        data: RNBlobUtil.wrap(filePath),
      });
    });

    const resp = await RNBlobUtil.fetch(
      'POST',
      url,
      {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      formDataArray,
    );

    const status = resp.info().status;
    const data = resp.data;

    // Check for HTTP errors
    if (status < 200 || status >= 300) {
      let errorMessage = `Server error: ${status}`;
      try {
        const errorJson = JSON.parse(data);
        errorMessage =
          errorJson.errorMessages?.join(', ') || errorJson.title || data;
      } catch (e) {
        errorMessage = data || errorMessage;
      }
      console.error('Upload Submissions HTTP Error:', status, data);
      throw new Error(errorMessage);
    }

    // Parse JSON response
    if (!data) {
      throw new Error('Server returned empty response.');
    }

    const jsonResp = JSON.parse(data) as ApiResponse<AssignSubmissionsResponse>;
    if (jsonResp.isSuccess && jsonResp.result) {
      return jsonResp.result;
    } else {
      throw new Error(
        jsonResp.errorMessages?.join(', ') || 'Failed to add submissions by file.',
      );
    }
  } catch (error: any) {
    console.error('Failed to add submissions by file:', error);
    throw new Error(error.message || 'Failed to upload files. Please try again.');
  }
};

