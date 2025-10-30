import React, { useEffect, useState } from 'react'; // <-- Thêm useMemo
import {
  Control,
  useFieldArray,
  useForm
} from 'react-hook-form';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import { RubricItemData } from '../../api/rubricItemService'; // <-- Import lại
import { AppColors } from '../../styles/color';
import AppButton from '../buttons/AppButton';
import BottomSheet from '../common/BottomSheet';
import AppTextInputController from '../inputs/AppTextInputController';
import AppText from '../texts/AppText';

interface CriteriaBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  questionNumber: number;
  rubrics?: RubricItemData[]; // <-- Dùng cho chế độ standalone (chỉ xem)
  control?: Control<any>; // <-- Dùng cho chế độ managed (từ cha)
  questionIndex?: number; // <-- Đi kèm với control
  isEditable?: boolean; // <-- Quyết định có cho sửa không
  isLoading?: boolean; // <-- Prop loading
}

// Kiểu dữ liệu cho form nội bộ (khi ở chế độ standalone)
type CriteriaFormValues = {
  criteria: {
    input: string;
    output: string;
    dataType: string;
    description: string;
    score: string;
  }[];
};

const CriteriaBottomSheet = ({
  visible,
  onClose,
  questionNumber,
  rubrics = [], // <-- Default là mảng rỗng
  control: controlFromProps, // <-- Đổi tên để tránh trùng lặp
  questionIndex: questionIndexFromProps,
  isEditable = true, // <-- Default là cho phép sửa
  isLoading = false,
}: CriteriaBottomSheetProps) => {
  // 1. Tạo form nội bộ, nhưng chỉ dùng khi controlFromProps không được cung cấp
  const internalForm = useForm<CriteriaFormValues>({
    defaultValues: {
      criteria: [],
    },
  });

  // 2. Quyết định dùng control nào
  const activeControl = controlFromProps || internalForm.control;
  // Quyết định dùng questionIndex nào (default là 0 nếu dùng form nội bộ)
  const activeQuestionIndex = questionIndexFromProps ?? 0;

  // 3. Reset form nội bộ KHI VÀ CHỈ KHI dùng form nội bộ
  useEffect(() => {
    // Chỉ reset form nội bộ khi đang ở chế độ standalone và sheet được mở
    if (!controlFromProps && visible) {
      const formattedData = rubrics.map(r => ({
        input: r.input || '',
        output: r.output || '',
        dataType: 'String', // Default
        description: r.description || '',
        score: String(r.score) || '0',
      }));
      internalForm.reset({ criteria: formattedData });
    }
  }, [visible, rubrics, controlFromProps, internalForm.reset]); // Thêm controlFromProps và reset

  const { fields, append, remove } = useFieldArray({
    control: activeControl, // <-- Dùng control đã chọn
    name: controlFromProps
      ? `questions.${activeQuestionIndex}.criteria` // <-- Name cho chế độ managed
      : 'criteria', // <-- Name cho chế độ standalone
  });

  const [expandedCriteriaId, setExpandedCriteriaId] = useState<string | null>(
    null,
  );
  useEffect(() => {
    if (visible && fields.length > 0 && !expandedCriteriaId) {
      setExpandedCriteriaId(fields[0].id);
    }
    if (!visible) {
      setExpandedCriteriaId(null);
    }
  }, [visible, fields]);
  const handleAddCriteria = () => {
    append({
      input: '',
      output: '',
      dataType: 'Numeric',
      description: '',
      score: '',
    });
  };

  const getFieldName = (index: number, fieldName: string): string => {
    return controlFromProps
      ? `questions.${activeQuestionIndex}.criteria.${index}.${fieldName}`
      : `criteria.${index}.${fieldName}`;
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.header}>
        <AppText variant="h3">Criteria (Q{questionNumber})</AppText>
        {isEditable && controlFromProps && !isLoading && (
          <TouchableOpacity onPress={handleAddCriteria}>
            <AppText variant="body14pxBold" style={{ color: AppColors.pr500 }}>
              Add
            </AppText>
          </TouchableOpacity>
        )}
      </View>
      {isLoading ? (
        <ActivityIndicator
          size="large"
          color={AppColors.pr500}
          style={{ marginVertical: vs(20) }}
        />
      ) : (
        <View style={styles.contentContainer}>
          {fields.length === 0 ? (
            <AppText style={styles.emptyText}>
              {isEditable && controlFromProps
                ? 'Click "Add" to define criteria.'
                : 'No criteria defined.'}
            </AppText>
          ) : (
            fields.map((field, index) => {
              const isExpanded = expandedCriteriaId === field.id;
              return (
                <View key={field.id} style={styles.criteriaContainer}>
                  <TouchableOpacity
                    style={styles.criteriaHeader}
                    onPress={() =>
                      setExpandedCriteriaId(prevId =>
                        prevId === field.id ? null : field.id,
                      )
                    }>
                    <AppText
                      variant="body16pxBold"
                      style={{ color: AppColors.n900 }}>
                      Criteria {index + 1}
                    </AppText>
                    <View style={styles.headerActions}>
                      {isEditable && controlFromProps && fields.length > 1 && (
                        <TouchableOpacity onPress={() => remove(index)}>
                          <AppText style={styles.removeButtonText}>
                            Remove
                          </AppText>
                        </TouchableOpacity>
                      )}
                      <AppText style={{ color: AppColors.n700, fontSize: 18 }}>
                        {isExpanded ? '−' : '+'}
                      </AppText>
                    </View>
                  </TouchableOpacity>
                  {isExpanded && (
                    <View style={styles.criteriaBody}>
                      <AppTextInputController
                        control={activeControl} // <-- Dùng active control
                        name={getFieldName(index, 'input')} // <-- Dùng tên field động
                        label={`Criteria ${index + 1} input`}
                        placeholder="5, 5"
                        editable={isEditable} // <-- Dùng prop isEditable
                      />
                      <AppTextInputController
                        control={activeControl}
                        name={getFieldName(index, 'output')}
                        label={`Criteria ${index + 1} output`}
                        placeholder="10"
                        editable={isEditable}
                      />
                      <View style={{ height: vs(8) }}></View>
                      <AppTextInputController
                        control={activeControl}
                        name={getFieldName(index, 'description')}
                        label="Description"
                        placeholder="Description text..."
                        multiline
                        numberOfLines={4}
                        editable={isEditable}
                      />
                      <AppTextInputController
                        control={activeControl}
                        name={getFieldName(index, 'score')}
                        label="Score"
                        placeholder="2"
                        keyboardType="numeric"
                        editable={isEditable}
                        rules={{
                          required: 'Score is required',
                          pattern: {
                            value: /^\d+(\.\d+)?$/, // Cho phép số nguyên hoặc số thập phân
                            message: 'Score must be a number',
                          },
                        }}
                      />
                      {/* Nút confirm chỉ hiện khi ở chế độ managed và editable */}
                      {isEditable && controlFromProps && (
                        <AppButton title="Confirm Criteria" onPress={onClose} />
                      )}
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>
      )}
    </BottomSheet>
  );
};

// Styles giữ nguyên
const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(10),
  },
  contentContainer: {
    backgroundColor: AppColors.pr100,
    borderRadius: 12,
    padding: s(10),
  },
  criteriaContainer: {
    backgroundColor: AppColors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: AppColors.n200,
    marginBottom: vs(10),
    overflow: 'hidden',
  },
  criteriaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: s(15),
    borderBottomWidth: 1,
    borderBottomColor: AppColors.n100,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(16),
  },
  removeButtonText: {
    color: AppColors.errorColor,
    fontSize: s(12),
  },
  criteriaBody: {
    padding: s(15),
  },
  emptyText: {
    textAlign: 'center',
    color: AppColors.n500,
    paddingVertical: vs(20),
  },
});

export default CriteriaBottomSheet;