import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import { CloseIcon } from '../assets/icons/icon';
import AppButton from '../components/buttons/AppButton';
import FilterSelector from '../components/common/FilterSelector';
import ScreenHeader from '../components/common/ScreenHeader';
import SearchInput from '../components/common/SearchInput';
import SectionHeader from '../components/common/SectionHeader';
import AppSafeView from '../components/views/AppSafeView';
import { AppColors } from '../styles/color';
import { globalStyles } from '../styles/shareStyles';

const GradingHistoryFilterScreen = () => {
  const navigation = useNavigation();
  const [searchValue, setSearchValue] = useState<string>('');
  const [sortDate, setSortDate] = useState<'oldest' | 'newest'>('oldest');
  const [sortGrade, setSortGrade] = useState<'highest' | 'lowest'>('highest');

  return (
    <AppSafeView>
      <ScreenHeader title="Filters" leftIcon={<CloseIcon />} />
      <View style={globalStyles.containerStyle}>
        <SearchInput
          title="Search By Student Code"
          value={searchValue}
          onChange={setSearchValue}
        />

        {/* Sort by */}
        <View
          style={{
            borderBottomWidth: 1,
            paddingBottom: vs(20),
            borderBottomColor: AppColors.n300,
          }}
        >
          <SectionHeader title="Sort by" textVariant="h3" />

          {/* Nhóm 1: Oldest / Newest */}
          <View
            style={[
              globalStyles.flexRowStyle,
              { gap: s(10), marginTop: s(20) },
            ]}
          >
            <AppButton
              style={[
                globalStyles.minWidthAuto,
                globalStyles.roundButton,
                { width: s(100) },
              ]}
              title="Oldest"
              variant={sortDate === 'oldest' ? 'primary' : 'secondary'}
              textColor={
                sortDate === 'oldest' ? AppColors.white : AppColors.black
              }
              onPress={() => setSortDate('oldest')}
            />
            <AppButton
              style={[
                globalStyles.minWidthAuto,
                globalStyles.roundButton,
                { width: s(100) },
              ]}
              title="Newest"
              variant={sortDate === 'newest' ? 'primary' : 'secondary'}
              textColor={
                sortDate === 'newest' ? AppColors.white : AppColors.black
              }
              onPress={() => setSortDate('newest')}
            />
          </View>

          {/* Nhóm 2: Highest / Lowest */}
          <View
            style={[
              globalStyles.flexRowStyle,
              { gap: s(10), marginTop: s(20) },
            ]}
          >
            <AppButton
              style={[
                globalStyles.minWidthAuto,
                globalStyles.roundButton,
                { width: s(140) },
              ]}
              title="Highest grade"
              variant={sortGrade === 'highest' ? 'primary' : 'secondary'}
              textColor={
                sortGrade === 'highest' ? AppColors.white : AppColors.black
              }
              onPress={() => setSortGrade('highest')}
            />
            <AppButton
              style={[
                globalStyles.minWidthAuto,
                globalStyles.roundButton,
                { width: s(140) },
              ]}
              title="Lowest grade"
              variant={sortGrade === 'lowest' ? 'primary' : 'secondary'}
              textColor={
                sortGrade === 'lowest' ? AppColors.white : AppColors.black
              }
              onPress={() => setSortGrade('lowest')}
            />
          </View>
        </View>

        {/* Categories */}
        <View style={{ marginTop: vs(20) }}>
          <SectionHeader
            title="Assignment Category"
            textVariant="h3"
            style={{ marginBottom: vs(10) }}
          />
          <FilterSelector
            categories={[
              { id: 'dsa', name: 'Basic (DSA)' },
              { id: 'webapi', name: 'Web API' },
              { id: 'webui', name: 'Web UI' },
            ]}
            initialSelected={['all']}
            onChange={selected => {
              console.log('Selected categories:', selected);
            }}
          />
        </View>

        <View
          style={[
            globalStyles.flexRowStyle,
            {
              gap: s(10),
              marginTop: vs(50),
            },
          ]}
        >
          <AppButton
            title="Back"
            onPress={() => {
              navigation.goBack();
            }}
            variant="secondary"
            style={{
              width: s(80),
              minWidth: 0,
              borderWidth: 0,
            }}
            textColor={AppColors.black}
          />
          <AppButton
            style={{
              flex: 1,
              minWidth: 0,
              borderWidth: 0,
            }}
            title="Show 12 results"
            onPress={() => {}}
          />
        </View>
      </View>
    </AppSafeView>
  );
};

export default GradingHistoryFilterScreen;

const styles = StyleSheet.create({});
