import React from 'react';
import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { vs } from 'react-native-size-matters';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { NavigationIcon } from '../../assets/icons/courses';
import { TestCaseIcon } from '../../assets/icons/icon';
import { AppColors } from '../../styles/color';
import CourseCardItem from '../courses/CourseCardItem';
import AppText from '../texts/AppText';

interface QuestionAccordionProps {
  title: string;
  description: string;
  imageUrl?: ImageSourcePropType | null;
  isExpanded: boolean;
  onPress: () => void;
  onCriteriaPress?: () => void;
  showCriteria?: boolean;
}

const QuestionAccordion = ({
  title,
  description,
  imageUrl,
  isExpanded,
  onPress,
  onCriteriaPress,
  showCriteria = true,
}: QuestionAccordionProps) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.header} onPress={onPress}>
        <AppText variant="label16pxBold" style={styles.title}>
          {title}
        </AppText>
        <AntDesign
          name={isExpanded ? 'up' : 'down'}
          size={16}
          color={AppColors.n700}
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.body}>
          <AppText style={styles.description}>
            {description}
          </AppText>
          {imageUrl && <Image source={imageUrl} style={styles.image} />}
          {showCriteria && (
            <CourseCardItem
              title="Criteria"
              leftIcon={<TestCaseIcon />}
              rightIcon={<NavigationIcon color={AppColors.pr500} />}
              backGroundColor={AppColors.pr100}
              onPress={onCriteriaPress}
            />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: vs(16),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: AppColors.n900,
    flex: 1,
  },
  body: {
    marginTop: vs(8),
  },
  description: {
    color: AppColors.n600,
    lineHeight: 20,
  },
  readMore: {
    color: AppColors.pr500,
    fontWeight: 'bold',
  },
  image: {
    width: '100%',
    height: vs(160),
    borderRadius: 12,
    marginVertical: vs(12),
  },
});

export default QuestionAccordion;
