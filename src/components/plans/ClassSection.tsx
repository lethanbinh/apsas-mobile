import React, { useState } from 'react';
import { deleteClass } from '../../api/classService';
import {
  showErrorToast,
  showSuccessToast,
} from '../../components/toasts/AppToast';
import { PlanDetailClassWithSemesterCourseId } from '../../hooks/usePlanDetails';
import TableSection from '../common/TableSection';
import ClassCrudModal from '../modals/ClassCrudModal';
import DeleteConfirmModal from '../modals/DeleteConfirmModal';

interface ClassSectionProps {
  classes: PlanDetailClassWithSemesterCourseId[]; // <-- SỬA TYPE
  semesterCourses: { id: string; courseName: string; code: string }[];
  onRefresh: () => void;
}

const ClassSection = ({
  classes,
  semesterCourses,
  onRefresh,
}: ClassSectionProps) => {
  const [isClassModalVisible, setIsClassModalVisible] = useState(false);
  const [isDeleteClassModalVisible, setIsDeleteClassModalVisible] =
    useState(false);
  const [selectedClass, setSelectedClass] =
    useState<PlanDetailClassWithSemesterCourseId | null>(null);
  const [isDeletingClass, setIsDeletingClass] = useState(false);
  const [currentSemesterCourseIdForModal, setCurrentSemesterCourseIdForModal] =
    useState<number | null>(null); // <-- THÊM STATE NÀY
  const handleCloseModals = () => {
    setIsClassModalVisible(false);
    setIsDeleteClassModalVisible(false);
    setSelectedClass(null);
    setIsDeletingClass(false);
    setCurrentSemesterCourseIdForModal(null);
  };

  const handleCrudSuccess = () => {
    handleCloseModals();
    onRefresh();
  };

  const handleOpenAddClass = () => {
    setSelectedClass(null);
    setIsClassModalVisible(true);
  };
  const handleOpenEditClass = (cls: PlanDetailClassWithSemesterCourseId) => {
    setSelectedClass(cls);
    setCurrentSemesterCourseIdForModal(cls.semesterCourseId); // <-- THÊM DÒNG NÀY
    setIsClassModalVisible(true);
  };
  const handleOpenDeleteClass = (cls: PlanDetailClassWithSemesterCourseId) => {
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

  return (
    <>
      <TableSection
        title="Classes"
        data={classes}
        columnConfig={[
          { key: 'classCode', label: 'Class Code' },
          { key: 'lecturer', label: 'Lecturer' }, // 'lecturer' key sẽ được xử lý bởi renderCell
          { key: 'totalStudent', label: 'Capacity' },
        ]}
        onAdd={handleOpenAddClass}
        onEdit={handleOpenEditClass}
        onDelete={handleOpenDeleteClass}
      />
      <ClassCrudModal
        visible={isClassModalVisible}
        onClose={handleCloseModals}
        onSuccess={handleCrudSuccess}
        initialData={selectedClass}
        semesterCourses={semesterCourses}
        currentSemesterCourseId={currentSemesterCourseIdForModal}
      />
      <DeleteConfirmModal
        visible={isDeleteClassModalVisible}
        onClose={handleCloseModals}
        onConfirm={handleConfirmDeleteClass}
        title={`Delete Class?`}
        description={`Are you sure you want to delete "${selectedClass?.classCode}"?`}
        isLoading={isDeletingClass}
      />
    </>
  );
};

export default React.memo(ClassSection);
