// Wrapper services to match web's class-based API
import {
  AssessmentTemplateData,
  getAssessmentTemplates as fetchTemplates,
  createAssessmentTemplate as createTemplate,
  updateAssessmentTemplate as updateTemplate,
  deleteAssessmentTemplate as deleteTemplate,
  getAssessmentTemplateById,
  FetchAssessmentTemplatesParams,
  AssessmentTemplatePaginatedResult,
} from './assessmentTemplateService';

// Alias types for compatibility
export type AssessmentTemplate = AssessmentTemplateData;

export interface GetAssessmentTemplatesParams {
  lecturerId?: number;
  assignedToHODId?: number;
  assignRequestId?: number;
  semesterId?: number;
  pageNumber: number;
  pageSize: number;
}

export interface GetAssessmentTemplatesResponse {
  items: AssessmentTemplate[];
  total: number;
}

class AssessmentTemplateServiceWrapper {
  async getAssessmentTemplates(
    params: GetAssessmentTemplatesParams,
  ): Promise<GetAssessmentTemplatesResponse> {
    const result = await fetchTemplates({
      pageNumber: params.pageNumber,
      pageSize: params.pageSize,
      lecturerId: params.lecturerId,
      assignedToHODId: params.assignedToHODId,
      assignRequestId: params.assignRequestId,
      semesterId: params.semesterId,
    });
    return {
      items: result?.items || [],
      total: result?.totalCount || 0,
    };
  }

  async createAssessmentTemplate(payload: any): Promise<AssessmentTemplate> {
    const response = await createTemplate(payload);
    if (response.isSuccess && response.result) {
      return response.result;
    }
    throw new Error(
      response.errorMessages?.join(', ') || 'Failed to create template',
    );
  }

  async updateAssessmentTemplate(
    id: number | string,
    payload: any,
  ): Promise<AssessmentTemplate> {
    const response = await updateTemplate(id, payload);
    if (response.isSuccess && response.result) {
      return response.result;
    }
    throw new Error(
      response.errorMessages?.join(', ') || 'Failed to update template',
    );
  }

  async deleteAssessmentTemplate(id: number | string): Promise<void> {
    const response = await deleteTemplate(id);
    if (!response.isSuccess) {
      throw new Error(
        response.errorMessages?.join(', ') || 'Failed to delete template',
      );
    }
  }
}

export const assessmentTemplateService = new AssessmentTemplateServiceWrapper();

