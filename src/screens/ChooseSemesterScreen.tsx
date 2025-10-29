import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  View
} from 'react-native';
import { s, vs } from 'react-native-size-matters';
import AppButton from '../components/buttons/AppButton';
import ScreenHeader from '../components/common/ScreenHeader';
import SemesterDropdown from '../components/common/SemesterDropdown';
import AppSafeView from '../components/views/AppSafeView';
import { globalStyles } from '../styles/shareStyles';

const ChooseSemesterScreen = () => {
  const [semesters, setSemesters] = useState([
    'Fall2025',
    'Summer2025',
    'Spring2025',
  ]);
  const navigation = useNavigation();
  const handleSemesterSelect = (semester: string) => {
    console.log('Selected semester:', semester);
  };

  return (
    <AppSafeView>
      <ScreenHeader title="Create plan" />
      <View style={globalStyles.containerStyle}>
        <SemesterDropdown
          semesters={semesters}
          onSelect={handleSemesterSelect}
        />

        <AppButton
          style={{
            marginTop: vs(20),
            borderRadius: s(12),
          }}
          title="Continue"
          onPress={() => {
            navigation.navigate('ImportExcelScreen' as never);
          }}
          size="large"
        />
      </View>
    </AppSafeView>
  );
};

export default ChooseSemesterScreen;