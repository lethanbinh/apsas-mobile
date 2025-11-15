import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { examinerService } from '../api/examinerService';
import { useState, useEffect } from 'react';

export const useGetCurrentExaminerId = () => {
  const [examinerId, setExaminerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const userAccountId = useSelector(
    (state: RootState) => state.userSlice.profile?.id,
  );

  useEffect(() => {
    const findExaminerId = async () => {
      if (!userAccountId) {
        setExaminerId(null);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const examinerList = await examinerService.getExaminerList();
        if (examinerList && examinerList.length > 0) {
          const currentExaminer = examinerList.find(
            examiner => examiner && examiner.accountId && examiner.accountId.toString() === userAccountId,
          );
          setExaminerId(
            currentExaminer ? currentExaminer.examinerId : null,
          );
        } else {
          // If list is empty, examiner might not be in the list yet
          console.warn('Examiner list is empty or endpoint not available.');
          setExaminerId(null);
        }
      } catch (error) {
        console.error('Failed to find current Examiner ID from list:', error);
        // Don't throw - just set to null and continue
        setExaminerId(null);
      } finally {
        setIsLoading(false);
      }
    };

    findExaminerId();
  }, [userAccountId]);

  return { examinerId, isLoading };
};

