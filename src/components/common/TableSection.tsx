import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { s, vs } from 'react-native-size-matters';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AppColors } from '../../styles/color';
import AppText from '../texts/AppText';
import SectionHeader from './SectionHeader';

interface TableSectionProps {
  title: string;
  data: any[];
  columnConfig?: { key: string; label: string }[];
  onAdd?: () => void;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  renderCellContent?: (item: any, key: string) => string;
}

const TableSection = React.memo(({
  title,
  data,
  columnConfig,
  onAdd,
  onEdit,
  onDelete,
  renderCellContent,
}: TableSectionProps) => {
  const [viewAll, setViewAll] = useState(false);

  // Memoize columns and dataKeys
  const { columns, dataKeys } = useMemo(() => {
    if (!data || data.length === 0) {
      return { columns: [], dataKeys: [] };
    }
    return {
      columns: columnConfig
        ? columnConfig.map(c => c.label)
        : Object.keys(data[0]),
      dataKeys: columnConfig
        ? columnConfig.map(c => c.key)
        : Object.keys(data[0]),
    };
  }, [data, columnConfig]);

  // Memoize visible data
  const visibleData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return viewAll ? data : data.slice(0, 3);
  }, [data, viewAll]);

  // Memoize cell renderer
  const cellRenderer = useMemo(() => {
    if (renderCellContent) return renderCellContent;
    return (item: any, key: string) => {
      const value = item[key];
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        if (key === 'lecturer' && value.account)
          return value.account.fullName ?? value.account.username;
        if (key === 'account' && value.fullName)
          return value.fullName ?? value.username;
        if (key === 'courseElement' && value.name) return value.name;
      }
      if (key === 'accountCode' && item.account) return item.account.accountCode;
      if (key === 'email' && item.account) return item.account.email;
      return String(value ?? '');
    };
  }, [renderCellContent]);

  const hasActions = !!(onEdit || onDelete);

  if (!data || data.length === 0) {
    return (
      <View style={styles.section}>
        <SectionHeader
          style={{ marginBottom: vs(10) }}
          title={title}
          hasButton={false}
          onAdd={onAdd}
        />
        <AppText style={styles.emptyText}>
          No data available for this section.
        </AppText>
      </View>
    );
  }
  return (
    <View style={styles.section}>
      <SectionHeader
        style={{ marginBottom: vs(10) }}
        title={title}
        buttonText={viewAll ? 'Collapse' : 'View All'}
        onPress={() => setViewAll(!viewAll)}
        hasButton={data.length > 3}
        onAdd={onAdd}
      />
      <ScrollView horizontal showsHorizontalScrollIndicator>
        <View style={styles.tableContainer}>
          {dataKeys.map((key, colIndex) => (
            <View key={key} style={styles.column}>
              <Text style={[styles.cell, styles.headerText]}>
                {columns[colIndex]}
              </Text>
              {visibleData.map((rowItem, rowIndex) => (
                <Text
                  key={rowIndex}
                  style={styles.cell}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {cellRenderer(rowItem, key)}
                </Text>
              ))}
            </View>
          ))}
          {hasActions && (
            <View style={[styles.column, styles.actionColumn]}>
              <Text
                style={[styles.cell, styles.headerText, styles.actionHeader]}
              >
                Actions
              </Text>
              {visibleData.map((rowItem, rowIndex) => (
                <View key={rowIndex} style={[styles.cell, styles.actionCell]}>
                  {onEdit && (
                    <TouchableOpacity
                      onPress={() => onEdit(rowItem)}
                      style={styles.actionButton}
                    >
                      <Ionicons
                        name="pencil"
                        size={s(16)}
                        color={AppColors.pr500}
                      />
                    </TouchableOpacity>
                  )}
                  {onDelete && (
                    <TouchableOpacity
                      onPress={() => onDelete(rowItem)}
                      style={styles.actionButton}
                    >
                      <Ionicons
                        name="trash"
                        size={s(16)}
                        color={AppColors.r500}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
});

TableSection.displayName = 'TableSection';

const styles = StyleSheet.create({
  section: {
    marginBottom: vs(20),
  },
  emptyText: {
    paddingHorizontal: s(10),
    color: AppColors.n500,
    fontStyle: 'italic',
  },
  tableContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: AppColors.n200,
    borderRadius: 8,
    overflow: 'hidden',
  },
  column: {
    flexDirection: 'column',
    borderRightWidth: 1,
    borderRightColor: AppColors.n200,
  },
  cell: {
    padding: s(10),
    fontSize: 13,
    color: AppColors.n800,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.n200,
    textAlignVertical: 'center',
    height: vs(40),
  },
  headerText: {
    fontWeight: 'bold',
    backgroundColor: AppColors.n100,
    color: AppColors.n900,
    borderBottomWidth: 2,
    borderBottomColor: AppColors.n300,
  },
  actionColumn: {
    borderRightWidth: 0,
  },
  actionHeader: {
    textAlign: 'center',
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

export default TableSection;
