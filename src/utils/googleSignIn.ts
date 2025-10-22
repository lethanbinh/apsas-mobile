import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';

const WEB_CLIENT_ID =
  '187957217621-kvm91jilshdoomjfj1ufk5crf189bjfu.apps.googleusercontent.com';

let isConfigured = false;

export const configureGoogleSignIn = () => {
  if (!isConfigured) {
    try {
      GoogleSignin.configure({
        webClientId: WEB_CLIENT_ID,
        offlineAccess: false,
      });
      isConfigured = true;
      console.log('Google Sign-In Configured');
    } catch (error) {
      console.error('Error configuring Google Sign-In:', error);
    }
  }
};

export const signInWithGoogle = async (): Promise<string> => {
  configureGoogleSignIn();

  if (!isConfigured) {
    throw new Error('Google Sign-In is not configured correctly.');
  }

  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const userInfo = await GoogleSignin.signIn();

    console.log('Available keys in userInfo:', Object.keys(userInfo));
    console.log('Full userInfo:', JSON.stringify(userInfo, null, 2));
    const idToken = userInfo.data?.idToken;

    if (!idToken) {
      console.error('idToken is missing from userInfo object:', userInfo);
      throw new Error(
        'Google Sign-In returned user info but idToken was missing.',
      );
    }

    console.log('Google Sign-In successful, ID Token obtained.');
    return idToken;
  } catch (error: any) {
    // ... (error handling remains the same) ...
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      console.log('Google Sign-In Cancelled');
      throw new Error('Sign in cancelled by user.');
    } else if (error.code === statusCodes.IN_PROGRESS) {
      console.log('Google Sign-In In Progress');
      throw new Error('Sign in is already in progress.');
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      console.log('Google Play Services Not Available');
      throw new Error('Google Play Services not available or outdated.');
    } else {
      console.error('Google Sign-In Error:', error);
      throw new Error(
        error.message || 'An unexpected error occurred during Google Sign-In.',
      );
    }
  }
};

export const signOutWithGoogle = async (): Promise<void> => {
  try {
    await GoogleSignin.signOut();
    console.log('Google Sign-Out successful.');
  } catch (error) {
    console.error('Google Sign-Out Error:', error);
    throw new Error('Failed to sign out from Google.');
  }
};
