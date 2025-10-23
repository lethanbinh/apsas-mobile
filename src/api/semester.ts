import { ApiService, ApiResponse } from '../utils/ApiService';
import { AccountData } from './account';

// --- EXISTING INTERFACES ---
export interface SemesterData {
  id: string;
  semesterCode: string;
  academicYear: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface SemesterCourseData {
  id: string;
  semesterId: string;
  courseId: string;
  createdByHODId: string;
  createdAt: string;
  updatedAt: string;
}

export interface HoDData {
  accountId: number;
  accountCode: string;
}

export interface CourseData {
  id: string;
  name: string;
  description: string;
  code: string;
  createdAt: string;
  updatedAt: string;
}

export interface CourseElementData {
  id: string;
  name: string;
  description: string;
  weight: number;
  semesterCourseId: string;
  createdAt: string;
  updatedAt: string;
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
  studentCount: string;
}

export interface StudentGroupData {
  id: string;
  enrollmentDate: string;
  description: string | null;
  classId: string;
  studentId: string;
  createdAt: string;
  updatedAt: string;
  classCode: string;
  studentName: string;
  studentCode: string;
}

export interface AssignRequestData {
  id: string;
  message: string;
  courseElementId: string;
  assignedByHODId: string;
  createdAt: string;
  updatedAt: string;
  courseElementName: string;
  courseElementDescription: string;
  courseName: string;
  semesterName: string;
  assignedLecturerId: string;
  assignedLecturerName: string;
  assignedLecturerDepartment: string;
  assignedByHODName: string;
}

// --- PAYLOAD INTERFACES FOR COURSE CRUD ---
export interface CourseCrudPayload {
  name: string;
  description: string;
  code: string;
}

export interface HoDListData {
  accountId: number;
  hoDId: string;
  accountCode: string;
  username: string;
  email: string;
  phoneNumber: string | null;
  fullName: string | null;
  avatar: string | null;
  address: string | null;
  gender: number | null;
  dateOfBirth: string | null;
  role: number;
}

// --- EXISTING FETCH FUNCTIONS ---
export const fetchSemesters = async (): Promise<SemesterData[]> => {
  try {
    const response = await ApiService.get<SemesterData[]>(
      '/api/Semester?pageNumber=1&pageSize=100',
    );
    if (response.result) return response.result;
    throw new Error('No semester data found.');
  } catch (error: any) {
    console.error('Failed to fetch semesters:', error);
    throw error;
  }
};

export const fetchSemesterCourses = async (): Promise<SemesterCourseData[]> => {
  try {
    const response = await ApiService.get<SemesterCourseData[]>(
      '/api/semesterCourse?pageNumber=1&pageSize=5000',
    );
    if (response.result) return response.result;
    throw new Error('No semester course data found.');
  } catch (error: any) {
    console.error('Failed to fetch semester courses:', error);
    throw error;
  }
};

export const fetchHoDDetails = async (hodId: string): Promise<HoDData> => {
  try {
    const response = await ApiService.get<HoDData>(`/api/HoD/${hodId}`);
    if (response.result) return response.result;
    throw new Error(`HoD details not found for ID ${hodId}.`);
  } catch (error: any) {
    console.error(`Failed to fetch HOD ${hodId}:`, error);
    throw error;
  }
};

export const fetchHoDList = async (): Promise<HoDListData[]> => {
  try {
    const response = await ApiService.get<HoDListData[]>('/api/HoD/list');
    if (response.result) {
      return response.result;
    }
    throw new Error('No HOD list data found.');
  } catch (error: any) {
    console.error('Failed to fetch HOD list:', error);
    throw error;
  }
};

export const fetchCourseById = async (
  courseId: string,
): Promise<CourseData> => {
  try {
    const response = await ApiService.get<CourseData>(
      `/api/Course/${courseId}`,
    );
    if (response.result) return response.result;
    throw new Error(`Course data not found for ID ${courseId}.`);
  } catch (error: any) {
    console.error(`Failed to fetch course ${courseId}:`, error);
    throw error;
  }
};

export const fetchCourseElements = async (): Promise<CourseElementData[]> => {
  try {
    const response = await ApiService.get<CourseElementData[]>('/api/courseElements?pageNumber=1&pageSize=5000');
    if (response.result) {
      return response.result;
    }
    throw new Error('No course elements data found.');
  } catch (error: any) {
    console.error('Failed to fetch course elements:', error);
    throw error;
  }
};

export const fetchClassList = async (): Promise<ClassData[]> => {
  try {
    const response = await ApiService.get<ClassData[]>('/api/Class/list');
    if (response.result) return response.result;
    throw new Error('No class list data found.');
  } catch (error: any) {
    console.error('Failed to fetch class list:', error);
    throw error;
  }
};

export const fetchStudentGroupList = async (): Promise<StudentGroupData[]> => {
  try {
    const response = await ApiService.get<StudentGroupData[]>(
      '/api/StudentGroup/list',
    );
    if (response.result) return response.result;
    throw new Error('No student group data found.');
  } catch (error: any) {
    console.error('Failed to fetch student group list:', error);
    throw error;
  }
};

export const fetchAssignRequestList = async (): Promise<
  AssignRequestData[]
> => {
  try {
    const response = await ApiService.get<AssignRequestData[]>(
      '/api/assignRequest/list',
    );
    if (response.result) return response.result;
    throw new Error('No assign request data found.');
  } catch (error: any) {
    console.error('Failed to fetch assign request list:', error);
    throw error;
  }
};

// --- NEW COURSE CRUD FUNCTIONS ---
export const createCourse = async (
  data: CourseCrudPayload,
): Promise<ApiResponse<CourseData>> => {
  return ApiService.post<CourseData>('/api/Course', data);
};

export const updateCourse = async (
  courseId: string | number,
  data: CourseCrudPayload,
): Promise<ApiResponse<any>> => {
  return ApiService.put(`/api/Course/${courseId}`, data);
};

export const deleteCourse = async (
  courseId: string | number,
): Promise<ApiResponse<any>> => {
  return ApiService.delete(`/api/Course/${courseId}`);
};

export const createSemesterCourse = async (data: {
  semesterId: string;
  courseId: string;
  createdByHODId: string;
}): Promise<ApiResponse<SemesterCourseData>> => {
  return ApiService.post<SemesterCourseData>('/api/SemesterCourse', data);
};

export const findHoDByAccountId = async (
  accountId: string | number,
): Promise<HoDListData | null> => {
  try {
    const response = await ApiService.get<HoDListData[]>(`/api/HoD/list`); // Giả sử API này trả về list
    if (response.result) {
      const hod = response.result.find(
        h => String(h.accountId) === String(accountId),
      );
      return hod || null; // Trả về HOD tìm thấy hoặc null
    }
    throw new Error('No HOD list data found.');
  } catch (error: any) {
    console.error(`Failed to find HOD by account ID ${accountId}:`, error);
    throw error;
  }
};

export const deleteSemesterCourse = async (
  semesterCourseId: string | number,
): Promise<ApiResponse<any>> => {
  return ApiService.delete(`/api/SemesterCourse/${semesterCourseId}`);
};

// ... (Các hàm fetch... và Course CRUD giữ nguyên) ...

// --- PAYLOAD INTERFACE FOR COURSE ELEMENT CRUD ---
export interface CourseElementCrudPayload {
  name: string;
  description: string;
  weight: number;
  semesterCourseId: string | number; // API yêu cầu số
}

// --- NEW COURSE ELEMENT CRUD FUNCTIONS ---
export const createCourseElement = async (
  data: CourseElementCrudPayload,
): Promise<ApiResponse<CourseElementData>> => {
  return ApiService.post<CourseElementData>('/api/CourseElements', data);
};

export const updateCourseElement = async (
  courseElementId: string | number,
  data: CourseElementCrudPayload,
): Promise<ApiResponse<any>> => {
  return ApiService.put(`/api/CourseElements/${courseElementId}`, data);
};

export const deleteCourseElement = async (
  courseElementId: string | number,
): Promise<ApiResponse<any>> => {
  return ApiService.delete(`/api/CourseElements/${courseElementId}`);
};
export interface ClassCrudPayload {
  classCode: string;
  totalStudent: number; // API yêu cầu số, nhưng trả về chuỗi? Gửi số.
  description: string | null;
  lecturerId: string | number; // API yêu cầu chuỗi
  semesterCourseId: string | number; // API yêu cầu số
}

// --- NEW CLASS CRUD FUNCTIONS ---
export const createClass = async (
  data: ClassCrudPayload,
): Promise<ApiResponse<ClassData>> => {
  return ApiService.post<ClassData>('/api/Class/create', data);
};

export const updateClass = async (
  classId: string | number,
  data: ClassCrudPayload,
): Promise<ApiResponse<any>> => {
  return ApiService.put(`/api/Class/${classId}`, data);
};

export const deleteClass = async (
  classId: string | number,
): Promise<ApiResponse<any>> => {
  return ApiService.delete(`/api/Class/${classId}`);
};
export interface AssignRequestCreatePayload {
    message: string | null;
    courseElementId: string | number;
    assignedLecturerId: string | number;
    assignedByHODId: string | number;
}

export interface AssignRequestUpdatePayload {
    message: string | null;
    assignedLecturerId: string | number;
}

// --- NEW ASSIGN REQUEST CRUD FUNCTIONS ---
export const createAssignRequest = async (
    data: AssignRequestCreatePayload
): Promise<ApiResponse<AssignRequestData>> => {
    return ApiService.post<AssignRequestData>('/api/AssignRequest/create', data);
};

export const updateAssignRequest = async (
    assignRequestId: string | number,
    data: AssignRequestUpdatePayload
): Promise<ApiResponse<any>> => {
    return ApiService.put(`/api/AssignRequest/${assignRequestId}`, data);
};

export const deleteAssignRequest = async (
    assignRequestId: string | number
): Promise<ApiResponse<any>> => {
    return ApiService.delete(`/api/AssignRequest/${assignRequestId}`);
};
