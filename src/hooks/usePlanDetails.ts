import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { CourseElementData } from '../api/courseElementService';
import { findHoDByAccountId } from '../api/hodService';
import { PlanDetailClass } from '../api/semester';
import {
  fetchSemesterPlanDetail,
  PlanDetailAssignRequest,
  PlanDetailCourse,
  PlanDetailResult,
} from '../api/semesterService';
import {
  fetchStudentGroupList,
  getStudentsInClass,
  StudentGroupData,
} from '../api/studentGroupService';
import { showErrorToast } from '../components/toasts/AppToast';
import { RootState } from '../store/store';

export interface PlanCourse extends PlanDetailCourse {
  semesterCourseId: number;
  elements: CourseElementData[];
}

export interface PlanDetailClassWithSemesterCourseId extends PlanDetailClass {
  semesterCourseId: number;
}

export const usePlanDetails = (
  semesterId: string | undefined,
  semesterCode: string,
) => {
  const userAccountId = useSelector(
    (state: RootState) => state.userSlice.profile?.id,
  );

  const [isLoading, setIsLoading] = useState(true);
  const [planData, setPlanData] = useState<PlanDetailResult | null>(null);
  const [courses, setCourses] = useState<PlanCourse[]>([]);
  const [classes, setClasses] = useState<PlanDetailClassWithSemesterCourseId[]>(
    [],
  );
  const [studentGroups, setStudentGroups] = useState<StudentGroupData[]>([]);
  const [assignRequests, setAssignRequests] = useState<
    PlanDetailAssignRequest[]
  >([]);
  const [planElements, setPlanElements] = useState<CourseElementData[]>([]);
  const [currentHodId, setCurrentHodId] = useState<string | null>(null);

  const loadPlanDetails = useCallback(async () => {
    if (!semesterCode || !userAccountId) {
      showErrorToast('Error', 'Missing Semester Code or User ID.');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const [data, hodProfile] = await Promise.all([
        fetchSemesterPlanDetail(semesterCode),
        findHoDByAccountId(userAccountId),
      ]);

      if (hodProfile) {
        setCurrentHodId(hodProfile.hoDId);
      } else {
        throw new Error('Current user is not a registered HOD.');
      }

      setPlanData(data);

      // Filter semesterCourses by current HOD's accountCode (same as web)
      const planSemesterCourses = (data.semesterCourses || []).filter(
        sc => sc.createdByHODAccountCode === hodProfile.accountCode,
      );

      // Transform courses
      const combinedCourses: PlanCourse[] = planSemesterCourses.map(sc => ({
        ...sc.course,
        semesterCourseId: sc.id,
        elements: sc.courseElements || [],
      }));
      setCourses(combinedCourses);

      // Transform elements
      const allPlanElements = planSemesterCourses.flatMap(
        sc => sc.courseElements || [],
      );
      setPlanElements(allPlanElements);

      // Transform classes with semesterCourseId
      const allPlanClasses: PlanDetailClassWithSemesterCourseId[] =
        planSemesterCourses.flatMap(sc =>
          (sc.classes || []).map(cls => ({
            ...cls,
            semesterCourseId: sc.id,
          })),
        );
      setClasses(allPlanClasses);

      // Transform assign requests
      const allPlanAssignRequests = planSemesterCourses.flatMap(
        sc => sc.assignRequests || [],
      );
      setAssignRequests(allPlanAssignRequests);

      // Fetch students from API for each class (same as web)
      const planClassIds = allPlanClasses.map(cls => Number(cls.id));
      
      // Fetch students for all classes in parallel
      const studentGroupPromises = planClassIds.map(async classId => {
        try {
          return await getStudentsInClass(classId);
        } catch (err) {
          console.warn(`Failed to fetch students for class ${classId}:`, err);
          return [];
        }
      });

      const studentGroupArrays = await Promise.all(studentGroupPromises);
      const allStudentGroups = studentGroupArrays.flat();
      setStudentGroups(allStudentGroups);
    } catch (error: any) {
      showErrorToast('Error', 'Failed to load plan details.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [semesterCode, userAccountId]);

  useEffect(() => {
    loadPlanDetails();
  }, [loadPlanDetails]);

  const semesterCoursesForDropdown = useMemo(() => {
    return (planData?.semesterCourses || []).map(sc => ({
      id: String(sc.id),
      courseName: sc.course.name,
      code: sc.course.code,
    }));
  }, [planData]);

  return {
    isLoading,
    planData,
    courses,
    classes,
    studentGroups,
    assignRequests,
    planElements,
    currentHodId,
    semesterCoursesForDropdown,
    refreshPlan: loadPlanDetails, // Cung cấp hàm refresh
  };
};
