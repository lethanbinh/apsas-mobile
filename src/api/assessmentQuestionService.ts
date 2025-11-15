import { ApiResponse, ApiService } from '../utils/ApiService';

export interface CreateAssessmentQuestionPayload {
  questionText: string;
  questionSampleInput: string;
  questionSampleOutput: string;
  score: number;
  questionNumber?: number;
  assessmentPaperId: number;
}

export interface AssessmentQuestionData {
  id: number;
  questionText: string;
  questionSampleInput: string;
  questionSampleOutput: string;
  score: number;
  questionNumber?: number;
  assessmentPaperId: number;
  assessmentPaperName: string;
  rubricCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateAssessmentQuestionPayload {
  questionText: string;
  questionSampleInput: string;
  questionSampleOutput: string;
  score: number;
  questionNumber?: number;
}

export interface AssessmentQuestionPaginatedResult {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  items: AssessmentQuestionData[];
}

export interface FetchAssessmentQuestionsParams {
  pageNumber: number;
  pageSize: number;
  assessmentPaperId?: number;
}

export const createAssessmentQuestion = async (
  data: CreateAssessmentQuestionPayload,
): Promise<ApiResponse<AssessmentQuestionData>> => {
  return ApiService.post<AssessmentQuestionData>(
    '/api/AssessmentQuestion/create',
    data,
  );
};

export const getAssessmentQuestionById = async (
  assessmentQuestionId: number | string,
): Promise<AssessmentQuestionData> => {
  try {
    const response = await ApiService.get<AssessmentQuestionData>(
      `/api/AssessmentQuestion/${assessmentQuestionId}`,
    );
    if (response.result) {
      return response.result;
    } else {
      throw new Error('Assessment question data not found.');
    }
  } catch (error) {
    console.error(
      `Failed to fetch assessment question ${assessmentQuestionId}:`,
      error,
    );
    throw error;
  }
};

export const updateAssessmentQuestion = async (
  assessmentQuestionId: number | string,
  data: UpdateAssessmentQuestionPayload,
): Promise<ApiResponse<AssessmentQuestionData>> => {
  return ApiService.put<AssessmentQuestionData>(
    `/api/AssessmentQuestion/${assessmentQuestionId}`,
    data,
  );
};

export const deleteAssessmentQuestion = async (
  assessmentQuestionId: number | string,
): Promise<ApiResponse<any>> => {
  return ApiService.delete<any>(
    `/api/AssessmentQuestion/${assessmentQuestionId}`,
  );
};

export const fetchAssessmentQuestions = async (
  params: FetchAssessmentQuestionsParams,
): Promise<AssessmentQuestionPaginatedResult> => {
  try {
    let endpoint = `/api/AssessmentQuestion/list?pageNumber=${params.pageNumber}&pageSize=${params.pageSize}`;

    if (params.assessmentPaperId) {
      endpoint += `&assessmentPaperId=${params.assessmentPaperId}`;
    }

    const response =
      await ApiService.get<AssessmentQuestionPaginatedResult>(endpoint);

    if (response.result) {
      return response.result;
    } else {
      throw new Error('No assessment questions data found in response.');
    }
  } catch (error) {
    console.error('Failed to fetch assessment questions:', error);
    throw error;
  }
};

// Alias for compatibility with web code
export const getAssessmentQuestions = fetchAssessmentQuestions;