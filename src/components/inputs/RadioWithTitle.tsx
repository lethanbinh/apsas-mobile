import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { s, vs } from "react-native-size-matters";
import { AppColors } from "../../styles/color";
import AppText from "../texts/AppText";

interface RadioWithTitle {
  selected: boolean;
  title: string;
  onPress: () => void;
}

const RadioWithTitle = ({ selected, title, onPress }: RadioWithTitle) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.circle}>
        {selected && <View style={styles.innerCircle}></View>}
      </View>
      <AppText style={styles.title}>{title}</AppText>
    </TouchableOpacity>
  );
};

export default RadioWithTitle;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: vs(5),
  },

  circle: {
    height: s(20),
    width: s(20),
    borderRadius: "50%",
    borderWidth: 2,
    borderColor: AppColors.black,
    alignItems: "center",
    justifyContent: "center",
  },

  innerCircle: {
    height: s(10),
    width: s(10),
    borderRadius: "50%",
    backgroundColor: AppColors.black,
  },

  title: {
    fontSize: s(16),
    marginStart: s(10),
  },
});
