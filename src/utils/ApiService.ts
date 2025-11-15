import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';
import { BACKEND_API_URL } from '@env';
import { SecureStorage } from './SecureStorage'; // Giả sử file này ở cùng cấp
import { jwtDecode } from 'jwt-decode';

export interface ApiResponse<T = any> {
  statusCode: number;
  isSuccess: boolean;
  errorMessages?: string[];
  result?: T;
}

const axiosInstance: AxiosInstance = axios.create({
  baseURL: BACKEND_API_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await SecureStorage.getCredentials('authToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    console.error('Axios Request Interceptor Error:', error);
    return Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  response => {
    const apiResponse = response.data as ApiResponse;
    if (apiResponse.isSuccess) {
      return response;
    } else {
      const errorMessage =
        apiResponse.errorMessages?.join(', ') ||
        `Request failed with status ${response.status}`;
      console.error(
        `API Error for ${response.config.url}:`,
        errorMessage,
        apiResponse,
      );
      return Promise.reject(new Error(errorMessage));
    }
  },
  (error: AxiosError<ApiResponse>) => {
    let errorMessage = 'An unexpected network error occurred.';
    if (error.response) {
      const responseData = error.response.data;
      errorMessage =
        responseData?.errorMessages?.join(', ') ||
        `Request failed with status ${error.response.status}`;
      console.error(
        `API HTTP Error for ${error.config?.url}:`,
        errorMessage,
        error.response.data,
      );
    } else if (error.request) {
      console.error(
        `API No Response Error for ${error.config?.url}:`,
        error.request,
      );
      errorMessage =
        'No response received from the server. Check network connection.';
    } else {
      console.error('Axios Setup Error:', error.message);
      errorMessage = error.message;
    }
    return Promise.reject(new Error(errorMessage));
  },
);

const post = <T = any>(
  endpoint: string,
  body: any,
  config?: InternalAxiosRequestConfig,
): Promise<ApiResponse<T>> => {
  return axiosInstance
    .post<ApiResponse<T>>(endpoint, body, config)
    .then(response => response.data);
};

const get = <T = any>(
  endpoint: string,
  config?: InternalAxiosRequestConfig,
): Promise<ApiResponse<T>> => {
  return axiosInstance
    .get<ApiResponse<T>>(endpoint, config)
    .then(response => response.data);
};

const put = <T = any>(
  endpoint: string,
  body: any,
  config?: InternalAxiosRequestConfig,
): Promise<ApiResponse<T>> => {
  return axiosInstance
    .put<ApiResponse<T>>(endpoint, body, config)
    .then(response => response.data);
};

const patch = <T = any>(
  endpoint: string,
  body: any,
  config?: InternalAxiosRequestConfig,
): Promise<ApiResponse<T>> => {
  return axiosInstance
    .patch<ApiResponse<T>>(endpoint, body, config)
    .then(response => response.data);
};

const del = <T = any>(
  endpoint: string,
  config?: InternalAxiosRequestConfig,
): Promise<ApiResponse<T>> => {
  return axiosInstance
    .delete<ApiResponse<T>>(endpoint, config)
    .then(response => response.data);
};

interface DecodedToken {
  nameid?: string;
  email?: string;
  unique_name?: string;
  fullName?: string;
  role?: string | string[];
  nbf?: number;
  exp?: number;
  iat?: number;
  iss?: string;
  aud?: string;
  [key: string]: any;
}

const decodeToken = (token: string): DecodedToken | null => {
  try {
    const decoded: DecodedToken = jwtDecode(token);
    return decoded;
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};

export const ApiService = {
  post,
  get,
  put,
  patch,
  delete: del,
  decodeToken,
};
