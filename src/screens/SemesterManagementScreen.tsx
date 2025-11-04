import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { s, vs } from 'react-native-size-matters';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  deleteSemester,
  fetchSemesters,
  SemesterData,
} from '../api/semesterService';
import AppButton from '../components/buttons/AppButton';
import ScreenHeader from '../components/common/ScreenHeader';
import DeleteConfirmModal from '../components/modals/DeleteConfirmModal';
import SemesterCrudModal from '../components/modals/SemesterCrudModal';
import AppText from '../components/texts/AppText';
import {
  showErrorToast,
  showSuccessToast,
} from '../components/toasts/AppToast';
import AppSafeView from '../components/views/AppSafeView';
import { AppColors } from '../styles/color';

dayjs.extend(utc);

const formatUtcDate = (dateString: string, formatStr: string) => {
  if (!dateString) return 'N/A';
  const date = dayjs.utc(dateString).local();
  return date.format(formatStr);
};

const SemesterManagementScreen = () => {
  const [semesters, setSemesters] = useState<SemesterData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSemester, setEditingSemester] = useState<SemesterData | null>(
    null,
  );

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [deletingSemester, setDeletingSemester] = useState<SemesterData | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchSemestersList = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchSemesters({ pageNumber: 1, pageSize: 1000 });
      setSemesters(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load data.');
      showErrorToast('Error', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSemestersList();
  }, [fetchSemestersList]);

  const handleOpenCreate = () => {
    setEditingSemester(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (record: SemesterData) => {
    setEditingSemester(record);
    setIsModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsModalOpen(false);
    setIsDeleteModalVisible(false);
    setEditingSemester(null);
    setDeletingSemester(null);
  };

  const handleSuccess = () => {
    handleCloseModals();
    fetchSemestersList();
  };

  const handleOpenDelete = (record: SemesterData) => {
    setDeletingSemester(record);
    setIsDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingSemester) return;
    setIsDeleting(true);
    try {
      await deleteSemester(deletingSemester.id);
      showSuccessToast('Success', 'Semester deleted successfully.');
      handleSuccess();
    } catch (err: any) {
      showErrorToast('Error', err.message || 'Failed to delete semester.');
    } finally {
      setIsDeleting(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.rowHeader}>
      <AppText style={[styles.cell, styles.headerText, styles.cellCode]}>
        Code
      </AppText>
      <AppText style={[styles.cell, styles.headerText, styles.cellYear]}>
        Year
      </AppText>
      <AppText style={[styles.cell, styles.headerText, styles.cellDate]}>
        Start Date
      </AppText>
      <AppText style={[styles.cell, styles.headerText, styles.cellDate]}>
        End Date
      </AppText>
      <AppText style={[styles.cell, styles.headerText, styles.cellNote]}>
        Note
      </AppText>
      <AppText style={[styles.cell, styles.headerText, styles.cellActions]}>
        Actions
      </AppText>
    </View>
  );

  const renderItem = ({ item }: { item: SemesterData }) => (
    <View style={styles.row}>
      <AppText style={[styles.cell, styles.cellCode]} numberOfLines={1}>
        {item.semesterCode}
      </AppText>
      <AppText style={[styles.cell, styles.cellYear]} numberOfLines={1}>
        {item.academicYear}
      </AppText>
      <AppText style={[styles.cell, styles.cellDate]} numberOfLines={1}>
        {formatUtcDate(item.startDate, 'DD/MM/YYYY')}
      </AppText>
      <AppText style={[styles.cell, styles.cellDate]} numberOfLines={1}>
        {formatUtcDate(item.endDate, 'DD/MM/YYYY')}
      </AppText>
      <AppText style={[styles.cell, styles.cellNote]} numberOfLines={1}>
        {item.note}
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
      <ScreenHeader title="Semester Management" />

      <View style={styles.container}>
        <AppButton
          title="Create Semester"
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
            <AppButton title="Retry" onPress={fetchSemestersList} />
          </View>
        )}
        {!loading && !error && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View>
              <FlatList
                data={semesters}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                ListHeaderComponent={renderHeader}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </ScrollView>
        )}
      </View>

      <SemesterCrudModal
        visible={isModalOpen}
        onClose={handleCloseModals}
        onSuccess={handleSuccess}
        initialData={editingSemester}
        existingSemesters={semesters}
      />

      <DeleteConfirmModal
        visible={isDeleteModalVisible}
        onClose={handleCloseModals}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Delete Semester?"
        description={`Are you sure you want to delete "${deletingSemester?.semesterCode}"? This action cannot be undone.`}
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
    width: s(150),
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
    alignItems: 'center',
  },
  cell: {
    padding: s(10),
    fontSize: s(13),
    color: AppColors.n800,
    borderRightWidth: 1,
    borderColor: AppColors.n200,
    textAlignVertical: 'center',
  },
  headerText: {
    fontWeight: 'bold',
    color: AppColors.n900,
  },
  cellCode: {
    width: s(120),
  },
  cellYear: {
    width: s(80),
  },
  cellDate: {
    width: s(120),
  },
  cellNote: {
    width: s(200),
  },
  cellActions: {
    width: s(100),
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

export default SemesterManagementScreen;
