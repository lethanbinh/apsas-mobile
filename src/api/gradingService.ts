import { ApiService, ApiResponse } from '../utils/ApiService';

export interface UploadTestFileResponse {
  message: string;
  folderName: string;
}

export interface UploadPostmanCollectionResponse {
  message: string;
  path: string;
}

export const uploadTestFile = async (
  submissionId: number,
  file: { uri: string; name: string; type: string },
): Promise<UploadTestFileResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as any);

    const response = await ApiService.post<UploadTestFileResponse>(
      `/api/Grading/upload-test-file?submissionId=${submissionId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    if (response.result) return response.result;
    throw new Error('Failed to upload test file.');
  } catch (error: any) {
    console.error('Failed to upload test file:', error);
    throw error;
  }
};

export const uploadPostmanCollectionDatabase = async (
  template: 0 | 1,
  assessmentTemplateId: number,
  file: { uri: string; name: string; type: string },
): Promise<UploadPostmanCollectionResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as any);

    const response = await ApiService.post<UploadPostmanCollectionResponse>(
      `/api/Grading/postman-collection-database?template=${template}&assessmentTemplateId=${assessmentTemplateId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    if (response.result) return response.result;
    throw new Error('Failed to upload postman collection/database file.');
  } catch (error: any) {
    console.error('Failed to upload postman collection/database file:', error);
    throw error;
  }
};

