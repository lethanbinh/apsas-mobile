import * as Keychain from 'react-native-keychain';
const saveCredentials = async (key: string, value: string): Promise<void> => {
  try {
    await Keychain.setGenericPassword(key, value, { service: key });
  } catch (error) {
    console.error(`Error saving credentials for key ${key}:`, error);
    throw new Error('Could not save credentials securely.');
  }
};

const getCredentials = async (key: string): Promise<string | null> => {
  try {
    const credentials = await Keychain.getGenericPassword({ service: key });
    if (credentials) {
      return credentials.password;
    }
    return null;
  } catch (error) {
    console.error(`Error retrieving credentials for key ${key}:`, error);
    throw new Error('Could not retrieve credentials.');
  }
};

const deleteCredentials = async (key: string): Promise<void> => {
  try {
    await Keychain.resetGenericPassword({ service: key });
  } catch (error) {
    console.error(`Error deleting credentials for key ${key}:`, error);
    throw new Error('Could not delete credentials.');
  }
};

export const SecureStorage = {
  saveCredentials,
  getCredentials,
  deleteCredentials,
};
