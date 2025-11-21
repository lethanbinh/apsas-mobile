import { yupResolver } from '@hookform/resolvers/yup';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, View, Alert } from 'react-native';
import { Modal, Portal } from 'react-native-paper';
import { s, vs } from 'react-native-size-matters';
import * as yup from 'yup';
import { submissionFeedbackService, SubmissionFeedback } from '../../api/submissionFeedbackService';
import { AppColors } from '../../styles/color';
import AppButton from '../buttons/AppButton';
import AppTextInputController from '../inputs/AppTextInputController';
import AppText from '../texts/AppText';
import { showErrorToast, showSuccessToast } from '../toasts/AppToast';

const schema = yup.object({
  feedbackText: yup.string().required('Feedback text is required'),
});

type FormData = yup.InferType<typeof schema>;

interface FeedbackCrudModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  submissionId: number;
  initialFeedback?: SubmissionFeedback | null;
}

const FeedbackCrudModal: React.FC<FeedbackCrudModalProps> = ({
  visible,
  onClose,
  onSuccess,
  submissionId,
  initialFeedback,
}) => {
  const isEditMode = !!initialFeedback;
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      feedbackText: '',
    },
  });

  useEffect(() => {
    if (visible) {
      if (initialFeedback) {
        reset({
          feedbackText: initialFeedback.feedbackText || '',
        });
      } else {
        reset({
          feedbackText: '',
        });
      }
    }
  }, [visible, initialFeedback, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);

      if (isEditMode && initialFeedback) {
        // Update existing feedback
        await submissionFeedbackService.updateSubmissionFeedback(initialFeedback.id, {
          feedbackText: data.feedbackText,
        });
        showSuccessToast('Success', 'Feedback updated successfully');
      } else {
        // Create new feedback
        await submissionFeedbackService.createSubmissionFeedback({
          submissionId: submissionId,
          feedbackText: data.feedbackText,
        });
        showSuccessToast('Success', 'Feedback created successfully');
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to save feedback:', error);
      showErrorToast(
        'Error',
        error.message || `Failed to ${isEditMode ? 'update' : 'create'} feedback`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    if (!initialFeedback) return;

    Alert.alert(
      'Delete Feedback',
      'Are you sure you want to delete this feedback?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsDeleting(true);
              await submissionFeedbackService.deleteSubmissionFeedback(initialFeedback.id);
              showSuccessToast('Success', 'Feedback deleted successfully');
              onSuccess();
              onClose();
            } catch (error: any) {
              console.error('Failed to delete feedback:', error);
              showErrorToast('Error', error.message || 'Failed to delete feedback');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ],
    );
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onClose}
        contentContainerStyle={styles.modalContainer}
      >
        <View style={styles.header}>
          <AppText variant="label16pxBold">
            {isEditMode ? 'Edit Feedback' : 'Create Feedback'}
          </AppText>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Controller
            control={control}
            name="feedbackText"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <View>
                <AppText variant="body14pxRegular" style={styles.label}>
                  Feedback Text *
                </AppText>
                <AppTextInputController
                  name="feedbackText"
                  control={control}
                  placeholder="Enter feedback text..."
                  multiline
                  numberOfLines={10}
                />
                {error && (
                  <AppText variant="body12pxRegular" style={styles.errorText}>
                    {error.message}
                  </AppText>
                )}
              </View>
            )}
          />
        </ScrollView>

        <View style={styles.footer}>
          {isEditMode && (
            <AppButton
              title={isDeleting ? 'Deleting...' : 'Delete'}
              onPress={handleDelete}
              variant="danger"
              style={[styles.button, styles.deleteButton]}
              disabled={isDeleting}
              loading={isDeleting}
              textColor={AppColors.r500}
            />
          )}
          <View style={styles.buttonGroup}>
            <AppButton
              title="Cancel"
              onPress={onClose}
              variant="secondary"
              style={[styles.button, styles.cancelButton]}
            />
            <AppButton
              title={isEditMode ? 'Update' : 'Create'}
              onPress={handleSubmit(onSubmit)}
              variant="primary"
              style={[styles.button, styles.submitButton]}
              disabled={isLoading || isSubmitting}
              loading={isLoading}
            />
          </View>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: AppColors.white,
    margin: s(20),
    borderRadius: s(12),
    maxHeight: '80%',
  },
  header: {
    padding: s(20),
    borderBottomWidth: 1,
    borderBottomColor: AppColors.n200,
  },
  content: {
    padding: s(20),
    maxHeight: vs(400),
  },
  label: {
    marginBottom: vs(8),
    color: AppColors.n700,
  },
  textArea: {
    minHeight: vs(200),
    textAlignVertical: 'top',
  },
  errorText: {
    color: AppColors.r500,
    marginTop: vs(4),
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: s(20),
    borderTopWidth: 1,
    borderTopColor: AppColors.n200,
    gap: s(10),
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: s(10),
    flex: 1,
    justifyContent: 'flex-end',
  },
  button: {
    minWidth: s(100),
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
  },
  deleteButton: {
    marginRight: 'auto',
  },
});

export default FeedbackCrudModal;

