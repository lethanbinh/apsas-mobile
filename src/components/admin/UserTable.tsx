import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { s, vs } from 'react-native-size-matters';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AppColors } from '../../styles/color';

interface User {
  id: number;
  name: string;
  address: string;
  gender: string;
  studentCode: string;
  status: 'Active' | 'Banned' | 'Rejected';
  date: string;
  phone: string;
  avatar?: string;
}

const generateFakeUsers = (count: number): User[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    address: `Street ${i + 1}, City`,
    gender: i % 2 === 0 ? 'Male' : 'Female',
    studentCode: `STU${1000 + i}`,
    status: i % 3 === 0 ? 'Active' : i % 3 === 1 ? 'Banned' : 'Rejected',
    date: `2025-10-${(i % 30) + 1}`,
    phone: `090${(1000000 + i).toString().slice(0, 7)}`,
    avatar: `https://randomuser.me/api/portraits/${
      i % 2 === 0 ? 'men' : 'women'
    }/${i % 50}.jpg`,
  }));
};

const UserTable = () => {
  const fakeUsers = generateFakeUsers(120);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const total = fakeUsers.length;
  const totalPages = Math.ceil(total / pageSize);

  const pagedData = fakeUsers.slice((page - 1) * pageSize, page * pageSize);

  const handleNext = () => {
    if (page < totalPages) setPage(prev => prev + 1);
  };
  const handlePrevious = () => {
    if (page > 1) setPage(prev => prev - 1);
  };

  const renderHeader = () => (
    <View style={[styles.row, styles.headerRow]}>
      <Ionicons
        name="checkbox-outline"
        size={18}
        color={AppColors.n500}
        style={styles.cellIcon}
      />
      <View style={styles.starCol} />
      <Text style={[styles.headerText, styles.nameCol]}>Client Name</Text>
      <Text style={[styles.headerText, styles.addressCol]}>Address</Text>
      <Text style={[styles.headerText, styles.genderCol]}>Gender</Text>
      <Text style={[styles.headerText, styles.codeCol]}>Student Code</Text>
      <Text style={[styles.headerText, styles.statusCol]}>Status</Text>
      <Text style={[styles.headerText, styles.dateCol]}>Date</Text>
      <Text style={[styles.headerText, styles.phoneCol]}>Phone</Text>
    </View>
  );

  const renderItem = ({ item }: { item: User }) => (
    <View style={styles.row}>
      <Ionicons
        name="square-outline"
        size={18}
        color={AppColors.n400}
        style={styles.cellIcon}
      />
      <Ionicons
        name="star-outline"
        size={16}
        color={AppColors.n400}
        style={styles.starCol}
      />

      <View style={[styles.nameCol, styles.userInfo]}>
        <Image
          source={{
            uri:
              item.avatar ||
              'https://cdn-icons-png.flaticon.com/512/847/847969.png',
          }}
          style={styles.avatar}
        />
        <Text style={styles.nameText}>{item.name}</Text>
      </View>

      <Text style={[styles.text, styles.addressCol]} numberOfLines={1}>
        {item.address}
      </Text>
      <Text style={[styles.text, styles.genderCol]}>{item.gender}</Text>
      <Text style={[styles.text, styles.codeCol]}>{item.studentCode}</Text>

      <View style={[styles.statusBadge, getStatusBadgeStyle(item.status)]}>
        <Text style={getStatusTextStyle(item.status)}>{item.status}</Text>
      </View>

      <Text style={[styles.text, styles.dateCol]}>{item.date}</Text>
      <Text style={[styles.text, styles.phoneCol]}>{item.phone}</Text>
    </View>
  );

  return (
    <View style={styles.wrapper}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.tableContainer}>
          {renderHeader()}
          <FlatList
            data={pagedData}
            renderItem={renderItem}
            keyExtractor={item => item.id.toString()}
            showsVerticalScrollIndicator={true} // ✅ cho phép scroll dọc mượt
            nestedScrollEnabled={true} // ✅ quan trọng cho Android
          />
        </View>
      </ScrollView>

      {/* Pagination */}
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          onPress={handlePrevious}
          disabled={page === 1}
          style={[styles.pageButton, page === 1 && styles.disabledButton]}
        >
          <Text style={[styles.pageText, page === 1 && styles.disabledText]}>
            Previous
          </Text>
        </TouchableOpacity>

        <Text style={styles.pageInfo}>
          {`${(page - 1) * pageSize + 1}-${Math.min(
            page * pageSize,
            total,
          )} of ${total}`}
        </Text>

        <TouchableOpacity
          onPress={handleNext}
          disabled={page === totalPages}
          style={[
            styles.pageButton,
            page === totalPages && styles.disabledButton,
          ]}
        >
          <Text
            style={[
              styles.pageText,
              page === totalPages && styles.disabledText,
            ]}
          >
            Next
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ✅ helper styles
const getStatusBadgeStyle = (status: string) => ({
  backgroundColor:
    status === 'Active'
      ? AppColors.g100
      : status === 'Banned'
      ? AppColors.r100
      : AppColors.p100,
});
const getStatusTextStyle = (status: string) => ({
  fontSize: s(12),
  fontWeight: '600' as const,
  color:
    status === 'Active'
      ? AppColors.g500
      : status === 'Banned'
      ? AppColors.r500
      : AppColors.p500,
});

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: AppColors.white,
    borderRadius: s(8),
    flex: 1,
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: AppColors.n200,
    borderRadius: s(8),
    minWidth: s(900),
    backgroundColor: AppColors.white,
    flexGrow: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: vs(10),
    paddingHorizontal: s(8),
    borderBottomWidth: 1,
    borderBottomColor: AppColors.n100,
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
  cellIcon: { width: s(30) },
  starCol: { width: s(30), alignItems: 'center' },
  nameCol: { width: s(140) },
  addressCol: { width: s(160) },
  genderCol: { width: s(80) },
  codeCol: { width: s(100) },
  statusCol: { width: s(100) },
  statusBadge: {
    width: s(100),
    paddingVertical: vs(3),
    paddingHorizontal: s(10),
    borderRadius: s(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateCol: { width: s(100) },
  phoneCol: { width: s(120) },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: s(22),
    height: s(22),
    borderRadius: s(11),
    marginRight: s(6),
  },
  nameText: { fontSize: s(13), color: AppColors.n800 },
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
  disabledButton: { borderColor: AppColors.n200 },
  pageText: { color: AppColors.n700, fontSize: s(13) },
  disabledText: { color: AppColors.n400 },
  pageInfo: { fontSize: s(13), color: AppColors.n600 },
});

export default UserTable;
