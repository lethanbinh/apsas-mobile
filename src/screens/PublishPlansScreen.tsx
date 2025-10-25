import { useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { s, vs } from 'react-native-size-matters';
import Ionicons from 'react-native-vector-icons/Ionicons'; // Import Ionicons
import {
  AssignRequestData,
  ClassData,
  CourseData,
  CourseElementData,
  deleteAssignRequest,
  deleteClass,
  deleteCourse,
  deleteCourseElement,
  deleteSemesterCourse,
  fetchAssignRequestList,
  fetchClassList,
  fetchCourseById,
  fetchCourseElements,
  fetchHoDList,
  fetchSemesterCourses,
  fetchSemesters,
  fetchStudentGroupList,
  StudentGroupData,
} from '../api/semester';
import ScreenHeader from '../components/common/ScreenHeader';
import SectionHeader from '../components/common/SectionHeader';
import CourseCrudModal from '../components/modals/CourseCrudModal';
import CourseElementCrudModal from '../components/modals/CourseElementCrudModal';
import DeleteConfirmModal from '../components/modals/DeleteConfirmModal';
import AppText from '../components/texts/AppText';
import {
  showErrorToast,
  showSuccessToast,
} from '../components/toasts/AppToast';
import AppSafeView from '../components/views/AppSafeView';
import { AppColors } from '../styles/color';
import { globalStyles } from '../styles/shareStyles';
import ClassCrudModal from '../components/modals/ClassCrudModal';
import AssignRequestCrudModal from '../components/modals/AssignRequestCrudModal';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

interface PlanCourse extends CourseData {
  semesterCourseId: string;
  elements: CourseElementData[];
}

const PublishPlansScreen = () => {
  const route = useRoute();
  const semesterId = (route.params as { semesterId?: string })?.semesterId;
  const userAccountId = useSelector(
    (state: RootState) => state.userSlice.profile?.id,
  );

  const [planElements, setPlanElements] = useState<CourseElementData[]>([]); // State cho elements
  const [currentHodId, setCurrentHodId] = useState<string | null>(null); // State cho HoD ID
  const [isLoading, setIsLoading] = useState(true);
  const [courses, setCourses] = useState<PlanCourse[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [studentGroups, setStudentGroups] = useState<StudentGroupData[]>([]);
  const [assignRequests, setAssignRequests] = useState<AssignRequestData[]>([]);

  // State for Modals
  const [isCourseModalVisible, setIsCourseModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<PlanCourse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeletingCourse, setIsDeletingCourse] = useState(false);
  const [isDeleteCourseModalVisible, setIsDeleteCourseModalVisible] =
    useState(false);
  const [isElementModalVisible, setIsElementModalVisible] = useState(false);
  const [isDeleteElementModalVisible, setIsDeleteElementModalVisible] =
    useState(false);
  const [selectedElement, setSelectedElement] =
    useState<CourseElementData | null>(null);
  const [currentSemesterCourseId, setCurrentSemesterCourseId] = useState<
    string | null
  >(null);

  const [isClassModalVisible, setIsClassModalVisible] = useState(false);
  const [isDeleteClassModalVisible, setIsDeleteClassModalVisible] =
    useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);
  const [isDeletingClass, setIsDeletingClass] = useState(false);
  const [isDeletingElement, setIsDeletingElement] = useState(false);

  const [isAssignRequestModalVisible, setIsAssignRequestModalVisible] =
    useState(false);
  const [
    isDeleteAssignRequestModalVisible,
    setIsDeleteAssignRequestModalVisible,
  ] = useState(false);
  const [selectedAssignRequest, setSelectedAssignRequest] =
    useState<AssignRequestData | null>(null);
  const [isDeletingAssignRequest, setIsDeletingAssignRequest] = useState(false);
  // Load data function
  const loadPlanDetails = async () => {
    if (!semesterId) {
      showErrorToast('Error', 'No Semester ID provided.');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const [
        allSemesters,
        allSemesterCourses,
        allElements,
        allClasses,
        allStudentGroups,
        allAssignRequests,
        allHoDs,
      ] = await Promise.all([
        fetchSemesters(),
        fetchSemesterCourses(),
        fetchCourseElements(),
        fetchClassList(),
        fetchStudentGroupList(),
        fetchAssignRequestList(),
        fetchHoDList(),
      ]);

      const currentSemester = allSemesters.find(sem => sem.id === semesterId);
      const currentSemesterName = currentSemester?.semesterCode;

      const planSemesterCourses = allSemesterCourses.filter(
        sc => sc.semesterId === semesterId,
      );
      const planSemesterCourseIds = planSemesterCourses.map(sc => sc.id);

      const uniqueCourseIds = [
        ...new Set(planSemesterCourses.map(sc => sc.courseId)),
      ];

      const currentUserHod = allHoDs.find(
        h => String(h.accountId) === String(userAccountId),
      );
      if (currentUserHod) {
        setCurrentHodId(currentUserHod.hoDId); // Lưu HOD ID (ví dụ: "1")
      } else {
        throw new Error('Current user is not a registered HOD.');
      }

      const courseDetailsPromises = uniqueCourseIds.map(id =>
        fetchCourseById(id).catch(e => null),
      );
      const courseDetailsResults = (
        await Promise.all(courseDetailsPromises)
      ).filter(c => c !== null) as CourseData[];

      const planCourseCodes = courseDetailsResults.map(c => c.code);
      const planElements = allElements.filter(el =>
        planSemesterCourseIds.includes(el.semesterCourseId),
      );
      setPlanElements(planElements);

      const combinedData: PlanCourse[] = courseDetailsResults.map(course => {
        const relevantSemesterCourse = planSemesterCourses.find(
          sc => sc.courseId === course.id,
        );
        const semesterCourseId = relevantSemesterCourse?.id;
        const elements = semesterCourseId
          ? planElements.filter(el => el.semesterCourseId === semesterCourseId)
          : [];
        return {
          ...course,
          semesterCourseId: semesterCourseId!,
          elements: elements,
        };
      });
      setCourses(combinedData);

      const planClasses = allClasses.filter(
        cls =>
          planCourseCodes.includes(cls.courseCode) &&
          currentSemesterName &&
          cls.semesterName.startsWith(currentSemesterName),
      );
      setClasses(planClasses);

      const planClassIds = planClasses.map(cls => cls.id);

      const planStudents = allStudentGroups.filter(sg =>
        planClassIds.includes(sg.classId),
      );
      setStudentGroups(planStudents);
      const planElementIds = planElements.map(el => el.id.toString());

      const planAssignRequests = allAssignRequests.filter(req =>
        planElementIds.includes(req.courseElementId),
      );
      setAssignRequests(planAssignRequests);
    } catch (error: any) {
      showErrorToast('Error', 'Failed to load plan details.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPlanDetails();
  }, [semesterId]);

  // --- CRUD Handlers ---
  const handleOpenAddCourse = () => {
    setSelectedCourse(null); // Clear selection
    setIsCourseModalVisible(true);
  };

  const handleOpenEditCourse = (course: PlanCourse) => {
    setSelectedCourse(course);
    setIsCourseModalVisible(true);
  };

  const handleOpenDeleteCourse = (course: PlanCourse) => {
    setSelectedCourse(course);
    setIsDeleteModalVisible(true);
  };

  const handleCloseModals = () => {
    setIsCourseModalVisible(false);
    setIsDeleteCourseModalVisible(false);
    setIsElementModalVisible(false);
    setIsDeleteElementModalVisible(false);
    setIsClassModalVisible(false);
    setIsDeleteClassModalVisible(false);
    setIsAssignRequestModalVisible(false); // Thêm
    setIsDeleteAssignRequestModalVisible(false); // Thêm
    setSelectedCourse(null);
    setSelectedElement(null);
    setSelectedClass(null);
    setSelectedAssignRequest(null); // Thêm
    setCurrentSemesterCourseId(null);
    setIsDeletingCourse(false);
    setIsDeletingElement(false);
    setIsDeletingClass(false);
    setIsDeletingAssignRequest(false); // Thêm
  };

  const handleOpenAddAssignRequest = () => {
    setSelectedAssignRequest(null);
    setIsAssignRequestModalVisible(true);
  };
  const handleOpenEditAssignRequest = (item: AssignRequestData) => {
    setSelectedAssignRequest(item);
    setIsAssignRequestModalVisible(true);
  };
  const handleOpenDeleteAssignRequest = (item: AssignRequestData) => {
    setSelectedAssignRequest(item);
    setIsDeleteAssignRequestModalVisible(true);
  };

  const handleConfirmDeleteAssignRequest = async () => {
    if (!selectedAssignRequest) return;
    setIsDeletingAssignRequest(true);
    try {
      await deleteAssignRequest(selectedAssignRequest.id);
      showSuccessToast('Success', `Assignment request deleted.`);
      handleCrudSuccess();
    } catch (error: any) {
      showErrorToast(
        'Error',
        error.message || 'Failed to delete assignment request.',
      );
      setIsDeletingAssignRequest(false);
    }
  };

  const handleOpenAddClass = () => {
    setSelectedClass(null);
    setIsClassModalVisible(true);
  };
  const handleOpenEditClass = (cls: ClassData) => {
    setSelectedClass(cls);
    setIsClassModalVisible(true);
  };
  const handleOpenDeleteClass = (cls: ClassData) => {
    setSelectedClass(cls);
    setIsDeleteClassModalVisible(true);
  };

  const handleConfirmDeleteClass = async () => {
    if (!selectedClass) return;
    setIsDeletingClass(true);
    try {
      await deleteClass(selectedClass.id);
      showSuccessToast(
        'Success',
        `Class "${selectedClass.classCode}" deleted.`,
      );
      handleCrudSuccess();
    } catch (error: any) {
      showErrorToast('Error', error.message || 'Failed to delete class.');
      setIsDeletingClass(false);
    }
  };

  const handleCrudSuccess = () => {
    handleCloseModals();
    loadPlanDetails(); // Gọi lại hàm fetch data chính
  };

  const handleCourseSaveSuccess = () => {
    handleCloseModals();
    loadPlanDetails(); // Refresh data
  };

  const handleOpenAddElement = (semesterCourseId: string) => {
    setSelectedElement(null);
    setCurrentSemesterCourseId(semesterCourseId);
    setIsElementModalVisible(true);
  };
  const handleOpenEditElement = (
    element: CourseElementData,
    semesterCourseId: string,
  ) => {
    setSelectedElement(element);
    setCurrentSemesterCourseId(semesterCourseId);
    setIsElementModalVisible(true);
  };
  const handleOpenDeleteElement = (element: CourseElementData) => {
    setSelectedElement(element);
    setIsDeleteElementModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedCourse) return;
    setIsDeleting(true);
    try {
      // BƯỚC 1: Xóa liên kết SemesterCourse trước
      if (selectedCourse.semesterCourseId) {
        await deleteSemesterCourse(selectedCourse.semesterCourseId);
      } else {
        throw new Error('SemesterCourse ID not found for this course.');
      }

      // BƯỚC 2: Xóa Course (chỉ khi bước 1 thành công)
      await deleteCourse(selectedCourse.id);

      showSuccessToast(
        'Success',
        `Course "${selectedCourse.name}" and its plan link deleted.`,
      );
      handleCourseSaveSuccess();
    } catch (error: any) {
      showErrorToast('Error', error.message || 'Failed to delete course.');
      setIsDeleting(false);
    }
  };

  const handleConfirmDeleteElement = async () => {
    if (!selectedElement) return;
    setIsDeletingElement(true);
    try {
      await deleteCourseElement(selectedElement.id);
      showSuccessToast(
        'Success',
        `Assignment "${selectedElement.name}" deleted.`,
      );
      handleCrudSuccess();
    } catch (error: any) {
      showErrorToast('Error', error.message || 'Failed to delete assignment.');
      setIsDeletingElement(false);
    }
  };

  return (
    <AppSafeView>
      <ScreenHeader title="Plan Detail" />
      {isLoading ? (
        <ActivityIndicator
          size="large"
          style={{ flex: 1, justifyContent: 'center' }}
        />
      ) : (
        <ScrollView style={globalStyles.containerStyle}>
          <TableSection
            title="Courses"
            data={courses}
            columnConfig={[
              { key: 'code', label: 'Course Code' },
              { key: 'name', label: 'Course Name' },
              { key: 'description', label: 'Description' },
            ]}
            onEdit={handleOpenEditCourse}
            onDelete={handleOpenDeleteCourse}
            onAdd={handleOpenAddCourse}
          />

          {courses.map(course => (
            <TableSection
              key={course.id}
              title={`${course.code} - Assignments`}
              data={course.elements}
              columnConfig={[
                { key: 'name', label: 'Name' },
                { key: 'description', label: 'Description' },
                { key: 'weight', label: 'Weight (%)' },
              ]}
              onAdd={() => handleOpenAddElement(course.semesterCourseId)}
              onEdit={element =>
                handleOpenEditElement(element, course.semesterCourseId)
              }
              onDelete={handleOpenDeleteElement}
            />
          ))}

          <TableSection
            title="Classes"
            data={classes}
            columnConfig={[
              { key: 'classCode', label: 'Class Code' },
              { key: 'courseName', label: 'Course' },
              { key: 'lecturerName', label: 'Lecturer' },
              { key: 'studentCount', label: 'Students' },
            ]}
            onAdd={handleOpenAddClass}
            onEdit={handleOpenEditClass}
            onDelete={handleOpenDeleteClass}
          />

          <TableSection
            title="Students"
            data={studentGroups}
            columnConfig={[
              { key: 'studentName', label: 'Student Name' },
              { key: 'studentCode', label: 'Student Code' },
              { key: 'classCode', label: 'Class Code' },
              { key: 'studentId', label: 'Student ID (API)' },
            ]}
          />

          <TableSection
            title="Teacher Assignments"
            data={assignRequests}
            columnConfig={[
              { key: 'courseName', label: 'Course' },
              { key: 'courseElementName', label: 'Course Element' },
              { key: 'assignedLecturerName', label: 'Teacher Name' },
              { key: 'assignedByHODName', label: 'Assigned By' },
            ]}
            onAdd={handleOpenAddAssignRequest}
            onEdit={handleOpenEditAssignRequest}
            onDelete={handleOpenDeleteAssignRequest}
          />
        </ScrollView>
      )}

      <CourseCrudModal
        visible={isCourseModalVisible}
        onClose={handleCloseModals}
        onSuccess={handleCourseSaveSuccess}
        initialData={selectedCourse}
        semesterId={semesterId || ''}
      />

      <DeleteConfirmModal
        visible={isDeleteModalVisible}
        onClose={handleCloseModals}
        onConfirm={handleConfirmDelete}
        title={`Delete Course?`}
        description={`Are you sure you want to delete "${selectedCourse?.name}"? This action cannot be undone.`}
        isLoading={isDeleting}
      />

      <CourseElementCrudModal
        visible={isElementModalVisible}
        onClose={handleCloseModals}
        onSuccess={handleCrudSuccess}
        initialData={selectedElement}
        semesterCourseId={currentSemesterCourseId || ''}
      />

      <DeleteConfirmModal
        visible={isDeleteElementModalVisible}
        onClose={handleCloseModals}
        onConfirm={handleConfirmDeleteElement}
        title={`Delete Assignment?`}
        description={`Are you sure you want to delete "${selectedElement?.name}"? This action cannot be undone.`}
        isLoading={isDeletingElement}
      />

      <ClassCrudModal
        visible={isClassModalVisible}
        onClose={handleCloseModals}
        onSuccess={handleCrudSuccess}
        initialData={selectedClass}
        semesterCourses={courses.map(c => ({
          id: c.semesterCourseId,
          courseName: c.name,
          code: c.code,
        }))}
      />

      <DeleteConfirmModal
        visible={isDeleteClassModalVisible}
        onClose={handleCloseModals}
        onConfirm={handleConfirmDeleteClass}
        title={`Delete Class?`}
        description={`Are you sure you want to delete "${selectedClass?.classCode}"? This action cannot be undone.`}
        isLoading={isDeletingClass}
      />

      <AssignRequestCrudModal
        visible={isAssignRequestModalVisible}
        onClose={handleCloseModals}
        onSuccess={handleCrudSuccess}
        initialData={selectedAssignRequest}
        courseElements={planElements} // Truyền tất cả elements của plan
        hodId={currentHodId || ''} // Truyền HOD ID đã lấy
      />

      <DeleteConfirmModal
        visible={isDeleteAssignRequestModalVisible}
        onClose={handleCloseModals}
        onConfirm={handleConfirmDeleteAssignRequest}
        title={`Delete Assignment?`}
        description={`Are you sure you want to delete this assignment for "${selectedAssignRequest?.assignedLecturerName}"?`}
        isLoading={isDeletingAssignRequest}
      />
    </AppSafeView>
  );
};

const columnWidths: { [key: string]: number } = {
  'Course Code': s(100),
  'Course Name': s(150),
  Description: s(200),
  Name: s(150),
  'Weight (%)': s(80),
  'Class Code': s(100),
  Course: s(150),
  Lecturer: s(150),
  Students: s(80),
  'Student Name': s(150),
  'Student Code': s(100),
  'Student ID (API)': s(100),
  'Course Element': s(150),
  'Teacher Name': s(150),
  'Assigned By': s(150),
  Actions: s(100), // Width for actions column
};
const DEFAULT_COL_WIDTH = s(120);

const TableSection = ({
  title,
  data,
  columnConfig,
  onAdd,
  onEdit,
  onDelete,
}: {
  title: string;
  data: any[];
  columnConfig?: { key: string; label: string }[];
  onAdd?: () => void;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
}) => {
  const [viewAll, setViewAll] = useState(false);

  if (!data || data.length === 0) {
    return (
      <View style={styles.section}>
        <SectionHeader
          style={{ marginBottom: vs(10) }}
          title={title}
          hasButton={false}
          onAdd={onAdd} // Show Add button even if empty
        />
        <AppText style={styles.emptyText}>
          No data available for this section.
        </AppText>
      </View>
    );
  }

  const columns = columnConfig
    ? columnConfig.map(c => c.label)
    : Object.keys(data[0]);
  const dataKeys = columnConfig
    ? columnConfig.map(c => c.key)
    : Object.keys(data[0]);
  const hasActions = !!(onEdit || onDelete);

  const visibleData = viewAll ? data : data.slice(0, 3);

  return (
    <View style={styles.section}>
      <SectionHeader
        style={{ marginBottom: vs(10) }}
        title={title}
        buttonText={viewAll ? 'Collapse' : 'View All'}
        onPress={() => setViewAll(!viewAll)}
        hasButton={data.length > 3}
        onAdd={onAdd} // Pass onAdd to SectionHeader
      />

      <ScrollView horizontal showsHorizontalScrollIndicator>
        <View>
          <View style={styles.rowHeader}>
            {columns.map((col, i) => (
              <Text
                key={i}
                style={[
                  styles.cell,
                  styles.headerText,
                  { width: columnWidths[col] || DEFAULT_COL_WIDTH },
                ]}
              >
                {col}
              </Text>
            ))}
            {hasActions && (
              <Text
                style={[
                  styles.cell,
                  styles.headerText,
                  { width: columnWidths['Actions'] || s(100) },
                ]}
              >
                Actions
              </Text>
            )}
          </View>

          {visibleData.map((rowItem, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {dataKeys.map((key, colIndex) => (
                <Text
                  key={colIndex}
                  style={[
                    styles.cell,
                    {
                      width:
                        columnWidths[columns[colIndex]] || DEFAULT_COL_WIDTH,
                    },
                  ]}
                >
                  {String(rowItem[key] ?? '')}
                </Text>
              ))}
              {hasActions && (
                <View
                  style={[
                    styles.cell,
                    styles.actionCell,
                    { width: columnWidths['Actions'] || s(100) },
                  ]}
                >
                  {onEdit && (
                    <TouchableOpacity
                      onPress={() => onEdit(rowItem)}
                      style={styles.actionButton}
                    >
                      <Ionicons
                        name="pencil"
                        size={s(16)}
                        color={AppColors.pr500}
                      />
                    </TouchableOpacity>
                  )}
                  {onDelete && (
                    <TouchableOpacity
                      onPress={() => onDelete(rowItem)}
                      style={styles.actionButton}
                    >
                      <Ionicons
                        name="trash"
                        size={s(16)}
                        color={AppColors.r500}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default PublishPlansScreen;

const styles = StyleSheet.create({
  section: {
    marginBottom: vs(20),
    borderRadius: 6,
    paddingVertical: vs(10),
  },
  rowHeader: {
    flexDirection: 'row',
    backgroundColor: '#f4f4f4',
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  cell: {
    padding: s(10),
    borderRightWidth: 1,
    borderColor: '#ddd',
    fontSize: 13,
    textAlignVertical: 'center',
    color: AppColors.n800,
    alignItems: 'center',
  },
  headerText: {
    fontWeight: 'bold',
    backgroundColor: '#e0e0e0',
  },
  emptyText: {
    paddingHorizontal: s(10),
    color: AppColors.n500,
    fontStyle: 'italic',
  },
  actionCell: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  actionButton: {
    padding: s(5),
  },
});
