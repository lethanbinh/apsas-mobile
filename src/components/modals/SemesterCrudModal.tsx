import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { Modal, Portal } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { s, vs } from 'react-native-size-matters';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import AppButton from '../buttons/AppButton';
import AppTextInputController from '../inputs/AppTextInputController';
import AppText from '../texts/AppText';
import { AppColors } from '../../styles/color';
import { showErrorToast, showSuccessToast } from '../toasts/AppToast';
import RNPickerSelect from 'react-native-picker-select';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {
  createSemester,
  CreateSemesterPayload,
  SemesterData,
  updateSemester,
  UpdateSemesterPayload,
} from '../../api/semesterService';
import { CalendarIcon } from '../../assets/icons/icon';

dayjs.extend(utc);

type FormData = {
  academicYear: number | null;
  season: string | null;
  semesterCode: string;
  note: string;
  startDate: Date | null;
  endDate: Date | null;
};

const allSeasons = [
  { label: 'Spring', value: 'Spring' },
  { label: 'Summer', value: 'Summer' },
  { label: 'Fall', value: 'Fall' },
];

const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear + 5; i >= currentYear - 5; i--) {
    years.push({ label: i.toString(), value: i });
  }
  return years;
};

const getDatesForSeason = (season: string, year: number) => {
  if (season.toLowerCase() === 'spring') {
    return {
      start: dayjs.utc(`${year}-01-01`).toDate(),
      end: dayjs.utc(`${year}-04-30`).endOf('day').toDate(),
    };
  }
  if (season.toLowerCase() === 'summer') {
    return {
      start: dayjs.utc(`${year}-05-01`).toDate(),
      end: dayjs.utc(`${year}-08-31`).endOf('day').toDate(),
    };
  }
  return {
    // Fall
    start: dayjs.utc(`${year}-09-01`).toDate(),
    end: dayjs.utc(`${year}-12-31`).endOf('day').toDate(),
  };
};

const schema = yup
  .object({
    academicYear: yup.number().nullable().required('Please select a year'),
    season: yup.string().nullable().required('Please select a season'),
    semesterCode: yup.string().required('Code is auto-generated'),
    note: yup.string().required('Please enter a note'),
    startDate: yup.date().nullable().required('Start date is required'),
    endDate: yup.date().nullable().required('End date is required'),
  })
  .required();

interface SemesterCrudModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: SemesterData | null;
  existingSemesters: SemesterData[];
}

const SemesterCrudModal: React.FC<SemesterCrudModalProps> = ({
  visible,
  onClose,
  onSuccess,
  initialData,
  existingSemesters,
}) => {
  const isEditMode = !!initialData;
  const [isStartDatePickerVisible, setStartDatePickerVisibility] =
    useState(false);
  const [isEndDatePickerVisible, setEndDatePickerVisibility] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      academicYear: null,
      season: null,
      semesterCode: '',
      note: '',
      startDate: null,
      endDate: null,
    },
  });

  const selectedYear = watch('academicYear');
  const selectedSeason = watch('season');

  const existingSemestersByYear = useMemo(() => {
    const map = new Map<number, string[]>();
    existingSemesters.forEach(s => {
      if (!map.has(Number(s.academicYear))) {
        map.set(Number(s.academicYear), []);
      }
      map.get(Number(s.academicYear))!.push(s.semesterCode.toLowerCase());
    });
    return map;
  }, [existingSemesters]);

  const yearOptions = useMemo(() => {
    return generateYearOptions().map(year => ({
      ...year,
      disabled: (existingSemestersByYear.get(year.value) || []).length >= 3,
    }));
  }, [existingSemestersByYear]);

  const seasonOptions = useMemo(() => {
    if (!selectedYear) return [];
    const takenSeasons = (existingSemestersByYear.get(selectedYear) || []).map(
      code => code.replace(String(selectedYear), '').toLowerCase(),
    );

    const currentEditSeason =
      isEditMode &&
      initialData &&
      Number(initialData.academicYear) === selectedYear
        ? initialData.semesterCode
            .replace(String(initialData.academicYear), '')
            .toLowerCase()
        : null;

    return allSeasons.filter(s => {
      const seasonLower = s.value.toLowerCase();
      return (
        seasonLower === currentEditSeason || !takenSeasons.includes(seasonLower)
      );
    });
  }, [selectedYear, existingSemestersByYear, isEditMode, initialData]);

  useEffect(() => {
    if (visible) {
      if (isEditMode && initialData) {
        const yearStr = String(initialData.academicYear);
        const seasonStr = initialData.semesterCode
          .replace(yearStr, '')
          .toLowerCase();
        const matchedSeason = allSeasons.find(
          s => s.value.toLowerCase() === seasonStr,
        );

        reset({
          academicYear: Number(initialData.academicYear),
          startDate: dayjs.utc(initialData.startDate).local().toDate(),
          endDate: dayjs.utc(initialData.endDate).local().toDate(),
          season: matchedSeason ? matchedSeason.value : null,
          semesterCode: initialData.semesterCode,
          note: initialData.note || '',
        });
      } else {
        reset({
          academicYear: null,
          season: null,
          semesterCode: '',
          note: '',
          startDate: null,
          endDate: null,
        });
      }
    }
  }, [visible, initialData, reset, isEditMode]);

  useEffect(() => {
    if (!isEditMode && selectedYear && selectedSeason) {
      setValue(
        'semesterCode',
        `${selectedSeason.toUpperCase()}${selectedYear}`,
      );
      const { start, end } = getDatesForSeason(selectedSeason, selectedYear);
      setValue('startDate', start, { shouldValidate: true });
      setValue('endDate', end, { shouldValidate: true });
    } else if (!isEditMode && selectedYear) {
      if (selectedSeason === null) {
        setValue('season', null);
      }
    }
  }, [selectedYear, selectedSeason, isEditMode, setValue]);

  const onSubmit = async (data: FormData) => {
    try {
      if (!data.startDate || !data.endDate || !data.academicYear) {
        throw new Error(
          'Academic Year, Start Date, and End Date are required.',
        );
      }

      const payload: CreateSemesterPayload | UpdateSemesterPayload = {
        semesterCode: data.semesterCode,
        academicYear: data.academicYear,
        note: data.note,
        startDate: dayjs(data.startDate).utc().toISOString(),
        endDate: dayjs(data.endDate).utc().toISOString(),
      };

      if (isEditMode && initialData) {
        await updateSemester(initialData.id, payload);
        showSuccessToast('Success', 'Semester updated successfully.');
      } else {
        await createSemester(payload as CreateSemesterPayload);
        showSuccessToast('Success', 'Semester created successfully.');
      }
      onSuccess();
    } catch (error: any) {
      showErrorToast('Error', error.message || `Failed to save semester.`);
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onClose}
        contentContainerStyle={styles.modalContainer}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContentContainer}
        >
          <AppText style={styles.modalTitle} variant="h3">
            {isEditMode ? 'Edit Semester' : 'Create New Semester'}
          </AppText>

          <AppText style={styles.label} variant="label16pxBold">
            Academic Year
          </AppText>
          <Controller
            name="academicYear"
            control={control}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <View>
                <RNPickerSelect
                  onValueChange={onChange}
                  items={yearOptions}
                  value={value}
                  style={pickerSelectStyles}
                  placeholder={{ label: 'Select year...', value: null }}
                  disabled={isEditMode}
                />
                {error && (
                  <AppText style={styles.textError}>{error.message}</AppText>
                )}
              </View>
            )}
          />

          <AppText style={styles.label} variant="label16pxBold">
            Season
          </AppText>
          <Controller
            name="season"
            control={control}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <View>
                <RNPickerSelect
                  onValueChange={onChange}
                  items={seasonOptions}
                  value={value}
                  style={pickerSelectStyles}
                  placeholder={{ label: 'Select season...', value: null }}
                  disabled={isEditMode || !selectedYear}
                />
                {error && (
                  <AppText style={styles.textError}>{error.message}</AppText>
                )}
              </View>
            )}
          />

          <AppTextInputController
            name="semesterCode"
            control={control as any}
            label="Semester Code"
            placeholder=""
            editable={false}
          />

          <Controller
            control={control}
            name="startDate"
            render={({ field: { value }, fieldState: { error } }) => (
              <View style={styles.dateContainer}>
                <AppText style={styles.label} variant="label16pxBold">
                  Start Date
                </AppText>
                <TouchableOpacity
                  onPress={() => setStartDatePickerVisibility(true)}
                  style={[styles.dateInput, error && styles.errorBorder]}
                  disabled={!isEditMode}
                >
                  <AppText
                    style={value ? styles.dateText : styles.datePlaceholder}
                  >
                    {value ? dayjs(value).format('DD/MM/YYYY') : 'Select date'}
                  </AppText>
                  <CalendarIcon />
                </TouchableOpacity>
                {error && (
                  <AppText style={styles.textError}>{error.message}</AppText>
                )}
              </View>
            )}
          />
          <DateTimePickerModal
            isVisible={isStartDatePickerVisible}
            mode="date"
            onConfirm={date => {
              setValue('startDate', date);
              setStartDatePickerVisibility(false);
            }}
            onCancel={() => setStartDatePickerVisibility(false)}
            date={watch('startDate') || new Date()}
          />

          <Controller
            control={control}
            name="endDate"
            render={({ field: { value }, fieldState: { error } }) => (
              <View style={styles.dateContainer}>
                <AppText style={styles.label} variant="label16pxBold">
                  End Date
                </AppText>
                <TouchableOpacity
                  onPress={() => setEndDatePickerVisibility(true)}
                  style={[styles.dateInput, error && styles.errorBorder]}
                  disabled={!isEditMode}
                >
                  <AppText
                    style={value ? styles.dateText : styles.datePlaceholder}
                  >
                    {value ? dayjs(value).format('DD/MM/YYYY') : 'Select date'}
                  </AppText>
                  <CalendarIcon />
                </TouchableOpacity>
                {error && (
                  <AppText style={styles.textError}>{error.message}</AppText>
                )}
              </View>
            )}
          />
          <DateTimePickerModal
            isVisible={isEndDatePickerVisible}
            mode="date"
            onConfirm={date => {
              setValue('endDate', date);
              setEndDatePickerVisibility(false);
            }}
            onCancel={() => setEndDatePickerVisibility(false)}
            date={watch('endDate') || watch('startDate') || new Date()}
          />

          <AppTextInputController
            name="note"
            control={control as any}
            label="Note"
            placeholder="Enter note"
            multiline
            numberOfLines={3}
          />

          <View style={styles.modalButtonRow}>
            <AppButton
              size="medium"
              title="Cancel"
              variant="secondary"
              onPress={onClose}
              style={styles.button}
              textColor={AppColors.pr500}
              disabled={isSubmitting}
            />
            <AppButton
              size="medium"
              title={isEditMode ? 'Update' : 'Create'}
              onPress={handleSubmit(onSubmit)}
              style={styles.button}
              loading={isSubmitting}
              disabled={isSubmitting}
            />
          </View>
        </ScrollView>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: AppColors.white,
    borderRadius: s(12),
    paddingVertical: 0,
    paddingHorizontal: 0,
    marginHorizontal: s(20),
    maxHeight: '85%',
    overflow: 'hidden',
  },
  scrollContentContainer: { paddingVertical: vs(20), paddingHorizontal: s(20) },
  modalTitle: {
    marginBottom: vs(15),
    textAlign: 'center',
    color: AppColors.n800,
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: s(15),
    marginTop: vs(20),
  },
  label: { color: AppColors.n700, marginBottom: vs(4), marginTop: vs(5) },
  textError: {
    color: AppColors.errorColor,
    fontSize: s(12),
    marginTop: -vs(5),
    marginBottom: vs(10),
  },
  button: { width: s(100), borderColor: AppColors.pr500, minWidth: 0 },
  dateContainer: { marginBottom: vs(10) },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: vs(40),
    borderRadius: s(6),
    borderColor: AppColors.n300,
    paddingHorizontal: s(15),
    borderWidth: 1,
    backgroundColor: AppColors.white,
  },
  dateText: { fontSize: s(14), color: AppColors.n800 },
  datePlaceholder: { fontSize: s(14), color: AppColors.n400 },
  errorBorder: { borderColor: AppColors.errorColor },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: s(14),
    paddingVertical: vs(10),
    paddingHorizontal: s(15),
    borderWidth: 1,
    borderColor: AppColors.n300,
    borderRadius: s(6),
    color: AppColors.n800,
    paddingRight: s(30),
    marginBottom: vs(10),
  },
  inputAndroid: {
    fontSize: s(14),
    paddingVertical: vs(10),
    paddingHorizontal: s(15),
    borderWidth: 1,
    borderColor: AppColors.n300,
    borderRadius: s(6),
    color: AppColors.n800,
    paddingRight: s(30),
    marginBottom: vs(10),
  },
  placeholder: { color: AppColors.n400 },
});

export default SemesterCrudModal;
