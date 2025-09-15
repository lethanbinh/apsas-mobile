import * as React from 'react';
import Svg, {
  ClipPath,
  Defs,
  G,
  Image,
  Path,
  Pattern,
  Rect,
  SvgProps,
  Use,
} from 'react-native-svg';

export const EmailInputIcon = (props: SvgProps) => (
  <Svg width={20} height={20} viewBox="0 0 20 20" fill="none" {...props}>
    <Path
      d="M15.8334 6.66699C15.139 6.66699 14.5487 6.42394 14.0626 5.93783C13.5765 5.45171 13.3334 4.86144 13.3334 4.16699C13.3334 3.47255 13.5765 2.88227 14.0626 2.39616C14.5487 1.91005 15.139 1.66699 15.8334 1.66699C16.5279 1.66699 17.1181 1.91005 17.6042 2.39616C18.0904 2.88227 18.3334 3.47255 18.3334 4.16699C18.3334 4.86144 18.0904 5.45171 17.6042 5.93783C17.1181 6.42394 16.5279 6.66699 15.8334 6.66699ZM3.33341 16.667C2.87508 16.667 2.48272 16.5038 2.15633 16.1774C1.82994 15.851 1.66675 15.4587 1.66675 15.0003V5.00033C1.66675 4.54199 1.82994 4.14963 2.15633 3.82324C2.48272 3.49685 2.87508 3.33366 3.33341 3.33366H11.7501C11.6945 3.61144 11.6667 3.88921 11.6667 4.16699C11.6667 4.44477 11.6945 4.72255 11.7501 5.00033C11.8473 5.44477 12.007 5.85796 12.2292 6.23991C12.4515 6.62185 12.7223 6.95866 13.0417 7.25033L10.0001 9.16699L3.33341 5.00033V6.66699L10.0001 10.8337L14.3959 8.08366C14.632 8.16699 14.8681 8.22949 15.1042 8.27116C15.3404 8.31283 15.5834 8.33366 15.8334 8.33366C16.2779 8.33366 16.7154 8.26421 17.1459 8.12533C17.5765 7.98644 17.9723 7.7781 18.3334 7.50033V15.0003C18.3334 15.4587 18.1702 15.851 17.8438 16.1774C17.5174 16.5038 17.1251 16.667 16.6667 16.667H3.33341Z"
      fill="#D2D3D3"
    />
  </Svg>
);

export const PasswordInputIcon = (props: SvgProps) => (
  <Svg width={20} height={20} viewBox="0 0 20 20" fill="none" {...props}>
    <G clipPath="url(#clip0_267_1653)">
      <Path
        d="M9.99992 3.75C5.83325 3.75 2.27492 6.34167 0.833252 10C2.27492 13.6583 5.83325 16.25 9.99992 16.25C14.1666 16.25 17.7249 13.6583 19.1666 10C17.7249 6.34167 14.1666 3.75 9.99992 3.75ZM9.99992 14.1667C7.69992 14.1667 5.83325 12.3 5.83325 10C5.83325 7.7 7.69992 5.83333 9.99992 5.83333C12.2999 5.83333 14.1666 7.7 14.1666 10C14.1666 12.3 12.2999 14.1667 9.99992 14.1667ZM9.99992 7.5C8.61658 7.5 7.49992 8.61667 7.49992 10C7.49992 11.3833 8.61658 12.5 9.99992 12.5C11.3833 12.5 12.4999 11.3833 12.4999 10C12.4999 8.61667 11.3833 7.5 9.99992 7.5Z"
        fill="#D9D9D9"
      />
    </G>
    <Defs>
      <ClipPath id="clip0_267_1653">
        <Rect width={20} height={20} fill="white" />
      </ClipPath>
    </Defs>
  </Svg>
);

export const GoogleIcon = (props: SvgProps) => (
  <Svg width={16} height={16} viewBox="0 0 16 16" fill="none" {...props}>
    <Rect width={16} height={16} fill="url(#pattern0_267_2805)" />
    <Defs>
      <Pattern
        id="pattern0_267_2805"
        patternContentUnits="objectBoundingBox"
        width={1}
        height={1}
      >
        <Use xlinkHref="#image0_267_2805" transform="scale(0.0104167)" />
      </Pattern>
      <Image
        id="image0_267_2805"
        width={96}
        height={96}
        preserveAspectRatio="none"
        xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAACXBIWXMAAAsTAAALEwEAmpwYAAAFJUlEQVR4nO2daYiWVRTHb/vi0kZkSAW2J1mIZQmNUVFGH4JmKgqLQiv70mAJUhqVEQaNmVEpWdACLRaFbbSQ0Wo1STtlJUqgTUVRWakT+YtDVxjkfWt877nvved57g/ebwNzlue5y7nn/h/nCoVCoVAoFAqFQiFDgGHAycAVwDzgeeBDYBXwI/An8DfwM/AtsBJ4DVgMzATOAUam9sMMwI7AqcAtwDvAX+ggCXsAuAjYI7Wf2QEcC9wOfEd8NgJPA+cDu7i6AmwPdAErSIckfBawj6sLwA7AxcAX5MMfQA+wp6sywFjgXfLlJz957+yqBLAXsMivWCzwETDGVQFgnF+FWKMfuFGGTGcRYDvgGu+IZV6RN9hZQsZQ4DGqw0rgcGcBYKh/aqrG57JRdDkj62mgl+qxNvs3ANgdeJvq0Qcc5XIG2Al4gerRl33wBeAhqsfa7IcdAZiWKEC/+VrOGl+O3lTH4EsVcwNx2Qx8AiwAzpUdKrBrk+LeQcBpwGzgRV/5bCX4h7ncAYb49XEs1gA3AKMCbBwOTAbeqlTwBWBupMB/BVwiE7uyvccBL1Ul+Ecqj7n448XZsQ9JgDOA1VgNvgAsQ5dPJalt3q3fbzX4k5SD/7hs4hL5cqmp4AvAm4rBv1tWL6l9MgPQoRj8Ran9MQfwnFLwnzJ70JEKYD+lPp2vZX2e2h9zAFcrBF8SODa1LybxB9Wh9KT2wyTAwUql3WGpfTEJcJlCAmam9sMswCOBwf+lTLxh7SWhTbOLW/3/tUf66wmnI6J9w33nXaOf/RZD4BSF4Sfapgv4mPz4XUYOLQevDDRmqYohthIgHOA0AO4INOQ6FUPsJeB0pwHwaKAhnSqG2EvAVJdJAe4YFUPsJWCG0wB4PdCQA1UMsZeAm50GCne49lYxxF4CFjgNSgJaZp6Wg2UIao25Wg4+Sxh1nYTnaDlYlqGJV0HzCWOWiiH2EnChy6QU8YyKIfYSoFOALMW4ljkkp3L0RBVj7CRgg1pzsT+QWRdo0H0qxjQAOMHfCdD8hV466XWZHUn+aulIkvDW+3u1DZpKONc6O6JR6wJ9naZt1CiFBHxv4S0AOhV8PSKGYaLVFsp8l/912y8DfVyde2viOJcpQLeCjwtjGTdCqTn3mxyF83zzsVx3DeXsmEaGFua2sDSn9nQ/9IRWffFSmvHuuAET0ONBtdaNQIC7lHyKP8cBb6DHPanfBGC6oj9Ht8NgueapyRNy6Tu64Y13+Jp3nZe30/hX0RdDGt1maR1R0tXkLNdGBw5tUYfhv9gE3NpIB0LZ9okKa/2t+aDt85nXd47BKmCKdmOt380/HMnmSZq2bstrrP0kDUTU0G+Sty1QpfdMYImiEPjWLNON7LY5OMZrPMTmM+BOL7gtEjm7NZlU9wdO8jvaJUobq/+TPNY5eGkV4HLStYD3eeENbcGmwTLd5UCEFYUFlqfew9RBtK8ZfbEbzlqdlAerTGUZOe890WUs3Po+1WUzcIHLGS+G9DLVZIYzJN4depCf25Pf7Szh1+XdiZaHmmxUazNMAXB8A5E8K4h05nhnHfk4jq/9W/mEifBk7MslqT5n0kveSE9Ql6sqXmJ4sj8DyIn1Xql3qKsD/JuITl9LT4k0jF1fq4+5Namq9ii0BA6Wft/h0VXrzxk2qd/L11Pn+LJGv7ImtRQNz8uxLynnXXWHV+y6zT+1K/yp2Q8DziLWD/ik7Xv+7xYCV4lmA7Bval8KhUKhUCgUCoWCqz3/ABGy3hx3fScnAAAAAElFTkSuQmCC"
      />
    </Defs>
  </Svg>
);

export const LoginIcon = (props: SvgProps) => (
  <Svg width={17} height={16} viewBox="0 0 17 16" fill="none" {...props}>
    <G clipPath="url(#clip0_267_2532)">
      <Path
        d="M7.83325 4.66667L6.89992 5.6L8.63325 7.33333H1.83325V8.66667H8.63325L6.89992 10.4L7.83325 11.3333L11.1666 8L7.83325 4.66667ZM13.8333 12.6667H8.49992V14H13.8333C14.5666 14 15.1666 13.4 15.1666 12.6667V3.33333C15.1666 2.6 14.5666 2 13.8333 2H8.49992V3.33333H13.8333V12.6667Z"
        fill="white"
      />
    </G>
    <Defs>
      <ClipPath id="clip0_267_2532">
        <Rect width={16} height={16} fill="white" transform="translate(0.5)" />
      </ClipPath>
    </Defs>
  </Svg>
);

export const RegisterIcon = (props: SvgProps) => (
  <Svg width={16} height={16} viewBox="0 0 16 16" fill="none" {...props}>
    <Rect width={16} height={16} fill="url(#pattern0_267_3095)" />
    <Defs>
      <Pattern
        id="pattern0_267_3095"
        patternContentUnits="objectBoundingBox"
        width={1}
        height={1}
      >
        <Use xlinkHref="#image0_267_3095" transform="scale(0.0416667)" />
      </Pattern>
      <Image
        id="image0_267_3095"
        width={24}
        height={24}
        preserveAspectRatio="none"
        xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAABEklEQVR4nO2UwUpCURCG70YlaNNSq7XQMvClvBYh9Aa9jBfBRS18Ab0FKvkAvoGG3lq0++LACLfp3rGjR9r0w6zOnP+bmTOcKPpXCAGXQB/IJAZAM6T5ip96c2chAH3KlYQAZAZgc2zAOgRgYAB6IQBNeVCtJXBxMCC3SYmbuUQvmPmfCagBN8Az8CGRAh2geqj5OfBqPP4MaPzGqAU8AI/AMFe5Zb7VtLAT4AS4BxbqQlfOb7VT7q5WXNT6vKSia8l58QCkGvBktHwmOe/auGAKW2X64NMAnOqvYx+ApSvJcWv5Tcb9sQ/gTnI6HoB25CugKnu+SxOg4g0QSGMHxJnX9zJXncRuzrJZLkZuLPnKvwBXiFFGebKV/wAAAABJRU5ErkJggg=="
      />
    </Defs>
  </Svg>
);

export const UserIcon = (props: SvgProps) => (
  <Svg width={20} height={20} viewBox="0 0 20 20" fill="none" {...props}>
    <Path
      d="M16.6666 17.5V15.8333C16.6666 14.9493 16.3154 14.1014 15.6903 13.4763C15.0652 12.8512 14.2173 12.5 13.3333 12.5H6.66659C5.78253 12.5 4.93468 12.8512 4.30956 13.4763C3.68444 14.1014 3.33325 14.9493 3.33325 15.8333V17.5"
      stroke="#D2D3D3"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M10.0001 9.16667C11.841 9.16667 13.3334 7.67428 13.3334 5.83333C13.3334 3.99238 11.841 2.5 10.0001 2.5C8.15913 2.5 6.66675 3.99238 6.66675 5.83333C6.66675 7.67428 8.15913 9.16667 10.0001 9.16667Z"
      stroke="#D2D3D3"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const PhoneIcon = (props: SvgProps) => (
  <Svg width={20} height={20} viewBox="0 0 20 20" fill="none" {...props}>
    <G clipPath="url(#clip0_267_3086)">
      <Path
        d="M5.51667 8.99167C6.71667 11.35 8.65 13.275 11.0083 14.4833L12.8417 12.65C13.0667 12.425 13.4 12.35 13.6917 12.45C14.625 12.7583 15.6333 12.925 16.6667 12.925C17.125 12.925 17.5 13.3 17.5 13.7583V16.6667C17.5 17.125 17.125 17.5 16.6667 17.5C8.84167 17.5 2.5 11.1583 2.5 3.33333C2.5 2.875 2.875 2.5 3.33333 2.5H6.25C6.70833 2.5 7.08333 2.875 7.08333 3.33333C7.08333 4.375 7.25 5.375 7.55833 6.30833C7.65 6.6 7.58333 6.925 7.35 7.15833L5.51667 8.99167Z"
        fill="#D9D9D9"
      />
    </G>
    <Defs>
      <ClipPath id="clip0_267_3086">
        <Rect width={20} height={20} fill="white" />
      </ClipPath>
    </Defs>
  </Svg>
);
