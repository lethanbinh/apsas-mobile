import { ApiService, ApiResponse } from '../utils/ApiService';
import { AccountData, AccountPaginatedResult } from './account';

interface GetAccountListResponse {
  users: AccountData[];
  total: number;
}

interface Semester {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  [key: string]: any;
}

export class AdminService {
  /**
   * Lấy danh sách tài khoản có phân trang
   */
  async getAccountList(
    pageNumber: number,
    pageSize: number,
  ): Promise<GetAccountListResponse> {
    const response = await ApiService.get<AccountPaginatedResult>(
      `/api/Account/page?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    );
    if (response.result) {
      return {
        users: response.result.items,
        total: response.result.totalCount,
      };
    }
    throw new Error('No account data found in response.');
  }

  /**
   * Xóa tài khoản
   */
  async deleteAccount(id: number): Promise<void> {
    await ApiService.delete(`/api/Admin/${id}`);
  }

  /**
   * Cập nhật thông tin tài khoản
   */
  async updateAccount(
    id: number,
    userData: {
      phoneNumber?: string | null;
      fullName?: string | null;
      address?: string;
    },
  ): Promise<AccountData> {
    const response = await ApiService.patch<AccountData>(
      `/api/Account/${id}/profile`,
      userData,
    );
    if (response.result) {
      return response.result;
    }
    throw new Error('Failed to update account.');
  }

  /**
   * Tạo tài khoản mới
   */
  async createAccount(newUserData: any): Promise<void> {
    await ApiService.post('/api/Account/create', newUserData);
  }

  /**
   * Tải template Excel
   */
  async downloadExcelTemplate(): Promise<Blob> {
    // Note: Mobile app có thể cần xử lý khác với web
    // Tạm thời throw error, có thể implement sau nếu cần
    throw new Error('Excel template download not implemented for mobile yet.');
  }

  /**
   * Lấy danh sách học kỳ có phân trang
   */
  async getPaginatedSemesters(
    pageNumber: number,
    pageSize: number,
  ): Promise<Semester[]> {
    const response = await ApiService.get<Semester[]>(
      `/api/Semester?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    );
    if (response.result && Array.isArray(response.result)) {
      return response.result;
    }
    return [];
  }

  /**
   * Upload dữ liệu học kỳ - khóa học
   */
  async uploadSemesterCourseData(
    semester: string,
    formData: FormData,
  ): Promise<ApiResponse<any>> {
    return ApiService.post(
      `/api/Import/excel/semester-course-data?semester=${semester}`,
      formData,
    );
  }

  /**
   * Upload dữ liệu lớp - sinh viên
   */
  async uploadClassStudentData(
    semester: string,
    formData: FormData,
  ): Promise<ApiResponse<any>> {
    return ApiService.post(
      `/api/Import/excel/class-student-data?semester=${semester}`,
      formData,
    );
  }
}

export const adminService = new AdminService();

