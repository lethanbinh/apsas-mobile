// Wrapper services to match web's class-based API
import {
  RubricItemData,
  getRubricsForQuestion,
  createRubricItem as createRubric,
  updateRubricItem as updateRubric,
  deleteRubricItem as deleteRubric,
  GetRubricsForQuestionParams,
  GetRubricsForQuestionResponse,
} from './rubricItemService';

// Alias types for compatibility
export type RubricItem = RubricItemData;

export interface GetRubricsParams {
  assessmentQuestionId?: number;
  pageNumber: number;
  pageSize: number;
}

export interface GetRubricsResponse {
  items: RubricItem[];
  total: number;
}

class RubricItemServiceWrapper {
  async getRubricsForQuestion(
    params: GetRubricsParams,
  ): Promise<GetRubricsResponse> {
    if (!params.assessmentQuestionId) {
      throw new Error('assessmentQuestionId is required');
    }
    return await getRubricsForQuestion({
      assessmentQuestionId: params.assessmentQuestionId,
      pageNumber: params.pageNumber,
      pageSize: params.pageSize,
    });
  }

  async createRubricItem(payload: any): Promise<RubricItem> {
    const response = await createRubric(payload);
    if (response.isSuccess && response.result) {
      return response.result;
    }
    throw new Error(
      response.errorMessages?.join(', ') || 'Failed to create rubric',
    );
  }

  async updateRubricItem(
    id: number | string,
    payload: any,
  ): Promise<RubricItem> {
    const response = await updateRubric(id, payload);
    if (response.isSuccess && response.result) {
      return response.result;
    }
    throw new Error(
      response.errorMessages?.join(', ') || 'Failed to update rubric',
    );
  }

  async deleteRubricItem(id: number | string): Promise<void> {
    const response = await deleteRubric(id);
    if (!response.isSuccess) {
      throw new Error(
        response.errorMessages?.join(', ') || 'Failed to delete rubric',
      );
    }
  }
}

export const rubricItemService = new RubricItemServiceWrapper();

