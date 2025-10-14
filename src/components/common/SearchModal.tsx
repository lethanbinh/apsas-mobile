import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import { Modal, Portal } from 'react-native-paper';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { s, vs } from 'react-native-size-matters';
import { AppColors } from '../../styles/color';
import {
  ArrowLeftIcon,
  CloseSearchIcon,
  SearchIcon,
} from '../../assets/icons/icon';
import AppButton from '../buttons/AppButton';
import AppText from '../texts/AppText';

const allClassItems = [
  { id: '1', name: 'Class SE1720 - Nguyen NT - Java Spring' },
  { id: '2', name: 'Class SE1721 - Nguyen NT - Java Spring' },
  { id: '3', name: 'Class SE1722 - Nguyen NT - Java Spring' },
  { id: '4', name: 'Class SE1723 - Nguyen NT - Java Spring' },
  { id: '5', name: 'Class SE1724 - Nguyen NT - Java Spring' },
  { id: '6', name: 'Class SE1725 - Nguyen NT - Java Spring' },
  { id: '7', name: 'Class IA1701 - Le HPT - Information Assurance' },
  { id: '8', name: 'Class DBW301 - Vo T - Database Web' },
];

interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
}

const ListItem = ({ title }: { title: string }) => (
  <TouchableOpacity style={styles.listItem}>
    <Text style={styles.listItemText}>{title}</Text>
    <Text style={styles.arrow}>{'>'}</Text>
  </TouchableOpacity>
);

const EmptyState = ({
  searchText,
  onClearSearch,
}: {
  searchText: string;
  onClearSearch: () => void;
}) => (
  <View style={styles.emptyContainer}>
    <Image
      source={require('../../assets/images/empty_search.png')}
      style={styles.emptyImage}
    />
    <AppText
      variant="h3"
      style={{
        alignSelf: 'center',
        paddingHorizontal: s(40),
        textAlign: 'center',
        marginBottom: vs(10),
      }}
    >
      Oh no! We couldn't find any results for
    </AppText>
    <AppText variant="label20pxRegular" style={{ marginBottom: vs(15) }}>
      "{searchText}"
    </AppText>
    <AppText
      style={{
        color: '#363931',
      }}
      variant="body16pxBold"
    >
      Did you mean “SE1720”?
    </AppText>
    <TouchableOpacity onPress={onClearSearch}>
      <AppButton
        leftIcon={<SearchIcon color={AppColors.white} />}
        onPress={() => {}}
        title="Try a different search"
        style={{
          width: s(200),
          alignSelf: 'center',
          marginTop: vs(20),
        }}
      />
    </TouchableOpacity>
  </View>
);

const SearchModal: React.FC<SearchModalProps> = ({ visible, onClose }) => {
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState<typeof allClassItems>([]);

  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredData([]);
    } else {
      const filtered = allClassItems.filter(item =>
        item.name.toLowerCase().includes(searchText.toLowerCase()),
      );
      setFilteredData(filtered);
    }
  }, [searchText]);

  useEffect(() => {
    if (!visible) {
      setSearchText('');
    }
  }, [visible]);

  const showEmptyState = searchText.trim() !== '' && filteredData.length === 0;

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onClose}
        contentContainerStyle={styles.modalContentContainer}
      >
        <View style={styles.container}>
          <View style={styles.searchHeader}>
            <TouchableOpacity onPress={onClose} style={styles.iconButton}>
              <ArrowLeftIcon />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder="Search..."
              value={searchText}
              onChangeText={setSearchText}
              autoFocus={true}
            />
            {searchText.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchText('')}
                style={styles.iconButton}
              >
                <CloseSearchIcon />
              </TouchableOpacity>
            )}
          </View>

          {showEmptyState ? (
            <EmptyState
              searchText={searchText}
              onClearSearch={() => setSearchText('')}
            />
          ) : (
            <FlatList
              data={filteredData}
              keyExtractor={item => item.id}
              renderItem={({ item }) => <ListItem title={item.name} />}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ flexGrow: 1 }}
            />
          )}
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContentContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(10),
    paddingBottom: vs(10),
    paddingTop: Platform.OS === 'ios' ? getStatusBarHeight(true) : vs(15),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  input: {
    flex: 1,
    height: vs(40),
    fontSize: s(16),
    fontWeight: '500',
    paddingHorizontal: s(10),
  },
  iconButton: {
    padding: s(5),
  },
  backIcon: {
    fontSize: s(22),
    color: '#333',
  },
  clearIconContainer: {
    width: s(20),
    height: s(20),
    borderRadius: s(10),
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearIcon: {
    color: 'white',
    fontSize: s(12),
    fontWeight: 'bold',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: s(20),
    paddingVertical: vs(15),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  listItemText: {
    fontSize: s(14),
    color: '#333',
  },
  arrow: {
    fontSize: s(16),
    color: '#c7c7cc',
  },
  // Styles cho Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: s(20),
  },
  emptyImage: {
    width: s(150),
    height: s(150),
    marginBottom: vs(20),
  },
  emptyTitle: {
    fontSize: s(22),
    fontWeight: 'bold',
    color: '#333',
  },
  emptySubtitle: {
    fontSize: s(14),
    color: '#666',
    textAlign: 'center',
    marginTop: vs(5),
  },
  emptySuggestion: {
    fontSize: s(14),
    color: '#666',
    textAlign: 'center',
    marginTop: vs(15),
  },
  emptyButton: {
    marginTop: vs(20),
    backgroundColor: '#4A90E2', // Màu xanh dương
    paddingVertical: vs(12),
    paddingHorizontal: s(30),
    borderRadius: 8,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: s(14),
    fontWeight: 'bold',
  },
});

export default SearchModal;
