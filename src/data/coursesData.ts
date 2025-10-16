import {
  AIIllustration,
  CSharpIllustration,
  CurriculumIcon,
  DownloadIcon,
  ExcelIcon,
  ExportExcelIcon,
  GradeIcon,
  JavaIllustration,
  NodeJSIllustration,
  ParticipantsIcon,
  ViewIcon,
} from '../assets/icons/courses';
import { GradingHistoryIcon, UploadIcon } from '../assets/icons/icon';
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

export const teacherNavigation = [
  {
    id: 1,
    title: 'Curriculum',
    leftIcon: CurriculumIcon,
    backGroundColor: AppColors.b100,
    rightIconColor: AppColors.b500,
    linkTo: 'CurriculumTeacherScreen',
  },
  {
    id: 2,
    title: 'Participants',
    leftIcon: ParticipantsIcon,
    backGroundColor: AppColors.pur100,
    rightIconColor: AppColors.pur500,
    linkTo: 'ParticipantsScreen',
  },
  {
    id: 3,
    title: 'Export grade report',
    leftIcon: ExcelIcon,
    rightIcon: ExportExcelIcon,
    backGroundColor: AppColors.g100,
    rightIconColor: AppColors.g500,
    linkTo: 'GradingHistoryScreen',
    onDownload: () => {},
  },
];

export const DocumentList = [
  {
    id: 1,
    number: '01',
    title: 'Requirement',
    linkFile: 'requirement.pdf',
    rightIcon: DownloadIcon,
    linkTo: '',
    detailNavigation: 'RequirementTeacherScreen',
    onAction: () => {},
  },
  {
    id: 2,
    number: '02',
    title: 'Database',
    linkFile: 'database.pdf',
    rightIcon: DownloadIcon,
    linkTo: '',
    onAction: () => {},
  },
];

export const SubmissionList = [
  {
    id: 1,
    number: '01',
    title: 'Lethanhbinh',
    linkFile: 'Score: 5/10',
    rightIcon: ViewIcon,
    linkTo: 'AssessmentDetailScreen',
    detailNavigation: 'AssessmentDetailScreen',
    onAction: () => {},
  },
  {
    id: 2,
    number: '02',
    title: 'lexuanphuongnam',
    linkFile: 'Score: 5/10',
    rightIcon: ViewIcon,
    linkTo: 'AssessmentDetailScreen',
    detailNavigation: 'AssessmentDetailScreen',
    onAction: () => {},
  },
];

export const SyllabusList = [
  {
    id: 1,
    number: '01',
    title: 'Requirement',
    linkFile: 'requirement.pdf',
    rightIcon: DownloadIcon,
    linkTo: '',
    detailNavigation: 'RequirementScreen',
    onAction: () => {},
  },
  {
    id: 2,
    number: '02',
    title: 'Database',
    linkFile: 'database.pdf',
    rightIcon: DownloadIcon,
    linkTo: '',
    onAction: () => {},
  },
];

export const PEList = [
  {
    id: 1,
    number: '01',
    title: 'PE1',
    linkFile: 'pe.pdf',
    rightIcon: ViewIcon,
    detailNavigation: 'AssignmentDetailScreen',
    onAction: () => {},
  },
  {
    id: 2,
    number: '02',
    title: 'PE2',
    linkFile: 'pe.pdf',
    rightIcon: ViewIcon,
    detailNavigation: 'AssignmentDetailScreen',
    onAction: () => {},
  },
];

export const AssignmentList = [
  {
    id: 1,
    number: '01',
    title: 'Assignment 1',
    linkFile: 'asm1.pdf',
    rightIcon: ViewIcon,
    detailNavigation: 'AssignmentDetailScreen',
    onAction: () => {},
  },
  {
    id: 2,
    number: '02',
    title: 'Assignment 2',
    linkFile: 'asm2.pdf',
    rightIcon: ViewIcon,
    detailNavigation: 'AssignmentDetailScreen',
    onAction: () => {},
  },
];

export const PETeacherList = [
  {
    id: 1,
    number: '01',
    title: 'PE1',
    linkFile: 'pe.pdf',
    rightIcon: ViewIcon,
    detailNavigation: 'PracticalExamDetailScreen',
    onAction: () => {},
  },
  {
    id: 2,
    number: '02',
    title: 'PE2',
    linkFile: 'pe.pdf',
    rightIcon: ViewIcon,
    detailNavigation: 'PracticalExamDetailScreen',
    onAction: () => {},
  },
];

export const AssignmentTeacherList = [
  {
    id: 1,
    number: '01',
    title: 'Assignment 1',
    linkFile: 'asm1.pdf',
    rightIcon: ViewIcon,
    detailNavigation: 'AssignmentDetailTeacherScreen',
    onAction: () => {},
  },
  {
    id: 2,
    number: '02',
    title: 'Assignment 2',
    linkFile: 'asm2.pdf',
    rightIcon: ViewIcon,
    detailNavigation: 'AssignmentDetailTeacherScreen',
    onAction: () => {},
  },
];

export const SyllabusListUpload = [
  {
    id: 1,
    number: '01',
    title: 'Why using Java',
    linkFile: 'tutorial.pdf',
    rightIcon: UploadIcon,
    detailNavigation: '',
    onAction: () => {},
  },
  {
    id: 2,
    number: '02',
    title: 'Setup Your Java env...',
    linkFile: 'setup.pdf',
    rightIcon: UploadIcon,
    detailNavigation: '',
    onAction: () => {},
  },
];

export const PEListUpload = [
  {
    id: 1,
    number: '01',
    title: 'PE1',
    linkFile: 'pe1.pdf',
    rightIcon: UploadIcon,
    detailNavigation: 'CreateAssessmentScreen',
    onAction: () => {},
  },
  {
    id: 2,
    number: '02',
    title: 'PE2',
    linkFile: 'pe2.pdf',
    rightIcon: UploadIcon,
    detailNavigation: 'CreateAssessmentScreen',
    onAction: () => {},
  },
];

export const AssignmentListUpload = [
  {
    id: 1,
    number: '01',
    title: 'Assignment 1',
    linkFile: 'asm1.pdf',
    rightIcon: UploadIcon,
    detailNavigation: 'CreateAssessmentScreen',
    onAction: () => {},
  },
  {
    id: 2,
    number: '02',
    title: 'Assignment 2',
    linkFile: 'asm2.pdf',
    rightIcon: UploadIcon,
    detailNavigation: 'CreateAssessmentScreen',
    onAction: () => {},
  },
];

export const submissionsAssignmentList = [
  {
    id: 1,
    number: '01',
    title: 'Assignment 1',
    linkFile: 'asm1.pdf',
    rightIcon: DownloadIcon,
    detailNavigation: 'ScoreDetailScreen',
    onAction: () => {},
  },
  {
    id: 2,
    number: '02',
    title: 'Assignment 2',
    linkFile: 'asm2.pdf',
    rightIcon: DownloadIcon,
    detailNavigation: 'ScoreDetailScreen',
    onAction: () => {},
  },
];

export const DocumentListUpload = [
  {
    id: 1,
    number: '01',
    title: 'Requirement',
    linkFile: 'requirement.pdf',
    rightIcon: UploadIcon,
    detailNavigation: '',
    onAction: () => {},
  },
  {
    id: 2,
    number: '02',
    title: 'Criteria',
    linkFile: 'criteria.pdf',
    rightIcon: UploadIcon,
    detailNavigation: '',
    onAction: () => {},
  },
  {
    id: 3,
    number: '03',
    title: 'Database',
    linkFile: 'database.pdf',
    rightIcon: UploadIcon,
    detailNavigation: '',
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

export const submissionList = [
  {
    id: 1,
    number: '01',
    title: 'Zipfile 1',
    linkFile: 'asm1.pdf',
    rightIcon: DownloadIcon,
    detailNavigation: 'ScoreDetailScreen',
    onAction: () => {},
  },
  {
    id: 2,
    number: '02',
    title: 'Zipfile 2',
    linkFile: 'asm1.pdf',
    rightIcon: DownloadIcon,
    detailNavigation: 'ScoreDetailScreen',
    onAction: () => {},
  },
];

export const initialCoursesData = [
  {
    id: '1',
    title: 'Capstone Project',
    status: 'Pending',
    assignments: [
      {
        id: 'a1',
        title: 'Assignment 1',
        hasTestCase: true,
        status: 'Pending',
        sections: [
          {
            title: 'Materials',
            data: [
              {
                id: 1,
                number: '01',
                title: 'Requirement',
                linkFile: 'requirement.pdf',
                rightIcon: UploadIcon,
                detailNavigation: '',
                onAction: () => {},
              },
              {
                id: 2,
                number: '02',
                title: 'Criteria',
                linkFile: 'criteria.pdf',
                rightIcon: UploadIcon,
                detailNavigation: '',
                onAction: () => {},
              },
              {
                id: 3,
                number: '03',
                title: 'Database file',
                linkFile: 'database.sql',
                rightIcon: UploadIcon,
                detailNavigation: '',
                onAction: () => {},
              },
            ],
          },
        ],
      },
      {
        id: 'a2',
        title: 'Assignment 2',
        hasTestCase: false,
        status: 'Approve',
        sections: [
          {
            title: 'Materials',
            data: [
              {
                id: 1,
                number: '01',
                title: 'Requirement',
                linkFile: 'requirement_lab.pdf',
                rightIcon: UploadIcon,
                detailNavigation: '',
                onAction: () => {},
              },
              {
                id: 2,
                number: '02',
                title: 'Criteria',
                linkFile: 'criteria_lab.pdf',
                rightIcon: UploadIcon,
                detailNavigation: '',
                onAction: () => {},
              },
              {
                id: 3,
                number: '03',
                title: 'Database file',
                linkFile: 'lab_db.sql',
                rightIcon: UploadIcon,
                detailNavigation: '',
                onAction: () => {},
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: '2',
    title: 'Lab211 Java',
    status: 'Approve',
    assignments: [
      {
        id: 'a3',
        title: 'Assignment 1',
        hasTestCase: true,
        status: 'Approve',
        sections: [
          {
            title: 'Materials',
            data: [
              {
                id: 1,
                number: '01',
                title: 'Requirement',
                linkFile: 'lab_requirement.pdf',
                rightIcon: UploadIcon,
                detailNavigation: '',
                onAction: () => {},
              },
              {
                id: 2,
                number: '02',
                title: 'Criteria',
                linkFile: 'lab_criteria.pdf',
                rightIcon: UploadIcon,
                detailNavigation: '',
                onAction: () => {},
              },
              {
                id: 3,
                number: '03',
                title: 'Database file',
                linkFile: 'lab_database.sql',
                rightIcon: UploadIcon,
                detailNavigation: '',
                onAction: () => {},
              },
            ],
          },
        ],
      },
    ],
  },
];
