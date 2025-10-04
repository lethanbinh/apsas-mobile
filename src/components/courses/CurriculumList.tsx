import React from 'react';
import { SectionList, StyleSheet, View } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import { SvgProps } from 'react-native-svg';
import AppButton from '../buttons/AppButton';
import AppText from '../texts/AppText';
import CurriculumItem from './CurriculumItem';
import { AppColors } from '../../styles/color';

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
}

const CurriculumList = ({ sections, isGraded, isDownloadable = true }: CurriculumListProps) => {
  return (
    <SectionList
      style={styles.curriculumContainer}
      sections={sections}
      keyExtractor={(item, index) =>
        item.id ? String(item.id) : String(index)
      }
      scrollEnabled={false}
      renderSectionHeader={({ section: { title, sectionButton } }) => (
        <View>
          <AppText
            style={{ color: '#202244', marginBottom: vs(15) }}
            variant="label16pxBold"
          >
            {title}
          </AppText>
          {sectionButton && <AppText>{sectionButton}</AppText>}
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
      ItemSeparatorComponent={() => <View style={{ height: 10 }}></View>}
      showsVerticalScrollIndicator={false}
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
            title="Download All Material"
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
