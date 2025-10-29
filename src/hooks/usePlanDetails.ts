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
    if (!semesterId || !userAccountId) {
      showErrorToast('Error', 'Missing Semester ID or User ID.');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const [data, hodProfile, allStudentGroups] = await Promise.all([
        fetchSemesterPlanDetail(semesterCode),
        findHoDByAccountId(userAccountId),
        fetchStudentGroupList(),
      ]);

      if (hodProfile) {
        setCurrentHodId(hodProfile.hoDId);
      } else {
        throw new Error('Current user is not a registered HOD.');
      }

      setPlanData(data);

      const planSemesterCourses = data.semesterCourses || []; // Biến đổi dữ liệu

      const combinedCourses: PlanCourse[] = planSemesterCourses.map(sc => ({
        ...sc.course,
        semesterCourseId: sc.id,
        elements: sc.courseElements || [],
      }));
      setCourses(combinedCourses);

      const allPlanElements = planSemesterCourses.flatMap(
        sc => sc.courseElements || [],
      );
      setPlanElements(allPlanElements);

      const allPlanClasses: PlanDetailClassWithSemesterCourseId[] =
        planSemesterCourses.flatMap(sc =>
          (sc.classes || []).map(cls => ({
            ...cls, // Giữ lại tất cả thuộc tính cũ của class
            semesterCourseId: sc.id, // <-- THÊM trường này
          })),
        );
      setClasses(allPlanClasses);

      const allPlanAssignRequests = planSemesterCourses.flatMap(
        sc => sc.assignRequests || [],
      );
      setAssignRequests(allPlanAssignRequests); // Tối ưu: Lọc StudentGroups

      const planClassIds = new Set(allPlanClasses.map(cls => Number(cls.id)));
      const planStudents = allStudentGroups.filter(sg =>
        planClassIds.has(Number(sg.classId)),
      );
      setStudentGroups(planStudents);
    } catch (error: any) {
      showErrorToast('Error', 'Failed to load plan details.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [semesterId, userAccountId]); // Chỉ phụ thuộc vào ID

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
