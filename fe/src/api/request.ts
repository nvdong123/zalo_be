import type { AxiosRequestConfig, Method } from 'axios';

import { message as $message } from 'antd';
import axios from 'axios';

import store from '@/stores';
import { setGlobalState } from '@/stores/global.store';
// import { history } from '@/routes/history';

const axiosInstance = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:8000',
  timeout: 15000,
});

axiosInstance.interceptors.request.use(
  config => {
    store.dispatch(
      setGlobalState({
        loading: true,
      }),
    );
    // Attach Authorization header if token exists
    try {
      // Try to get token from authState first, then fallback to direct token
      let token = null;
      const authState = localStorage.getItem('authState');
      if (authState) {
        const parsed = JSON.parse(authState);
        token = parsed.token;
      }
      // Fallback to direct token key
      if (!token) {
        token = localStorage.getItem('token');
      }
      
      console.log('Request interceptor - Token:', token ? 'EXISTS' : 'MISSING');
      if (token) {
        config.headers = config.headers || {};
        (config.headers as any)['Authorization'] = `Bearer ${token}`;
        console.log('Request interceptor - Authorization header set');
      }
    } catch (e) {
      console.error('Request interceptor - Token error:', e);
    }

    return config;
  },
  error => {
    store.dispatch(
      setGlobalState({
        loading: false,
      }),
    );
    Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  config => {
    store.dispatch(
      setGlobalState({
        loading: false,
      }),
    );

    if (config?.data?.message) {
      // $message.success(config.data.message)
    }

    return config?.data;
  },
  error => {
    store.dispatch(
      setGlobalState({
        loading: false,
      }),
    );
    // if needs to navigate to login page when request exception
    // history.replace('/login');
    let errorMessage = '系统异常';

    if (error?.message?.includes('Network Error')) {
      errorMessage = '网络错误，请检查您的网络';
    } else {
      errorMessage = error?.message;
    }

    console.dir(error);
    error.message && $message.error(errorMessage);

    return {
      status: false,
      message: errorMessage,
      result: null,
    };
  },
);

export type Response<T = any> = {
  status: boolean;
  message: string;
  result: T;
};

export type MyResponse<T = any> = Promise<Response<T>>;

/**
 *
 * @param method - request methods
 * @param url - request url
 * @param data - request data or params
 */
export const request = <T = any>(
  method: Lowercase<Method>,
  url: string,
  data?: any,
  config?: AxiosRequestConfig,
): MyResponse<T> => {
  // Prefix all API routes with versioned base used by FastAPI backend
  const prefix = '/api/v1';

  url = prefix + url;

  if (method === 'post') {
    return axiosInstance.post(url, data, config);
  } else if (method === 'put') {
    return axiosInstance.put(url, data, config);
  } else if (method === 'delete') {
    return axiosInstance.delete(url, {
      params: data,
      ...config,
    });
  } else {
    return axiosInstance.get(url, {
      params: data,
      ...config,
    });
  }
};
