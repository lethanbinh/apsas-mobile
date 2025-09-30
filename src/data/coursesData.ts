import {
  AIIllustration,
  CSharpIllustration,
  CurriculumIcon,
  DownloadIcon,
  GradeIcon,
  JavaIllustration,
  NodeJSIllustration,
  ParticipantsIcon,
  ViewIcon,
} from '../assets/icons/courses';
import { CurriculumItemProps } from '../components/courses/CurriculumItem';
import { AppColors } from '../styles/color';

export const allCourses = {
  items: [
    {
      item: {
        id: '1',
        title: 'Java Spring',
        description: 'A Course Java Microservice Course by VanVTT',
        image: require('../assets/images/course1.png'),
        color: AppColors.pr100,
      },
      onPress: () => {},
    },
    {
      item: {
        id: '2',
        title: 'ASP.NET MVC web',
        description: 'A Course Java Microservice Course by VanVTT',
        image: require('../assets/images/course2.png'),
        color: AppColors.g100,
      },
      onPress: () => {},
    },
    {
      item: {
        id: '3',
        title: 'Java core',
        description: 'A Course Java Microservice Course by VanVTT',
        image: require('../assets/images/course3.png'),
        color: AppColors.p100,
      },
      onPress: () => {},
    },
  ],
};

export const allMyCourses = {
  items: [
    {
      item: {
        id: '1',
        title: 'Java Spring',
        description: 'A Course Java Microservice Course by VanVTT',
        image: require('../assets/images/course1.png'),
        color: AppColors.pr100,
      },
      onPress: () => {},
      isMyCourse: true,
    },
    {
      item: {
        id: '2',
        title: 'ASP.NET MVC web',
        description: 'A Course Java Microservice Course by VanVTT',
        image: require('../assets/images/course2.png'),
        color: AppColors.g100,
      },
      onPress: () => {},
      isMyCourse: true,
    },
    {
      item: {
        id: '3',
        title: 'Java core',
        description: 'A Course Java Microservice Course by VanVTT',
        image: require('../assets/images/course3.png'),
        color: AppColors.p100,
      },
      onPress: () => {},
      isMyCourse: true,
    },
  ],
};

export const cSharpMyCourses = {
  items: [
    {
      item: {
        id: '1',
        title: 'ASP.NET MVC web',
        description: 'A Course Java Microservice Course by VanVTT',
        image: require('../assets/images/course2.png'),
        color: AppColors.g100,
      },
      onPress: () => {},
      isMyCourse: true,
    },
    {
      item: {
        id: '2',
        title: 'C# Microservice',
        description: 'A Course Java Microservice Course by VanVTT',
        image: require('../assets/images/course3.png'),
        color: AppColors.p100,
      },
      onPress: () => {},
      isMyCourse: true,
    },
    {
      item: {
        id: '3',
        title: 'C# Unity',
        description: 'A Course Java Microservice Course by VanVTT',
        image: require('../assets/images/course1.png'),
        color: AppColors.pr100,
      },
      onPress: () => {},
      isMyCourse: true,
    },
  ],
};

export const javaMyCourses = {
  items: [
    {
      item: {
        id: '1',
        title: 'Java core',
        description: 'A Course Java Microservice Course by VanVTT',
        image: require('../assets/images/course3.png'),
        color: AppColors.p100,
      },
      onPress: () => {},
      isMyCourse: true,
    },
    {
      item: {
        id: '2',
        title: 'Java Spring',
        description: 'A Course Java Microservice Course by VanVTT',
        image: require('../assets/images/course2.png'),
        color: AppColors.g100,
      },
      onPress: () => {},
      isMyCourse: true,
    },
    {
      item: {
        id: '3',
        title: 'Java FX',
        description: 'A Course Java Microservice Course by VanVTT',
        image: require('../assets/images/course1.png'),
        color: AppColors.pr100,
      },
      onPress: () => {},
      isMyCourse: true,
    },
  ],
};

export const courseCategories = [
  {
    id: '1',
    title: 'AI',
    courseNumber: '15 Courses',
    image: AIIllustration,
    color: AppColors.b100,
  },
  {
    id: '2',
    title: 'Java',
    courseNumber: '15 Courses',
    image: JavaIllustration,
    color: AppColors.g100,
  },
  {
    id: '3',
    title: 'C#',
    courseNumber: '15 Courses',
    image: CSharpIllustration,
    color: AppColors.r100,
  },
  {
    id: '4',
    title: 'NodeJS',
    courseNumber: '15 Courses',
    image: NodeJSIllustration,
    color: AppColors.p100,
  },
];

export const courseCategoryList = {
  items: [
    {
      item: {
        id: '1',
        title: 'Java core',
        description: 'A Course Java Microservice Course by VanVTT',
        image: require('../assets/images/course3.png'),
        color: AppColors.p100,
      },
      onPress: () => {},
    },
    {
      item: {
        id: '2',
        title: 'Java Spring',
        description: 'A Course Java Microservice Course by VanVTT',
        image: require('../assets/images/course2.png'),
        color: AppColors.g100,
      },
      onPress: () => {},
    },
    {
      item: {
        id: '3',
        title: 'Java FX',
        description: 'A Course Java Microservice Course by VanVTT',
        image: require('../assets/images/course1.png'),
        color: AppColors.pr100,
      },
      onPress: () => {},
    },
    {
      item: {
        id: '4',
        title: 'JSP MVC',
        description: 'A Course Java Microservice Course by VanVTT',
        image: require('../assets/images/course3.png'),
        color: AppColors.p100,
      },
      onPress: () => {},
    },
    {
      item: {
        id: '5',
        title: 'Java Microservice',
        description: 'A Course Java Microservice Course by VanVTT',
        image: require('../assets/images/course2.png'),
        color: AppColors.g100,
      },
      onPress: () => {},
    },
    {
      item: {
        id: '6',
        title: 'Java ORM',
        description: 'A Course Java Microservice Course by VanVTT',
        image: require('../assets/images/course1.png'),
        color: AppColors.pr100,
      },
      onPress: () => {},
    },
  ],
};

export const navigationList = [
  {
    id: 1,
    title: 'Curriculum',
    leftIcon: CurriculumIcon,
    backGroundColor: AppColors.b100,
    rightIconColor: AppColors.b500,
    linkTo: 'CurriculumScreen',
  },
  {
    id: 2,
    title: 'Participants',
    leftIcon: ParticipantsIcon,
    backGroundColor: AppColors.pur100,
    rightIconColor: AppColors.pr500,
    linkTo: 'ParticipantsScreen',
  },
  {
    id: 3,
    title: 'Grades',
    leftIcon: GradeIcon,
    backGroundColor: AppColors.g100,
    rightIconColor: AppColors.g500,
    linkTo: 'GradesScreen',
  },
];

export const SyllabusList = [
  {
    id: 1,
    number: '01',
    title: 'Why using Java',
    linkFile: 'tutorial.pdf',
    rightIcon: DownloadIcon,
    detailNavigation: '',
    onAction: () => {},
  },
  {
    id: 2,
    number: '02',
    title: 'Setup Your Java env...',
    linkFile: 'setup.pdf',
    rightIcon: DownloadIcon,
    detailNavigation: '',
    onAction: () => {},
  },
];

export const PEList = [
  {
    id: 1,
    number: '01',
    title: 'PE',
    linkFile: 'pe.pdf',
    rightIcon: DownloadIcon,
    detailNavigation: '',
    onAction: () => {},
  },
  {
    id: 2,
    number: '02',
    title: 'Criteria',
    linkFile: 'criteria.pdf',
    rightIcon: DownloadIcon,
    detailNavigation: '',
    onAction: () => {},
  },
];

export const AssignmentList = [
  {
    id: 1,
    number: '01',
    title: 'Assignment 1',
    linkFile: 'asm1.pdf',
    rightIcon: DownloadIcon,
    detailNavigation: 'AssignmentDetailScreen',
    onAction: () => {},
  },
  {
    id: 2,
    number: '02',
    title: 'Assignment 2',
    linkFile: 'asm2.pdf',
    rightIcon: DownloadIcon,
    detailNavigation: 'AssignmentDetailScreen',
    onAction: () => {},
  },
];

export const participantList = [
  {
    id: 1,
    avatar: null,
    title: 'Le Thanh Binh',
    className: 'Group Name: Summer_SE1720',
    joinDate: 'Join 2 Weeks Agos',
    role: 'Student',
  },
  {
    id: 2,
    avatar: null,
    title: 'Le Thanh Binh',
    className: 'Group Name: Summer_SE1720',
    joinDate: 'Join 2 Weeks Agos',
    role: 'Student',
  },
  {
    id: 3,
    avatar: null,
    title: 'Le Thanh Binh',
    className: 'Group Name: Summer_SE1720',
    joinDate: 'Join 2 Weeks Agos',
    role: 'Student',
  },
  {
    id: 4,
    avatar: null,
    title: 'Le Thanh Binh',
    className: 'Group Name: Summer_SE1720',
    joinDate: 'Join 2 Weeks Agos',
    role: 'Student',
  },
  {
    id: 5,
    avatar: null,
    title: 'Le Thanh Binh',
    className: 'Group Name: Summer_SE1720',
    joinDate: 'Join 2 Weeks Agos',
    role: 'Student',
  },
  {
    id: 6,
    avatar: null,
    title: 'Le Thanh Binh',
    className: 'Group Name: Summer_SE1720',
    joinDate: 'Join 2 Weeks Agos',
    role: 'Student',
  },
  {
    id: 7,
    avatar: null,
    title: 'Le Thanh Binh',
    className: 'Group Name: Summer_SE1720',
    joinDate: 'Join 2 Weeks Agos',
    role: 'Student',
  },
  {
    id: 8,
    avatar: null,
    title: 'NguyenNT',
    className: 'Group Name: Summer_SE1720',
    joinDate: 'Join 2 Weeks Agos',
    role: 'Teacher',
  },
];

export const gradeExerciseList = [
  {
    id: 1,
    number: '01',
    title: 'Java Core',
    linkFile: '7 / 10',
    rightIcon: ViewIcon,
    detailNavigation: '',
    onAction: () => {},
  },
  {
    id: 2,
    number: '02',
    title: 'Setup Your Java env...',
    linkFile: '7 / 10',
    rightIcon: ViewIcon,
    detailNavigation: '',
    onAction: () => {},
  },
];

export const gradeAssignmentList = [
  {
    id: 1,
    number: '01',
    title: 'Assignment 1',
    linkFile: '7 / 10',
    rightIcon: ViewIcon,
    detailNavigation: 'AssignmentDetailScreen',
    onAction: () => {},
  },
  {
    id: 2,
    number: '02',
    title: 'Assignment 2',
    linkFile: '7 / 10',
    rightIcon: ViewIcon,
    detailNavigation: 'AssignmentDetailScreen',
    onAction: () => {},
  },
];
