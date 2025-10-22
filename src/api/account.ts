import { BACKEND_API_URL } from '@env';
import { ApiResponse, ApiService } from '../utils/ApiService';

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
}

export interface AccountPaginatedResult {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  items: AccountData[];
}

// Updated Role ID mapping
export const RoleMap: { [key: number]: string } = {
  0: 'ADMIN',
  1: 'LECTURER',
  2: 'STUDENT',
  3: 'HOD',
};

export const RoleNameToIdMap: { [key: string]: number | null } = {
  ADMIN: 0,
  LECTURER: 1,
  STUDENT: 2,
  HOD: 3,
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
    if (roleId !== undefined && roleId !== null) {
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

export const createAccount = async (
  accountData: any,
): Promise<ApiResponse<any>> => {
  return ApiService.post('/api/Account/create', accountData);
};

export const updateAccount = async (
  accountId: number | string,
  accountData: any,
): Promise<ApiResponse<any>> => {
  return ApiService.put(`/api/Account/${accountId}`, accountData);
};

export const banAccount = async (
  accountId: number | string,
): Promise<ApiResponse<any>> => {
  return ApiService.put(`/api/Account/${accountId}`, { status: 'Banned' });
};

export const reactivateAccount = async (
  accountId: number | string,
): Promise<ApiResponse<any>> => {
  return ApiService.put(`/api/Account/${accountId}`, { status: 'Active' });
};

export const exportAccounts = async (
  roleId?: number | null,
  searchTerm?: string,
): Promise<void> => {
  try {
    let url = `${BACKEND_API_URL}/api/Account/export?fileType=excel`;
    if (roleId !== undefined && roleId !== null) {
      url += `&role=${roleId}`;
    }
    if (searchTerm && searchTerm.trim() !== '') {
      url += `&searchTerm=${encodeURIComponent(searchTerm.trim())}`;
    }
    console.log('Attempting to export:', url);
    throw new Error('Export not fully implemented on native yet.');
  } catch (error) {
    console.error('Failed to export accounts:', error);
    throw error;
  }
};
