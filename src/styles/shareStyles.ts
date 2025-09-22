import { StyleSheet } from 'react-native';
import { AppFonts } from './font';
import { s } from 'react-native-size-matters';
import { AppColors } from './color';

export const textStyles = StyleSheet.create({
  h1: AppFonts.h1,
  h2: AppFonts.h2,
  h3: AppFonts.h3,
  h4: AppFonts.h4,
  h5: AppFonts.h5,

  body16pxRegular: AppFonts.body16pxRegular,
  body16pxBold: AppFonts.body16pxBold,
  body14pxRegular: AppFonts.body14pxRegular,
  body14pxBold: AppFonts.body14pxBold,
  body12pxRegular: AppFonts.body12pxRegular,
  body12pxBold: AppFonts.body12pxBold,

  label20pxRegular: AppFonts.label20pxRegular,
  label20pxBold: AppFonts.label20pxBold,
  label16pxRegular: AppFonts.label16pxRegular,
  label16pxBold: AppFonts.label16pxBold,
  label14pxRegular: AppFonts.label14pxRegular,
  label14pxBold: AppFonts.label14pxBold,
  label12pxRegular: AppFonts.label12pxRegular,
  label12pxBold: AppFonts.label12pxBold,
});

export const globalStyles = StyleSheet.create({
  authenticationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: s(35),
    backgroundColor: AppColors.white,
  },
});
