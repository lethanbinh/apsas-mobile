import React from 'react';
import { View, StyleSheet } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import AppButton from '../buttons/AppButton';

interface ModalActionsProps {
  onCancel: () => void;
  onSubmit: () => void;
  isLoading: boolean;
  isSubmitting: boolean;
}

const ModalActions: React.FC<ModalActionsProps> = ({
  onCancel,
  onSubmit,
  isLoading,
  isSubmitting,
}) => {
  return (
    <View style={styles.buttonContainer}>
      <AppButton
        title="Cancel"
        onPress={onCancel}
        variant="secondary"
        style={styles.cancelButton}
      />
      <AppButton
        title="Assign"
        onPress={onSubmit}
        loading={isLoading || isSubmitting}
        variant="primary"
        style={styles.submitButton}
      />
    </View>
  );
};

export default ModalActions;

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: vs(20),
    gap: s(12),
  },
  cancelButton: {
    flex: 1,
    minWidth: 0,
  },
  submitButton: {
    flex: 1,
    minWidth: 0,
  },
});

