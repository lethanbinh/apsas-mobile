import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import ScreenHeader from '../components/common/ScreenHeader';
import CurriculumList from '../components/courses/CurriculumList';
import AppSafeView from '../components/views/AppSafeView';
import {
  CourseElementData,
  fetchCourseElements,
} from '../api/courseElementService';
import { ViewIcon } from '../assets/icons/courses';
import AppText from '../components/texts/AppText';
import { showErrorToast } from '../components/toasts/AppToast';
import { AppColors } from '../styles/color';

const CurriculumTeacherScreen = () => {
  const route = useRoute();
  // Giữ semesterCourseId là string vì nó đến từ route params
  const semesterCourseId = (route.params as { semesterCourseId?: string })
    ?.semesterCourseId;

  const [isLoading, setIsLoading] = useState(true);
  // SỬA STATE TYPE: Dùng interface mới
  const [courseElements, setCourseElements] = useState<CourseElementData[]>([]);
  const navigation = useNavigation<any>();

  useEffect(() => {
    if (!semesterCourseId) {
      showErrorToast('Error', 'No Semester Course ID provided.');
      setIsLoading(false);
      return;
    }

    const loadElements = async () => {
      setIsLoading(true);
      try {
        const allElements = await fetchCourseElements();
        console.log('All elements:', allElements); // Log dữ liệu gốc
        console.log('Filtering by semesterCourseId:', semesterCourseId); // Log ID đang filter

        // SỬA FILTER LOGIC: So sánh number với Number(string)
        const relevantElements = allElements.filter(
          el => el.semesterCourseId === Number(semesterCourseId),
        );
        console.log('Relevant elements:', relevantElements); // Log kết quả filter
        setCourseElements(relevantElements);
      } catch (error: any) {
        showErrorToast('Error', 'Failed to load curriculum elements.');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadElements();
  }, [semesterCourseId]);

  // Hàm requestStoragePermission giữ nguyên

  // Hàm handleDownload giữ nguyên (vẫn dùng dummy URL và item.description)
  // LƯU Ý: `item.description` hiện tại là text ("First programming assignment"),
  // không phải URL file. Logic download này cần API trả về URL file thực tế.
  const requestStoragePermission = async () => {
    // ... (Giữ nguyên code của bạn)
  };

  const handleDownload = async (fileUrl: string, fileName: string) => {
    // ... (Giữ nguyên code của bạn)
    // LƯU Ý QUAN TRỌNG: sampleFileUrl đang lấy từ fileUrl (tức item.description từ API mới)
    // Điều này có thể không đúng nếu API không trả về URL file trong description.
    // Bạn cần xác nhận lại cấu trúc API hoặc điều chỉnh logic này.
    const sampleFileUrl =
      fileUrl ||
      'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
    // ... (Phần còn lại giữ nguyên)
  };

  // SỬA MAP LOGIC:
  const assignments = courseElements
    .filter(
      el =>
        !el.name.toLowerCase().includes('pe') &&
        !el.name.toLowerCase().includes('exam'),
    )
    .map((item, index) => ({
      id: String(item.id), // Chuyển sang string nếu CurriculumList cần
      number: `0${index + 1}`,
      title: item.name,
      // LƯU Ý: linkFile lấy từ description có thể không đúng với API mới
      linkFile: item.description,
      rightIcon: ViewIcon,
      onAction: () => {
        navigation.navigate('AssignmentDetailTeacherScreen', {
          elementId: item.id, // Truyền number ID
        });
      },
    }));

  const practicalExams = courseElements
    .filter(
      el =>
        el.name.toLowerCase().includes('pe') ||
        el.name.toLowerCase().includes('exam'), // Bao gồm cả exam
    )
    .map((item, index) => ({
      id: String(item.id), // Chuyển sang string nếu CurriculumList cần
      number: `0${index + 1}`,
      title: item.name,
      // LƯU Ý: linkFile lấy từ description có thể không đúng với API mới
      linkFile: item.description,
      rightIcon: ViewIcon,
      onAction: () => {
        navigation.navigate('PracticalExamDetailScreen', {
          elementId: item.id, // Truyền number ID
        });
      },
    }));

  // Phần còn lại của component (sections, isLoading, return JSX) giữ nguyên
  const sections = [
    { title: 'Assignments', data: assignments },
    { title: 'PE & Exams', data: practicalExams }, // Đổi title nếu muốn
  ];

  if (isLoading) {
    return (
      <AppSafeView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={AppColors.pr500} />
      </AppSafeView>
    );
  }

  return (
    <AppSafeView>
      <ScreenHeader title="Curriculum" />
      {courseElements.length > 0 ? (
        <CurriculumList
          sections={sections.filter(sec => sec.data.length > 0)}
          scrollEnabled={true}
        />
      ) : (
        <View style={styles.loadingContainer}>
          <AppText style={styles.emptyText}>
            No curriculum elements found for this course.
          </AppText>
        </View>
      )}
    </AppSafeView>
  );
};

export default CurriculumTeacherScreen;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.white,
  },
  emptyText: {
    textAlign: 'center',
    color: AppColors.n500,
  },
});
