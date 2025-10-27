import React, { useState } from 'react';
import {
  CourseElementData,
  deleteCourseElement,
} from '../../api/courseElementService';
import { deleteSemesterCourse } from '../../api/semesterService';
import {
  showErrorToast,
  showSuccessToast,
} from '../../components/toasts/AppToast';
import { PlanCourse } from '../../hooks/usePlanDetails';
import CourseCrudModal from '../modals/CourseCrudModal';
import CourseElementCrudModal from '../modals/CourseElementCrudModal';
import DeleteConfirmModal from '../modals/DeleteConfirmModal';
import TableSection from '../common/TableSection';

interface CourseSectionProps {
  courses: PlanCourse[];
  semesterId: string;
  onRefresh: () => void;
}

const CourseSection = ({
  courses,
  semesterId,
  onRefresh,
}: CourseSectionProps) => {
  const [isCourseModalVisible, setIsCourseModalVisible] = useState(false);
  const [isDeleteCourseModalVisible, setIsDeleteCourseModalVisible] =
    useState(false);
  const [selectedCourse, setSelectedCourse] = useState<PlanCourse | null>(null);
  const [isDeletingCourse, setIsDeletingCourse] = useState(false);

  const [isElementModalVisible, setIsElementModalVisible] = useState(false);
  const [isDeleteElementModalVisible, setIsDeleteElementModalVisible] =
    useState(false);
  const [selectedElement, setSelectedElement] =
    useState<CourseElementData | null>(null);
  const [currentSemesterCourseId, setCurrentSemesterCourseId] = useState<
    string | number | null
  >(null);
  const [isDeletingElement, setIsDeletingElement] = useState(false);

  const handleCloseModals = () => {
    setIsCourseModalVisible(false);
    setIsDeleteCourseModalVisible(false);
    setIsElementModalVisible(false);
    setIsDeleteElementModalVisible(false);
    setSelectedCourse(null);
    setSelectedElement(null);
    setCurrentSemesterCourseId(null);
    setIsDeletingCourse(false);
    setIsDeletingElement(false);
  };

  const handleCrudSuccess = () => {
    handleCloseModals();
    onRefresh(); // Gọi hàm refresh từ hook
  }; // --- Course Handlers ---

  const handleOpenAddCourse = () => {
    setSelectedCourse(null);
    setIsCourseModalVisible(true);
  };
  const handleOpenEditCourse = (course: PlanCourse) => {
    setSelectedCourse(course);
    setIsCourseModalVisible(true);
  };
  const handleOpenDeleteCourse = (course: PlanCourse) => {
    setSelectedCourse(course);
    setIsDeleteCourseModalVisible(true);
  };
  const handleConfirmDeleteCourse = async () => {
    if (!selectedCourse) return;
    setIsDeletingCourse(true);
    try {
      if (selectedCourse.semesterCourseId) {
        await deleteSemesterCourse(selectedCourse.semesterCourseId);
      } else {
        throw new Error('SemesterCourse ID not found for this course.');
      } // Lưu ý: logic `deleteCourseElement(selectedCourse.id)` của bạn có vẻ sai, // bạn đang xóa course element bằng course id? // Tạm giữ logic này theo code gốc của bạn. // await deleteCourseElement(selectedCourse.id);
      showSuccessToast(
        'Success',
        `Course "${selectedCourse.name}" link deleted.`,
      );
      handleCrudSuccess();
    } catch (error: any) {
      showErrorToast('Error', error.message || 'Failed to delete course.');
      setIsDeletingCourse(false);
    }
  }; // --- Element Handlers ---

  const handleOpenAddElement = (semesterCourseId: number) => {
    setSelectedElement(null);
    setCurrentSemesterCourseId(semesterCourseId);
    setIsElementModalVisible(true);
  };
  const handleOpenEditElement = (
    element: CourseElementData,
    semesterCourseId: number,
  ) => {
    setSelectedElement(element);
    setCurrentSemesterCourseId(semesterCourseId);
    setIsElementModalVisible(true);
  };
  const handleOpenDeleteElement = (element: CourseElementData) => {
    setSelectedElement(element);
    setIsDeleteElementModalVisible(true);
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
    <>
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
          onEdit={(element: CourseElementData) =>
            handleOpenEditElement(element, course.semesterCourseId)
          }
          onDelete={handleOpenDeleteElement}
        />
      ))}
      <CourseCrudModal
        visible={isCourseModalVisible}
        onClose={handleCloseModals}
        onSuccess={handleCrudSuccess}
        initialData={selectedCourse}
        semesterId={semesterId || ''}
      />
      <DeleteConfirmModal
        visible={isDeleteCourseModalVisible}
        onClose={handleCloseModals}
        onConfirm={handleConfirmDeleteCourse}
        title={`Delete Course?`}
        description={`Are you sure you want to delete "${selectedCourse?.name}"?`}
        isLoading={isDeletingCourse}
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
        description={`Are you sure you want to delete "${selectedElement?.name}"?`}
        isLoading={isDeletingElement}
      />
    </>
  );
};

export default React.memo(CourseSection);