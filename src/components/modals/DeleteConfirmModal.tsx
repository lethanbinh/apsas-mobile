import React from 'react';
import { View, StyleSheet } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import AppButton from '../buttons/AppButton';
import CustomModal from '../modals/CustomModal';
import { AppColors } from '../../styles/color';
import { QuestionMarkIcon } from '../../assets/icons/input-icon';

interface DeleteConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  isLoading?: boolean;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  visible,
  onClose,
  onConfirm,
  title,
  description,
  isLoading = false,
}) => {
  return (
    <CustomModal
      visible={visible}
      onClose={onClose}
      title={title}
      description={description}
      icon={<QuestionMarkIcon />}
      disableScrollView={true}
    >
      <View style={styles.modalButtonRow}>
        <AppButton
          title="Delete"
          variant="danger"
          onPress={onConfirm}
          textColor={AppColors.errorColor}
          style={styles.deleteButton}
          size="small"
          loading={isLoading}
          disabled={isLoading}
        />
        <AppButton
          title="Cancel"
          onPress={onClose}
          style={styles.cancelButton}
          size="small"
          variant="secondary"
          textColor={AppColors.n700}
          disabled={isLoading}
        />
      </View>
    </CustomModal>
  );
};

const styles = StyleSheet.create({
  modalButtonRow: {
    flexDirection: 'row',
    gap: s(10),
    justifyContent: 'center',
    marginTop: vs(20),
  },
  deleteButton: {
    minWidth: 'auto',
    width: s(90),
    borderColor: AppColors.errorColor,
  },
  cancelButton: {
    minWidth: 'auto',
    width: s(90),
    borderColor: AppColors.n700,
  },
});

export default DeleteConfirmModal;
