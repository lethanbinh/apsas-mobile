import React from "react";
import {
  StyleSheet,
  View,
  ViewStyle
} from "react-native";
import { AppColors } from "../../styles/color";
import { SafeAreaView } from "react-native-safe-area-context";

interface AppSafeViewProps {
  children?: React.ReactNode;
  style?: ViewStyle;
}

const AppSafeView = ({ children, style }: AppSafeViewProps) => {
  return (
    <SafeAreaView style={styles.safeAreaView}>
      <View style={[styles.container, style]}>{children}</View>
    </SafeAreaView>
  );
};

export default AppSafeView;

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: AppColors.white,
  },
  container: {
    flex: 1,
  },
});
