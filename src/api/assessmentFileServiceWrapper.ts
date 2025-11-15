// Wrapper services to match web's class-based API
import {
  AssessmentFileData,
  getFilesForTemplate,
  uploadAssessmentFile as uploadFile,
  deleteAssessmentFile as deleteFile,
  GetFilesForTemplateParams,
  GetFilesForTemplateResponse,
} from './assessmentFileService';

// Alias types for compatibility
export type AssessmentFile = AssessmentFileData;

class AssessmentFileServiceWrapper {
  async getFilesForTemplate(
    params: GetFilesForTemplateParams,
  ): Promise<GetFilesForTemplateResponse> {
    const result = await getFilesForTemplate(params);
    return {
      items: result?.items || [],
      total: result?.total || 0,
    };
  }

  async createAssessmentFile(payload: any): Promise<AssessmentFile> {
    // Mobile uses uploadAssessmentFile with different signature
    // This wrapper adapts the web's createAssessmentFile signature
    const { File, Name, FileTemplate, AssessmentTemplateId } = payload;
    return await uploadFile(File, Name, FileTemplate, AssessmentTemplateId);
  }

  async deleteAssessmentFile(id: number | string): Promise<string> {
    const response = await deleteFile(id);
    if (response.isSuccess) {
      return 'File deleted successfully';
    }
    throw new Error(
      response.errorMessages?.join(', ') || 'Failed to delete file',
    );
  }
}

export const assessmentFileService = new AssessmentFileServiceWrapper();

