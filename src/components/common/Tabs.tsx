import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import { AppColors } from '../../styles/color';

export type TabType = string;

interface TabItem {
  key: TabType;
  label: string;
}

interface TabsProps {
  activeTab: TabType;
  onChange: (tab: TabType) => void;
  tabs?: TabItem[];
}

const defaultTabs: TabItem[] = [
  { key: 'ongoing', label: 'Ongoing' },
  { key: 'ended', label: 'Ended' },
  { key: 'upcoming', label: 'Upcoming' },
];

const Tabs: React.FC<TabsProps> = ({ activeTab, onChange, tabs = defaultTabs }) => {
  const renderTab = (tab: TabItem) => (
    <TouchableOpacity
      key={tab.key}
      style={styles.tab}
      onPress={() => onChange(tab.key)}
    >
      <Text
        style={[
          styles.tabText,
          activeTab === tab.key ? styles.activeText : styles.inactiveText,
        ]}
      >
        {tab.label}
      </Text>
      {activeTab === tab.key && <View style={styles.underline} />}
    </TouchableOpacity>
  );

  return <View style={styles.container}>{tabs.map(renderTab)}</View>;
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
