import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { s, vs } from 'react-native-size-matters';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AppText from '../texts/AppText';

type Category = {
  id: string;
  name: string;
};

type FilterSelectorProps = {
  categories: Category[];
  initialSelected?: string[];
  onChange?: (selected: string[]) => void;
};

const FilterSelector: React.FC<FilterSelectorProps> = ({
  categories,
  initialSelected = ['all'],
  onChange,
}) => {
  const [selected, setSelected] = useState<string[]>(initialSelected);
  const [showAll, setShowAll] = useState(false);

  const toggleCategory = (id: string) => {
    let newSelected = [...selected];
    const allIds = categories.map(c => c.id);

    if (id === 'all') {
      if (newSelected.includes('all')) {
        // nếu đang tick all -> bỏ hết
        newSelected = [];
      } else {
        // tick all -> chọn all + tất cả
        newSelected = ['all', ...allIds];
      }
    } else {
      if (newSelected.includes(id)) {
        // bỏ chọn item này
        newSelected = newSelected.filter(s => s !== id);
      } else {
        // tick item này
        newSelected.push(id);
      }

      // Nếu tất cả item con đã được tick -> auto tick All
      const selectedIds = newSelected.filter(s => s !== 'all');
      if (selectedIds.length === allIds.length) {
        newSelected = ['all', ...allIds];
      } else {
        // chưa đủ -> bỏ tick all
        newSelected = newSelected.filter(s => s !== 'all');
      }
    }

    setSelected(newSelected);
    onChange && onChange(newSelected);
  };

  const renderItem = ({ item }: { item: Category }) => {
    const isChecked = selected.includes(item.id) || selected.includes('all') && item.id === 'all';

    return (
      <TouchableOpacity
        style={styles.row}
        onPress={() => toggleCategory(item.id)}
        activeOpacity={0.7}
      >
        <AppText style={styles.text}>{item.name}</AppText>
        <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
          {isChecked && <Ionicons name="checkmark" size={14} color="#fff" />}
        </View>
      </TouchableOpacity>
    );
  };

  const displayedData = [{ id: 'all', name: 'All' }, ...categories];

  const dataToRender =
    showAll || categories.length <= 3
      ? displayedData
      : displayedData.slice(0, 4);

  return (
    <View style={styles.container}>
      <FlatList
        data={dataToRender}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />

      {categories.length > 3 && (
        <TouchableOpacity
          style={{ marginTop: vs(10) }}
          onPress={() => setShowAll(!showAll)}
        >
          <AppText style={styles.link}>
            {showAll
              ? 'See less'
              : `See all ${categories.length} categories`}
          </AppText>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default FilterSelector;

const styles = StyleSheet.create({
  container: {
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: vs(6),
  },
  text: {
    fontSize: s(14),
    color: '#222',
  },
  checkbox: {
    width: s(18),
    height: s(18),
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  link: {
    fontSize: s(13),
    fontWeight: '600',
    color: '#000',
  },
});
