import React, { useState } from 'react';
import { deleteAssignRequest } from '../../api/assignRequestService';
import { CourseElementData } from '../../api/courseElementService';
import { PlanDetailAssignRequest } from '../../api/semesterService';
import {
  showErrorToast,
  showSuccessToast,
} from '../../components/toasts/AppToast';
import AssignRequestCrudModal from '../modals/AssignRequestCrudModal';
import DeleteConfirmModal from '../modals/DeleteConfirmModal';
import TableSection from '../common/TableSection';

interface AssignRequestSectionProps {
  assignRequests: PlanDetailAssignRequest[];
  courseElements: CourseElementData[];
  hodId: string;
  onRefresh: () => void;
}

const AssignRequestSection = ({
  assignRequests,
  courseElements,
  hodId,
  onRefresh,
}: AssignRequestSectionProps) => {
  const [isAssignRequestModalVisible, setIsAssignRequestModalVisible] =
    useState(false);
  const [
    isDeleteAssignRequestModalVisible,
    setIsDeleteAssignRequestModalVisible,
  ] = useState(false);
  const [selectedAssignRequest, setSelectedAssignRequest] =
    useState<PlanDetailAssignRequest | null>(null);
  const [isDeletingAssignRequest, setIsDeletingAssignRequest] = useState(false);

  const handleCloseModals = () => {
    setIsAssignRequestModalVisible(false);
    setIsDeleteAssignRequestModalVisible(false);
    setSelectedAssignRequest(null);
    setIsDeletingAssignRequest(false);
  };

  const handleCrudSuccess = () => {
    handleCloseModals();
    onRefresh();
  };

  const handleOpenAddAssignRequest = () => {
    setSelectedAssignRequest(null);
    setIsAssignRequestModalVisible(true);
  };
  const handleOpenEditAssignRequest = (item: PlanDetailAssignRequest) => {
    setSelectedAssignRequest(item);
    setIsAssignRequestModalVisible(true);
  };
  const handleOpenDeleteAssignRequest = (item: PlanDetailAssignRequest) => {
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

  return (
    <>
      <TableSection
        title="Teacher Assignments"
        data={assignRequests}
        columnConfig={[
          { key: 'courseElement', label: 'Course Element' }, // renderCell xử lý
          { key: 'lecturer', label: 'Teacher Name' }, // renderCell xử lý
          { key: 'message', label: 'Message' },
        ]}
        onAdd={handleOpenAddAssignRequest}
        onEdit={handleOpenEditAssignRequest}
        onDelete={handleOpenDeleteAssignRequest}
      />
      <AssignRequestCrudModal
        visible={isAssignRequestModalVisible}
        onClose={handleCloseModals}
        onSuccess={handleCrudSuccess}
        initialData={assignRequests.find(
          ar => ar.id === selectedAssignRequest?.id,
        )}
        courseElements={courseElements}
        hodId={hodId || ''}
      />
      <DeleteConfirmModal
        visible={isDeleteAssignRequestModalVisible}
        onClose={handleCloseModals}
        onConfirm={handleConfirmDeleteAssignRequest}
        title={`Delete Assignment?`}
        description={`Are... "${selectedAssignRequest?.lecturer.account?.fullName}"?`}
        isLoading={isDeletingAssignRequest}
      />
    </>
  );
};

export default React.memo(AssignRequestSection);
