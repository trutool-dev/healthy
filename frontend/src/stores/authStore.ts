/**
 * Store de autenticación con Zustand
 * Gestiona sesión, tokens y perfil básico del usuario
 */

import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

interface User {
  id:    string;
  email: string;
  name?: string;
}

interface AuthState {
  user:            User | null;
  token:           string | null;
  isAuthenticated: boolean;
  isLoading:       boolean;
  // Acciones
  setAuth:         (user: User, token: string) => Promise<void>;
  clearAuth:       () => Promise<void>;
  loadStoredAuth:  () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user:            null,
  token:           null,
  isAuthenticated: false,
  isLoading:       true,

  // Guarda sesión en memoria y en SecureStore
  setAuth: async (user, token) => {
    await SecureStore.setItemAsync('auth_token', token);
    await SecureStore.setItemAsync('auth_user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },

  // Limpia sesión completa
  clearAuth: async () => {
    await SecureStore.deleteItemAsync('auth_token');
    await SecureStore.deleteItemAsync('auth_user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  // Restaura sesión persisitda al arrancar la app
  loadStoredAuth: async () => {
    try {
      const [token, userJson] = await Promise.all([
        SecureStore.getItemAsync('auth_token'),
        SecureStore.getItemAsync('auth_user'),
      ]);
      if (token && userJson) {
        const user = JSON.parse(userJson) as User;
        set({ user, token, isAuthenticated: true });
      }
    } catch {
      // Si hay corrupción de datos, limpia el estado
      await SecureStore.deleteItemAsync('auth_token');
      await SecureStore.deleteItemAsync('auth_user');
    } finally {
      set({ isLoading: false });
    }
  },
}));
