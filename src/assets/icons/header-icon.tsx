import * as React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';
import { AppColors } from '../../styles/color';
export const SearchIcon = (props: SvgProps) => (
  <Svg width={20} height={21} viewBox="0 0 20 21" fill="none" {...props}>
    <Path
      d="M9.16667 16.3333C12.8486 16.3333 15.8333 13.3486 15.8333 9.66667C15.8333 5.98477 12.8486 3 9.16667 3C5.48477 3 2.5 5.98477 2.5 9.66667C2.5 13.3486 5.48477 16.3333 9.16667 16.3333Z"
      stroke={AppColors.pr500}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M17.5 18L13.875 14.375"
      stroke={AppColors.pr500}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
