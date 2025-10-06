import { yupResolver } from '@hookform/resolvers/yup';
import React, { useState } from 'react';
import { useForm, type Path, type Resolver } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
} from 'react-native';
import { s, vs } from 'react-native-size-matters';
import * as yup from 'yup';
import { AppColors } from '../../styles/color';
import AppButton from '../buttons/AppButton';
import AppTextInputController from '../inputs/AppTextInputController';
import RadioWithTitle from '../inputs/RadioWithTitle';
import AppText from '../texts/AppText';

// schema
const schema = yup.object({
  testCase1Input: yup.string().required('Test case 1 input is required'),
  testCase1Output: yup.string().required('Test case 1 output is required'),

  testCase2Input: yup.string().optional(),
  testCase2Output: yup.string().optional(),

  testCase3Input: yup.string().optional(),
  testCase3Output: yup.string().optional(),

  testCase4Input: yup.string().optional(),
  testCase4Output: yup.string().optional(),

  testCase5Input: yup.string().optional(),
  testCase5Output: yup.string().optional(),
});
const TEST_CASES = ['Numeric', 'Boolean', 'String', 'Array'];

type FormData = yup.InferType<typeof schema>;

const TestCaseForm: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<string>('Numeric');
  const [testCaseCount, setTestCaseCount] = useState(1);

  const handleChangeTestCase = (value: string) => {
    setSelectedItem(value);
  };

  const methods = useForm<FormData>({
    resolver: yupResolver(schema) as unknown as Resolver<FormData>,
    defaultValues: {
      testCase1Input: '',
      testCase1Output: '',
      testCase2Input: '',
      testCase2Output: '',
      testCase3Input: '',
      testCase3Output: '',
      testCase4Input: '',
      testCase4Output: '',
      testCase5Input: '',
      testCase5Output: '',
    },
  });

  const { control, handleSubmit } = methods;

  const handleConfirm = (formData: FormData) => {
    console.log('Form data: ', formData);
  };

  const handleAddTestCase = () => {
    if (testCaseCount < 5) {
      setTestCaseCount(prev => prev + 1);
    }
  };

  const handleRemoveTestCase = (index: number) => {
    if (testCaseCount > 1) {
      setTestCaseCount(prev => prev - 1);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {Array.from({ length: testCaseCount }).map((_, index) => {
          const inputName = `testCase${index + 1}Input` as Path<FormData>;
          const outputName = `testCase${index + 1}Output` as Path<FormData>;
          return (
            <View key={index} style={styles.caseBox}>
              <AppTextInputController
                name={inputName}
                control={control}
                placeholder={`Enter test case ${index + 1} input`}
                label={`Test case ${index + 1} input`}
              />
              <AppTextInputController
                name={outputName}
                control={control}
                placeholder={`Enter test case ${index + 1} output`}
                label={`Test case ${index + 1} output`}
              />
              {TEST_CASES.map(item => {
                return (
                  <RadioWithTitle
                    key={item}
                    title={item}
                    selected={item === selectedItem}
                    onPress={() => handleChangeTestCase(item)}
                  />
                );
              })}

              {testCaseCount > 1 && (
                <TouchableOpacity
                  onPress={() => handleRemoveTestCase(index)}
                  style={{ marginTop: vs(8) }}
                >
                  <AppText style={{ color: 'red' }}>Remove</AppText>
                </TouchableOpacity>
              )}
            </View>
          );
        })}

        {testCaseCount < 5 && (
          <AppButton
            onPress={handleAddTestCase}
            title="Add Test Case"
            style={{ alignSelf: 'center', marginBottom: vs(15), borderRadius: s(10) }}
            size="medium"
            textVariant="label14pxBold"
          />
        )}

        <AppButton
          onPress={handleSubmit(handleConfirm)}
          title="Confirm"
          style={{ alignSelf: 'center', borderRadius: s(10) }}
          size="large"
          textVariant="label14pxBold"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default TestCaseForm;

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
    paddingBottom: vs(40),
    paddingTop: vs(20),
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: vs(10),
    color: AppColors.pr500,
  },
  caseBox: {
    marginBottom: vs(20),
  },
  caseTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: vs(6),
  },
});
