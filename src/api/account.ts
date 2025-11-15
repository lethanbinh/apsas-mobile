import { BACKEND_API_URL } from '@env';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { Platform } from 'react-native';
import RNBlobUtil from 'react-native-blob-util'; // Import blob-util
import { ApiResponse, ApiService } from '../utils/ApiService';
import { SecureStorage } from '../utils/SecureStorage';
dayjs.extend(utc);

export interface UploadAvatarResponse {
  fileName: string;
  fileUrl: string; // This is the URL we need
  fileSize: number;
  fileType: string;
  uploadedAt: string;
}

export interface AccountData {
  id: number;
  accountCode: string;
  username: string;
  email: string;
  phoneNumber: string | null;
  fullName: string | null;
  avatar: string | null;
  address: string | null;
  gender: number | null;
  dateOfBirth: string | null;
  role: number;
  status?: string;
  department?: string | null;
  specialization?: string | null;
}

export interface AccountPaginatedResult {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  items: AccountData[];
}

export const RoleMap: { [key: number]: string } = {
  0: 'ADMIN',
  1: 'LECTURER',
  2: 'STUDENT',
  3: 'HOD',
  4: 'EXAMINER',
};

export const RoleNameToIdMap: { [key: string]: number | null } = {
  ADMIN: 0,
  LECTURER: 1,
  STUDENT: 2,
  HOD: 3,
  EXAMINER: 4,
  All: null,
};

export const GenderMap: { [key: string]: number | null } = {
  Male: 0,
  Female: 1,
  Others: null,
};

export const GenderIdToNameMap: { [key: number]: string } = {
  0: 'Male',
  1: 'Female',
};

export const fetchAccounts = async (
  pageNumber: number = 1,
  pageSize: number = 10,
  roleId?: number | null,
  searchTerm?: string,
): Promise<AccountPaginatedResult> => {
  try {
    let endpoint = `/api/Account/page?pageNumber=${pageNumber}&pageSize=${pageSize}`;
    if (typeof roleId === 'number') {
      endpoint += `&role=${roleId}`;
    }
    if (searchTerm && searchTerm.trim() !== '') {
      endpoint += `&searchTerm=${encodeURIComponent(searchTerm.trim())}`;
    }
    const response = await ApiService.get<AccountPaginatedResult>(endpoint);
    if (response.result) {
      return response.result;
    } else {
      throw new Error('No account data found in response.');
    }
  } catch (error) {
    console.error('Failed to fetch accounts:', error);
    throw error;
  }
};

export const getAccountById = async (
  accountId: number | string,
): Promise<AccountData> => {
  try {
    const response = await ApiService.get<AccountData>(
      `/api/Account/${accountId}`,
    );
    if (response.result) {
      return response.result;
    } else {
      throw new Error('Account data not found.');
    }
  } catch (error) {
    console.error(`Failed to fetch account ${accountId}:`, error);
    throw error;
  }
};

interface BaseCreatePayload {
  username: string;
  password?: string;
  email: string;
  phoneNumber: string | null;
  fullName: string | null;
  avatar: string | null;
  address: string;
  gender: number | null;
  dateOfBirth: string | null;
}

interface LecturerCreatePayload extends BaseCreatePayload {
  department: string | null;
  specialization: string | null;
}

interface UpdateAccountPayload {
  username: string;
  email: string;
  phoneNumber: string | null;
  fullName: string | null;
  avatar: string | null;
  address: string;
  gender: number | null;
  dateOfBirth: string | null;
  role: number;
}

export const createAdmin = async (
  data: BaseCreatePayload,
): Promise<ApiResponse<any>> => {
  return ApiService.post('/api/Admin/create', data);
};
export const createHoD = async (
  data: BaseCreatePayload,
): Promise<ApiResponse<any>> => {
  return ApiService.post('/api/HoD/create', data);
};
export const createLecturer = async (
  data: LecturerCreatePayload,
): Promise<ApiResponse<any>> => {
  return ApiService.post('/api/Lecturer/create', data);
};
export const createStudent = async (
  data: BaseCreatePayload,
): Promise<ApiResponse<any>> => {
  return ApiService.post('/api/Student/create', data);
};

export const updateAccount = async (
  accountId: number | string,
  accountData: UpdateAccountPayload,
): Promise<ApiResponse<any>> => {
  return ApiService.put(`/api/Account/${accountId}`, accountData);
};

export const uploadAvatar = async (file: {
  uri: string;
  name: string;
  type: string;
}): Promise<string> => {
  const token = await SecureStorage.getCredentials('authToken');
  if (!token) {
    throw new Error('No auth token found for upload.');
  }

  const url = `${BACKEND_API_URL}/api/File/upload?folder=avatar`; // Use the endpoint from image
  const filePath =
    Platform.OS === 'android' ? file.uri : file.uri.replace('file://', '');

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
          name: 'file', // Key must match API (image_38a2c1.png)
          filename: file.name,
          type: file.type,
          data: RNBlobUtil.wrap(filePath),
        },
      ],
    );

    const jsonResp = resp.json() as ApiResponse<UploadAvatarResponse>; // Cast to full ApiResponse

    if (jsonResp.isSuccess && jsonResp.result?.fileUrl) {
      return jsonResp.result.fileUrl; // Return the URL
    } else {
      throw new Error(
        jsonResp.errorMessages?.join(', ') || 'File upload failed.',
      );
    }
  } catch (error: any) {
    console.error('Upload Avatar Error:', error);
    throw new Error(error.message || 'Failed to upload avatar.');
  }
};
