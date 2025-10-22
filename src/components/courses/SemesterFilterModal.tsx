import React from 'react';
import { StyleSheet, View, TouchableOpacity, FlatList } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import AppText from '../texts/AppText'; // Adjust path
import { AppColors } from '../../styles/color'; // Adjust path
import AppButton from '../buttons/AppButton'; // Adjust path
import CustomModal from '../modals/CustomModal';

interface SemesterFilterModalProps {
  visible: boolean;
  semesters: string[];
  selectedSemester: string | null;
  onSelect: (semester: string | null) => void;
  onClose: () => void;
}

const SemesterFilterModal: React.FC<SemesterFilterModalProps> = ({
  visible,
  semesters,
  selectedSemester,
  onSelect,
  onClose,
}) => {
  const allOptions = [null, ...semesters];

  const renderItem = ({ item }: { item: string | null }) => {
    const isSelected = selectedSemester === item;
    const label = item === null ? 'All Semesters' : item;
    return (
      <TouchableOpacity
        style={[styles.optionButton, isSelected && styles.selectedOption]}
        onPress={() => onSelect(item)}
      >
        <AppText style={[styles.optionText, isSelected && styles.selectedText]}>
          {label}
        </AppText>
      </TouchableOpacity>
    );
  };

  return (
    <CustomModal
      visible={visible}
      onClose={onClose}
      title="Choose Semester"
      disableScrollView={true} // Pass prop to disable internal ScrollView
    >
      <View style={styles.contentContainer}>
        <FlatList
          data={allOptions}
          renderItem={renderItem}
          keyExtractor={item => item ?? 'all'}
          style={styles.list}
        />
        <AppButton
          title="Close"
          onPress={onClose}
          style={styles.closeButton}
          variant="secondary"
        />
      </View>
    </CustomModal>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    alignItems: 'center',
  },
  list: {
    width: '100%',
    maxHeight: vs(250),
    marginBottom: vs(15),
  },
  optionButton: {
    paddingVertical: vs(12),
    borderBottomWidth: 1,
    borderBottomColor: AppColors.n100,
    width: '100%',
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: AppColors.pr100,
  },
  optionText: {
    fontSize: s(14),
    color: AppColors.n700,
  },
  selectedText: {
    color: AppColors.pr500,
    fontWeight: 'bold',
  },
  closeButton: {
    width: '60%',
    marginTop: vs(10),
  },
});

export default SemesterFilterModal;
