import { pick, types } from '@react-native-documents/picker';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { s, vs } from 'react-native-size-matters';

import { UploadIcon } from '../../assets/icons/icon';
import { AppColors } from '../../styles/color';
import AppButton from '../buttons/AppButton';
import CurriculumItem from '../courses/CurriculumItem';
import RadioWithTitle from '../inputs/RadioWithTitle';
import AppText from '../texts/AppText';
import QuestionItem from './QuestionItem';
import StatusTag from './StatusTag';

interface AssignmentAccordionProps {
  assignment: any;
  isExpanded: boolean;
  onToggle: () => void;
}

const AssignmentAccordion = ({
  assignment,
  isExpanded,
  onToggle,
}: AssignmentAccordionProps) => {
  const [selectedType, setSelectedType] = useState('Basic assignment');
  const [questions, setQuestions] = useState<
    { id: number; fileUri: string | null }[]
  >([{ id: 1, fileUri: null }]);
  const [expandedQuestionId, setExpandedQuestionId] = useState<number | null>(
    1
  );
  const [databaseFile, setDatabaseFile] = useState<string | null>(null);

  const { control } = useForm();
  const ASSIGNMENT_TYPES = ['Basic assignment', 'Web API', 'Web UI'];

  const handleQuestionFileUpload = async (questionId: number) => {
    try {
      const result = await pick({
        type: [types.images],
      });
      if (result && result.length > 0) {
        const file = result[0];
        setQuestions(prevQuestions =>
          prevQuestions.map(q =>
            q.id === questionId ? { ...q, fileUri: file.uri } : q
          )
        );
      }
    } catch (err: any) {
      console.error('File picker error:', err);
    }
  };

  const handleDatabaseUpload = async () => {
    try {
      const result = await pick();
      if (result && result.length > 0) {
        setDatabaseFile(result[0].name);
      }
    } catch (err: any) {
      console.error('File picker error:', err);
    }
  };

  const handleAddQuestion = () => {
    const newId = (questions[questions.length - 1]?.id || 0) + 1;
    setQuestions([...questions, { id: newId, fileUri: null }]);
    setExpandedQuestionId(newId);
  };

  const handleRemoveQuestion = (idToRemove: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(question => question.id !== idToRemove));
    }
  };

  return (
    <View style={styles.assignmentCard}>
      <TouchableOpacity style={styles.assignmentHeader} onPress={onToggle}>
        <AppText variant="body14pxBold" style={{ flex: 1, color: AppColors.n900 }}>
          {assignment.title}
        </AppText>
        <TouchableOpacity>
          <AppText style={styles.exportButtonText}>Export</AppText>
        </TouchableOpacity>
        <StatusTag status={assignment.status} />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.assignmentBody}>
          <View style={{ marginBottom: vs(16) }}>
            <AppText variant="body14pxBold" style={{ color: AppColors.n700 }}>
              Assignment Type
            </AppText>
            {ASSIGNMENT_TYPES.map(item => (
              <RadioWithTitle
                key={item}
                title={item}
                selected={item === selectedType}
                onPress={() => setSelectedType(item)}
              />
            ))}
          </View>

          {selectedType !== 'Basic assignment' && (
            <View style={{ marginBottom: vs(16) }}>
              <CurriculumItem
                id={0}
                number="01"
                title="Database"
                linkFile={databaseFile || 'database.sql'}
                rightIcon={<UploadIcon color={AppColors.pr500} />}
                onAction={handleDatabaseUpload}
              />
            </View>
          )}

          {questions.map((question, index) => (
            <QuestionItem
              key={question.id}
              question={question}
              index={index}
              isExpanded={expandedQuestionId === question.id}
              control={control}
              onToggle={() =>
                setExpandedQuestionId(prevId =>
                  prevId === question.id ? null : question.id
                )
              }
              onFileUpload={() => handleQuestionFileUpload(question.id)}
              onRemove={() => handleRemoveQuestion(question.id)}
              canRemove={questions.length > 1}
            />
          ))}

          <TouchableOpacity
            style={styles.addQuestionButton}
            onPress={handleAddQuestion}
          >
            <AppText
              variant="body14pxBold"
              style={styles.addQuestionButtonText}
            >
              + Add Question
            </AppText>
          </TouchableOpacity>

          <AppButton
            title="Confirm"
            onPress={() => {}}
            style={styles.confirmButton}
            textVariant="body14pxBold"
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  assignmentCard: {
    backgroundColor: AppColors.white,
    borderRadius: 10,
    marginHorizontal: s(10),
    marginVertical: vs(8),
    borderWidth: 1,
    borderColor: AppColors.n200,
  },
  assignmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: vs(10),
    paddingHorizontal: s(14),
  },
  exportButtonText: {
    color: AppColors.pr500,
    fontWeight: 'bold',
    marginHorizontal: s(8),
  },
  assignmentBody: {
    paddingHorizontal: s(16),
    paddingVertical: vs(12),
  },
  addQuestionButton: {
    alignItems: 'center',
    paddingVertical: vs(8),
    marginBottom: vs(16),
  },
  addQuestionButtonText: {
    color: AppColors.pr500,
  },
  confirmButton: {
    marginTop: vs(24),
    borderRadius: vs(10),
  },
});

export default AssignmentAccordion;