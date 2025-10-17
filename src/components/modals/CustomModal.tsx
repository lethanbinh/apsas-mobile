import React, { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Portal } from 'react-native-paper';
import { s, vs } from 'react-native-size-matters';
import AppText from '../texts/AppText';

interface CustomModalProps {
  visible: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  icon?: ReactNode;
}

const CustomModal: React.FC<CustomModalProps> = ({
  visible,
  onClose,
  title,
  description,
  children,
  icon,
}) => {
  if (!visible) return null;

  return (
    <Portal>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modalContainer}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View
              style={{
                alignItems: 'center',
                marginBottom: vs(20),
              }}
            >
              {icon}
            </View>
            <AppText style={styles.title} variant="h3">
              {title}
            </AppText>
            <AppText style={styles.description}>{description}</AppText>
            <View style={styles.content}>{children}</View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Portal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: vs(40),
    paddingHorizontal: s(20),
    elevation: 5,
    maxHeight: '90%', // Giới hạn chiều cao để modal không quá lớn
  },
  title: {
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    marginTop: vs(10),
  },
  content: {
    marginTop: vs(20),
  },
  button: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default CustomModal;