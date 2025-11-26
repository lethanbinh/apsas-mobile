import { exportGradeReportToExcel, GradeReportData } from './exportGradeReport';
import { getSubmissionList, Submission } from '../api/submissionService';
import { getClassAssessments } from '../api/classAssessmentService';
import { fetchCourseElements, CourseElementData } from '../api/courseElementService';
import { getAssessmentPapers } from '../api/assessmentPaperService';
import { getAssessmentQuestions } from '../api/assessmentQuestionService';
import { getRubricsForQuestion } from '../api/rubricItemService';
import { gradingService } from '../api/gradingService';
import { getGradeItems } from '../api/gradeItemService';
import { getStudentsInClass } from '../api/studentGroupService';
import { getGradingGroups, GradingGroup } from '../api/gradingGroupService';

export interface ExportTypes {
  assignment: boolean;
  lab: boolean;
  practicalExam: boolean;
}

// Helper to check if course element is assignment, lab, or PE
const isAssignment = (ce: CourseElementData) => {
  const name = (ce.name || '').toLowerCase();
  return (
    !name.includes('exam') &&
    !name.includes('pe') &&
    !name.includes('practical') &&
    !name.includes('lab') &&
    !name.includes('thực hành') &&
    !name.includes('thi')
  );
};

const isLab = (ce: CourseElementData) => {
  const name = (ce.name || '').toLowerCase();
  return name.includes('lab') || name.includes('thực hành');
};

const isPracticalExam = (ce: CourseElementData) => {
  const name = (ce.name || '').toLowerCase();
  return (
    name.includes('exam') ||
    name.includes('pe') ||
    name.includes('practical') ||
    name.includes('thi thực hành') ||
    name.includes('kiểm tra thực hành')
  );
};

// Lecturer export: all students in the class
export const exportLecturerReport = async (
  classId: string | number,
  exportTypes: ExportTypes,
  gradingGroups: GradingGroup[],
): Promise<void> => {
  // Fetch all course elements
  const courseElementsRes = await fetchCourseElements().catch(() => []);

  // Fetch all class assessments
  const classAssessmentRes = await getClassAssessments({
    classId: Number(classId),
    pageNumber: 1,
    pageSize: 1000,
  }).catch(() => ({ items: [] }));

  // Get all course elements for this class
  const allCourseElements = courseElementsRes.filter(ce => {
    const classAssessment = classAssessmentRes.items.find(ca => ca.courseElementId === ce.id);
    return classAssessment && classAssessment.classId === Number(classId);
  });

  const reportData: GradeReportData[] = [];

  // Process each course element
  for (const courseElement of allCourseElements) {
    const classAssessment = classAssessmentRes.items.find(ca => ca.courseElementId === courseElement.id);
    if (!classAssessment) continue;

    // Determine assignment type
    let assignmentType: 'Assignment' | 'Lab' | 'Practical Exam' = 'Assignment';
    if (isLab(courseElement)) {
      assignmentType = 'Lab';
    } else if (isPracticalExam(courseElement)) {
      assignmentType = 'Practical Exam';
    }

    // Filter by selected export types
    if (assignmentType === 'Assignment' && !exportTypes.assignment) continue;
    if (assignmentType === 'Lab' && !exportTypes.lab) continue;
    if (assignmentType === 'Practical Exam' && !exportTypes.practicalExam) continue;

    // Fetch all students in the class
    const allStudents = await getStudentsInClass(Number(classId)).catch(() => []);

    // Fetch submissions for this class assessment
    const submissions = await getSubmissionList({
      classAssessmentId: classAssessment.id,
    }).catch(() => []);

    // Create a map of studentId to submission for quick lookup
    const submissionMap = new Map<number, Submission>();
    for (const submission of submissions) {
      if (submission.studentId) {
        submissionMap.set(submission.studentId, submission);
      }
    }

    // Fetch questions and rubrics ONCE per course element (not per student)
    let questions: any[] = [];
    const rubrics: { [questionId: number]: any[] } = {};

    try {
      let assessmentTemplateId: number | null = classAssessment.assessmentTemplateId || null;

      // If no template from class assessment, try grading group (from any submission)
      if (!assessmentTemplateId && submissions.length > 0) {
        const firstSubmission = submissions[0];
        if (firstSubmission.gradingGroupId) {
          const gradingGroup = gradingGroups.find(g => g.id === firstSubmission.gradingGroupId);
          assessmentTemplateId = gradingGroup?.assessmentTemplateId || null;
        }
      }

      if (assessmentTemplateId !== null) {
        // Fetch papers
        const papersRes = await getAssessmentPapers({
          assessmentTemplateId: assessmentTemplateId,
          pageNumber: 1,
          pageSize: 100,
        }).catch(() => ({ items: [] }));

        // Fetch questions for each paper
        for (const paper of papersRes.items) {
          const questionsRes = await getAssessmentQuestions({
            assessmentPaperId: paper.id,
            pageNumber: 1,
            pageSize: 100,
          }).catch(() => ({ items: [] }));
          questions = [...questions, ...questionsRes.items];

          // Fetch rubrics for each question
          for (const question of questionsRes.items) {
            const rubricsRes = await getRubricsForQuestion({
              assessmentQuestionId: question.id,
              pageNumber: 1,
              pageSize: 100,
            }).catch(() => ({ items: [] }));
            rubrics[question.id] = rubricsRes.items;
          }
        }
      }
    } catch (err) {
      console.error(`Failed to fetch questions/rubrics for course element ${courseElement.id}:`, err);
    }

    // Process ALL students in the class (not just those with submissions)
    for (const student of allStudents) {
      const submission = submissionMap.get(student.studentId) || null;
      // Fetch latest grading session (only if submission exists)
      let gradingSession = null;
      let gradeItems: any[] = [];

      if (submission) {
        try {
          const gradingSessionsResult = await gradingService.getGradingSessions({
            submissionId: submission.id,
          }).catch(() => ({ items: [] }));
          if (gradingSessionsResult.items.length > 0) {
            gradingSession = gradingSessionsResult.items.sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
            )[0];

            // Fetch grade items
            const gradeItemsResult = await getGradeItems({
              gradingSessionId: gradingSession.id,
            }).catch(() => ({ items: [] }));
            gradeItems = gradeItemsResult.items;
          }
        } catch (err) {
          console.error(`Failed to fetch grading data for submission ${submission.id}:`, err);
        }
      }

      // Create a submission object if it doesn't exist (for students without submission)
      const submissionData: Submission = submission || {
        id: 0,
        studentId: student.studentId,
        studentCode: student.studentCode || '',
        studentName: student.studentName || '',
        classAssessmentId: classAssessment.id,
        submittedAt: '',
        lastGrade: 0,
        status: 0,
        createdAt: '',
        updatedAt: '',
        submissionFile: null,
        gradingGroupId: null,
      };

      reportData.push({
        submission: submissionData,
        gradingSession,
        gradeItems,
        questions,
        rubrics,
        feedback: {
          overallFeedback: '',
          strengths: '',
          weaknesses: '',
          codeQuality: '',
          algorithmEfficiency: '',
          suggestionsForImprovement: '',
          bestPractices: '',
          errorHandling: '',
        },
        courseElementName: courseElement.name,
        assignmentType,
      });
    }
  }

  if (reportData.length === 0) {
    throw new Error('No data available to export');
  }

  await exportGradeReportToExcel(reportData, 'Full_Grade_Report');
};

// Student export: only their own data
export const exportStudentReport = async (
  classId: string | number,
  studentId: string | number,
  exportTypes: ExportTypes,
): Promise<void> => {
  const reportData: GradeReportData[] = [];

  // Fetch all submissions for the student
  const allSubmissions = await getSubmissionList({
    studentId: Number(studentId),
  }).catch(() => []);

  // Group submissions by classAssessmentId to get course elements
  const classAssessmentIds = Array.from(
    new Set(allSubmissions.map(s => s.classAssessmentId).filter(id => id !== null && id !== undefined)),
  );

  // Fetch all class assessments to get course element info
  const classAssessmentsRes = await getClassAssessments({
    classId: Number(classId),
    pageNumber: 1,
    pageSize: 1000,
  }).catch(() => ({ items: [] }));

  // Fetch all course elements
  const courseElementsRes = await fetchCourseElements().catch(() => []);

  const courseElementMap = new Map(courseElementsRes.map(ce => [ce.id, ce]));

  // Group submissions by course element (classAssessmentId -> courseElementId)
  const courseElementSubmissionsMap = new Map<number, Submission[]>();
  for (const classAssessmentId of classAssessmentIds) {
    if (!classAssessmentId) continue;

    // Find class assessment
    const classAssessment = classAssessmentsRes.items.find(ca => ca.id === classAssessmentId);
    if (!classAssessment) continue;

    // Get course element from map
    const courseElement = courseElementMap.get(classAssessment.courseElementId || 0);
    if (!courseElement) continue;

    // Determine assignment type from course element name
    const assignmentType: 'Assignment' | 'Lab' | 'Practical Exam' = (() => {
      const nameLower = (courseElement.name || '').toLowerCase();
      if (nameLower.includes('lab') || nameLower.includes('thực hành')) {
        return 'Lab';
      } else if (
        nameLower.includes('exam') ||
        nameLower.includes('pe') ||
        nameLower.includes('practical') ||
        nameLower.includes('thi thực hành') ||
        nameLower.includes('kiểm tra thực hành')
      ) {
        return 'Practical Exam';
      }
      return 'Assignment';
    })();

    // Filter by selected export types
    if (assignmentType === 'Assignment' && !exportTypes.assignment) continue;
    if (assignmentType === 'Lab' && !exportTypes.lab) continue;
    if (assignmentType === 'Practical Exam' && !exportTypes.practicalExam) continue;

    // Get submissions for this class assessment
    const submissions = allSubmissions.filter(s => s.classAssessmentId === classAssessmentId);

    // Group by course element ID
    const courseElementId = courseElement.id;
    if (!courseElementSubmissionsMap.has(courseElementId)) {
      courseElementSubmissionsMap.set(courseElementId, []);
    }
    courseElementSubmissionsMap.get(courseElementId)!.push(...submissions);
  }

  // Process each course element (similar to lecturer export)
  for (const [courseElementId, submissions] of courseElementSubmissionsMap.entries()) {
    const courseElement = courseElementMap.get(courseElementId);
    if (!courseElement) continue;

    // Find class assessment for this course element
    const classAssessment = classAssessmentsRes.items.find(ca => ca.courseElementId === courseElementId);
    if (!classAssessment) continue;

    // Determine assignment type
    const assignmentType: 'Assignment' | 'Lab' | 'Practical Exam' = (() => {
      const nameLower = (courseElement.name || '').toLowerCase();
      if (nameLower.includes('lab') || nameLower.includes('thực hành')) {
        return 'Lab';
      } else if (
        nameLower.includes('exam') ||
        nameLower.includes('pe') ||
        nameLower.includes('practical') ||
        nameLower.includes('thi thực hành') ||
        nameLower.includes('kiểm tra thực hành')
      ) {
        return 'Practical Exam';
      }
      return 'Assignment';
    })();

    // Fetch questions and rubrics ONCE per course element (not per submission)
    let questions: any[] = [];
    const rubrics: { [questionId: number]: any[] } = {};

    try {
      let assessmentTemplateId: number | null = classAssessment.assessmentTemplateId || null;

      if (assessmentTemplateId !== null) {
        // Fetch papers
        const papersRes = await getAssessmentPapers({
          assessmentTemplateId: assessmentTemplateId,
          pageNumber: 1,
          pageSize: 100,
        }).catch(() => ({ items: [] }));

        // Fetch questions for each paper
        for (const paper of papersRes.items) {
          const questionsRes = await getAssessmentQuestions({
            assessmentPaperId: paper.id,
            pageNumber: 1,
            pageSize: 100,
          }).catch(() => ({ items: [] }));
          questions = [...questions, ...questionsRes.items];

          // Fetch rubrics for each question
          for (const question of questionsRes.items) {
            const rubricsRes = await getRubricsForQuestion({
              assessmentQuestionId: question.id,
              pageNumber: 1,
              pageSize: 100,
            }).catch(() => ({ items: [] }));
            rubrics[question.id] = rubricsRes.items;
          }
        }
      }
    } catch (err) {
      console.error(`Failed to fetch questions/rubrics for course element ${courseElementId}:`, err);
    }

    // Process all submissions for this course element - find latest grading session
    // Only use gradeItems from the latest grading session to avoid duplicates
    let latestSubmission: Submission | null = null;
    let allGradeItems: any[] = [];
    let latestGradingSession = null;
    let latestSubmissionWithGrading: Submission | null = null;

    // Find the submission with the latest grading session
    for (const submission of submissions) {
      // Keep track of latest submission
      if (submission.submittedAt && submission.submittedAt !== '') {
        if (
          !latestSubmission ||
          new Date(submission.submittedAt).getTime() > new Date(latestSubmission.submittedAt).getTime()
        ) {
          latestSubmission = submission;
        }
      } else if (!latestSubmission) {
        latestSubmission = submission;
      }

      // Fetch latest grading session for this submission
      try {
        const gradingSessionsResult = await gradingService.getGradingSessions({
          submissionId: submission.id,
        }).catch(() => ({ items: [] }));
        if (gradingSessionsResult.items.length > 0) {
          const gradingSession = gradingSessionsResult.items.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          )[0];

          // Keep latest grading session across all submissions
          if (
            !latestGradingSession ||
            new Date(gradingSession.createdAt).getTime() > new Date(latestGradingSession.createdAt).getTime()
          ) {
            latestGradingSession = gradingSession;
            latestSubmissionWithGrading = submission;
          }
        }
      } catch (err) {
        console.error(`Failed to fetch grading data for submission ${submission.id}:`, err);
      }
    }

    // Only fetch gradeItems from the latest grading session (not from all submissions)
    if (latestGradingSession && latestSubmissionWithGrading) {
      try {
        const gradeItemsResult = await getGradeItems({
          gradingSessionId: latestGradingSession.id,
        }).catch(() => ({ items: [] }));
        allGradeItems = gradeItemsResult.items;
      } catch (err) {
        console.error(`Failed to fetch grade items for grading session ${latestGradingSession.id}:`, err);
      }
    }

    // Use latest submission or first submission if no latest
    const submissionToUse = latestSubmission || submissions[0];
    if (!submissionToUse) continue;

    reportData.push({
      submission: submissionToUse,
      gradingSession: latestGradingSession,
      gradeItems: allGradeItems, // Grade items from latest grading session only (no duplicates)
      questions,
      rubrics,
      feedback: {
        overallFeedback: '',
        strengths: '',
        weaknesses: '',
        codeQuality: '',
        algorithmEfficiency: '',
        suggestionsForImprovement: '',
        bestPractices: '',
        errorHandling: '',
      },
      courseElementName: courseElement.name,
      assignmentType,
    });
  }

  if (reportData.length === 0) {
    throw new Error('No data available to export');
  }

  await exportGradeReportToExcel(reportData, `Grade_Report_${studentId}`);
};

