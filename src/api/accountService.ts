import { ApiService, ApiResponse } from '../utils/ApiService';
import { AccountData, AccountPaginatedResult } from './account';

interface GetAccountListResponse {
  users: AccountData[];
  total: number;
}

/**
 * Account Service - Giống với web
 * Sử dụng để fetch danh sách accounts
 */
export class AccountService {
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
}

export const accountService = new AccountService();

