import { ApiResponse, ApiService } from '../utils/ApiService';

export interface AssessmentFile {
  id: number;
  name: string;
  fileUrl: string;
  fileTemplate: number;
}

export interface AssessmentPaperQuestion {
  id: number;
  questionText: string;
  questionSampleInput: string;
  questionSampleOutput: string;
  score: number;
  rubricCount: number;
}

export interface AssessmentPaper {
  id: number;
  name: string;
  description: string;
  questionCount: number;
  questions: AssessmentPaperQuestion[];
}

export interface AssessmentTemplateData {
  id: number;
  assignRequestId: number;
  templateType: number;
  name: string;
  description: string;
  createdByLecturerId: number;
  lecturerName: string;
  lecturerCode: string;
  assignedToHODId: number;
  hodName: string;
  hodCode: string;
  courseElementId: number;
  courseElementName: string;
  createdAt: string;
  updatedAt: string;
  files: AssessmentFile[];
  papers: AssessmentPaper[];
}

export interface AssessmentTemplatePaginatedResult {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  items: AssessmentTemplateData[];
}

export interface CreateAssessmentTemplatePayload {
  assignRequestId: number;
  templateType: number;
  name: string;
  description: string;
  createdByLecturerId: number;
  assignedToHODId: number;
}

export interface UpdateAssessmentTemplatePayload {
  templateType: number;
  name: string;
  description: string;
  assignedToHODId: number;
}

export interface FetchAssessmentTemplatesParams {
  pageNumber: number;
  pageSize: number;
  lecturerId?: number;
  assignedToHODId?: number;
  assignRequestId?: number;
  semesterId?: number;
}

export const fetchAssessmentTemplates = async (
  params: FetchAssessmentTemplatesParams,
): Promise<AssessmentTemplatePaginatedResult> => {
  try {
    let endpoint = `/api/AssessmentTemplate/list?pageNumber=${params.pageNumber}&pageSize=${params.pageSize}`;
    if (params.lecturerId) {
      endpoint += `&lecturerId=${params.lecturerId}`;
    }
    if (params.assignedToHODId) {
      endpoint += `&assignedToHODId=${params.assignedToHODId}`;
    }
    if (params.assignRequestId) {
      endpoint += `&assignRequestId=${params.assignRequestId}`;
    }
    if (params.semesterId) {
      endpoint += `&semesterId=${params.semesterId}`;
    }

    const response =
      await ApiService.get<AssessmentTemplatePaginatedResult>(endpoint);

    if (response.result) {
      return response.result;
    } else {
      throw new Error('No assessment templates found in response.');
    }
  } catch (error) {
    console.error('Failed to fetch assessment templates:', error);
    throw error;
  }
};

export const getAssessmentTemplateById = async (
  assessmentTemplateId: number | string,
): Promise<AssessmentTemplateData> => {
  try {
    const response = await ApiService.get<AssessmentTemplateData>(
      `/api/AssessmentTemplate/${assessmentTemplateId}`,
    );
    if (response.result) {
      return response.result;
    } else {
      throw new Error('Assessment template data not found.');
    }
  } catch (error) {
    console.error(
      `Failed to fetch assessment template ${assessmentTemplateId}:`,
      error,
    );
    throw error;
  }
};

export const createAssessmentTemplate = async (
  data: CreateAssessmentTemplatePayload,
): Promise<ApiResponse<AssessmentTemplateData>> => {
  return ApiService.post('/api/AssessmentTemplate/create', data);
};

export const updateAssessmentTemplate = async (
  assessmentTemplateId: number | string,
  data: UpdateAssessmentTemplatePayload,
): Promise<ApiResponse<AssessmentTemplateData>> => {
  return ApiService.put(
    `/api/AssessmentTemplate/${assessmentTemplateId}`,
    data,
  );
};

export const deleteAssessmentTemplate = async (
  assessmentTemplateId: number | string,
): Promise<ApiResponse<any>> => {
  return ApiService.delete(
    `/api/AssessmentTemplate/${assessmentTemplateId}`,
  );
};