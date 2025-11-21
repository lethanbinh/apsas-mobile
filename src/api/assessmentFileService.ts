import { BACKEND_API_URL } from '@env';
import { ApiResponse, ApiService } from '../utils/ApiService';
import { SecureStorage } from '../utils/SecureStorage';
import { IS_ANDROID } from '../constants/constants';
import RNBlobUtil from 'react-native-blob-util';
export enum FileTemplate {
  DATABASE = 0,
  TESTFILE = 1,
  PAPER = 2,
}
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
  name: string, // <-- Thêm tham số 'name'
  fileTemplate: FileTemplate, // <-- Dùng Enum
  assessmentTemplateId: number,
): Promise<AssessmentFileData> => {
  const token = await SecureStorage.getCredentials('authToken');
  if (!token) {
    throw new Error('No auth token found for upload.');
  }

  // SỬA URL: Dùng endpoint /create
  const url = `${BACKEND_API_URL}/api/AssessmentFile/create`;
  const filePath = IS_ANDROID ? file.uri : file.uri.replace('file://', '');

  try {
    const resp = await RNBlobUtil.fetch(
      // SỬA METHOD: Dùng 'POST'
      'POST',
      url,
      {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      // SỬA CÁC TRƯỜNG FORM DATA
      [
        {
          name: 'File', // Tên field là 'File' (viết hoa)
          filename: file.name,
          type: file.type,
          data: RNBlobUtil.wrap(filePath),
        },
        {
          name: 'Name', // <-- Thêm trường 'Name'
          data: name,
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

    // Bổ sung logic xử lý response an toàn
    const status = resp.info().status;
    const data = resp.data;

    // Lỗi 4xx, 5xx
    if (status < 200 || status >= 300) {
      let errorMessage = `Server error: ${status}`;
      try {
        const errorJson = JSON.parse(data);
        errorMessage =
          errorJson.errorMessages?.join(', ') || errorJson.title || data;
      } catch (e) {
        errorMessage = data || errorMessage; // Giữ lỗi text/html nếu có
      }
      console.error('Upload Assessment File HTTP Error:', status, data);
      throw new Error(errorMessage);
    }

    // Lỗi response 2xx rỗng
    if (!data) {
      console.warn(
        'Upload Assessment File: Server returned 2xx but with empty body.',
      );
      throw new Error('File upload succeeded but returned no data.');
    }

    // Parse JSON
    const jsonResp = JSON.parse(data) as ApiResponse<AssessmentFileData>;

    if (jsonResp.isSuccess && jsonResp.result) {
      return jsonResp.result;
    } else {
      throw new Error(
        jsonResp.errorMessages?.join(', ') || 'File upload failed.',
      );
    }
  } catch (error: any) {
    console.error('Upload Assessment File Error:', error.message);
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
  } catch (error: any) {
    // 404 is expected when template has no files - return empty array
    if (error?.response?.status === 404 || error?.message?.includes('404')) {
      console.warn(
        `No files found for template ${templateId} (404 - expected when template has no files)`,
      );
      return [];
    }
    console.error(
      `Failed to fetch assessment files for template ${templateId}:`,
      error,
    );
    throw error;
  }
};

// Alias for compatibility with web code
export interface GetFilesForTemplateParams {
  assessmentTemplateId: number;
  pageNumber: number;
  pageSize: number;
}

export interface GetFilesForTemplateResponse {
  items: AssessmentFileData[];
  total: number;
}

export interface AssessmentFileListResult {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  items: AssessmentFileData[];
}

export interface AssessmentFileListApiResponse {
  statusCode: number;
  isSuccess: boolean;
  errorMessages: any[];
  result: AssessmentFileListResult;
}

export const getFilesForTemplate = async (
  params: GetFilesForTemplateParams,
): Promise<GetFilesForTemplateResponse> => {
  try {
    // Use /AssessmentFile/page endpoint with query params (same as web version)
    const queryParams = new URLSearchParams({
      assessmentTemplateId: params.assessmentTemplateId.toString(),
      pageNumber: params.pageNumber.toString(),
      pageSize: params.pageSize.toString(),
    });
    
    const response = await ApiService.get<AssessmentFileListResult>(
      `/api/AssessmentFile/page?${queryParams.toString()}`,
    );
    
    if (response.result && response.result.items) {
      return {
        items: response.result.items,
        total: response.result.totalCount,
      };
    } else {
      console.warn('getFilesForTemplate: API returned no result array.');
      return {
        items: [],
        total: 0,
      };
    }
  } catch (error: any) {
    // 404 is expected when template has no files - return empty array
    if (error?.response?.status === 404 || error?.message?.includes('404')) {
      console.warn(`No files found for template ${params.assessmentTemplateId} (404 - expected when template has no files)`);
      return {
        items: [],
        total: 0,
      };
    }
    console.error('Failed to fetch files for template:', error);
    throw error;
  }
};