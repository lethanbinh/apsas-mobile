import React from 'react';
import { SectionList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import { SvgProps } from 'react-native-svg';
import AppButton from '../buttons/AppButton';
import AppText from '../texts/AppText';
import CurriculumItem from './CurriculumItem';
import { AppColors } from '../../styles/color';
import CourseCardItem from './CourseCardItem';
import { TestCaseIcon } from '../../assets/icons/icon';
import { NavigationIcon } from '../../assets/icons/courses';

interface CurriculumSection {
  title: string;
  data: {
    id: number;
    number: string;
    title: string;
    linkFile: string;
    rightIcon: (props: SvgProps) => React.ReactElement;
    detailNavigation: string;
    onAction: () => void;
  }[];
  sectionButton?: string;
}

interface CurriculumListProps {
  sections: CurriculumSection[];
  isGraded?: boolean;
  isDownloadable?: boolean;
  isSaved?: boolean;
  scrollEnabled?: boolean;
  hasTestCase?: boolean;
  buttonText?: string;
}

const CurriculumList = ({
  sections,
  isGraded,
  isDownloadable = true,
  isSaved = false,
  scrollEnabled = false,
  hasTestCase = false,
  buttonText,
}: CurriculumListProps) => {
  const handleSave = () => {};

  return (
    <SectionList
      style={styles.curriculumContainer}
      sections={sections}
      keyExtractor={(item, index) =>
        item.id ? String(item.id) : String(index)
      }
      renderSectionHeader={({ section: { title, sectionButton } }) => (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <View>
            <AppText
              style={{ color: '#202244', marginBottom: vs(15) }}
              variant="label16pxBold"
            >
              {title}
            </AppText>
          </View>

          {sectionButton && (
            <TouchableOpacity>
              <AppText
                variant="body12pxBold"
                style={{
                  color: AppColors.pr500,
                  marginBottom: vs(15),
                }}
              >
                {sectionButton}
              </AppText>
            </TouchableOpacity>
          )}
        </View>
      )}
      renderItem={({ item }) => (
        <CurriculumItem
          id={item.id}
          number={item.number}
          title={item.title}
          linkFile={item.linkFile}
          rightIcon={<item.rightIcon />}
          detailNavigation={item.detailNavigation}
          onAction={item.onAction}
        />
      )}
      scrollEnabled={scrollEnabled}
      ItemSeparatorComponent={() => <View style={{ height: 10 }}></View>}
      showsVerticalScrollIndicator={scrollEnabled}
      ListFooterComponent={() => {
        if (isGraded) {
          return (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <AppText style={{ color: AppColors.black }}>Total Score</AppText>
              <AppText
                style={{ color: AppColors.black }}
                variant="body14pxBold"
              >
                28 / 40
              </AppText>
            </View>
          );
        }

        if (!isDownloadable) {
          if (isSaved) {
            if (hasTestCase) {
              return (
                <View>
                  <CourseCardItem
                    title={'Test case'}
                    leftIcon={<TestCaseIcon />}
                    backGroundColor={AppColors.pr100}
                    rightIcon={<NavigationIcon color={AppColors.pr500} />}
                    linkTo={''}
                    hasTestCase={true}
                  />

                  <AppButton
                    title="Save"
                    onPress={handleSave}
                    style={{
                      width: s(220),
                      marginTop: vs(20),
                      borderRadius: s(10),
                    }}
                    textVariant="body14pxBold"
                  />
                </View>
              );
            }

            return (
              <AppButton
                title="Save"
                onPress={handleSave}
                style={{
                  width: s(220),
                  marginTop: vs(10),
                  borderRadius: s(10),
                }}
                textVariant="body14pxBold"
              />
            );
          }
          return null;
        }

        return (
          <AppButton
            textVariant="label14pxBold"
            style={{
              width: s(220),
              marginTop: vs(10),
              borderRadius: s(10),
            }}
            onPress={() => {}}
            title={buttonText || 'Download All Materials'}
          />
        );
      }}
      ListFooterComponentStyle={{ marginBottom: vs(40) }}
    />
  );
};

export default CurriculumList;

const styles = StyleSheet.create({
  curriculumContainer: {
    padding: s(25),
  },
});
