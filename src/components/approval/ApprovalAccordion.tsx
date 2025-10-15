import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import { DownloadIcon } from '../../assets/icons/courses'; // Import icon download
import { AppColors } from '../../styles/color';
import AppButton from '../buttons/AppButton';
import AppText from '../texts/AppText';
import ApprovalQuestionItem from './ApprovalQuestionItem';
import { Assignment } from '../../screens/ApprovalScreen';
import CurriculumItem from '../courses/CurriculumItem'; // << IMPORT COMPONENT CẦN THIẾT
import StatusTag from '../assessments/StatusTag';

interface ApprovalAccordionProps {
  assignment: Assignment;
  isExpanded: boolean;
  onToggle: () => void;
  onApprove: () => void;
  onReject: (reason: string) => void;
  onDownload: (fileName: string) => void; // << THÊM PROP MỚI
}

const ApprovalAccordion = ({
  assignment,
  isExpanded,
  onToggle,
  onApprove,
  onReject,
  onDownload, // << NHẬN PROP
}: ApprovalAccordionProps) => {
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [expandedQuestionId, setExpandedQuestionId] = useState<number | null>(
    null
  );

  const handleConfirmReject = () => {
    if (rejectReason.trim()) {
      onReject(rejectReason);
      setIsRejecting(false);
    }
  };

  return (
    <View style={styles.assignmentCard}>
      <TouchableOpacity style={styles.assignmentHeader} onPress={onToggle}>
        <AppText variant="body14pxBold" style={styles.assignmentTitle}>
          {assignment.name}
        </AppText>
        <StatusTag status={assignment.status} />
        <AppText style={styles.expandIcon}>
          {isExpanded ? '−' : '+'}
        </AppText>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.assignmentBody}>
          {/* === HIỂN THỊ LOẠI ASSIGNMENT === */}
          <View style={styles.typeContainer}>
            <AppText variant="body14pxBold" style={styles.typeLabel}>
              Assignment Type:
            </AppText>
            <AppText style={styles.typeValue}>
              {assignment.assignmentType}
            </AppText>
          </View>

          {/* === HIỂN THỊ CÓ ĐIỀU KIỆN MỤC DATABASE === */}
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
                setExpandedQuestionId(prevId =>
                  prevId === q.id ? null : q.id
                )
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