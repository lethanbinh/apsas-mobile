import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import { AppColors } from '../../styles/color';

export type TabType = 'ongoing' | 'ended' | 'upcoming';

interface TabsProps {
  activeTab: TabType;
  onChange: (tab: TabType) => void;
}

const Tabs: React.FC<TabsProps> = ({ activeTab, onChange }) => {
  const renderTab = (tab: TabType, label: string) => (
    <TouchableOpacity
      key={tab}
      style={styles.tab}
      onPress={() => onChange(tab)}
    >
      <Text
        style={[
          styles.tabText,
          activeTab === tab ? styles.activeText : styles.inactiveText,
        ]}
      >
        {label}
      </Text>
      {activeTab === tab && <View style={styles.underline} />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {renderTab('ongoing', 'Ongoing')}
      {renderTab('ended', 'Ended')}
      {renderTab('upcoming', 'Upcoming')}
    </View>
  );
};

export default Tabs;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  tab: {
    marginRight: s(20),
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  activeText: {
    color: AppColors.black,
    fontWeight: '700',
  },
  inactiveText: {
    color: '#9e9e9e',
  },
  underline: {
    marginTop: vs(4),
    height: 2,
    width: '100%',
    backgroundColor: AppColors.black,
  },
});
