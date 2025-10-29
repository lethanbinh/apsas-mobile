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
import { ClassDetailData } from '../../api/class';

interface StudentSectionProps {
  studentGroups: StudentGroupData[];
  planClasses: ClassDetailData[];
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
      await deleteStudentEnrollment(selectedStudentGroup.id);
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
