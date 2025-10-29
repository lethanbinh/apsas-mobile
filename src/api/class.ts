import { ApiService, ApiResponse } from '../utils/ApiService';

export interface StudentEnrollment {
  studentId: string;
  studentCode: string;
  studentName: string;
  email: string;
  enrollmentDate: string;
  description: string | null;
}

export interface ClassResponse {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  items: ClassData[];
}

export interface ClassData {
  id: string;
  classCode: string;
  totalStudent: string;
  description: string | null;
  lecturerId: string;
  semesterCourseId: string;
  createdAt: string;
  updatedAt: string;
  lecturerName: string;
  lecturerCode: string;
  courseName: string;
  courseCode: string;
  semesterName: string;
  semesterCode: string;
  students: StudentEnrollment[];
}

export interface SemesterData {
  id: string;
  semesterCode: string;
  academicYear: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClassDetailLecturerAccount {
  id: number;
  accountCode: string;
  username: string;
  email: string;
  phoneNumber: string;
  fullName: string;
  avatar: string;
}

export interface ClassDetailLecturer {
  id: number;
  department: string;
  specialization: string;
  account: ClassDetailLecturerAccount;
}

export interface ClassDetailStudentAccount {
  id: number;
  accountCode: string;
  username: string;
  email: string;
  phoneNumber: string;
  fullName: string;
  avatar: string;
}

export interface ClassDetailStudent {
  id: number;
  account: ClassDetailStudentAccount;
  enrollmentDate: string;
}

export interface ClassDetailData {
  id: number;
  classCode: string;
  totalStudent: number;
  description: string;
  lecturer: ClassDetailLecturer;
  students: ClassDetailStudent[];
}

export const fetchClassList = async (
  includeStudents: boolean = false, // Thêm tham số
  pageNumber: number = 1,
  pageSize: number = 1000, // Tăng pageSize để lấy nhiều hơn
): Promise<ClassData[]> => {
  try {
    // Xây dựng endpoint với params
    const endpoint = `/api/Class/list?pageNumber=${pageNumber}&pageSize=${pageSize}&includeStudents=${includeStudents}`;
    const response = await ApiService.get<ClassResponse>(endpoint);

    if (response.result && response.result.items) {
      // TODO: Cân nhắc xử lý phân trang nếu totalPages > 1
      return response.result.items;
    } else {
      throw new Error('No class list data found in the response result.');
    }
  } catch (error: any) {
    console.error('Failed to fetch class list:', error);
    throw error;
  }
};

export const fetchSemesterList = async (): Promise<SemesterData[]> => {
  try {
    const response = await ApiService.get<SemesterData[]>('/api/Semester');
    if (response.result) {
      return response.result;
    } else {
      throw new Error('No semester list data found in the response result.');
    }
  } catch (error: any) {
    console.error('Failed to fetch semester list:', error);
    throw error;
  }
};

export const fetchClassById = async (classId: string): Promise<ClassData> => {
  try {
    const response = await ApiService.get<ClassData>(`/api/Class/${classId}`);
    if (response.result) {
      return response.result;
    } else {
      throw new Error('Class data not found.');
    }
  } catch (error: any) {
    console.error(`Failed to fetch class ${classId}:`, error);
    throw error;
  }
};
