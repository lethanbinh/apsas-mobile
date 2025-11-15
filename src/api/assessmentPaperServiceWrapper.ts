// Wrapper services to match web's class-based API
import {
  AssessmentPaperData,
  getAssessmentPapers as fetchPapers,
  createAssessmentPaper as createPaper,
  updateAssessmentPaper as updatePaper,
  deleteAssessmentPaper as deletePaper,
  FetchAssessmentPapersParams,
  AssessmentPaperPaginatedResult,
} from './assessmentPaperService';

// Alias types for compatibility
export type AssessmentPaper = AssessmentPaperData;

export interface GetAssessmentPapersParams {
  assessmentTemplateId?: number;
  pageNumber: number;
  pageSize: number;
}

export interface GetAssessmentPapersResponse {
  items: AssessmentPaper[];
  total: number;
}

class AssessmentPaperServiceWrapper {
  async getAssessmentPapers(
    params: GetAssessmentPapersParams,
  ): Promise<GetAssessmentPapersResponse> {
    const result = await fetchPapers({
      pageNumber: params.pageNumber,
      pageSize: params.pageSize,
      assessmentTemplateId: params.assessmentTemplateId,
    });
    return {
      items: result?.items || [],
      total: result?.totalCount || 0,
    };
  }

  async createAssessmentPaper(payload: any): Promise<AssessmentPaper> {
    const response = await createPaper(payload);
    if (response.isSuccess && response.result) {
      return response.result;
    }
    throw new Error(
      response.errorMessages?.join(', ') || 'Failed to create paper',
    );
  }

  async updateAssessmentPaper(
    id: number | string,
    payload: any,
  ): Promise<AssessmentPaper> {
    const response = await updatePaper(id, payload);
    if (response.isSuccess && response.result) {
      return response.result;
    }
    throw new Error(
      response.errorMessages?.join(', ') || 'Failed to update paper',
    );
  }

  async deleteAssessmentPaper(id: number | string): Promise<void> {
    const response = await deletePaper(id);
    if (!response.isSuccess) {
      throw new Error(
        response.errorMessages?.join(', ') || 'Failed to delete paper',
      );
    }
  }
}

export const assessmentPaperService = new AssessmentPaperServiceWrapper();

