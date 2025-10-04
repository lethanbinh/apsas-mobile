import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import { AppColors } from '../../styles/color';
import AppButton from '../buttons/AppButton';
import AppText from '../texts/AppText';
import { DemoIcon } from '../../assets/icons/icon';

interface LearningCardProps {
  title?: string;
  buttonLabel: string;
  onPress: () => void;
  backgroundColor: string;
  imageSource: any;
  reverse?: boolean;
}

const LearningCard = ({
  title,
  buttonLabel,
  onPress,
  backgroundColor,
  imageSource,
  reverse = false,
}: LearningCardProps) => {
  return (
    <View
      style={[
        styles.card,
        { backgroundColor, flexDirection: reverse ? 'row-reverse' : 'row' },
      ]}
    >
      <View style={styles.leftSection}>
        {title && <AppText style={styles.title}>{title}</AppText>}
        {reverse && (
          <View style={{ alignSelf: "flex-end" }}>
            <DemoIcon />
          </View>
        )}
        <AppButton
          textVariant="label12pxRegular"
          title={buttonLabel}
          onPress={onPress}
          style={{
            marginVertical: vs(35),
            minWidth: s(100),
          }}
        />
      </View>
      <Image source={imageSource} style={styles.image} resizeMode="contain" />
    </View>
  );
};

export default LearningCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: s(15),
    paddingVertical: s(15),
    paddingHorizontal: s(10),
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: vs(15),
    height: vs(140),
  },
  leftSection: {
    flex: 1,
    marginHorizontal: s(10),
  },
  title: {
    fontSize: s(14),
    color: AppColors.black,
    marginBottom: vs(10),
  },
  image: {
    width: s(130),
    height: s(130),
  },
});
