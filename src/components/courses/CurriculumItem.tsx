import { useNavigation } from '@react-navigation/native';
import React, { ReactNode } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import AppText from '../texts/AppText';

export interface CurriculumItemProps {
  id: number | string;
  number: string;
  title: string;
  linkFile: string;
  rightIcon: ReactNode;
  detailNavigation?: string;
  onAction: () => void;
  onPress?: () => void;
  disabled?: boolean; // <-- Thêm prop
}
const CurriculumItem = ({
  id,
  number,
  title,
  linkFile,
  rightIcon,
  detailNavigation,
  onAction,
  onPress,
  disabled = false,
}: CurriculumItemProps) => {
  const navigation = useNavigation<any>();
  const truncateText = (text: string, maxLength: number = 30): string => {
    if (text.length <= maxLength) {
      return text;
    }
    return `${text.substring(0, maxLength - 3)}...`;
  };
  const truncatedLinkFile = truncateText(linkFile, 30);
  return (
    <View style={[styles.container, disabled && styles.disabledContainer]}>
      <View style={styles.contentWrapper}>
        <View style={styles.numberContainer}>
          <AppText>{number}</AppText>
        </View>
        <TouchableOpacity
          disabled={disabled} // <-- Thêm disabled
          onPress={() => {
            if (onPress) {
              onPress();
              return;
            }
            detailNavigation &&
              navigation.navigate(detailNavigation as never, { elementId: id });
          }}
        >
          <AppText
            variant="label16pxBold"
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{ color: '#202244' }}
          >
            {truncateText(title, 25)}
          </AppText>
          <AppText
            variant="label14pxRegular"
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{ color: '#202244' }}
          >
            {truncatedLinkFile}
          </AppText>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.iconWrapper}
        onPress={onAction}
        disabled={disabled} // <-- Thêm disabled
      >
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
  disabledContainer: {
    // <-- Thêm style
    opacity: 0.5,
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
