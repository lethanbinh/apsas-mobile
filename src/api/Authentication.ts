import { ApiResponse, ApiService } from '../utils/ApiService';

interface ForgotPasswordResult {
  sent: boolean;
  expiresMinutes?: number;
}
interface ForgotPasswordResult {
  sent: boolean;
  expiresMinutes?: number;
}

interface VerifyOtpResult {
  verified: boolean;
  message: string;
}

interface ResetPasswordResult {
  reset: boolean;
}

export const sendForgotPasswordEmail = async (
  email: string,
): Promise<ForgotPasswordResult> => {
  const response = await ApiService.post<ForgotPasswordResult>(
    '/api/Auth/forgot-password',
    {
      email: email,
    },
  );
  if (response.result) {
    return response.result;
  } else {
    throw new Error(
      'Forgot password response was successful but missing result data.',
    );
  }
};

export const verifyOtp = async (
  email: string,
  otp: string,
): Promise<ApiResponse<VerifyOtpResult>> => {
  return ApiService.post<VerifyOtpResult>('/api/Auth/verify-otp', {
    email: email,
    otp: otp,
  });
};

export const resetPassword = async (
  email: string,
  otp: string,
  newPassword: string,
): Promise<ApiResponse<ResetPasswordResult>> => {
  // Return full ApiResponse
  return ApiService.post<ResetPasswordResult>('/api/Auth/reset-password', {
    email: email,
    otp: otp,
    newPassword: newPassword,
  });
};
