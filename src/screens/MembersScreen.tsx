import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { s, vs } from 'react-native-size-matters';
import { useRoute } from '@react-navigation/native';
import { getStudentsInClass } from '../api/studentGroupService';
import { getStudentById, StudentDetail } from '../api/studentService';
import { StudentGroupData } from '../api/studentGroupService';
import AppSafeView from '../components/views/AppSafeView';
import ScreenHeader from '../components/common/ScreenHeader';
import AppText from '../components/texts/AppText';
import { showErrorToast } from '../components/toasts/AppToast';
import { AppColors } from '../styles/color';
import Feather from 'react-native-vector-icons/Feather';

interface Member {
  key: string;
  no: number;
  email: string;
  fullName: string;
  date: string;
  role: 'Student';
  class: string;
}

const MembersScreen = () => {
  const route = useRoute();
  const classId = (route.params as { classId?: string | number })?.classId;
  const [searchText, setSearchText] = useState('');
  const [memberData, setMemberData] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(true);

  useEffect(() => {
    setIsMounted(true);

    const fetchMembers = async () => {
      if (!classId) {
        if (isMounted) {
          showErrorToast('Error', 'No Class ID provided.');
          setIsLoading(false);
        }
        return;
      }

      if (!isMounted) return;
      setIsLoading(true);

      try {
        const studentGroup = await getStudentsInClass(classId);

        if (!isMounted) return;

        const detailPromises = (studentGroup || [])
          .filter(s => s && s.studentId)
          .map(s =>
            getStudentById(s.studentId).catch(err => {
              console.error(`Failed to fetch student ${s.studentId}:`, err);
              return null;
            }),
          );
        const studentDetails = await Promise.all(detailPromises);

        if (!isMounted) return;

        const combinedData: Member[] = (studentGroup || [])
          .filter(s => s && s.id && s.studentId)
          .map((enrolledStudent, index) => {
            try {
              const detail = studentDetails.find(
                d => d && d.studentId && enrolledStudent.studentId && d.studentId === enrolledStudent.studentId.toString(),
              );

              let enrollmentDate = 'N/A';
              try {
                if (enrolledStudent.enrollmentDate && typeof enrolledStudent.enrollmentDate === 'string') {
                  const dateParts = enrolledStudent.enrollmentDate.split(' ');
                  if (dateParts.length > 0 && dateParts[0]) {
                    enrollmentDate = dateParts[0];
                  }
                }
              } catch (dateErr) {
                console.error('Error parsing enrollment date:', dateErr);
              }

              return {
                key: String(enrolledStudent.id),
                no: index + 1,
                email: (detail && detail.email) ? detail.email : 'N/A',
                fullName: (detail && detail.fullName) 
                  ? detail.fullName
                  : (enrolledStudent.studentName || 'N/A'),
                date: enrollmentDate,
                role: 'Student' as const,
                class: enrolledStudent.classCode || 'N/A',
              };
            } catch (itemErr) {
              console.error('Error processing member item:', itemErr);
              return null;
            }
          })
          .filter((item): item is Member => item !== null);

        setMemberData(combinedData);
      } catch (error: any) {
        console.error('Failed to fetch class members:', error);
        if (isMounted) {
          showErrorToast('Error', 'Failed to load class members.');
          setMemberData([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchMembers();

    return () => {
      setIsMounted(false);
    };
  }, [classId]);

  const filteredData = memberData.filter(member => {
    try {
      if (!member || !member.fullName || !member.email) return false;
      const searchLower = searchText.toLowerCase();
      return member.fullName.toLowerCase().includes(searchLower) ||
             member.email.toLowerCase().includes(searchLower);
    } catch (err) {
      console.error('Error filtering members:', err);
      return false;
    }
  });

  const renderMemberItem = ({ item }: { item: Member }) => (
    <View style={styles.memberCard}>
      <View style={styles.memberHeader}>
        <View style={styles.memberNumber}>
          <AppText variant="body14pxBold" style={styles.numberText}>
            {item.no}
          </AppText>
        </View>
        <View style={styles.memberInfo}>
          <AppText variant="body14pxBold" style={styles.memberName}>
            {item.fullName}
          </AppText>
          <AppText variant="body12pxRegular" style={styles.memberEmail}>
            {item.email}
          </AppText>
        </View>
      </View>
      <View style={styles.memberDetails}>
        <View style={styles.detailRow}>
          <Feather name="calendar" size={s(14)} color={AppColors.n500} />
          <AppText variant="body12pxRegular" style={styles.detailText}>
            {item.date}
          </AppText>
        </View>
        <View style={styles.detailRow}>
          <Feather name="users" size={s(14)} color={AppColors.n500} />
          <AppText variant="body12pxRegular" style={styles.detailText}>
            {item.class}
          </AppText>
        </View>
        <View style={styles.detailRow}>
          <Feather name="tag" size={s(14)} color={AppColors.n500} />
          <AppText variant="body12pxRegular" style={styles.detailText}>
            {item.role}
          </AppText>
        </View>
      </View>
    </View>
  );

  return (
    <AppSafeView style={styles.container}>
      <ScreenHeader title="Class Members" />
      <View style={styles.contentContainer}>
        <View style={styles.searchContainer}>
          <Feather
            name="search"
            size={s(18)}
            color={AppColors.n500}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search members..."
            placeholderTextColor={AppColors.n400}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {isLoading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={AppColors.pr500} />
          </View>
        ) : (
          <FlatList
            data={filteredData}
            renderItem={renderMemberItem}
            keyExtractor={item => item.key}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <AppText variant="body14pxRegular" style={styles.emptyText}>
                  No members found.
                </AppText>
              </View>
            }
          />
        )}
      </View>
    </AppSafeView>
  );
};

export default MembersScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.white,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: s(20),
    paddingTop: vs(16),
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.n50,
    borderRadius: s(8),
    paddingHorizontal: s(12),
    marginBottom: vs(16),
    borderWidth: 1,
    borderColor: AppColors.n200,
  },
  searchIcon: {
    marginRight: s(8),
  },
  searchInput: {
    flex: 1,
    fontSize: s(14),
    color: AppColors.black,
    paddingVertical: vs(10),
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: vs(20),
  },
  memberCard: {
    backgroundColor: AppColors.white,
    borderRadius: s(12),
    padding: s(16),
    marginBottom: vs(12),
    borderWidth: 1,
    borderColor: AppColors.n200,
    shadowColor: AppColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(12),
  },
  memberNumber: {
    width: s(32),
    height: s(32),
    borderRadius: s(16),
    backgroundColor: AppColors.pr100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: s(12),
  },
  numberText: {
    color: AppColors.pr500,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    color: AppColors.black,
    marginBottom: vs(4),
  },
  memberEmail: {
    color: AppColors.n600,
  },
  memberDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: s(12),
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: s(16),
  },
  detailText: {
    marginLeft: s(6),
    color: AppColors.n600,
  },
  emptyContainer: {
    paddingVertical: vs(60),
    alignItems: 'center',
  },
  emptyText: {
    color: AppColors.n500,
    textAlign: 'center',
  },
});

