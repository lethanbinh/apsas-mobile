import { ApiService, ApiResponse } from '../utils/ApiService';

export interface SubmissionFeedback {
  id: number;
  feedbackText: string;
  submissionId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubmissionFeedbackPayload {
  submissionId: number;
  feedbackText: string;
}

export interface UpdateSubmissionFeedbackPayload {
  feedbackText: string;
}

export interface GetSubmissionFeedbackListParams {
  submissionId: number;
}

export class SubmissionFeedbackService {
  /**
   * Get list of submission feedbacks by submission ID
   */
  async getSubmissionFeedbackList(
    params: GetSubmissionFeedbackListParams,
  ): Promise<SubmissionFeedback[]> {
    try {
      const endpoint = `/api/SubmissionFeedback/list?submissionId=${params.submissionId}`;
      const response = await ApiService.get<SubmissionFeedback[]>(endpoint);
      if (response.result) return response.result;
      throw new Error('No submission feedback data found.');
    } catch (error: any) {
      console.error('Failed to fetch submission feedback list:', error);
      throw error;
    }
  }

  /**
   * Create a new submission feedback
   */
  async createSubmissionFeedback(
    payload: CreateSubmissionFeedbackPayload,
  ): Promise<SubmissionFeedback> {
    try {
      const response = await ApiService.post<SubmissionFeedback>(
        '/api/SubmissionFeedback/create',
        {
          submissionId: payload.submissionId,
          feedbackText: payload.feedbackText,
        },
      );

      if (!response.isSuccess) {
        const errorMessage =
          response.errorMessages?.join(', ') ||
          'Failed to create submission feedback';
        throw new Error(errorMessage);
      }

      if (!response.result) {
        throw new Error('No feedback data returned from API');
      }

      return response.result;
    } catch (error: any) {
      console.error('Failed to create submission feedback:', error);
      throw error;
    }
  }

  /**
   * Update an existing submission feedback
   */
  async updateSubmissionFeedback(
    submissionFeedbackId: number,
    payload: UpdateSubmissionFeedbackPayload,
  ): Promise<SubmissionFeedback> {
    try {
      const response = await ApiService.put<SubmissionFeedback>(
        `/api/SubmissionFeedback/${submissionFeedbackId}`,
        {
          feedbackText: payload.feedbackText,
        },
      );

      if (!response.isSuccess) {
        const errorMessage =
          response.errorMessages?.join(', ') ||
          'Failed to update submission feedback';
        throw new Error(errorMessage);
      }

      if (!response.result) {
        throw new Error('No feedback data returned from API');
      }

      return response.result;
    } catch (error: any) {
      console.error('Failed to update submission feedback:', error);
      throw error;
    }
  }

  /**
   * Delete a submission feedback
   */
  async deleteSubmissionFeedback(submissionFeedbackId: number): Promise<void> {
    try {
      const response = await ApiService.delete<ApiResponse<any>>(
        `/api/SubmissionFeedback/${submissionFeedbackId}`,
      );

      if (!response.isSuccess) {
        const errorMessage =
          response.errorMessages?.join(', ') ||
          'Failed to delete submission feedback';
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error(
        `Failed to delete submission feedback ${submissionFeedbackId}:`,
        error,
      );
      throw error;
    }
  }
}

export const submissionFeedbackService = new SubmissionFeedbackService();

