import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { findHoDByAccountId } from '../api/hodService';
import { useState, useEffect } from 'react';

export const useGetCurrentHodID = () => {
  const [hodId, setHodId] = useState<number | null>(null);

  const userAccountId = useSelector(
    (state: RootState) => state.userSlice.profile?.id,
  );

  useEffect(() => {
    const fetchHodId = async () => {
      if (!userAccountId) {
        setHodId(null);
        return;
      }
      try {
        const hodProfile = await findHoDByAccountId(userAccountId);
        setHodId(Number(hodProfile?.hoDId) || null);
      } catch (error) {
        console.error('Failed to fetch current HoD ID:', error);
        setHodId(null);
      }
    };

    fetchHodId();
  }, [userAccountId]);
  return hodId;
};
