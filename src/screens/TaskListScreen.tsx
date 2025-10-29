import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  View
} from 'react-native';
import { s, vs } from 'react-native-size-matters';
import { fetchSemesters } from '../api/semester';
import AppButton from '../components/buttons/AppButton';
import ScreenHeader from '../components/common/ScreenHeader';
import SemesterDropdown from '../components/common/SemesterDropdown';
import { showErrorToast } from '../components/toasts/AppToast';
import AppSafeView from '../components/views/AppSafeView';
import { AppColors } from '../styles/color';
import { globalStyles } from '../styles/shareStyles';

const TaskListScreen = () => {
  const [semesters, setSemesters] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null);
  const navigation = useNavigation<any>();

  useEffect(() => {
    const loadSemesters = async () => {
      setIsLoading(true);
      try {
        const semesterData = await fetchSemesters();
        const semesterCodes = semesterData
          .map(s => s.semesterCode)
          .sort()
          .reverse();
        setSemesters(semesterCodes);
        if (semesterCodes.length > 0) {
          setSelectedSemester(semesterCodes[0]);
        }
      } catch (error: any) {
        showErrorToast('Error', 'Failed to load semesters.');
      } finally {
        setIsLoading(false);
      }
    };
    loadSemesters();
  }, []);

  const handleSemesterSelect = (semester: string | null) => {
    setSelectedSemester(semester);
  };
  return (
    <AppSafeView>
      <ScreenHeader title="Choose Semesters" />
      <View style={globalStyles.containerStyle}>
        {isLoading ? (
          <ActivityIndicator size="large" style={styles.loader} />
        ) : (
          <SemesterDropdown
            semesters={semesters}
            onSelect={handleSemesterSelect}
          />
        )}
        <AppButton
          style={{
            marginTop: vs(20),
            borderRadius: s(12),
          }}
          title="Continue"
          onPress={() => {
            if (selectedSemester) {
              navigation.navigate('CreateAssessmentScreen' as never, {
                semesterCode: selectedSemester,
              });
            } else {
              showErrorToast('Error', 'Please select a semester.');
            }
          }}
          size="large"
          disabled={isLoading || !selectedSemester}
        />
      </View>
    </AppSafeView>
  );
};

export default TaskListScreen;

const styles = StyleSheet.create({
  loader: {
    marginVertical: vs(20),
  },
  modalContainer: {
    backgroundColor: AppColors.white,
    borderRadius: s(12),
    paddingVertical: vs(20),
    paddingHorizontal: s(16),
    marginHorizontal: s(20),
    alignItems: 'stretch',
  },
  modalTitle: {
    fontSize: s(16),
    fontWeight: '600',
    marginBottom: vs(12),
    textAlign: 'center',
    color: AppColors.black,
  },
  input: {
    borderWidth: 1,
    borderColor: AppColors.n300,
    borderRadius: s(8),
    padding: s(10),
    marginBottom: vs(20),
    color: AppColors.black,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancel: {
    color: AppColors.n500,
    fontSize: s(14),
    marginRight: s(20),
  },
  add: {
    color: AppColors.pr500,
    fontSize: s(14),
    fontWeight: '600',
  },
});
