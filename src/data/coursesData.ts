import {
  AIIllustration,
  CSharpIllustration,
  JavaIllustration,
  NodeJSIllustration,
} from '../assets/icons/courses';
import { AppColors } from '../styles/color';

export const allCourses = [
  {
    id: '1',
    title: 'Java Spring',
    description: 'A Course Java Microservice Course by VanVTT',
    image: require('../assets/images/course1.png'),
    color: AppColors.pr100,
  },
  {
    id: '2',
    title: 'ASP.NET MVC web',
    description: 'A Course Java Microservice Course by VanVTT',
    image: require('../assets/images/course2.png'),
    color: AppColors.g100,
  },
  {
    id: '3',
    title: 'Java core',
    description: 'A Course Java Microservice Course by VanVTT',
    image: require('../assets/images/course3.png'),
    color: AppColors.p100,
  },
];

export const cSharpCourses = [
  {
    id: '1',
    title: 'ASP.NET MVC web',
    description: 'A Course Java Microservice Course by VanVTT',
    image: require('../assets/images/course2.png'),
    color: AppColors.g100,
  },
  {
    id: '2',
    title: 'C# Microservice',
    description: 'A Course Java Microservice Course by VanVTT',
    image: require('../assets/images/course3.png'),
    color: AppColors.p100,
  },
  {
    id: '3',
    title: 'C# Unity',
    description: 'A Course Java Microservice Course by VanVTT',
    image: require('../assets/images/course1.png'),
    color: AppColors.pr100,
  },
];

export const javaCourses = [
  {
    id: '1',
    title: 'Java core',
    description: 'A Course Java Microservice Course by VanVTT',
    image: require('../assets/images/course3.png'),
    color: AppColors.p100,
  },
  {
    id: '2',
    title: 'Java Spring',
    description: 'A Course Java Microservice Course by VanVTT',
    image: require('../assets/images/course2.png'),
    color: AppColors.g100,
  },
  {
    id: '3',
    title: 'Java FX',
    description: 'A Course Java Microservice Course by VanVTT',
    image: require('../assets/images/course1.png'),
    color: AppColors.pr100,
  },
];

export const CourseCategories = [
  {
    id: '1',
    title: 'AI',
    CourseNumber: '15 Courses',
    image: AIIllustration,
    color: AppColors.b100,
  },
  {
    id: '2',
    title: 'Java',
    CourseNumber: '15 Courses',
    image: JavaIllustration,
    color: AppColors.g100,
  },
  {
    id: '3',
    title: 'C#',
    CourseNumber: '15 Courses',
    image: CSharpIllustration,
    color: AppColors.r100,
  },
  {
    id: '4',
    title: 'NodeJS',
    CourseNumber: '15 Courses',
    image: NodeJSIllustration,
    color: AppColors.p100,
  },
];
