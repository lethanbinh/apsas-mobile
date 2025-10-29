import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { fetchLecturerList } from '../api/lecturerService';
import { useState, useEffect } from 'react';

export const useGetCurrentLecturerId = () => {
  const [lecturerId, setLecturerId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  const userAccountId = useSelector(
    (state: RootState) => state.userSlice.profile?.id,
  );

  useEffect(() => {
    const findLecturerId = async () => {
      if (!userAccountId) {
        setLecturerId(null);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const lecturerList = await fetchLecturerList();
        const currentLecturer = lecturerList.find(
          lecturer => lecturer.accountId.toString() === userAccountId,
        );
        setLecturerId(
          currentLecturer ? Number(currentLecturer.lecturerId) : null,
        );
      } catch (error) {
        console.error('Failed to find current Lecturer ID from list:', error);
        setLecturerId(null); // Set to null on error
      } finally {
        setIsLoading(false); // Stop loading
      }
    };

    findLecturerId();
  }, [userAccountId]); // Re-run when userAccountId changes

  return { lecturerId, isLoading };
};
