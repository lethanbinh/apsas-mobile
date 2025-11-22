import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { s, vs } from 'react-native-size-matters';
import { AppColors } from '../../styles/color';
import AppButton from '../buttons/AppButton';
import AppText from '../texts/AppText';
import dayjs from 'dayjs';

interface AssessmentTemplate {
  id: number;
  name: string;
  description: string;
  courseElementName: string;
  lecturerName: string;
  lecturerCode: string;
  createdAt: string;
  courseElementId: number;
  templateType: number;
  status?: number;
}

interface TemplateTableProps {
  isLoading: boolean;
  data: AssessmentTemplate[];
  onView: (template: AssessmentTemplate) => void | Promise<void>;
}

const TemplateTable = ({ isLoading, data, onView }: TemplateTableProps) => {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const total = data.length;
  const totalPages = Math.ceil(total / pageSize);
  const pagedData = data.slice((page - 1) * pageSize, page * pageSize);
  const scrollViewRef = useRef<ScrollView>(null);
  const lastScrollX = useRef(0);

  useEffect(() => {
    setPage(1);
  }, [data]);

  const handleNext = () => {
    if (page < totalPages) setPage(prev => prev + 1);
  };

  const handlePrevious = () => {
    if (page > 1) setPage(prev => prev - 1);
  };


  const renderHeader = () => (
    <View style={[styles.row, styles.headerRow]}>
      <Text style={[styles.headerText, styles.idCol]}>ID</Text>
      <Text style={[styles.headerText, styles.nameCol]}>Template Name</Text>
      <Text style={[styles.headerText, styles.descriptionCol]}>Description</Text>
      <Text style={[styles.headerText, styles.courseElementCol]}>Course Element</Text>
      <Text style={[styles.headerText, styles.lecturerCol]}>Lecturer</Text>
      <Text style={[styles.headerText, styles.dateCol]}>Created At</Text>
      <Text style={[styles.headerText, styles.actionCol]}>Action</Text>
    </View>
  );

  const renderItem = ({ item }: { item: AssessmentTemplate }) => (
    <View style={styles.row}>
      <Text style={[styles.text, styles.idCol]}>{item.id}</Text>
      <Text style={[styles.text, styles.nameCol]} numberOfLines={1}>
        {item.name}
      </Text>
      <Text style={[styles.text, styles.descriptionCol]} numberOfLines={2}>
        {item.description || 'No description'}
      </Text>
      <Text style={[styles.text, styles.courseElementCol]} numberOfLines={1}>
        {item.courseElementName}
      </Text>
      <Text style={[styles.text, styles.lecturerCol]} numberOfLines={1}>
        {item.lecturerName} ({item.lecturerCode})
      </Text>
      <Text style={[styles.text, styles.dateCol]}>
        {dayjs(item.createdAt).format('MMM DD, YYYY HH:mm')}
      </Text>
      <View style={styles.actionCol}>
        <AppButton
          title="View"
          onPress={() => onView(item)}
          size="small"
          variant="primary"
          style={styles.viewButton}
          textVariant="label12pxRegular"
        />
      </View>
    </View>
  );

  return (
    <View style={styles.wrapper}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={true}
        style={styles.horizontalScroll}
        contentContainerStyle={styles.horizontalScrollContent}
        nestedScrollEnabled={true}
        bounces={false}
        scrollEnabled={true}
        onScroll={(event) => {
          lastScrollX.current = event.nativeEvent.contentOffset.x;
        }}
        scrollEventThrottle={16}
        directionalLockEnabled={false}
      >
        <View style={styles.tableContainer}>
          {renderHeader()}
          {isLoading ? (
            <ActivityIndicator size="large" style={styles.loadingIndicator} />
          ) : (
            <View>
              {pagedData.map((item) => (
                <View key={item.id.toString()}>
                  {renderItem({ item })}
                </View>
              ))}
              {pagedData.length === 0 && (
                <View style={styles.emptyContainer}>
                  <AppText style={styles.emptyText}>No templates found</AppText>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {total > pageSize && (
        <View style={styles.paginationContainer}>
          <TouchableOpacity
            onPress={handlePrevious}
            disabled={page === 1 || isLoading}
            style={[
              styles.pageButton,
              (page === 1 || isLoading) && styles.disabledButton,
            ]}
          >
            <Text
              style={[
                styles.pageText,
                (page === 1 || isLoading) && styles.disabledText,
              ]}
            >
              Previous
            </Text>
          </TouchableOpacity>

          <Text style={styles.pageInfo}>
            {total > 0
              ? `${(page - 1) * pageSize + 1}-${Math.min(
                  page * pageSize,
                  total,
                )} of ${total}`
              : '0 of 0'}
          </Text>

          <TouchableOpacity
            onPress={handleNext}
            disabled={page === totalPages || isLoading}
            style={[
              styles.pageButton,
              (page === totalPages || isLoading) && styles.disabledButton,
            ]}
          >
            <Text
              style={[
                styles.pageText,
                (page === totalPages || isLoading) && styles.disabledText,
              ]}
            >
              Next
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: AppColors.white,
    borderRadius: s(8),
    marginBottom: vs(20),
  },
  horizontalScroll: {
    width: '100%',
  },
  horizontalScrollContent: {
    flexGrow: 1,
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: AppColors.n200,
    borderRadius: s(8),
    minWidth: s(1000),
    backgroundColor: AppColors.white,
  },
  loadingIndicator: {
    marginTop: vs(50),
    alignSelf: 'center',
    height: vs(300),
  },
  emptyContainer: {
    padding: vs(30),
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: AppColors.n500,
    fontSize: s(14),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: vs(12),
    paddingHorizontal: s(8),
    borderBottomWidth: 1,
    borderBottomColor: AppColors.n100,
    minHeight: vs(50),
  },
  headerRow: {
    backgroundColor: AppColors.n100,
  },
  headerText: {
    fontSize: s(13),
    fontWeight: '600',
    color: AppColors.n700,
  },
  text: {
    fontSize: s(13),
    color: AppColors.n800,
  },
  idCol: { width: s(60), paddingHorizontal: s(4) },
  nameCol: { width: s(180), paddingHorizontal: s(4) },
  descriptionCol: { width: s(220), paddingHorizontal: s(4) },
  courseElementCol: { width: s(180), paddingHorizontal: s(4) },
  lecturerCol: { width: s(180), paddingHorizontal: s(4) },
  dateCol: { width: s(140), paddingHorizontal: s(4) },
  actionCol: { width: s(100), alignItems: 'center', paddingHorizontal: s(4) },
  viewButton: {
    paddingHorizontal: s(12),
    paddingVertical: vs(6),
    minWidth: s(70),
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: vs(12),
    gap: s(20),
    marginBottom: vs(20),
  },
  pageButton: {
    paddingVertical: vs(6),
    paddingHorizontal: s(14),
    borderWidth: 1,
    borderColor: AppColors.n300,
    borderRadius: s(6),
  },
  disabledButton: {
    borderColor: AppColors.n200,
    backgroundColor: AppColors.n100,
  },
  pageText: { color: AppColors.n700, fontSize: s(13) },
  disabledText: { color: AppColors.n400 },
  pageInfo: { fontSize: s(13), color: AppColors.n600 },
});

export default TemplateTable;

