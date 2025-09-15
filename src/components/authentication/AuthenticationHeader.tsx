import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { SmallAppIcon } from '../../assets/icons/icon';
import AppText from '../texts/AppText';
import { s, vs } from 'react-native-size-matters';
interface AuthenticationHeaderProps {
  title: string;
  description: string;
}
const AuthenticationHeader = ({
  title,
  description,
}: AuthenticationHeaderProps) => {
  return (
    <View style={styles.container}>
      <SmallAppIcon />
      <AppText variant="h3" style={styles.title}>
        {title}
      </AppText>
      <AppText style={styles.description}>{description}</AppText>
    </View>
  );
};

export default AuthenticationHeader;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginTop: vs(30),
    marginBottom: vs(8),
  },
  description: {
    paddingHorizontal: s(50),
    textAlign: 'center',
  },
});
