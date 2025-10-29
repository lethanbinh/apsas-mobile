import { StyleSheet, View, Text } from 'react-native';
import React from 'react';
import AppText from '../texts/AppText';
import { UserAvatarDemoIcon } from '../../assets/icons/icon';
import { s, vs } from 'react-native-size-matters';
import { AppColors } from '../../styles/color';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';
import { useDispatch, useSelector } from 'react-redux';
import { clearUser } from '../../store/slices/userSlice';
import { SecureStorage } from '../../utils/SecureStorage';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootState } from '../../store/store';

interface LecturerHeaderProps {
  title: string;
  role: string;
}

const LecturerHeader = ({ title, role }: LecturerHeaderProps) => {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const userProfile = useSelector(
    (state: RootState) => state.userSlice.profile,
  );

  const userRole = Array.isArray(userProfile?.role)
    ? userProfile?.role[0]?.toUpperCase()
    : userProfile?.role?.toUpperCase();

  const handleLogout = async () => {
    try {
      await SecureStorage.deleteCredentials('authToken');
      await AsyncStorage.removeItem('tokenExpiresAt');
      dispatch(clearUser());
    } catch (error) {
    }
  };

  const handleProfile = () => {
    navigation.navigate('ProfileScreen');
  };

  return (
    <View style={styles.container}>
      <View>
        <AppText variant="h3">{title}</AppText>
        <AppText variant="body12pxRegular">{role}</AppText>
      </View>
      <View>
        <Menu>
          <MenuTrigger>
            <UserAvatarDemoIcon />
          </MenuTrigger>
          <MenuOptions optionsContainerStyle={styles.menuOptions}>
            {userRole === 'ADMIN' && ( // Keep role check as requested
              <>
                <MenuOption onSelect={handleProfile} style={styles.menuOption}>
                  <Text style={styles.menuOptionText}>Profile</Text>
                </MenuOption>
                <View style={styles.separator} />
              </>
            )}
            <MenuOption onSelect={handleLogout} style={styles.menuOption}>
              <Text style={[styles.menuOptionText, styles.logoutText]}>
                Logout
              </Text>
            </MenuOption>
          </MenuOptions>
        </Menu>
      </View>
    </View>
  );
};

export default LecturerHeader;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: s(25),
    marginBottom: vs(20),
    marginTop: vs(10),
  },
  menuOptions: {
    marginTop: vs(40),
    borderRadius: s(8),
    paddingVertical: vs(5),
    width: s(120),
  },
  menuOption: {
    paddingVertical: vs(8),
    paddingHorizontal: s(15),
  },
  menuOptionText: {
    fontSize: s(14),
    color: AppColors.n800,
  },
  logoutText: {
    color: AppColors.errorColor,
  },
  separator: {
    height: 1,
    backgroundColor: AppColors.n200,
    marginVertical: vs(5),
  },
});
