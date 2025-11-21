import { ApiService, ApiResponse } from '../utils/ApiService';
import { geminiService, FeedbackData } from './geminiService';

export interface UploadTestFileResponse {
  message: string;
  folderName: string;
}

export interface UploadPostmanCollectionResponse {
  message: string;
  path: string;
}

export interface CreateGradingPayload {
  submissionId: number;
  assessmentTemplateId: number;
}

export interface AiFeedbackResult {
  feedback: string;
  language: string;
  provider: string;
  submissionId: number;
  fileName: string;
}

export interface GradeItem {
  id: number;
  score: number;
  comments: string;
  rubricItemId: number;
  rubricItemDescription: string;
  rubricItemMaxScore: number;
}

export interface GradingSession {
  id: number;
  grade: number;
  gradingType: number; // 0: AI, 1: LECTURER, 2: BOTH
  status: number; // 0: PROCESSING, 1: COMPLETED, 2: FAILED
  submissionId: number;
  submissionStudentName: string;
  submissionStudentCode: string;
  createdAt: string;
  updatedAt: string;
  gradeItemCount: number;
  gradeItems: GradeItem[];
  gradingLogs: any[];
}

export interface GradingSessionListResult {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  items: GradingSession[];
}

export interface UpdateGradingSessionPayload {
  grade: number;
  status: number; // 0: PROCESSING, 1: COMPLETED, 2: FAILED
}

export interface GetGradingSessionsParams {
  pageNumber?: number;
  pageSize?: number;
  submissionId?: number;
  gradingType?: number; // 0: AI, 1: LECTURER, 2: BOTH
  status?: number; // 0: PROCESSING, 1: COMPLETED, 2: FAILED
}

export class GradingService {
  /**
   * Create a new grading session (for manual grading)
   * @param payload - Create grading payload (submissionId and assessmentTemplateId)
   * @returns Created grading session
   */
  async createGrading(payload: CreateGradingPayload): Promise<GradingSession> {
    try {
      const response = await ApiService.post<GradingSession>(
        '/api/Grading',
        payload,
      );

      if (!response.isSuccess) {
        const errorMessage =
          response.errorMessages?.join(', ') || 'Failed to create grading session';
        throw new Error(errorMessage);
      }

      if (!response.result) {
        throw new Error('No grading session returned from API');
      }

      return response.result;
    } catch (error: any) {
      // Handle API errors
      if (error.response?.data) {
        const apiError = error.response.data;
        if (apiError.errorMessages && apiError.errorMessages.length > 0) {
          throw new Error(apiError.errorMessages.join(', '));
        }
        if (apiError.message) {
          throw new Error(apiError.message);
        }
      }
      throw error;
    }
  }

  /**
   * Trigger auto grading for a submission
   * @param payload - Auto grading payload (submissionId and assessmentTemplateId)
   * @returns Created grading session with status 0 (PROCESSING) if grading is in progress
   */
  async autoGrading(payload: CreateGradingPayload): Promise<GradingSession> {
    try {
      const response = await ApiService.post<GradingSession>(
        '/api/Grading',
        payload,
      );

      if (!response.isSuccess) {
        const errorMessage =
          response.errorMessages?.join(', ') || 'Failed to start auto grading';
        throw new Error(errorMessage);
      }

      if (!response.result) {
        throw new Error('No grading session returned from API');
      }

      return response.result;
    } catch (error: any) {
      // Handle API errors
      if (error.response?.data) {
        const apiError = error.response.data;
        if (apiError.errorMessages && apiError.errorMessages.length > 0) {
          throw new Error(apiError.errorMessages.join(', '));
        }
        if (apiError.message) {
          throw new Error(apiError.message);
        }
      }
      throw error;
    }
  }

  /**
   * Get AI feedback for a submission
   * @param submissionId - Submission ID
   * @param provider - Optional provider (defaults to OpenAI)
   * @returns AI feedback result
   */
  async getAiFeedback(
    submissionId: number,
    provider?: string,
  ): Promise<AiFeedbackResult> {
    try {
      const queryParams = provider ? `?provider=${provider}` : '';
      const response = await ApiService.post<AiFeedbackResult>(
        `/api/Grading/ai-feedback/submission/${submissionId}${queryParams}`,
        {},
      );

      if (!response.isSuccess) {
        const errorMessage =
          response.errorMessages?.join(', ') || 'Failed to get AI feedback';
        throw new Error(errorMessage);
      }

      if (!response.result) {
        throw new Error('No feedback data returned from API');
      }

      return response.result;
    } catch (error: any) {
      if (error.response?.data) {
        const apiResponse = error.response.data;
        if (apiResponse.errorMessages && apiResponse.errorMessages.length > 0) {
          throw new Error(apiResponse.errorMessages.join(', '));
        }
      }
      throw error;
    }
  }

  /**
   * Get paginated list of grading sessions
   * @param params - Query parameters for filtering and pagination
   * @returns Paginated grading sessions
   */
  async getGradingSessions(
    params?: GetGradingSessionsParams,
  ): Promise<GradingSessionListResult> {
    const queryParams = new URLSearchParams();
    if (params?.pageNumber) {
      queryParams.append('pageNumber', params.pageNumber.toString());
    }
    if (params?.pageSize) {
      queryParams.append('pageSize', params.pageSize.toString());
    }
    if (params?.submissionId) {
      queryParams.append('submissionId', params.submissionId.toString());
    }
    if (params?.gradingType !== undefined) {
      queryParams.append('gradingType', params.gradingType.toString());
    }
    if (params?.status !== undefined) {
      queryParams.append('status', params.status.toString());
    }

    const response = await ApiService.get<GradingSessionListResult>(
      `/api/GradingSession/page?${queryParams.toString()}`,
    );
    if (response.result) {
      return response.result;
    }
    return {
      currentPage: 1,
      pageSize: 10,
      totalCount: 0,
      totalPages: 0,
      items: [],
    };
  }

  /**
   * Get a grading session by ID
   * @param gradingSessionId - Grading session ID
   * @returns Grading session
   */
  async getGradingSession(gradingSessionId: number): Promise<GradingSession> {
    const response = await ApiService.get<GradingSession>(
      `/api/GradingSession/${gradingSessionId}`,
    );
    if (response.result) {
      return response.result;
    }
    throw new Error('Grading session not found');
  }

  /**
   * Update a grading session
   * @param gradingSessionId - Grading session ID
   * @param payload - Update payload (grade and status)
   */
  async updateGradingSession(
    gradingSessionId: number,
    payload: UpdateGradingSessionPayload,
  ): Promise<void> {
    await ApiService.put(`/api/GradingSession/${gradingSessionId}`, payload);
  }

  /**
   * Delete a grading session
   * @param gradingSessionId - Grading session ID
   */
  async deleteGradingSession(gradingSessionId: number): Promise<void> {
    await ApiService.delete(`/api/GradingSession/${gradingSessionId}`);
  }

  async uploadTestFile(
    submissionId: number,
    file: { uri: string; name: string; type: string },
  ): Promise<UploadTestFileResponse> {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.type,
      } as any);

      const response = await ApiService.post<UploadTestFileResponse>(
        `/api/Grading/upload-test-file?submissionId=${submissionId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      if (response.result) return response.result;
      throw new Error('Failed to upload test file.');
    } catch (error: any) {
      console.error('Failed to upload test file:', error);
      throw error;
    }
  }

  async uploadPostmanCollectionDatabase(
    template: 0 | 1,
    assessmentTemplateId: number,
    file: { uri: string; name: string; type: string },
  ): Promise<UploadPostmanCollectionResponse> {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.type,
      } as any);

      const response = await ApiService.post<UploadPostmanCollectionResponse>(
        `/api/Grading/postman-collection-database?template=${template}&assessmentTemplateId=${assessmentTemplateId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      if (response.result) return response.result;
      throw new Error('Failed to upload postman collection/database file.');
    } catch (error: any) {
      console.error('Failed to upload postman collection/database file:', error);
      throw error;
    }
  }

  /**
   * Get AI feedback and format it using Gemini Pro
   * @param submissionId - Submission ID
   * @param provider - Optional provider (defaults to OpenAI)
   * @returns Formatted feedback data ready for form
   */
  async getFormattedAiFeedback(
    submissionId: number,
    provider: string = 'OpenAI',
  ): Promise<FeedbackData> {
    // Get raw feedback from AI feedback API
    const aiFeedback = await this.getAiFeedback(submissionId, provider);
    
    // Format feedback using Gemini Pro
    const formattedFeedback = await geminiService.formatFeedback(aiFeedback.feedback);
    
    return formattedFeedback;
  }
}

export const gradingService = new GradingService();

// Legacy function exports for backward compatibility
export const uploadTestFile = async (
  submissionId: number,
  file: { uri: string; name: string; type: string },
): Promise<UploadTestFileResponse> => {
  return await gradingService.uploadTestFile(submissionId, file);
};

export const uploadPostmanCollectionDatabase = async (
  template: 0 | 1,
  assessmentTemplateId: number,
  file: { uri: string; name: string; type: string },
): Promise<UploadPostmanCollectionResponse> => {
  return await gradingService.uploadPostmanCollectionDatabase(
    template,
    assessmentTemplateId,
    file,
  );
};

