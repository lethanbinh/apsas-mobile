import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { s, vs } from 'react-native-size-matters';

import Ionicons from 'react-native-vector-icons/Ionicons';
import { CourseData, deleteCourse, fetchCourses } from '../api/courseService';
import AppButton from '../components/buttons/AppButton';
import ScreenHeader from '../components/common/ScreenHeader';
import CourseManageModal from '../components/modals/CourseManageModal';
import DeleteConfirmModal from '../components/modals/DeleteConfirmModal';
import AppText from '../components/texts/AppText';
import {
    showErrorToast,
    showSuccessToast,
} from '../components/toasts/AppToast';
import AppSafeView from '../components/views/AppSafeView';
import { AppColors } from '../styles/color';

const CourseManagementScreen = () => {
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseData | null>(null);

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [deletingCourse, setDeletingCourse] = useState<CourseData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCoursesList = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchCourses();
      setCourses(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load data.');
      showErrorToast('Error', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoursesList();
  }, [fetchCoursesList]);

  const existingCodes = useMemo(
    () => courses.map(c => c.code.toLowerCase()),
    [courses],
  );

  const handleOpenCreate = () => {
    setEditingCourse(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (record: CourseData) => {
    setEditingCourse(record);
    setIsModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsModalOpen(false);
    setIsDeleteModalVisible(false);
    setEditingCourse(null);
    setDeletingCourse(null);
  };

  const handleSuccess = () => {
    handleCloseModals();
    fetchCoursesList();
  };

  const handleOpenDelete = (record: CourseData) => {
    setDeletingCourse(record);
    setIsDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingCourse) return;
    setIsDeleting(true);
    try {
      await deleteCourse(deletingCourse.id);
      showSuccessToast('Success', 'Course deleted successfully.');
      handleSuccess();
    } catch (err: any) {
      showErrorToast('Error', err.message || 'Failed to delete course.');
    } finally {
      setIsDeleting(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.rowHeader}>
      <AppText style={[styles.cell, styles.headerText, styles.cellCode]}>
        Code
      </AppText>
      <AppText style={[styles.cell, styles.headerText, styles.cellName]}>
        Name
      </AppText>
      <AppText style={[styles.cell, styles.headerText, styles.cellDesc]}>
        Description
      </AppText>
      <AppText style={[styles.cell, styles.headerText, styles.cellActions]}>
        Actions
      </AppText>
    </View>
  );

  const renderItem = ({ item }: { item: CourseData }) => (
    <View style={styles.row}>
      <AppText style={[styles.cell, styles.cellCode]}>{item.code}</AppText>
      <AppText style={[styles.cell, styles.cellName]}>{item.name}</AppText>
      <AppText style={[styles.cell, styles.cellDesc]} numberOfLines={1}>
        {item.description}
      </AppText>
      <View style={[styles.cell, styles.cellActions, styles.actionCell]}>
        <TouchableOpacity
          onPress={() => handleOpenEdit(item)}
          style={styles.actionButton}
        >
          <Ionicons name="pencil" size={s(16)} color={AppColors.pr500} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleOpenDelete(item)}
          style={styles.actionButton}
        >
          <Ionicons name="trash" size={s(16)} color={AppColors.r500} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <AppSafeView style={styles.safeView}>
      <ScreenHeader title="Course Management" />

      <View style={styles.container}>
        <AppButton
          title="Create Course"
          onPress={handleOpenCreate}
          style={styles.createButton}
          size='small'
          leftIcon={
            <Ionicons name="add" size={s(16)} color={AppColors.white} />
          }
        />

        {loading && <ActivityIndicator size="large" style={styles.loader} />}
        {error && !loading && (
          <View style={styles.errorContainer}>
            <AppText style={styles.errorText}>{error}</AppText>
            <AppButton title="Retry" onPress={fetchCoursesList} />
          </View>
        )}
        {!loading && !error && (
          <FlatList
            data={courses}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            ListHeaderComponent={renderHeader}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <CourseManageModal
        visible={isModalOpen}
        onClose={handleCloseModals}
        onSuccess={handleSuccess}
        initialData={editingCourse}
        existingCodes={existingCodes}
      />

      <DeleteConfirmModal
        visible={isDeleteModalVisible}
        onClose={handleCloseModals}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Delete Course?"
        description={`Are you sure you want to delete "${deletingCourse?.name}"? This action cannot be undone.`}
      />
    </AppSafeView>
  );
};

const styles = StyleSheet.create({
  safeView: {
    flex: 1,
    backgroundColor: AppColors.white,
  },
  container: {
    flex: 1,
    paddingHorizontal: s(20),
    paddingTop: vs(10),
  },
  createButton: {
    marginBottom: vs(15),
    width: s(140),
    alignSelf: 'flex-end',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: AppColors.r500,
    marginBottom: vs(10),
  },
  rowHeader: {
    flexDirection: 'row',
    backgroundColor: AppColors.n100,
    borderBottomWidth: 1,
    borderColor: AppColors.n300,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: AppColors.n100,
  },
  cell: {
    padding: s(10),
    fontSize: s(13),
    color: AppColors.n800,
  },
  headerText: {
    fontWeight: 'bold',
    color: AppColors.n900,
  },
  cellCode: {
    flex: 2,
  },
  cellName: {
    flex: 3,
  },
  cellDesc: {
    flex: 4,
  },
  cellActions: {
    flex: 2,
  },
  actionCell: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  actionButton: {
    padding: s(5),
  },
});

export default CourseManagementScreen;
