// Wrapper services to match web's class-based API
import {
  AssessmentQuestionData,
  getAssessmentQuestions as fetchQuestions,
  createAssessmentQuestion as createQuestion,
  updateAssessmentQuestion as updateQuestion,
  deleteAssessmentQuestion as deleteQuestion,
  FetchAssessmentQuestionsParams,
  AssessmentQuestionPaginatedResult,
} from './assessmentQuestionService';

// Alias types for compatibility
export type AssessmentQuestion = AssessmentQuestionData;

export interface GetAssessmentQuestionsParams {
  assessmentPaperId?: number;
  pageNumber: number;
  pageSize: number;
}

export interface GetAssessmentQuestionsResponse {
  items: AssessmentQuestion[];
  total: number;
}

class AssessmentQuestionServiceWrapper {
  async getAssessmentQuestions(
    params: GetAssessmentQuestionsParams,
  ): Promise<GetAssessmentQuestionsResponse> {
    const result = await fetchQuestions({
      pageNumber: params.pageNumber,
      pageSize: params.pageSize,
      assessmentPaperId: params.assessmentPaperId,
    });
    return {
      items: result?.items || [],
      total: result?.totalCount || 0,
    };
  }

  async createAssessmentQuestion(
    payload: any,
  ): Promise<AssessmentQuestion> {
    const response = await createQuestion(payload);
    if (response.isSuccess && response.result) {
      return response.result;
    }
    throw new Error(
      response.errorMessages?.join(', ') || 'Failed to create question',
    );
  }

  async updateAssessmentQuestion(
    id: number | string,
    payload: any,
  ): Promise<AssessmentQuestion> {
    const response = await updateQuestion(id, payload);
    if (response.isSuccess && response.result) {
      return response.result;
    }
    throw new Error(
      response.errorMessages?.join(', ') || 'Failed to update question',
    );
  }

  async deleteAssessmentQuestion(id: number | string): Promise<void> {
    const response = await deleteQuestion(id);
    if (!response.isSuccess) {
      throw new Error(
        response.errorMessages?.join(', ') || 'Failed to delete question',
      );
    }
  }
}

export const assessmentQuestionService = new AssessmentQuestionServiceWrapper();

