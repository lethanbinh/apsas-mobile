import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { s, vs } from 'react-native-size-matters';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AppColors } from '../../styles/color';
import { fetchAccounts, AccountData, RoleMap } from '../../api/account'; // Adjust path
import { showErrorToast } from '../toasts/AppToast'; // Adjust path

interface UserTableProps {
  filters: {
    roleId?: number | null;
    searchTerm?: string;
  };
  onSelectionChange: (selectedIds: number[]) => void; // Callback for parent
  refreshKey: number; // Prop to trigger refetch
}

const UserTable = ({
  filters,
  onSelectionChange,
  refreshKey,
}: UserTableProps) => {
  const [users, setUsers] = useState<AccountData[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isAllSelected, setIsAllSelected] = useState(false);

  const loadUsers = useCallback(
    async (resetPage: boolean = false) => {
      setIsLoading(true);
      const currentPage = resetPage ? 1 : page;
      if (resetPage) setPage(1); // Reset page state if requested
      try {
        const result = await fetchAccounts(
          currentPage,
          pageSize,
          filters.roleId,
          filters.searchTerm,
        );
        setUsers(result.items);
        setTotal(result.totalCount);
        setTotalPages(result.totalPages);
        // Reset selection when data reloads
        setSelectedIds([]);
        setIsAllSelected(false);
        onSelectionChange([]);
      } catch (error: any) {
        showErrorToast('Error', 'Failed to load users.');
        setUsers([]);
        setTotal(0);
        setTotalPages(1);
      } finally {
        setIsLoading(false);
      }
    },
    [page, pageSize, filters.roleId, filters.searchTerm, onSelectionChange],
  ); // Include dependencies

  useEffect(() => {
    loadUsers(true); // Initial load and reload on filter change (reset page)
  }, [filters.roleId, filters.searchTerm, refreshKey]); // Depend on filters and refreshKey

  useEffect(() => {
    if (page > 1) {
      loadUsers(false); // Load specific page if not page 1
    }
  }, [page]); // Reload only when page changes manually (after initial load)

  const handleNext = () => {
    if (page < totalPages) setPage(prev => prev + 1);
  };
  const handlePrevious = () => {
    if (page > 1) setPage(prev => prev - 1);
  };

  const handleSelectUser = (id: number) => {
    let newSelectedIds: number[];
    if (selectedIds.includes(id)) {
      newSelectedIds = selectedIds.filter(selectedId => selectedId !== id);
    } else {
      newSelectedIds = [...selectedIds, id];
    }
    setSelectedIds(newSelectedIds);
    setIsAllSelected(
      newSelectedIds.length === users.length && users.length > 0,
    );
    onSelectionChange(newSelectedIds);
  };

  const handleSelectAll = () => {
    let newSelectedIds: number[];
    if (isAllSelected) {
      newSelectedIds = [];
    } else {
      newSelectedIds = users.map(user => user.id);
    }
    setSelectedIds(newSelectedIds);
    setIsAllSelected(!isAllSelected);
    onSelectionChange(newSelectedIds);
  };

  const getStatus = (user: AccountData): 'Active' | 'Banned' | 'Inactive' => {
    // Derive status based on your API's logic or a dedicated field if available
    // Example: Assuming a field like `isActive` or similar might exist
    // if (user.isBanned) return 'Banned';
    // if (user.isActive) return 'Active';
    return 'Active'; // Placeholder - Adjust based on actual data
  };

  const renderHeader = () => (
    <View style={[styles.row, styles.headerRow]}>
      <TouchableOpacity onPress={handleSelectAll} style={styles.cellIcon}>
        <Ionicons
          name={isAllSelected ? 'checkbox' : 'checkbox-outline'}
          size={18}
          color={isAllSelected ? AppColors.pr500 : AppColors.n500}
        />
      </TouchableOpacity>
      <View style={styles.starCol} />
      <Text style={[styles.headerText, styles.nameCol]}>Client Name</Text>
      <Text style={[styles.headerText, styles.emailCol]}>Email</Text>
      <Text style={[styles.headerText, styles.genderCol]}>Gender</Text>
      <Text style={[styles.headerText, styles.codeCol]}>Account Code</Text>
      <Text style={[styles.headerText, styles.statusCol]}>Status</Text>
      <Text style={[styles.headerText, styles.dateCol]}>Date of Birth</Text>
      <Text style={[styles.headerText, styles.phoneCol]}>Phone</Text>
      <Text style={[styles.headerText, styles.roleCol]}>Role</Text>
    </View>
  );

  const renderItem = ({ item }: { item: AccountData }) => {
    const isSelected = selectedIds.includes(item.id);
    const status = getStatus(item);
    return (
      <View style={[styles.row, isSelected && styles.selectedRow]}>
        <TouchableOpacity
          onPress={() => handleSelectUser(item.id)}
          style={styles.cellIcon}
        >
          <Ionicons
            name={isSelected ? 'checkbox' : 'square-outline'}
            size={18}
            color={isSelected ? AppColors.pr500 : AppColors.n400}
          />
        </TouchableOpacity>
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
          <Text style={styles.nameText} numberOfLines={1}>
            {item.fullName || item.username}
          </Text>
        </View>
        <Text style={[styles.text, styles.emailCol]} numberOfLines={1}>
          {item.email}
        </Text>
        <Text style={[styles.text, styles.genderCol]}>
          {item.gender === 0 ? 'Male' : item.gender === 1 ? 'Female' : '-'}
        </Text>
        <Text style={[styles.text, styles.codeCol]}>{item.accountCode}</Text>
        <View style={[styles.statusBadge, getStatusBadgeStyle(status)]}>
          <Text style={getStatusTextStyle(status)}>{status}</Text>
        </View>
        <Text style={[styles.text, styles.dateCol]}>
          {item.dateOfBirth
            ? new Date(item.dateOfBirth).toLocaleDateString()
            : '-'}
        </Text>
        <Text style={[styles.text, styles.phoneCol]}>
          {item.phoneNumber || '-'}
        </Text>
        <Text style={[styles.text, styles.roleCol]}>
          {RoleMap[item.role] || 'Unknown'}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.tableContainer}>
          {renderHeader()}
          {isLoading && users.length === 0 ? (
            <ActivityIndicator size="large" style={styles.loadingIndicator} />
          ) : (
            <FlatList
              data={users}
              renderItem={renderItem}
              keyExtractor={item => item.id.toString()}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No users found</Text>
              }
              extraData={selectedIds} // Ensure re-render on selection change
            />
          )}
        </View>
      </ScrollView>

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
    </View>
  );
};

const getStatusBadgeStyle = (status: string) => ({
  backgroundColor:
    status === 'Active'
      ? AppColors.g100
      : status === 'Banned'
      ? AppColors.r100
      : AppColors.n100,
});
const getStatusTextStyle = (status: string) => ({
  fontSize: s(12),
  fontWeight: '600' as const,
  color:
    status === 'Active'
      ? AppColors.g500
      : status === 'Banned'
      ? AppColors.r500
      : AppColors.n500,
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
    minWidth: s(1100),
    backgroundColor: AppColors.white,
    flexGrow: 1,
  },
  loadingIndicator: {
    marginTop: vs(50),
    alignSelf: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: vs(30),
    color: AppColors.n500,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: vs(10),
    paddingHorizontal: s(8),
    borderBottomWidth: 1,
    borderBottomColor: AppColors.n100,
  },
  selectedRow: {
    backgroundColor: AppColors.pr300, // Highlight selected row
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
  cellIcon: { width: s(30), justifyContent: 'center', alignItems: 'center' },
  starCol: { width: s(30), alignItems: 'center' },
  nameCol: { width: s(150) },
  emailCol: { width: s(200) },
  genderCol: { width: s(70) },
  codeCol: { width: s(110) },
  statusCol: { width: s(90) },
  statusBadge: {
    width: s(80),
    paddingVertical: vs(3),
    paddingHorizontal: s(10),
    borderRadius: s(10),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: s(10),
  },
  dateCol: { width: s(100) },
  phoneCol: { width: s(110) },
  roleCol: { width: s(100) },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: s(22),
    height: s(22),
    borderRadius: s(11),
    marginRight: s(6),
  },
  nameText: { fontSize: s(13), color: AppColors.n800, flexShrink: 1 },
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

export default UserTable;
