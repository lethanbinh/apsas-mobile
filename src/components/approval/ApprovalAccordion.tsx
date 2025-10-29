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
import {
  Alert,
  Image,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { s, vs } from 'react-native-size-matters';
import { DownloadIcon } from '../../assets/icons/courses';
import { AppColors } from '../../styles/color';
import { Assignment } from '../../screens/ApprovalScreen';
import AppButton from '../buttons/AppButton';
import CurriculumItem from '../courses/CurriculumItem';
import AppText from '../texts/AppText';
import StatusTag from '../assessments/StatusTag';
import ApprovalQuestionItem from './ApprovalQuestionItem';

interface ApprovalAccordionProps {
  assignment: Assignment;
  isExpanded: boolean;
  onToggle: () => void;
  onApprove: () => void;
  onReject: (reason: string) => void;
  onDownload: (fileName: string) => void;
}

const ApprovalAccordion = ({
  assignment,
  isExpanded,
  onToggle,
  onApprove,
  onReject,
  onDownload,
}: ApprovalAccordionProps) => {
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [expandedQuestionId, setExpandedQuestionId] = useState<number | null>(
    null,
  );

  const handleConfirmReject = () => {
    if (rejectReason.trim()) {
      onReject(rejectReason);
      setIsRejecting(false);
    }
  };

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

    const children: Paragraph[] = [
      new Paragraph({
        text: assignment.name,
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),
    ];

    for (const [index, question] of assignment.questions.entries()) {
      children.push(
        new Paragraph({
          text: `Question ${index + 1}: ${question.title}`,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 150 },
        }),
        new Paragraph({
          children: [new TextRun({ text: question.content, size: 24 })],
          spacing: { after: 200 },
        }),
      );

      if (question.imageUrl) {
        try {
          const imageDimensions = await new Promise<{
            width: number;
            height: number;
          }>((resolve, reject) => {
            Image.getSize(
              question.imageUrl,
              (width, height) => resolve({ width, height }),
              reject,
            );
          });

          const response = await ReactNativeBlobUtil.fetch(
            'GET',
            question.imageUrl,
          );
          const imageBase64 = response.base64();
          const imageBuffer = Buffer.from(imageBase64, 'base64');

          const maxWidth = 450;
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
    }

    const doc = new Document({ sections: [{ children }] });

    try {
      const base64 = await Packer.toBase64String(doc);
      const fileName = `${assignment.name.replace(/ /g, '_')}.docx`;
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

  return (
    <View style={styles.assignmentCard}>
      <TouchableOpacity style={styles.assignmentHeader} onPress={onToggle}>
        <AppText variant="body14pxBold" style={styles.assignmentTitle}>
          {assignment.name}
        </AppText>
        <TouchableOpacity
          onPress={e => {
            e.stopPropagation();
            handleExport();
          }}
        >
          <AppText style={styles.exportButtonText}>Export</AppText>
        </TouchableOpacity>
        <StatusTag status={assignment.status} />
        <AppText style={styles.expandIcon}>{isExpanded ? '−' : '+'}</AppText>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.assignmentBody}>
          <View style={styles.typeContainer}>
            <AppText variant="body14pxBold" style={styles.typeLabel}>
              Assignment Type:
            </AppText>
            <AppText style={styles.typeValue}>
              {assignment.assignmentType}
            </AppText>
          </View>

          {assignment.assignmentType !== 'Basic assignment' && (
            <View style={{ marginBottom: vs(16) }}>
              <CurriculumItem
                id={0}
                number="01"
                title="Database"
                linkFile="database.sql"
                rightIcon={<DownloadIcon color={AppColors.pr500} />}
                onAction={() => onDownload('database.sql')}
              />
            </View>
          )}

          {assignment.questions.map((q, index) => (
            <ApprovalQuestionItem
              key={q.id}
              question={q}
              index={index}
              isExpanded={expandedQuestionId === q.id}
              onToggle={() =>
                setExpandedQuestionId(prevId => (prevId === q.id ? null : q.id))
              }
            />
          ))}

          {assignment.status === 'Pending' && (
            <>
              {isRejecting && (
                <TextInput
                  style={styles.reasonInput}
                  placeholder="Enter reject reason..."
                  value={rejectReason}
                  onChangeText={setRejectReason}
                  multiline
                />
              )}
              <View style={styles.actionRow}>
                <AppButton
                  title="Approve"
                  onPress={onApprove}
                  style={styles.actionButton}
                  size="small"
                />
                {!isRejecting ? (
                  <AppButton
                    title="Reject"
                    onPress={() => setIsRejecting(true)}
                    style={styles.actionButton}
                    variant="danger"
                    size="small"
                    textColor={AppColors.errorColor}
                  />
                ) : (
                  <AppButton
                    title="Confirm Reject"
                    onPress={handleConfirmReject}
                    style={styles.actionButton}
                    variant="danger"
                    size="small"
                    textColor={AppColors.errorColor}
                  />
                )}
              </View>
            </>
          )}

          {assignment.status === 'Rejected' && assignment.reason && (
            <AppText style={styles.reasonText}>
              Reason: {assignment.reason}
            </AppText>
          )}
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
    padding: s(15),
  },
  assignmentTitle: {
    flex: 1,
    color: AppColors.n900,
  },
  exportButtonText: {
    color: AppColors.pr500,
    fontWeight: 'bold',
    marginHorizontal: s(8),
  },
  expandIcon: {
    fontSize: 18,
    marginLeft: 6,
    color: AppColors.n700,
  },
  assignmentBody: {
    paddingHorizontal: s(15),
    paddingBottom: vs(15),
    borderTopWidth: 1,
    borderTopColor: AppColors.n100,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(12),
    marginTop: vs(8),
  },
  typeLabel: {
    color: AppColors.n700,
  },
  typeValue: {
    marginLeft: s(8),
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: vs(16),
    gap: s(16),
  },
  actionButton: {
    flex: 1,
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: AppColors.errorColor,
    borderRadius: 8,
    padding: s(10),
    marginTop: vs(8),
    backgroundColor: AppColors.white,
    textAlignVertical: 'top',
    minHeight: vs(60),
  },
  reasonText: {
    marginTop: vs(12),
    color: AppColors.errorColor,
    fontStyle: 'italic',
    backgroundColor: AppColors.r100,
    padding: s(10),
    borderRadius: 8,
  },
});

export default ApprovalAccordion;
