import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import AppButton from '../components/buttons/AppButton';
import ScreenHeader from '../components/common/ScreenHeader';
import SemesterDropdown from '../components/common/SemesterDropdown';
import AppSafeView from '../components/views/AppSafeView';
import { globalStyles } from '../styles/shareStyles';
import { SemesterData } from '../api/class';
import { fetchSemesters } from '../api/semester';

const ApprovalChooseSemesterScreen = () => {
  const [semesters, setSemesters] = useState<SemesterData[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<SemesterData | null>(
    null,
  );
  const [semesterCodes, setSemesterCodes] = useState<string[]>([]);
  const navigation = useNavigation();

  useEffect(() => {
    const loadSemesters = async () => {
      try {
        const data = await fetchSemesters();
        setSemesters(data);
        setSemesterCodes(data.map(s => s.semesterCode));
        if (data.length > 0) {
          setSelectedSemester(data[0]);
        }
      } catch (error) {
        console.error('Failed to load semesters:', error);
      }
    };

    loadSemesters();
  }, []);

  const handleSemesterSelect = (semesterCode: string) => {
    const selected =
      semesters.find(s => s.semesterCode === semesterCode) || null;
    setSelectedSemester(selected);
    console.log('Selected semester:', selected);
  };

  return (
    <AppSafeView>
      <ScreenHeader title="Approval" />
      <View style={globalStyles.containerStyle}>
        <SemesterDropdown
          semesters={semesterCodes}
          onSelect={handleSemesterSelect}
        />

        <AppButton
          style={{
            marginTop: vs(20),
            borderRadius: s(12),
          }}
          title="Continue"
          onPress={() => {
            navigation.navigate('ApprovalScreen' as never);
          }}
          size="large"
          disabled={!selectedSemester}
        />
      </View>
    </AppSafeView>
  );
};

export default ApprovalChooseSemesterScreen;
