import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import AppButton from '../buttons/AppButton';
import AppText from '../texts/AppText';

interface ClassItemProps {
  item: {
    id: string;
    title: string;
    description: string;
    image: any;
    color: string;
  };
  isMyClass?: boolean;
  onPress: () => void;
}

const ClassItem = ({
  item: { id, title, description, image, color },
  isMyClass = false,
  onPress,
}: ClassItemProps) => {
  return (
    <View style={[styles.container, { backgroundColor: color }]}>
      <Image style={styles.image} source={image} />
      <View style={styles.contentContainer}>
        <AppText
          variant="h4"
          style={{
            marginBottom: vs(5),
          }}
        >
          {title}
        </AppText>
        <AppText
          style={{
            marginBottom: vs(15),
          }}
          variant="label12pxRegular"
        >
          {description}
        </AppText>
        <AppButton
          size="small"
          title={isMyClass ? 'View' : 'Join'}
          textVariant="label12pxBold"
          onPress={onPress}
          style={{
            width: s(100),
            borderRadius: s(50),
          }}
        />
      </View>
    </View>
  );
};

export default ClassItem;

const styles = StyleSheet.create({
  container: {
    width: s(160),
    borderRadius: s(10),
  },
  image: {
    width: s(160),
    borderRadius: s(10),
  },
  contentContainer: {
    paddingHorizontal: s(10),
    paddingVertical: vs(15),
  },
});
