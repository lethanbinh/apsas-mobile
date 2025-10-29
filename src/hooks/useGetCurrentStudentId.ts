import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { fetchStudentList } from '../api/studentService';
import { RootState } from '../store/store';
export const useGetCurrentStudentId = () => {
  const [studentId, setStudentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const userAccountId = useSelector(
    (state: RootState) => state.userSlice.profile?.id,
  );

  useEffect(() => {
    const findStudentId = async () => {
      if (!userAccountId) {
        setStudentId(null);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const studentList = await fetchStudentList();
        const currentStudent = studentList.find(
          student => student.accountId === userAccountId,
        );
        setStudentId(currentStudent ? currentStudent.studentId : null);
      } catch (error) {
        console.error('Failed to find current Student ID from list:', error);
        setStudentId(null);
      } finally {
        setIsLoading(false);
      }
    };

    findStudentId();
  }, [userAccountId]);

  return { studentId, isLoading };
};
