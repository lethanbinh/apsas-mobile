import React, { useState } from 'react';
import {
  deleteStudentEnrollment,
  StudentGroupData,
} from '../../api/studentGroupService';
import {
  showErrorToast,
  showSuccessToast,
} from '../../components/toasts/AppToast';
import DeleteConfirmModal from '../modals/DeleteConfirmModal';
import StudentEnrollmentModal from '../modals/StudentEnrollmentModal';
import TableSection from '../common/TableSection';
import { PlanDetailClassWithSemesterCourseId } from '../../hooks/usePlanDetails';

interface StudentSectionProps {
  studentGroups: StudentGroupData[];
  planClasses: PlanDetailClassWithSemesterCourseId[];
  onRefresh: () => void;
}

const StudentSection = ({
  studentGroups,
  planClasses,
  onRefresh,
}: StudentSectionProps) => {
  const [isStudentModalVisible, setIsStudentModalVisible] = useState(false);
  const [isDeleteStudentModalVisible, setIsDeleteStudentModalVisible] =
    useState(false);
  const [selectedStudentGroup, setSelectedStudentGroup] =
    useState<StudentGroupData | null>(null);
  const [isDeletingStudent, setIsDeletingStudent] = useState(false);

  const handleCloseModals = () => {
    setIsStudentModalVisible(false);
    setIsDeleteStudentModalVisible(false);
    setSelectedStudentGroup(null);
    setIsDeletingStudent(false);
  };

  const handleCrudSuccess = () => {
    handleCloseModals();
    onRefresh();
  };

  const handleOpenAddStudent = () => {
    setSelectedStudentGroup(null);
    setIsStudentModalVisible(true);
  };
  const handleOpenEditStudent = (item: StudentGroupData) => {
    setSelectedStudentGroup(item);
    setIsStudentModalVisible(true);
  };
  const handleOpenDeleteStudent = (item: StudentGroupData) => {
    setSelectedStudentGroup(item);
    setIsDeleteStudentModalVisible(true);
  };

  const handleConfirmDeleteStudent = async () => {
    if (!selectedStudentGroup) return;
    setIsDeletingStudent(true);
    try {
      // Convert ID to number if it's a string, as API expects number
      const studentGroupId = typeof selectedStudentGroup.id === 'string' 
        ? Number(selectedStudentGroup.id) 
        : selectedStudentGroup.id;
      
      if (isNaN(studentGroupId)) {
        throw new Error('Invalid student group ID.');
      }
      
      await deleteStudentEnrollment(studentGroupId);
      showSuccessToast(
        'Success',
        `Student "${selectedStudentGroup.studentName}" enrollment deleted.`,
      );
      handleCrudSuccess();
    } catch (error: any) {
      showErrorToast('Error', error.message || 'Failed to delete enrollment.');
      setIsDeletingStudent(false);
    }
  };
  return (
    <>
      <TableSection
        title="Students"
        data={studentGroups}
        columnConfig={[
          { key: 'studentName', label: 'Student Name' },
          { key: 'studentCode', label: 'Student Code' },
          { key: 'classCode', label: 'Class Code' },
          { key: 'description', label: 'Description' },
        ]}
        onAdd={handleOpenAddStudent}
        onEdit={handleOpenEditStudent}
        onDelete={handleOpenDeleteStudent}
      />
      <StudentEnrollmentModal
        visible={isStudentModalVisible}
        onClose={handleCloseModals}
        onSuccess={handleCrudSuccess}
        initialData={selectedStudentGroup}
        planClasses={planClasses}
      />
      <DeleteConfirmModal
        visible={isDeleteStudentModalVisible}
        onClose={handleCloseModals}
        onConfirm={handleConfirmDeleteStudent}
        title={`Delete Enrollment?`}
        description={`Remove "${selectedStudentGroup?.studentName}" from class "${selectedStudentGroup?.classCode}"?`}
        isLoading={isDeletingStudent}
      />
    </>
  );
};

export default React.memo(StudentSection);
