import { Platform } from 'react-native';
import RNBlobUtil from 'react-native-blob-util';
import { ApiResponse } from '../utils/ApiService';
import { SecureStorage } from '../utils/SecureStorage';

interface FileUploadResponse {
  totalRow: number;
  totalRowSuccess: number;
  totalRowFail: number;
}

const getApiUrl = (endpoint: string) => {
  const baseUrl = 'https://aspas-edu.site';
  return `${baseUrl}${endpoint}`;
};

export const importSemesterCourse = async (file: {
  name: string;
  uri: string;
  type: string;
}): Promise<ApiResponse<FileUploadResponse>> => {
  const token = await SecureStorage.getCredentials('authToken');
  const url = getApiUrl('/api/Import/excel/semester-course-data');
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
          name: 'file', // Must match API key
          filename: file.name,
          type: file.type,
          data: RNBlobUtil.wrap(
            Platform.OS === 'android'
              ? file.uri
              : file.uri.replace('file://', ''),
          ),
        },
      ],
    );

    const jsonResp = resp.json();
    if (!jsonResp.isSuccess) {
      throw new Error(
        jsonResp.errorMessages?.join(', ') ||
          'Failed to upload semester course file.',
      );
    }
    return jsonResp;
  } catch (error: any) {
    console.error('Upload Semester Course Error:', error);
    throw new Error(error.message || 'Failed to upload semester course file.');
  }
};

export const importClassStudentData = async (file: {
  name: string;
  uri: string;
  type: string;
}): Promise<ApiResponse<FileUploadResponse>> => {
  const token = await SecureStorage.getCredentials('authToken');
  const url = getApiUrl('/api/Import/excel/class-student-data');

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
          name: 'file',
          filename: file.name,
          type: file.type,
          data: RNBlobUtil.wrap(
            Platform.OS === 'android'
              ? file.uri
              : file.uri.replace('file://', ''),
          ),
        },
      ],
    );

    const jsonResp = resp.json();
    if (!jsonResp.isSuccess) {
      throw new Error(
        jsonResp.errorMessages?.join(', ') ||
          'Failed to upload class student file.',
      );
    }
    return jsonResp;
  } catch (error: any) {
    console.error('Upload Class Student Error:', error);
    throw new Error(error.message || 'Failed to upload class student file.');
  }
};