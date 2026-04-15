/**
 * Cliente Axios configurado para la API de Healthy
 * Incluye interceptores para inyectar el token de autenticación
 */

import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// URL base — se sobreescribe con variable de entorno en producción
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de petición: añade el token JWT si existe
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Interceptor de respuesta: centraliza manejo de errores 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Limpia el token caducado para forzar re-login
      await SecureStore.deleteItemAsync('auth_token');
    }
    return Promise.reject(error);
  },
);

export default api;
