import React from 'react';
import { StyleSheet, View } from 'react-native';
import { s } from 'react-native-size-matters';
import AppText from '../texts/AppText';

type FeedbackItemProps = {
  title: string;
  content: string;
  textColor: string;
  backgroundColor: string;
};

const FeedbackItem: React.FC<FeedbackItemProps> = ({
  title,
  content,
  textColor,
  backgroundColor,
}) => {
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: backgroundColor,
        },
      ]}
    >
      <AppText
        variant="label16pxBold"
        style={{
          color: textColor,
          marginBottom: s(5),
        }}
      >
        {title}
      </AppText>
      <AppText numberOfLines={3}>{content}</AppText>
    </View>
  );
};

export default FeedbackItem;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: s(10),
    paddingVertical: s(10),
    borderRadius: s(10),
    marginBottom: s(15),
  },
});
