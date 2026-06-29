import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

interface User { id: string; email: string; name?: string }

interface AuthState {
  user: User | null; token: string | null;
  isAuthenticated: boolean; isLoading: boolean;
  setAuth:        (user: User, token: string) => Promise<void>;
  clearAuth:      () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null, token: null, isAuthenticated: false, isLoading: true,

  setAuth: async (user, token) => {
    await SecureStore.setItemAsync('auth_token', token);
    await SecureStore.setItemAsync('auth_user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },

  clearAuth: async () => {
    await SecureStore.deleteItemAsync('auth_token');
    await SecureStore.deleteItemAsync('auth_user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  loadStoredAuth: async () => {
    try {
      const [token, userJson] = await Promise.all([
        SecureStore.getItemAsync('auth_token'),
        SecureStore.getItemAsync('auth_user'),
      ]);
      if (token && userJson) set({ user: JSON.parse(userJson), token, isAuthenticated: true });
    } catch {
      await SecureStore.deleteItemAsync('auth_token');
      await SecureStore.deleteItemAsync('auth_user');
    } finally {
      set({ isLoading: false });
    }
  },
}));
