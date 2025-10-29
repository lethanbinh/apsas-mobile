import { BACKEND_API_URL } from '@env';
import { ApiResponse, ApiService } from '../utils/ApiService';
import { SecureStorage } from '../utils/SecureStorage';
import { IS_ANDROID } from '../constants/constants';
import RNBlobUtil from 'react-native-blob-util';

export interface AssessmentFileData {
  id: number;
  name: string;
  fileUrl: string;
  fileTemplate: number;
  assessmentTemplateId: number;
  assessmentTemplateName: string;
  createdAt: string;
  updatedAt: string;
}

export interface FileUpload {
  uri: string;
  name: string;
  type: string;
}

export interface CreateAssessmentFilePayload {
  name: string;
  fileUrl: string;
  fileTemplate: number;
  assessmentTemplateId: number;
}

export interface UpdateAssessmentFilePayload {
  name: string;
  fileUrl: string;
  fileTemplate: number;
}

export const createAssessmentFile = async (
  data: CreateAssessmentFilePayload,
): Promise<ApiResponse<AssessmentFileData>> => {
  return ApiService.post<AssessmentFileData>(
    '/api/AssessmentFile/create',
    data,
  );
};
export const uploadAssessmentFile = async (
  file: FileUpload,
  fileTemplate: number,
  assessmentTemplateId: number,
): Promise<AssessmentFileData> => {
  const token = await SecureStorage.getCredentials('authToken');
  if (!token) {
    throw new Error('No auth token found for upload.');
  }

  const url = `${BACKEND_API_URL}/api/AssessmentFile/upload`;
  const filePath = IS_ANDROID ? file.uri : file.uri.replace('file://', '');

  try {
    const resp = await RNBlobUtil.fetch(
      'POST',
      url,
      {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      [
        {
          name: 'File',
          filename: file.name,
          type: file.type,
          data: RNBlobUtil.wrap(filePath),
        },
        {
          name: 'FileTemplate',
          data: String(fileTemplate),
        },
        {
          name: 'AssessmentTemplateId',
          data: String(assessmentTemplateId),
        },
      ],
    );

    const jsonResp = resp.json() as ApiResponse<AssessmentFileData>;

    if (jsonResp.isSuccess && jsonResp.result) {
      return jsonResp.result;
    } else {
      throw new Error(
        jsonResp.errorMessages?.join(', ') || 'File upload failed.',
      );
    }
  } catch (error: any) {
    console.error('Upload Assessment File Error:', error);
    throw new Error(error.message || 'Failed to upload assessment file.');
  }
};

export const getAssessmentFileById = async (
  assessmentFileId: number | string,
): Promise<AssessmentFileData> => {
  try {
    const response = await ApiService.get<AssessmentFileData>(
      `/api/AssessmentFile/${assessmentFileId}`,
    );
    if (response.result) {
      return response.result;
    } else {
      throw new Error('Assessment file data not found.');
    }
  } catch (error) {
    console.error(
      `Failed to fetch assessment file ${assessmentFileId}:`,
      error,
    );
    throw error;
  }
};

export const updateAssessmentFile = async (
  assessmentFileId: number | string,
  data: UpdateAssessmentFilePayload,
): Promise<ApiResponse<AssessmentFileData>> => {
  return ApiService.put<AssessmentFileData>(
    `/api/AssessmentFile/${assessmentFileId}`,
    data,
  );
};

export const deleteAssessmentFile = async (
  assessmentFileId: number | string,
): Promise<ApiResponse<any>> => {
  return ApiService.delete<any>(`/api/AssessmentFile/${assessmentFileId}`);
};

export const getAllAssessmentFiles = async (): Promise<
  AssessmentFileData[]
> => {
  try {
    const response = await ApiService.get<AssessmentFileData[]>(
      '/api/AssessmentFile/list',
    );
    if (response.result) {
      return response.result;
    } else {
      console.warn('getAllAssessmentFiles: API returned no result array.');
      return [];
    }
  } catch (error) {
    console.error('Failed to fetch all assessment files:', error);
    throw error;
  }
};

export const getAssessmentFilesByTemplateId = async (
  templateId: number | string,
): Promise<AssessmentFileData[]> => {
  try {
    const response = await ApiService.get<AssessmentFileData[]>(
      `/api/AssessmentFile/template/${templateId}`,
    );
    if (response.result) {
      return response.result;
    } else {
      console.warn(
        `getAssessmentFilesByTemplateId: API returned no result array for templateId ${templateId}.`,
      );
      return [];
    }
  } catch (error) {
    console.error(
      `Failed to fetch assessment files for template ${templateId}:`,
      error,
    );
    throw error;
  }
};