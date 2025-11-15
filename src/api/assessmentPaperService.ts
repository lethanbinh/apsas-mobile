import { ApiResponse, ApiService } from '../utils/ApiService';

export interface CreateAssessmentPaperPayload {
  name: string;
  description: string;
  assessmentTemplateId: number;
}

export interface AssessmentPaperData {
  id: number;
  name: string;
  description: string;
  assessmentTemplateId: number;
  assessmentTemplateName: string;
  questionCount: number;
  createdAt: string;
  updatedAt: string;
}
export interface UpdateAssessmentPaperPayload {
  name: string;
  description: string;
}

export interface AssessmentPaperPaginatedResult {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  items: AssessmentPaperData[];
}
export interface FetchAssessmentPapersParams {
  pageNumber: number;
  pageSize: number;
  assessmentTemplateId?: number;
}
export const createAssessmentPaper = async (
  data: CreateAssessmentPaperPayload,
): Promise<ApiResponse<AssessmentPaperData>> => {
  return ApiService.post<AssessmentPaperData>(
    '/api/AssessmentPaper/create',
    data,
  );
};
export const getAssessmentPaperById = async (
  assessmentPaperId: number | string,
): Promise<AssessmentPaperData> => {
  try {
    const response = await ApiService.get<AssessmentPaperData>(
      `/api/AssessmentPaper/${assessmentPaperId}`,
    );
    if (response.result) {
      return response.result;
    } else {
      throw new Error('Assessment paper data not found.');
    }
  } catch (error) {
    console.error(
      `Failed to fetch assessment paper ${assessmentPaperId}:`,
      error,
    );
    throw error;
  }
};
export const updateAssessmentPaper = async (
  assessmentPaperId: number | string,
  data: UpdateAssessmentPaperPayload,
): Promise<ApiResponse<AssessmentPaperData>> => {
  return ApiService.put<AssessmentPaperData>(
    `/api/AssessmentPaper/${assessmentPaperId}`,
    data,
  );
};
export const deleteAssessmentPaper = async (
  assessmentPaperId: number | string,
): Promise<ApiResponse<any>> => {
  return ApiService.delete<any>(
    `/api/AssessmentPaper/${assessmentPaperId}`,
  );
};
export const fetchAssessmentPapers = async (
  params: FetchAssessmentPapersParams,
): Promise<AssessmentPaperPaginatedResult> => {
  try {
    let endpoint = `/api/AssessmentPaper/list?pageNumber=${params.pageNumber}&pageSize=${params.pageSize}`;

    if (params.assessmentTemplateId) {
      endpoint += `&assessmentTemplateId=${params.assessmentTemplateId}`;
    }

    const response =
      await ApiService.get<AssessmentPaperPaginatedResult>(endpoint);

    if (response.result) {
      return response.result;
    } else {
      throw new Error('No assessment papers data found in response.');
    }
  } catch (error) {
    console.error('Failed to fetch assessment papers:', error);
    throw error;
  }
};

// Alias for compatibility with web code
export const getAssessmentPapers = fetchAssessmentPapers;