import { ApiResponse, ApiService } from '../utils/ApiService';

export enum ApprovalStatus {
  PENDING = 0,
  APPROVED = 1,
  REJECTED = 2,
}

export const ApprovalStatusMap: { [key: number]: string } = {
  0: 'Pending',
  1: 'Approved',
  2: 'Rejected',
};

export interface CreateApprovalRequestPayload {
  assessmentTemplateId: number;
  assignedHODId: number;
  message: string;
  status: ApprovalStatus;
}

export interface ApprovalRequestData {
  id: number;
  status: ApprovalStatus;
  message: string;
  decidedAt: string | null;
  assessmentTemplateId: number;
  assignedHODId: number;
  createdAt: string;
  updatedAt: string;
  assessmentTemplateName: string;
  hodName: string;
  hodCode: string;
}

export const createApprovalRequest = async (
  data: CreateApprovalRequestPayload,
): Promise<ApiResponse<ApprovalRequestData>> => {
  return ApiService.post<ApprovalRequestData>(
    '/api/ApprovalRequest/create',
    data,
  );
};

export const getApprovalRequestById = async (
  approvalRequestId: number | string,
): Promise<ApprovalRequestData> => {
  try {
    const response = await ApiService.get<ApprovalRequestData>(
      `/api/ApprovalRequest/${approvalRequestId}`,
    );

    if (response.result) {
      return response.result;
    } else {
      throw new Error('Approval request data not found.');
    }
  } catch (error) {
    console.error(
      `Failed to fetch approval request ${approvalRequestId}:`,
      error,
    );
    throw error;
  }
};
