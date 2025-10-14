import { useNavigation } from '@react-navigation/native';
import React, { ReactNode } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import AppText from '../texts/AppText';
export interface CurriculumItemProps {
  id: number;
  number: string;
  title: string;
  linkFile: string;
  rightIcon: ReactNode;
  detailNavigation?: string;
  onAction: () => void;
}
const CurriculumItem = ({
  id,
  number,
  title,
  linkFile,
  rightIcon,
  detailNavigation,
  onAction,
}: CurriculumItemProps) => {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        <View style={styles.numberContainer}>
          <AppText>{number}</AppText>
        </View>
        <TouchableOpacity
          onPress={() =>
            detailNavigation && navigation.navigate(detailNavigation as never)
          }
        >
          <AppText variant="label16pxBold" style={{ color: '#202244' }}>
            {title}
          </AppText>
          <AppText variant="label14pxRegular" style={{ color: '#202244' }}>
            {linkFile}
          </AppText>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.iconWrapper} onPress={onAction}>
        {rightIcon}
      </TouchableOpacity>
    </View>
  );
};

export default CurriculumItem;

const styles = StyleSheet.create({
  container: {
    paddingTop: 0,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: '#E8F1FF',
    borderBottomWidth: 2,
    paddingBottom: vs(15),
    marginBottom: vs(10),
  },
  contentWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  numberContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: s(40),
    height: s(40),
    borderRadius: s(20),
    marginRight: s(10),
    backgroundColor: '#F5F9FF',
    borderWidth: 2,
    borderColor: '#E8F1FF',
  },
  iconWrapper: {},
});
