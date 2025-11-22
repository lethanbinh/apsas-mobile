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
  disableScrollView?: boolean;
  width?: string | number;
}

const CustomModal: React.FC<CustomModalProps> = ({
  visible,
  onClose,
  title,
  description,
  children,
  icon,
  disableScrollView = false,
  width = '85%',
}) => {
  if (!visible) return null;
  const modalInnerContent = (
    <>
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
    </>
  );

  return (
    <Portal>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.modalContainer]}>
          {/* Render ScrollView có điều kiện */}
          {disableScrollView ? (
            modalInnerContent // Render trực tiếp nếu disableScrollView là true
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {modalInnerContent}
            </ScrollView>
          )}
        </View>
      </KeyboardAvoidingView>
    </Portal>
  );
};

// Styles giữ nguyên như file gốc bạn cung cấp
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
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: vs(30),
    paddingHorizontal: s(25),
    elevation: 5,
    maxHeight: '98%', // Tăng chiều cao tối đa
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
  // button và buttonText không được dùng trong component này nữa, có thể xóa
  // button: { ... },
  // buttonText: { ... },
});

export default CustomModal;
