import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUserAndToken, clearUser } from '../store/slices/userSlice';
import { AppDispatch } from '../store/store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { SecureStorage } from '../utils/SecureStorage';
import { ApiService } from '../utils/ApiService';

dayjs.extend(utc);

export const useAuthInitializer = (): boolean => {
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const bootstrapAsync = async () => {
      let userToken: string | null = null;
      let expiresAtStr: string | null = null;

      try {
        userToken = await SecureStorage.getCredentials('authToken');
        expiresAtStr = await AsyncStorage.getItem('tokenExpiresAt');
        const expiresAtTimestamp = expiresAtStr
          ? parseInt(expiresAtStr, 10)
          : null;

        if (
          userToken &&
          expiresAtTimestamp &&
          dayjs().valueOf() < expiresAtTimestamp
        ) {
          const decodedProfileData = ApiService.decodeToken(userToken);

          if (decodedProfileData && decodedProfileData.nameid) {
            const userProfileForRedux = {
              id: decodedProfileData.nameid,
              name: decodedProfileData.name,
              email: decodedProfileData.email,
              role: decodedProfileData.role,
            };
            dispatch(
              setUserAndToken({
                profile: userProfileForRedux,
                token: userToken,
              }),
            );
            console.log('Auth Hook: User session restored.');
          } else {
            console.warn('Auth Hook: Invalid token found, clearing.');
            await SecureStorage.deleteCredentials('authToken');
            await AsyncStorage.removeItem('tokenExpiresAt');
            dispatch(clearUser());
          }
        } else if (userToken) {
          console.warn(
            'Auth Hook: Token expired or expiry info missing, clearing.',
          );
          await SecureStorage.deleteCredentials('authToken');
          await AsyncStorage.removeItem('tokenExpiresAt');
          dispatch(clearUser());
        }
      } catch (e) {
        console.error('Auth Hook: Restoring token failed', e);
        try {
          await SecureStorage.deleteCredentials('authToken');
          await AsyncStorage.removeItem('tokenExpiresAt');
          dispatch(clearUser());
        } catch (clearError) {
          console.error(
            'Auth Hook: Failed to clear credentials on error',
            clearError,
          );
        }
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, [dispatch]);

  return isLoading;
};
