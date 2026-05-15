import api from './api';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
}

interface AuthResponse {
  user: AuthUser;
  token: string;
}

export const authService = {
  register: (email: string, phoneNumber: string) =>
    api.post('/auth/register', { email, phone_number: phoneNumber }),

  verifyEmail: (email: string, code: string) =>
    api.post<AuthResponse>('/auth/verify-email', { email, code }),

  resendCode: (email: string) =>
    api.post('/auth/resend-code', { email }),

  setPassword: (email: string, code: string, password: string) =>
    api.post<AuthResponse>('/auth/set-password', { email, code, password }),

  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }),

  logout: () =>
    api.post('/auth/logout'),

  me: () =>
    api.get<{ user: AuthUser }>('/auth/me'),
};
