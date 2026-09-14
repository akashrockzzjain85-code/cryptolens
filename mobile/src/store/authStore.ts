import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string, baseUrl: string) => Promise<void>;
  register: (email: string, password: string, name: string, baseUrl: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      login: async (email: string, password: string, baseUrl: string) => {
        try {
          set({ isLoading: true });
          const response = await fetch(`${baseUrl}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          if (!response.ok) throw new Error('Login failed');
          const data = await response.json();
          await SecureStore.setItemAsync('token', data.token);
          set({ user: data.user, token: data.token, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      register: async (email: string, password: string, name: string, baseUrl: string) => {
        try {
          set({ isLoading: true });
          const response = await fetch(`${baseUrl}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name }),
          });
          if (!response.ok) throw new Error('Registration failed');
          const data = await response.json();
          await SecureStore.setItemAsync('token', data.token);
          set({ user: data.user, token: data.token, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      logout: async () => {
        await SecureStore.deleteItemAsync('token');
        set({ user: null, token: null });
      },
      restoreSession: async () => {
        try {
          const token = await SecureStore.getItemAsync('token');
          if (token) {
            set({ token });
          }
        } catch (error) {
          console.error('Session restore failed:', error);
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: AsyncStorage,
    }
  )
);
