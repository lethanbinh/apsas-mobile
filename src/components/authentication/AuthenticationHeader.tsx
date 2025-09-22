import { StyleSheet, Text, View } from 'react-native';
import React, { ReactNode } from 'react';
import { SmallAppIcon } from '../../assets/icons/icon';
import AppText from '../texts/AppText';
import { s, vs } from 'react-native-size-matters';
interface AuthenticationHeaderProps {
  title: string;
  description: string;
  isLongDescription?: boolean;
  icon?: React.ReactNode;
}
const AuthenticationHeader = ({
  title,
  description,
  isLongDescription = true,
  icon = <SmallAppIcon />,
}: AuthenticationHeaderProps) => {
  return (
    <View style={styles.container}>
      {icon}
      <AppText variant="h3" style={styles.title}>
        {title}
      </AppText>
      <AppText
        style={[
          styles.description,
          {
            paddingHorizontal: isLongDescription ? s(50) : 0,
          },
        ]}
      >
        {description}
      </AppText>
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
    textAlign: 'center',
  },
});
