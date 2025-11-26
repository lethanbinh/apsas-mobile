import { adminService } from './adminService';
import { accountService } from './accountService';
import { fetchLecturerList } from './lecturerService';
import { fetchClassList, ClassData } from './classService';
import { getClassAssessments } from './classAssessmentService';
import { getSubmissionList, Submission } from './submissionService';
import { getGradingGroups } from './gradingGroupService';
import { gradingService } from './gradingService';
import { fetchCourseElements } from './courseElementService';
import { assessmentTemplateService } from './assessmentTemplateServiceWrapper';
import { fetchAssignRequestList } from './assignRequestService';

const ROLES = {
  ADMIN: 0,
  LECTURER: 1,
  STUDENT: 2,
  HOD: 3,
};

export interface DashboardOverview {
  users: UserStats;
  academic: AcademicStats;
  assessments: AssessmentStats;
  submissions: SubmissionStats;
  grading: GradingStats;
}

export interface UserStats {
  total: number;
  byRole: {
    admin: number;
    lecturer: number;
    student: number;
    hod: number;
  };
  newThisMonth: number;
  active: number;
  inactive: number;
  neverLoggedIn: number;
  byGender: {
    male: number;
    female: number;
    other: number;
  };
  averageAge?: number;
  usersWithAvatar: number;
  usersWithoutAvatar: number;
  usersWithPhone: number;
  usersWithoutPhone: number;
}

export interface AcademicStats {
  totalSemesters: number;
  activeSemesters: number;
  totalClasses: number;
  totalCourseElements: number;
  totalCourses: number;
  totalStudents: number;
  totalLecturers: number;
  classesOverloaded: number;
  classesBySemester: Array<{
    semesterCode: string;
    semesterName: string;
    classCount: number;
    studentCount: number;
    lecturerCount: number;
  }>;
  averageStudentsPerClass: number;
  classesWithoutStudents: number;
  topClassesByStudents: Array<{
    id: number;
    classCode: string;
    courseName: string;
    studentCount: number;
    lecturerName: string;
  }>;
  semesterCourses: number;
  lecturerWorkload: Array<{
    lecturerId: string;
    lecturerName: string;
    classCount: number;
    studentCount: number;
  }>;
  studentToLecturerRatio: number;
}

export interface AssessmentStats {
  totalTemplates: number;
  totalClassAssessments: number;
  byType: {
    assignment: number;
    lab: number;
    practicalExam: number;
  };
  assessmentsByStatus: {
    active: number;
    completed: number;
    pending: number;
  };
  assessmentsByLecturer: Array<{
    lecturerId: number;
    lecturerName: string;
    count: number;
  }>;
  averageSubmissionsPerAssessment: number;
  assessmentsWithoutSubmissions: number;
  topAssessmentsBySubmissions: Array<{
    id: number;
    name: string;
    courseName: string;
    submissionCount: number;
    lecturerName: string;
  }>;
  upcomingDeadlines: Array<{
    id: number;
    name: string;
    endAt: string;
    daysRemaining: number;
  }>;
}

export interface SubmissionStats {
  total: number;
  graded: number;
  pending: number;
  notSubmitted: number;
  completionRate: number;
  submissionsByType: {
    assignment: number;
    lab: number;
    practicalExam: number;
  };
  averageGrade: number;
  submissionsByGradeRange: {
    excellent: number;
    good: number;
    average: number;
    belowAverage: number;
  };
  lateSubmissions: number;
  onTimeSubmissions: number;
  topStudentsBySubmissions: Array<{
    studentId: number;
    studentName: string;
    studentCode: string;
    submissionCount: number;
    averageGrade: number;
  }>;
  submissionsByDay: Array<{
    date: string;
    count: number;
  }>;
}

export interface GradingStats {
  totalGradingGroups: number;
  totalGradingSessions: number;
  pendingAssignRequests: number;
  completedGradingSessions: number;
  gradingSessionsByStatus: {
    processing: number;
    completed: number;
    failed: number;
  };
  gradingSessionsByType: {
    ai: number;
    lecturer: number;
    both: number;
  };
  averageGradingTime?: number;
  gradingByLecturer: Array<{
    lecturerId: number;
    lecturerName: string;
    sessionCount: number;
    completedCount: number;
  }>;
  pendingAssignRequestsByLecturer: Array<{
    lecturerId: number;
    lecturerName: string;
    requestCount: number;
  }>;
  gradingGroupsByStatus: {
    active: number;
    completed: number;
  };
}

export interface ChartData {
  userGrowth: UserGrowthData[];
  semesterActivity: SemesterActivityData[];
  assessmentDistribution: AssessmentDistributionData[];
  submissionStatus: SubmissionStatusData[];
  gradingPerformance: GradingPerformanceData[];
}

export interface UserGrowthData {
  month: string;
  total: number;
  students: number;
  lecturers: number;
}

export interface SemesterActivityData {
  semester: string;
  courses: number;
  classes: number;
  assessments: number;
  submissions: number;
}

export interface AssessmentDistributionData {
  type: string;
  count: number;
}

export interface SubmissionStatusData {
  status: string;
  count: number;
}

export interface GradingPerformanceData {
  date: string;
  graded: number;
  pending: number;
}

class AdminDashboardService {
  async getDashboardOverview(): Promise<DashboardOverview> {
    try {
      // Use Promise.allSettled to handle errors gracefully
      const [
        usersData,
        semestersData,
        classesData,
        assessmentsData,
        submissionsData,
        gradingGroupsData,
        gradingSessionsData,
        assignRequestsData,
      ] = await Promise.allSettled([
        this.getUserStats().catch(err => {
          console.warn('Failed to get user stats:', err);
          return this.getDefaultUserStats();
        }),
        this.getSemesterStats().catch(err => {
          console.warn('Failed to get semester stats:', err);
          return { total: 0, active: 0 };
        }),
        this.getClassStats().catch(err => {
          console.warn('Failed to get class stats:', err);
          return { total: 0 };
        }),
        this.getAssessmentStats().catch(err => {
          console.warn('Failed to get assessment stats:', err);
          return this.getDefaultAssessmentStats();
        }),
        this.getSubmissionStats().catch(err => {
          console.warn('Failed to get submission stats:', err);
          return this.getDefaultSubmissionStats();
        }),
        this.getGradingGroupStats().catch(err => {
          console.warn('Failed to get grading group stats:', err);
          return { total: 0 };
        }),
        this.getGradingSessionStats().catch(err => {
          console.warn('Failed to get grading session stats:', err);
          return { total: 0, completed: 0 };
        }),
        this.getAssignRequestStats().catch(err => {
          console.warn('Failed to get assign request stats:', err);
          return { pending: 0 };
        }),
      ]);

      const users = usersData.status === 'fulfilled' ? usersData.value : this.getDefaultUserStats();
      const academicDetailed = await this.getDetailedAcademicStats();
      console.log('Academic detailed stats:', academicDetailed);
      const academic: AcademicStats = {
        totalSemesters: semestersData.status === 'fulfilled' ? semestersData.value.total : 0,
        activeSemesters: semestersData.status === 'fulfilled' ? semestersData.value.active : 0,
        totalClasses: classesData.status === 'fulfilled' ? classesData.value.total : 0,
        totalCourseElements: academicDetailed.totalCourseElements || 0,
        totalCourses: academicDetailed.totalCourses || 0,
        totalStudents: academicDetailed.totalStudents || 0,
        totalLecturers: academicDetailed.totalLecturers || 0,
        classesOverloaded: academicDetailed.classesOverloaded || 0,
        classesBySemester: academicDetailed.classesBySemester || [],
        averageStudentsPerClass: academicDetailed.averageStudentsPerClass || 0,
        classesWithoutStudents: academicDetailed.classesWithoutStudents || 0,
        topClassesByStudents: academicDetailed.topClassesByStudents || [],
        semesterCourses: academicDetailed.semesterCourses || 0,
        lecturerWorkload: academicDetailed.lecturerWorkload || [],
        studentToLecturerRatio: academicDetailed.studentToLecturerRatio || 0,
      };

      const assessmentDetailed = await this.getDetailedAssessmentStats();
      console.log('Assessment detailed stats:', assessmentDetailed);
      const baseAssessments = assessmentsData.status === 'fulfilled' ? assessmentsData.value : this.getDefaultAssessmentStats();
      console.log('Base assessments:', baseAssessments);
      const assessments: AssessmentStats = {
        ...baseAssessments,
        assessmentsByStatus: assessmentDetailed.assessmentsByStatus || { active: 0, completed: 0, pending: 0 },
        assessmentsByLecturer: assessmentDetailed.assessmentsByLecturer || [],
        averageSubmissionsPerAssessment: assessmentDetailed.averageSubmissionsPerAssessment || 0,
        assessmentsWithoutSubmissions: assessmentDetailed.assessmentsWithoutSubmissions || 0,
        topAssessmentsBySubmissions: assessmentDetailed.topAssessmentsBySubmissions || [],
        upcomingDeadlines: assessmentDetailed.upcomingDeadlines || [],
      };

      const submissions = submissionsData.status === 'fulfilled' ? submissionsData.value : this.getDefaultSubmissionStats();

      const gradingDetailed = await this.getDetailedGradingStats();
      const grading: GradingStats = {
        totalGradingGroups: gradingGroupsData.status === 'fulfilled' ? gradingGroupsData.value.total : 0,
        totalGradingSessions: gradingSessionsData.status === 'fulfilled' ? gradingSessionsData.value.total : 0,
        pendingAssignRequests: assignRequestsData.status === 'fulfilled' ? assignRequestsData.value.pending : 0,
        completedGradingSessions: gradingSessionsData.status === 'fulfilled' ? gradingSessionsData.value.completed : 0,
        gradingSessionsByStatus: gradingDetailed.gradingSessionsByStatus || { processing: 0, completed: 0, failed: 0 },
        gradingSessionsByType: gradingDetailed.gradingSessionsByType || { ai: 0, lecturer: 0, both: 0 },
        averageGradingTime: gradingDetailed.averageGradingTime,
        gradingByLecturer: gradingDetailed.gradingByLecturer || [],
        pendingAssignRequestsByLecturer: gradingDetailed.pendingAssignRequestsByLecturer || [],
        gradingGroupsByStatus: gradingDetailed.gradingGroupsByStatus || { active: 0, completed: 0 },
      };

      return {
        users,
        academic,
        assessments,
        submissions,
        grading,
      };
    } catch (error) {
      console.error('Error fetching dashboard overview:', error);
      throw error;
    }
  }

  async getChartData(): Promise<ChartData> {
    try {
      const [userGrowth, semesterActivity, assessmentDistribution, submissionStatus, gradingPerformance] =
        await Promise.allSettled([
          this.getUserGrowthData(),
          this.getSemesterActivityData(),
          this.getAssessmentDistributionData(),
          this.getSubmissionStatusData(),
          this.getGradingPerformanceData(),
        ]);

      return {
        userGrowth: userGrowth.status === 'fulfilled' ? userGrowth.value : [],
        semesterActivity: semesterActivity.status === 'fulfilled' ? semesterActivity.value : [],
        assessmentDistribution: assessmentDistribution.status === 'fulfilled' ? assessmentDistribution.value : [],
        submissionStatus: submissionStatus.status === 'fulfilled' ? submissionStatus.value : [],
        gradingPerformance: gradingPerformance.status === 'fulfilled' ? gradingPerformance.value : [],
      };
    } catch (error) {
      console.error('Error fetching chart data:', error);
      return {
        userGrowth: [],
        semesterActivity: [],
        assessmentDistribution: [],
        submissionStatus: [],
        gradingPerformance: [],
      };
    }
  }

  private async getUserStats(): Promise<UserStats> {
    try {
      const { users } = await accountService.getAccountList(1, 1000);
      if (!users || !Array.isArray(users)) {
        return this.getDefaultUserStats();
      }
      const filteredUsers = users.filter((user) => user.role !== 4);

      const byRole = {
        admin: 0,
        lecturer: 0,
        student: 0,
        hod: 0,
      };

      let active = 0;
      const byGender = {
        male: 0,
        female: 0,
        other: 0,
      };
      let totalAge = 0;
      let ageCount = 0;
      let usersWithAvatar = 0;
      let usersWithoutAvatar = 0;
      let usersWithPhone = 0;
      let usersWithoutPhone = 0;

      filteredUsers.forEach((user) => {
        if (user.role === ROLES.ADMIN) byRole.admin++;
        else if (user.role === ROLES.LECTURER) byRole.lecturer++;
        else if (user.role === ROLES.STUDENT) byRole.student++;
        else if (user.role === ROLES.HOD) byRole.hod++;

        active++;
        if (user.gender === 0) byGender.male++;
        else if (user.gender === 1) byGender.female++;
        else byGender.other++;

        if (user.avatar) usersWithAvatar++;
        else usersWithoutAvatar++;

        if (user.phoneNumber && user.phoneNumber.trim() !== '') usersWithPhone++;
        else usersWithoutPhone++;

        if (user.dateOfBirth) {
          try {
            const birthDate = new Date(user.dateOfBirth);
            const age = new Date().getFullYear() - birthDate.getFullYear();
            if (age > 0 && age < 100) {
              totalAge += age;
              ageCount++;
            }
          } catch (e) {
            // Invalid date
          }
        }
      });

      const averageAge = ageCount > 0 ? Math.round(totalAge / ageCount) : undefined;

      return {
        total: filteredUsers.length,
        byRole,
        newThisMonth: 0,
        active,
        inactive: 0,
        neverLoggedIn: 0,
        byGender,
        averageAge,
        usersWithAvatar,
        usersWithoutAvatar,
        usersWithPhone,
        usersWithoutPhone,
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return this.getDefaultUserStats();
    }
  }

  private async getSemesterStats(): Promise<{ total: number; active: number }> {
    try {
      const semesters = await adminService.getPaginatedSemesters(1, 100);
      if (!semesters || !Array.isArray(semesters)) {
        return { total: 0, active: 0 };
      }
      const now = new Date();

      const active = semesters.filter((semester) => {
        const startDate = new Date(semester.startDate);
        const endDate = new Date(semester.endDate);
        return now >= startDate && now <= endDate;
      }).length;

      return {
        total: semesters.length,
        active,
      };
    } catch (error) {
      console.error('Error fetching semester stats:', error);
      return { total: 0, active: 0 };
    }
  }

  private async getClassStats(): Promise<{ total: number }> {
    try {
      const classes = await fetchClassList();
      if (!classes || !Array.isArray(classes)) {
        return { total: 0 };
      }
      return { total: classes.length };
    } catch (error) {
      console.error('Error fetching class stats:', error);
      return { total: 0 };
    }
  }

  private async getAssessmentStats(): Promise<AssessmentStats> {
    try {
      const templates = await assessmentTemplateService.getAssessmentTemplates({
        pageNumber: 1,
        pageSize: 1000,
      });
      if (!templates || !templates.items) {
        return this.getDefaultAssessmentStats();
      }
      const assessments = await getClassAssessments({
        pageNumber: 1,
        pageSize: 1000,
      });
      if (!assessments || !assessments.items) {
        return this.getDefaultAssessmentStats();
      }

      const byType = {
        assignment: 0,
        lab: 0,
        practicalExam: 0,
      };

      templates.items.forEach((template) => {
        if (this.isPracticalExamTemplate(template)) {
          byType.practicalExam++;
        } else if (this.isLabTemplate(template)) {
          byType.lab++;
        } else {
          byType.assignment++;
        }
      });

      return {
        totalTemplates: templates.total,
        totalClassAssessments: assessments.totalCount,
        byType,
        assessmentsByStatus: { active: 0, completed: 0, pending: 0 },
        assessmentsByLecturer: [],
        averageSubmissionsPerAssessment: 0,
        assessmentsWithoutSubmissions: 0,
        topAssessmentsBySubmissions: [],
        upcomingDeadlines: [],
      };
    } catch (error) {
      console.error('Error fetching assessment stats:', error);
      return this.getDefaultAssessmentStats();
    }
  }

  private async getSubmissionStats(): Promise<SubmissionStats> {
    try {
      const submissions = await getSubmissionList({});
      if (!submissions || !Array.isArray(submissions)) {
        return this.getDefaultSubmissionStats();
      }
      const assessments = await getClassAssessments({
        pageNumber: 1,
        pageSize: 1000,
      }).catch(() => ({ items: [], totalCount: 0 }));
      const templates = await assessmentTemplateService.getAssessmentTemplates({
        pageNumber: 1,
        pageSize: 1000,
      }).catch(() => ({ items: [], total: 0 }));

      const graded = submissions.filter((s) => s.lastGrade > 0).length;
      const pending = submissions.filter((s) => s.lastGrade === 0 && s.submittedAt).length;
      const notSubmitted = 0;

      const completionRate = submissions.length > 0 ? (graded / submissions.length) * 100 : 0;

      const submissionsByType = { assignment: 0, lab: 0, practicalExam: 0 };
      const templateMap = new Map<number, any>();
      templates.items.forEach((template) => {
        templateMap.set(template.id, template);
      });

      submissions.forEach((submission) => {
        const assessment = assessments.items.find((a) => a.id === submission.classAssessmentId);
        if (assessment && assessment.assessmentTemplateId) {
          const template = templateMap.get(assessment.assessmentTemplateId);
          if (template) {
            if (this.isPracticalExamTemplate(template)) {
              submissionsByType.practicalExam++;
            } else if (this.isLabTemplate(template)) {
              submissionsByType.lab++;
            } else {
              submissionsByType.assignment++;
            }
          } else {
            submissionsByType.assignment++;
          }
        } else {
          submissionsByType.assignment++;
        }
      });

      const gradedSubmissions = submissions.filter((s) => s.lastGrade > 0);
      const averageGrade =
        gradedSubmissions.length > 0
          ? gradedSubmissions.reduce((sum, s) => sum + s.lastGrade, 0) / gradedSubmissions.length
          : 0;

      const submissionsByGradeRange = {
        excellent: gradedSubmissions.filter((s) => s.lastGrade >= 8.5).length,
        good: gradedSubmissions.filter((s) => s.lastGrade >= 7.0 && s.lastGrade < 8.5).length,
        average: gradedSubmissions.filter((s) => s.lastGrade >= 5.5 && s.lastGrade < 7.0).length,
        belowAverage: gradedSubmissions.filter((s) => s.lastGrade < 5.5).length,
      };

      const lateSubmissions = 0;
      const onTimeSubmissions = submissions.length;

      const studentMap = new Map<
        number,
        {
          studentId: number;
          studentName: string;
          studentCode: string;
          submissionCount: number;
          totalGrade: number;
          gradedCount: number;
        }
      >();
      submissions.forEach((sub) => {
        if (!studentMap.has(sub.studentId)) {
          studentMap.set(sub.studentId, {
            studentId: sub.studentId,
            studentName: sub.studentName,
            studentCode: sub.studentCode,
            submissionCount: 0,
            totalGrade: 0,
            gradedCount: 0,
          });
        }
        const student = studentMap.get(sub.studentId)!;
        student.submissionCount++;
        if (sub.lastGrade > 0) {
          student.totalGrade += sub.lastGrade;
          student.gradedCount++;
        }
      });
      const topStudentsBySubmissions = Array.from(studentMap.values())
        .map((s) => ({
          studentId: s.studentId,
          studentName: s.studentName,
          studentCode: s.studentCode,
          submissionCount: s.submissionCount,
          averageGrade: s.gradedCount > 0 ? Math.round((s.totalGrade / s.gradedCount) * 100) / 100 : 0,
        }))
        .sort((a, b) => b.submissionCount - a.submissionCount)
        .slice(0, 10);

      const submissionsByDayMap = new Map<string, number>();
      submissions.forEach((sub) => {
        if (sub.submittedAt) {
          const date = new Date(sub.submittedAt).toISOString().split('T')[0];
          submissionsByDayMap.set(date, (submissionsByDayMap.get(date) || 0) + 1);
        }
      });
      const submissionsByDay = Array.from(submissionsByDayMap.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-30);

      return {
        total: submissions.length,
        graded,
        pending,
        notSubmitted,
        completionRate: Math.round(completionRate * 100) / 100,
        submissionsByType,
        averageGrade: Math.round(averageGrade * 100) / 100,
        submissionsByGradeRange,
        lateSubmissions,
        onTimeSubmissions,
        topStudentsBySubmissions,
        submissionsByDay,
      };
    } catch (error) {
      console.error('Error fetching submission stats:', error);
      return this.getDefaultSubmissionStats();
    }
  }

  private async getGradingGroupStats(): Promise<{ total: number }> {
    try {
      const groups = await getGradingGroups({});
      if (!groups || !Array.isArray(groups)) {
        return { total: 0 };
      }
      return { total: groups.length };
    } catch (error) {
      console.error('Error fetching grading group stats:', error);
      return { total: 0 };
    }
  }

  private async getGradingSessionStats(): Promise<{ total: number; completed: number }> {
    try {
      const sessions = await gradingService.getGradingSessions({
        pageNumber: 1,
        pageSize: 1000,
      });
      if (!sessions || !sessions.items || !Array.isArray(sessions.items)) {
        return { total: 0, completed: 0 };
      }

      const completed = sessions.items.filter((s) => s.status === 1).length;

      return {
        total: sessions.totalCount,
        completed,
      };
    } catch (error) {
      console.error('Error fetching grading session stats:', error);
      return { total: 0, completed: 0 };
    }
  }

  private async getAssignRequestStats(): Promise<{ pending: number }> {
    try {
      const requests = await fetchAssignRequestList(undefined, undefined, 1, 1000);
      if (!requests || !requests.items || !Array.isArray(requests.items)) {
        return { pending: 0 };
      }
      const pending = requests.items.filter((r) => r.status === 0).length;
      return { pending };
    } catch (error) {
      console.error('Error fetching assign request stats:', error);
      return { pending: 0 };
    }
  }

  private async getDetailedAcademicStats(): Promise<Partial<AcademicStats>> {
    try {
      const classes = await fetchClassList().catch(() => []);
      if (!Array.isArray(classes)) {
        return {
          totalCourseElements: 0,
          totalCourses: 0,
          totalStudents: 0,
          totalLecturers: 0,
          classesOverloaded: 0,
          averageStudentsPerClass: 0,
          classesWithoutStudents: 0,
          topClassesByStudents: [],
          classesBySemester: [],
          semesterCourses: 0,
          lecturerWorkload: [],
          studentToLecturerRatio: 0,
        };
      }
      const semesters = await adminService.getPaginatedSemesters(1, 100).catch(() => []);
      const courseElements = await fetchCourseElements().catch(() => []);
      
      // Validate courseElements is an array
      const validCourseElements = Array.isArray(courseElements) ? courseElements : [];

      const totalStudents = classes.reduce((sum, cls) => sum + (parseInt(cls.studentCount) || 0), 0);
      const averageStudentsPerClass = classes.length > 0 ? totalStudents / classes.length : 0;

      const classesWithoutStudents = classes.filter((cls) => !parseInt(cls.studentCount) || parseInt(cls.studentCount) === 0).length;
      const classesOverloaded = classes.filter((cls) => parseInt(cls.studentCount) > 50).length;

      const topClassesByStudents = classes
        .map((cls) => ({
          id: parseInt(cls.id),
          classCode: cls.classCode,
          courseName: cls.courseName,
          studentCount: parseInt(cls.studentCount) || 0,
          lecturerName: cls.lecturerName,
        }))
        .sort((a, b) => b.studentCount - a.studentCount)
        .slice(0, 10);

      const semesterMap = new Map<
        string,
        {
          semesterCode: string;
          semesterName: string;
          classCount: number;
          studentCount: number;
          lecturerSet: Set<string>;
        }
      >();

      const uniqueCourses = new Set<string>();
      classes.forEach((cls) => {
        if (cls.courseName) uniqueCourses.add(cls.courseName);
      });

      const uniqueLecturers = new Set<string>();
      classes.forEach((cls) => {
        if (cls.lecturerId) uniqueLecturers.add(cls.lecturerId);
      });

      classes.forEach((cls) => {
        const semesterKey = cls.semesterName || 'Unknown';
        if (!semesterMap.has(semesterKey)) {
          semesterMap.set(semesterKey, {
            semesterCode: semesterKey,
            semesterName: semesterKey,
            classCount: 0,
            studentCount: 0,
            lecturerSet: new Set(),
          });
        }
        const data = semesterMap.get(semesterKey)!;
        data.classCount++;
        data.studentCount += parseInt(cls.studentCount || '0', 10);
        if (cls.lecturerId) {
          data.lecturerSet.add(cls.lecturerId);
        }
      });

      const classesBySemester = Array.from(semesterMap.values())
        .filter((item) => item.classCount > 0)
        .sort((a, b) => a.semesterCode.localeCompare(b.semesterCode))
        .map((item) => ({
          semesterCode: item.semesterCode,
          semesterName: item.semesterName,
          classCount: item.classCount,
          studentCount: item.studentCount,
          lecturerCount: item.lecturerSet.size,
        }));

      const lecturerWorkloadMap = new Map<
        string,
        {
          lecturerId: string;
          lecturerName: string;
          classCount: number;
          studentCount: number;
        }
      >();

      classes.forEach((cls) => {
        if (cls.lecturerId && cls.lecturerName) {
          if (!lecturerWorkloadMap.has(cls.lecturerId)) {
            lecturerWorkloadMap.set(cls.lecturerId, {
              lecturerId: cls.lecturerId,
              lecturerName: cls.lecturerName,
              classCount: 0,
              studentCount: 0,
            });
          }
          const lecturer = lecturerWorkloadMap.get(cls.lecturerId)!;
          lecturer.classCount++;
          lecturer.studentCount += parseInt(cls.studentCount || '0', 10);
        }
      });

      const lecturerWorkload = Array.from(lecturerWorkloadMap.values())
        .sort((a, b) => b.classCount - a.classCount)
        .slice(0, 20);

      const studentToLecturerRatio = uniqueLecturers.size > 0 ? Math.round((totalStudents / uniqueLecturers.size) * 10) / 10 : 0;

      return {
        totalCourseElements: validCourseElements.length,
        totalCourses: uniqueCourses.size,
        totalStudents,
        totalLecturers: uniqueLecturers.size,
        classesOverloaded,
        averageStudentsPerClass: Math.round(averageStudentsPerClass * 10) / 10,
        classesWithoutStudents,
        topClassesByStudents,
        classesBySemester,
        semesterCourses: uniqueCourses.size,
        lecturerWorkload,
        studentToLecturerRatio,
      };
    } catch (error) {
      console.error('Error fetching detailed academic stats:', error);
      return {
        totalCourseElements: 0,
        totalCourses: 0,
        totalStudents: 0,
        totalLecturers: 0,
        classesOverloaded: 0,
        averageStudentsPerClass: 0,
        classesWithoutStudents: 0,
        topClassesByStudents: [],
        classesBySemester: [],
        semesterCourses: 0,
        lecturerWorkload: [],
        studentToLecturerRatio: 0,
      };
    }
  }

  private async getDetailedAssessmentStats(): Promise<Partial<AssessmentStats>> {
    try {
      const assessments = await getClassAssessments({
        pageNumber: 1,
        pageSize: 1000,
      }).catch(() => ({ items: [], totalCount: 0 }));
      if (!assessments || !assessments.items || !Array.isArray(assessments.items)) {
        return {
          assessmentsByStatus: { active: 0, completed: 0, pending: 0 },
          assessmentsByLecturer: [],
          averageSubmissionsPerAssessment: 0,
          assessmentsWithoutSubmissions: 0,
          topAssessmentsBySubmissions: [],
          upcomingDeadlines: [],
        };
      }
      const submissions = await getSubmissionList({}).catch(() => []);

      const assessmentsByStatus = {
        active: 0,
        completed: 0,
        pending: 0,
      };

      assessments.items.forEach((assessment) => {
        if (assessment.status === 1) assessmentsByStatus.active++;
        else if (assessment.status === 2) assessmentsByStatus.completed++;
        else assessmentsByStatus.pending++;
      });

      const lecturerMap = new Map<number, { lecturerId: number; lecturerName: string; count: number }>();

      // Validate submissions is an array
      const validSubmissions = Array.isArray(submissions) ? submissions : [];
      
      const totalSubmissions = validSubmissions.length;
      const averageSubmissionsPerAssessment = assessments.items.length > 0 ? totalSubmissions / assessments.items.length : 0;

      const assessmentsWithoutSubmissions = assessments.items.filter((assessment) => parseInt(assessment.submissionCount || '0') === 0).length;

      const topAssessmentsBySubmissions = assessments.items
        .map((assessment) => ({
          id: assessment.id,
          name: assessment.assessmentTemplateName,
          courseName: assessment.courseName,
          submissionCount: parseInt(assessment.submissionCount) || 0,
          lecturerName: assessment.lecturerName,
        }))
        .sort((a, b) => b.submissionCount - a.submissionCount)
        .slice(0, 10);

      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const upcomingDeadlines = assessments.items
        .filter((assessment) => {
          const endDate = new Date(assessment.endAt);
          return endDate >= now && endDate <= nextWeek;
        })
        .map((assessment) => ({
          id: assessment.id,
          name: assessment.assessmentTemplateName,
          endAt: assessment.endAt,
          daysRemaining: Math.ceil((new Date(assessment.endAt).getTime() - now.getTime()) / (24 * 60 * 60 * 1000)),
        }))
        .sort((a, b) => new Date(a.endAt).getTime() - new Date(b.endAt).getTime())
        .slice(0, 10);

      return {
        assessmentsByStatus,
        assessmentsByLecturer: Array.from(lecturerMap.values()),
        averageSubmissionsPerAssessment: Math.round(averageSubmissionsPerAssessment * 10) / 10,
        assessmentsWithoutSubmissions,
        topAssessmentsBySubmissions,
        upcomingDeadlines,
      };
    } catch (error) {
      console.error('Error fetching detailed assessment stats:', error);
      return {
        assessmentsByStatus: { active: 0, completed: 0, pending: 0 },
        assessmentsByLecturer: [],
        averageSubmissionsPerAssessment: 0,
        assessmentsWithoutSubmissions: 0,
        topAssessmentsBySubmissions: [],
        upcomingDeadlines: [],
      };
    }
  }

  private async getDetailedGradingStats(): Promise<Partial<GradingStats>> {
    try {
      const [groups, sessions, requests] = await Promise.all([
        getGradingGroups({}),
        gradingService.getGradingSessions({
          pageNumber: 1,
          pageSize: 1000,
        }),
        fetchAssignRequestList(undefined, undefined, 1, 1000),
      ]);

      const completedSessions = sessions.items.filter((s) => s.status === 1).length;
      const pendingRequests = requests.items.filter((r) => r.status === 0).length;

      const gradingSessionsByStatus = {
        processing: sessions.items.filter((s) => s.status === 0).length,
        completed: completedSessions,
        failed: sessions.items.filter((s) => s.status === 2).length,
      };

      const gradingSessionsByType = {
        ai: sessions.items.filter((s) => s.gradingType === 0).length,
        lecturer: sessions.items.filter((s) => s.gradingType === 1).length,
        both: sessions.items.filter((s) => s.gradingType === 2).length,
      };

      const lecturerMap = new Map<
        number,
        {
          lecturerId: number;
          lecturerName: string;
          sessionCount: number;
          completedCount: number;
        }
      >();

      const gradingByLecturer = Array.from(lecturerMap.values());

      const requestLecturerMap = new Map<
        number,
        {
          lecturerId: number;
          lecturerName: string;
          requestCount: number;
        }
      >();

      requests.items
        .filter((r) => r.status === 0)
        .forEach((request) => {
          const lecturerId = request.assignedLecturerId;
          if (!requestLecturerMap.has(lecturerId)) {
            requestLecturerMap.set(lecturerId, {
              lecturerId,
              lecturerName: request.assignedLecturerName,
              requestCount: 0,
            });
          }
          requestLecturerMap.get(lecturerId)!.requestCount++;
        });

      const pendingAssignRequestsByLecturer = Array.from(requestLecturerMap.values());

      const gradingGroupsByStatus = {
        active: groups.filter((g) => g.submissionCount > 0).length,
        completed: 0,
      };

      return {
        gradingSessionsByStatus,
        gradingSessionsByType,
        gradingByLecturer,
        pendingAssignRequestsByLecturer,
        gradingGroupsByStatus,
      };
    } catch (error) {
      console.error('Error fetching detailed grading stats:', error);
      return {
        gradingSessionsByStatus: { processing: 0, completed: 0, failed: 0 },
        gradingSessionsByType: { ai: 0, lecturer: 0, both: 0 },
        gradingByLecturer: [],
        pendingAssignRequestsByLecturer: [],
        gradingGroupsByStatus: { active: 0, completed: 0 },
      };
    }
  }

  private async getUserGrowthData(): Promise<UserGrowthData[]> {
    try {
      const { users } = await accountService.getAccountList(1, 1000);
      if (!users || !Array.isArray(users)) {
        return [];
      }
      const monthlyData: Record<string, { total: number; students: number; lecturers: number }> = {};
      const now = new Date();
      const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      monthlyData[currentMonthKey] = { total: 0, students: 0, lecturers: 0 };

      users.forEach((user) => {
        monthlyData[currentMonthKey].total++;
        if (user.role === ROLES.STUDENT) monthlyData[currentMonthKey].students++;
        if (user.role === ROLES.LECTURER) monthlyData[currentMonthKey].lecturers++;
      });

      return Object.entries(monthlyData)
        .map(([month, data]) => ({
          month,
          ...data,
        }))
        .sort((a, b) => a.month.localeCompare(b.month))
        .slice(-12);
    } catch (error) {
      console.error('Error fetching user growth data:', error);
      return [];
    }
  }

  private async getSemesterActivityData(): Promise<SemesterActivityData[]> {
    try {
      const assessments = await getClassAssessments({
        pageNumber: 1,
        pageSize: 1000,
      }).catch(() => ({ items: [], totalCount: 0 }));
      const classes = await fetchClassList().catch(() => []);
      const submissions = await getSubmissionList({}).catch(() => []);

      // Validate data types
      if (!Array.isArray(classes)) {
        console.warn('Classes is not an array:', classes);
        return [];
      }
      if (!assessments || !Array.isArray(assessments.items)) {
        console.warn('Assessments items is not an array:', assessments);
        return [];
      }
      if (!Array.isArray(submissions)) {
        console.warn('Submissions is not an array:', submissions);
        return [];
      }

      const semesterMap = new Map<string, SemesterActivityData>();

      classes.forEach((cls) => {
        const semesterKey = cls.semesterName || 'Unknown';
        if (!semesterMap.has(semesterKey)) {
          semesterMap.set(semesterKey, {
            semester: semesterKey,
            courses: 0,
            classes: 0,
            assessments: 0,
            submissions: 0,
          });
        }
        const data = semesterMap.get(semesterKey)!;
        data.classes++;
      });

      const courseToSemesterMap = new Map<string, string>();
      classes.forEach((cls) => {
        if (cls.courseName && cls.semesterName) {
          courseToSemesterMap.set(cls.courseName, cls.semesterName);
        }
      });

      assessments.items.forEach((assessment) => {
        const semesterKey = courseToSemesterMap.get(assessment.courseName || '') || 'Unknown';
        if (!semesterMap.has(semesterKey)) {
          semesterMap.set(semesterKey, {
            semester: semesterKey,
            courses: 0,
            classes: 0,
            assessments: 0,
            submissions: 0,
          });
        }
        const data = semesterMap.get(semesterKey)!;
        data.assessments++;
      });

      submissions.forEach((submission) => {
        if (!submission.classAssessmentId) return;
        const assessment = assessments.items.find((a) => a.id === submission.classAssessmentId);
        if (assessment) {
          const semesterKey = courseToSemesterMap.get(assessment.courseName || '') || 'Unknown';
          if (!semesterMap.has(semesterKey)) {
            semesterMap.set(semesterKey, {
              semester: semesterKey,
              courses: 0,
              classes: 0,
              assessments: 0,
              submissions: 0,
            });
          }
          const data = semesterMap.get(semesterKey)!;
          data.submissions++;
        }
      });

      const courseCountMap = new Map<string, Set<string>>();
      classes.forEach((cls) => {
        const semesterKey = cls.semesterName || 'Unknown';
        if (!courseCountMap.has(semesterKey)) {
          courseCountMap.set(semesterKey, new Set());
        }
        if (cls.courseName) {
          courseCountMap.get(semesterKey)!.add(cls.courseName);
        }
      });

      semesterMap.forEach((data, semesterKey) => {
        const courses = courseCountMap.get(semesterKey);
        data.courses = courses ? courses.size : 0;
      });

      const result = Array.from(semesterMap.values())
        .filter((data) => data.classes > 0 || data.assessments > 0 || data.submissions > 0)
        .sort((a, b) => a.semester.localeCompare(b.semester))
        .slice(-12);

      return result.length > 0 ? result : [];
    } catch (error) {
      console.error('Error fetching semester activity data:', error);
      return [];
    }
  }

  private async getAssessmentDistributionData(): Promise<AssessmentDistributionData[]> {
    try {
      const templates = await assessmentTemplateService.getAssessmentTemplates({
        pageNumber: 1,
        pageSize: 1000,
      });

      if (!templates || !templates.items || !Array.isArray(templates.items)) {
        return [];
      }

      const distribution = {
        assignment: 0,
        lab: 0,
        practicalExam: 0,
      };

      templates.items.forEach((template) => {
        if (this.isPracticalExamTemplate(template)) {
          distribution.practicalExam++;
        } else if (this.isLabTemplate(template)) {
          distribution.lab++;
        } else {
          distribution.assignment++;
        }
      });

      return [
        { type: 'Assignment', count: distribution.assignment },
        { type: 'Lab', count: distribution.lab },
        { type: 'Practical Exam', count: distribution.practicalExam },
      ];
    } catch (error) {
      console.error('Error fetching assessment distribution data:', error);
      return [];
    }
  }

  private async getSubmissionStatusData(): Promise<SubmissionStatusData[]> {
    try {
      const submissions = await getSubmissionList({});

      if (!submissions || !Array.isArray(submissions)) {
        return [];
      }

      const graded = submissions.filter((s) => s.lastGrade > 0).length;
      const pending = submissions.filter((s) => s.lastGrade === 0 && s.submittedAt).length;
      const notSubmitted = submissions.filter((s) => !s.submittedAt).length;

      return [
        { status: 'Graded', count: graded },
        { status: 'Pending', count: pending },
        { status: 'Not Submitted', count: notSubmitted },
      ];
    } catch (error) {
      console.error('Error fetching submission status data:', error);
      return [];
    }
  }

  private async getGradingPerformanceData(): Promise<GradingPerformanceData[]> {
    try {
      const sessions = await gradingService.getGradingSessions({
        pageNumber: 1,
        pageSize: 1000,
      });

      if (!sessions || !sessions.items || !Array.isArray(sessions.items)) {
        return [];
      }

      const dailyData: Record<string, { graded: number; pending: number }> = {};

      sessions.items.forEach((session) => {
        const date = new Date(session.createdAt).toISOString().split('T')[0];
        if (!dailyData[date]) {
          dailyData[date] = { graded: 0, pending: 0 };
        }

        if (session.status === 1) {
          dailyData[date].graded++;
        } else {
          dailyData[date].pending++;
        }
      });

      return Object.entries(dailyData)
        .map(([date, data]) => ({
          date,
          ...data,
        }))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-30);
    } catch (error) {
      console.error('Error fetching grading performance data:', error);
      return [];
    }
  }

  private isPracticalExamTemplate(template: any): boolean {
    const name = (template.name || '').toLowerCase();
    const keywords = ['exam', 'pe', 'practical exam', 'practical', 'test', 'kiểm tra thực hành', 'thi thực hành', 'bài thi', 'bài kiểm tra'];
    return keywords.some((keyword) => name.includes(keyword));
  }

  private isLabTemplate(template: any): boolean {
    const name = (template.name || '').toLowerCase();
    const keywords = ['lab', 'laboratory', 'thực hành', 'bài thực hành', 'lab session', 'lab work'];
    return keywords.some((keyword) => name.includes(keyword));
  }

  private getDefaultUserStats(): UserStats {
    return {
      total: 0,
      byRole: {
        admin: 0,
        lecturer: 0,
        student: 0,
        hod: 0,
      },
      newThisMonth: 0,
      active: 0,
      inactive: 0,
      neverLoggedIn: 0,
      byGender: { male: 0, female: 0, other: 0 },
      usersWithAvatar: 0,
      usersWithoutAvatar: 0,
      usersWithPhone: 0,
      usersWithoutPhone: 0,
    };
  }

  private getDefaultAssessmentStats(): AssessmentStats {
    return {
      totalTemplates: 0,
      totalClassAssessments: 0,
      byType: {
        assignment: 0,
        lab: 0,
        practicalExam: 0,
      },
      assessmentsByStatus: { active: 0, completed: 0, pending: 0 },
      assessmentsByLecturer: [],
      averageSubmissionsPerAssessment: 0,
      assessmentsWithoutSubmissions: 0,
      topAssessmentsBySubmissions: [],
      upcomingDeadlines: [],
    };
  }

  private getDefaultSubmissionStats(): SubmissionStats {
    return {
      total: 0,
      graded: 0,
      pending: 0,
      notSubmitted: 0,
      completionRate: 0,
      submissionsByType: { assignment: 0, lab: 0, practicalExam: 0 },
      averageGrade: 0,
      submissionsByGradeRange: { excellent: 0, good: 0, average: 0, belowAverage: 0 },
      lateSubmissions: 0,
      onTimeSubmissions: 0,
      topStudentsBySubmissions: [],
      submissionsByDay: [],
    };
  }
}

export const adminDashboardService = new AdminDashboardService();

