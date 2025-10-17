import { pick, types } from '@react-native-documents/picker';
import { Buffer } from 'buffer';
import {
  AlignmentType,
  Document,
  HeadingLevel,
  ImageRun,
  Packer,
  Paragraph,
  TextRun,
} from 'docx';
import React, { useState } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import {
  Alert,
  Image,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { s, vs } from 'react-native-size-matters';

import { UploadIcon } from '../../assets/icons/icon';
import { AppColors } from '../../styles/color';
import AppButton from '../buttons/AppButton';
import CurriculumItem from '../courses/CurriculumItem';
import RadioWithTitle from '../inputs/RadioWithTitle';
import AppText from '../texts/AppText';
import QuestionItem from './QuestionItem';
import StatusTag from './StatusTag';

interface Criteria {
  id?: string;
  input: string;
  output: string;
  dataType: string;
  description: string;
  score: string;
}

interface Question {
  id?: string;
  title: string;
  content: string;
  fileUri: string | null;
  fileName: string | null;
  width?: number | null;
  height?: number | null;
  criteria: Criteria[];
}

interface Assignment {
  id: string;
  title: string;
  name?: string;
  status: string;
  questions: Question[];
}

interface AssignmentAccordionProps {
  assignment: Assignment;
  isExpanded: boolean;
  onToggle: () => void;
}

const AssignmentAccordion = ({
  assignment,
  isExpanded,
  onToggle,
}: AssignmentAccordionProps) => {
  const [selectedType, setSelectedType] = useState('Basic assignment');
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);
  const [databaseFile, setDatabaseFile] = useState<string | null>(null);

  const { control, getValues, setValue } = useForm<{ questions: Question[] }>({
    defaultValues: {
      questions: assignment.questions || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questions',
  });
  
  const watchedQuestions = useWatch({ control, name: "questions" });

  const ASSIGNMENT_TYPES = ['Basic assignment', 'Web API', 'Web UI'];

  const handleExport = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission Denied!', 'Storage permission is required.');
          return;
        }
      } catch (err) {
        console.warn(err);
        return;
      }
    }

    const formData = getValues();
    const children: Paragraph[] = [];

    children.push(
      new Paragraph({
        text: assignment.title,
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),
    );

    for (const [index, question] of formData.questions.entries()) {
      children.push(
        new Paragraph({
          text: question.title || `Question ${index + 1}`,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 150 },
        }),
        new Paragraph({
          children: [new TextRun({ text: question.content || 'No content.', size: 24 })],
          spacing: { after: 200 },
        }),
      );

      if (question.fileUri) {
        try {
          const imageDimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
            Image.getSize(question.fileUri!, (width, height) => {
              resolve({ width, height });
            }, (error) => reject(error));
          });

          const imageBase64 = await ReactNativeBlobUtil.fs.readFile(
            question.fileUri,
            'base64',
          );
          const imageBuffer = Buffer.from(imageBase64, 'base64');
          
          const maxWidth = 350;
          const aspectRatio = imageDimensions.height / imageDimensions.width;
          const calculatedHeight = maxWidth * aspectRatio;

          children.push(
            new Paragraph({
              children: [
                new ImageRun({
                  data: imageBuffer,
                  transformation: { width: maxWidth, height: calculatedHeight },
                } as any),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
            }),
          );
        } catch (e) {
          console.error('Error processing image for docx:', e);
        }
      }

      if (question.criteria && question.criteria.length > 0) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: 'Criteria:', bold: true, size: 26 }),
            ],
            spacing: { before: 200, after: 100 },
          }),
        );
        question.criteria.forEach((crit, critIndex) => {
          children.push(
            new Paragraph({
              text: `Criteria ${critIndex + 1}:`,
              bullet: { level: 0 },
              style: "ListParagraph"
            }),
            new Paragraph({
              text: `Input: ${crit.input || '-'}`,
              bullet: { level: 1 },
              style: "ListParagraph"
            }),
            new Paragraph({
              text: `Output: ${crit.output || '-'}`,
              bullet: { level: 1 },
              style: "ListParagraph"
            }),
            new Paragraph({
              text: `Data Type: ${crit.dataType || '-'}`,
              bullet: { level: 1 },
              style: "ListParagraph"
            }),
            new Paragraph({
              text: `Description: ${crit.description || '-'}`,
              bullet: { level: 1 },
              style: "ListParagraph"
            }),
            new Paragraph({
              text: `Score: ${crit.score || '-'}`,
              bullet: { level: 1 },
              spacing: { after: 100 },
              style: "ListParagraph"
            }),
          );
        });
      }
      children.push(new Paragraph({ text: '', spacing: { after: 400 } }));
    }

    const doc = new Document({
        sections: [{ children }],
        styles: {
            paragraphStyles: [
                {
                    id: "ListParagraph",
                    name: "List Paragraph",
                    basedOn: "Normal",
                    next: "Normal",
                    quickFormat: true,
                    run: {
                        size: 24,
                    },
                },
            ],
        },
    });

    try {
      const base64 = await Packer.toBase64String(doc);
      const fileNameBase =
        assignment.name || assignment.title || 'AssignmentExport';
      const fileName = `${fileNameBase.replace(/ /g, '_')}.docx`;
      const path = `${ReactNativeBlobUtil.fs.dirs.DownloadDir}/${fileName}`;
      await ReactNativeBlobUtil.fs.writeFile(path, base64, 'base64');
      if (Platform.OS === 'android') {
        await ReactNativeBlobUtil.android.addCompleteDownload({
          title: fileName,
          description: 'Download complete',
          mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          path: path,
          showNotification: true,
        });
      }
      Alert.alert('Export Successful', `File saved as ${fileName}`);
    } catch (error) {
      console.error('Error exporting file:', error);
      Alert.alert('Export Failed', 'An error occurred.');
    }
  };

  const handleQuestionFileUpload = async (index: number) => {
    try {
      const result = await pick({ type: [types.images] });
      if (result && result.length > 0) {
        const file = result[0];
        Image.getSize(file.uri, (width, height) => {
          setValue(`questions.${index}.fileUri`, file.uri, { shouldDirty: true });
          setValue(`questions.${index}.fileName`, file.name, { shouldDirty: true });
          setValue(`questions.${index}.width`, width, { shouldDirty: true });
          setValue(`questions.${index}.height`, height, { shouldDirty: true });
        });
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
    } catch (err) {
      console.log(err);
    }
  };

  const handleAddQuestion = () => {
    append({
      title: '',
      content: '',
      fileUri: null,
      fileName: null,
      width: null,
      height: null,
      criteria: [],
    });
  };

  return (
    <View style={styles.assignmentCard}>
      <TouchableOpacity style={styles.assignmentHeader} onPress={onToggle}>
        <AppText
          variant="body14pxBold"
          style={{ flex: 1, color: AppColors.n900 }}
        >
          {assignment.title}
        </AppText>
        <TouchableOpacity onPress={handleExport}>
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

          {fields.map((field, index) => {
            const watchedFileUri = watchedQuestions?.[index]?.fileUri;
            return (
              <QuestionItem
                key={field.id}
                question={{ ...field, fileUri: watchedFileUri }}
                index={index}
                isExpanded={expandedQuestionId === field.id}
                control={control}
                onToggle={() =>
                  setExpandedQuestionId(prevId =>
                    prevId === field.id ? null : field.id,
                  )
                }
                onFileUpload={() => handleQuestionFileUpload(index)}
                onRemove={() => remove(index)}
                canRemove={fields.length > 1}
              />
            )
          })}

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
            onPress={() => console.log(JSON.stringify(getValues(), null, 2))}
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