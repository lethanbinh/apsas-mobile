import * as React from 'react';
import Svg, {
  Rect,
  Defs,
  Pattern,
  Use,
  Image,
  SvgProps,
  Path,
} from 'react-native-svg';
import { AppColors } from '../../styles/color';

export const HomeNavIcon = (props: SvgProps) => (
  <Svg width={20} height={20} viewBox="0 0 20 20" fill="none" {...props}>
    <Rect width={20} height={20} fill="url(#pattern0_327_11296)" />
    <Defs>
      <Pattern
        id="pattern0_327_11296"
        patternContentUnits="objectBoundingBox"
        width={1}
        height={1}
      >
        <Use xlinkHref="#image0_327_11296" transform="scale(0.0416667)" />
      </Pattern>
      <Image
        id="image0_327_11296"
        width={24}
        height={24}
        preserveAspectRatio="none"
        xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAABBklEQVR4nO2Uv0oDQRDGF2wsLbTRhMwmwTyEvoW+hs/gI0gwM8HKOkcgpfgcSamF1v67bzhBm5MRjBJuD8mu2NwHXzU73293dlnnGqVQj1/bxDolVpi96IwkHyQL96yPXrRc8ZPVogHEOq0I/3KWAoAQgETzvwWwvkQDvOgsOCLGJP4Ekg/sQisAD/1h0XLJXpJoZjM3286ThTcKKys3uiMckuB0/wLbq+X+EDtW645xYGvdb9W5LDeJ9YQE9z/e+40XHHXOnrfMfoRjL3r7Xced9VhvbXhrXOyRYFHzNZR1Jsa8fV7sBgFecL1uuF8aV0EAMd5jAcR4qzlB7O710/8HaOQq9AFQu7SmSJBOjwAAAABJRU5ErkJggg=="
      />
    </Defs>
  </Svg>
);

export const MyClassNavIcon = (props: SvgProps) => (
  <Svg width={21} height={20} viewBox="0 0 21 20" fill="none" {...props}>
    <Rect x={0.5} width={20} height={20} fill="url(#pattern0_327_11287)" />
    <Defs>
      <Pattern
        id="pattern0_327_11287"
        patternContentUnits="objectBoundingBox"
        width={1}
        height={1}
      >
        <Use xlinkHref="#image0_327_11287" transform="scale(0.0416667)" />
      </Pattern>
      <Image
        id="image0_327_11287"
        width={24}
        height={24}
        preserveAspectRatio="none"
        xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAwElEQVR4nO2UwQrCMAyG+ySSOLzoWZ906dh1j6L4Lt1NE7wJk5QpRTc3R4cK/aGXNfm+UtIZk/IzAStHtNLEWGDl8CKIBcd2JUHzuG9iB1ZoFgEQuyyXjR8S4nySAIgd0mWrICSukPjafq/v8EXBa1/3qUCbtDmsWxbnFVop38FHCUJ4pqe3Uio87OmDDwqe4UBc+z29HuLKC4vTrg8+RpAHcDfLmOroTYX/10PDOQSmI4M1+ouNJQCSfVdNyndyAwf9BEw4+SDHAAAAAElFTkSuQmCC"
      />
    </Defs>
  </Svg>
);

export const RequestNavIcon = (props: SvgProps) => (
  <Svg width={20} height={20} viewBox="0 0 20 20" fill="none" {...props}>
    <Rect width={20} height={20} fill="url(#pattern0_327_11290)" />
    <Defs>
      <Pattern
        id="pattern0_327_11290"
        patternContentUnits="objectBoundingBox"
        width={1}
        height={1}
      >
        <Use xlinkHref="#image0_327_11290" transform="scale(0.0416667)" />
      </Pattern>
      <Image
        id="image0_327_11290"
        width={24}
        height={24}
        preserveAspectRatio="none"
        xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAA6UlEQVR4nO2USwrCMBRFswOHiiBNAg7dgmOduxMRnOkemj4Rd+ECnLgAJy5A2rnQlwoi2kpCUWrrtwkieCGQweWe8D4h5K9X5UDUpYABA5mUORQwUFk5AAPclA1nV4hfBDiZAjCQSR7g4fHuizw8MJB9Pt1WGu6uru4UcG8MwAGHt34K4eA9wKMSzWQ19SwoyKUeChHVzAEg08C18vNJ2LQCYAJ7ukQeCuMACnKuwwW2n/k/AnBXtlLv6pMxjW3vQfx1ALmU81cBrNRnZwhAAX1HRJ2CMc2YRsS0mM1wJavhRPdAjq2F29QZqCo5E1DQPmUAAAAASUVORK5CYII="
      />
    </Defs>
  </Svg>
);

export const NotificationNavIcon = (props: SvgProps) => (
  <Svg width={21} height={20} viewBox="0 0 21 20" fill="none" {...props}>
    <Path
      d="M10.5 0C4.98 0 0.5 4.48 0.5 10C0.5 15.52 4.98 20 10.5 20C16.02 20 20.5 15.52 20.5 10C20.5 4.48 16.02 0 10.5 0ZM10.5 16.5C9.67 16.5 9 15.83 9 15H12C12 15.83 11.33 16.5 10.5 16.5ZM15.5 14H5.5V13L6.5 12V9.39C6.5 7.27 7.53 5.47 9.5 5V4.5C9.5 3.93 9.93 3.5 10.5 3.5C11.07 3.5 11.5 3.93 11.5 4.5V5C13.47 5.47 14.5 7.28 14.5 9.39V12L15.5 13V14Z"
      fill={AppColors.pr500}
    />
  </Svg>
);

export const ProfileNavIcon = (props: SvgProps) => (
  <Svg
    width={20}
    height={20}
    viewBox="0 0 20 20"
    fill="none"
    {...props}
  >
    <Rect width={20} height={20} fill="url(#pattern0_327_11296)" />
    <Defs>
      <Pattern
        id="pattern0_327_11296"
        patternContentUnits="objectBoundingBox"
        width={1}
        height={1}
      >
        <Use xlinkHref="#image0_327_11296" transform="scale(0.0416667)" />
      </Pattern>
      <Image
        id="image0_327_11296"
        width={24}
        height={24}
        preserveAspectRatio="none"
        xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAABBklEQVR4nO2Uv0oDQRDGF2wsLbTRhMwmwTyEvoW+hs/gI0gwM8HKOkcgpfgcSamF1v67bzhBm5MRjBJuD8mu2NwHXzU73293dlnnGqVQj1/bxDolVpi96IwkHyQL96yPXrRc8ZPVogHEOq0I/3KWAoAQgETzvwWwvkQDvOgsOCLGJP4Ekg/sQisAD/1h0XLJXpJoZjM3286ThTcKKys3uiMckuB0/wLbq+X+EDtW645xYGvdb9W5LDeJ9YQE9z/e+40XHHXOnrfMfoRjL3r7Xced9VhvbXhrXOyRYFHzNZR1Jsa8fV7sBgFecL1uuF8aV0EAMd5jAcR4qzlB7O710/8HaOQq9AFQu7SmSJBOjwAAAABJRU5ErkJggg=="
      />
    </Defs>
  </Svg>
);