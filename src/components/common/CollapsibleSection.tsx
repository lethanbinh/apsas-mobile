import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import { AppColors } from '../../styles/color';
import AppText from '../texts/AppText';
import Feather from 'react-native-vector-icons/Feather';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  style?: any;
}

const CollapsibleSection = ({
  title,
  children,
  defaultExpanded = false,
  style,
}: CollapsibleSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <AppText variant="label16pxBold" style={styles.title}>
          {title}
        </AppText>
        <Feather
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={s(20)}
          color={AppColors.n700}
        />
      </TouchableOpacity>
      {isExpanded && <View style={styles.content}>{children}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: AppColors.white,
    borderRadius: s(12),
    marginBottom: vs(16),
    borderWidth: 1,
    borderColor: AppColors.n200,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: s(16),
    backgroundColor: AppColors.n50,
  },
  title: {
    flex: 1,
    color: AppColors.n900,
  },
  content: {
    padding: s(16),
  },
});

export default CollapsibleSection;

