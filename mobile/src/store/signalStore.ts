import { create } from 'zustand';
import axios from 'axios';

interface Signal {
  id: string;
  coinId: string;
  direction: 'UP' | 'DOWN';
  target: number;
  stopLoss: number;
  confidence: number;
  status: 'ACTIVE' | 'HIT' | 'MISSED';
  createdAt: string;
}

interface SignalStore {
  signals: Signal[];
  isLoading: boolean;
  fetchSignals: (baseUrl: string, token: string) => Promise<void>;
  createSignal: (baseUrl: string, token: string, signal: Omit<Signal, 'id' | 'createdAt'>) => Promise<void>;
  updateSignalStatus: (baseUrl: string, token: string, id: string, status: Signal['status']) => Promise<void>;
  deleteSignal: (baseUrl: string, token: string, id: string) => Promise<void>;
}

export const useSignalStore = create<SignalStore>((set, get) => ({
  signals: [],
  isLoading: false,
  fetchSignals: async (baseUrl: string, token: string) => {
    try {
      set({ isLoading: true });
      const response = await axios.get(`${baseUrl}/api/signals`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ signals: response.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  createSignal: async (baseUrl: string, token: string, signal: Omit<Signal, 'id' | 'createdAt'>) => {
    try {
      const response = await axios.post(`${baseUrl}/api/signals`, signal, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ signals: [...get().signals, response.data] });
    } catch (error) {
      throw error;
    }
  },
  updateSignalStatus: async (baseUrl: string, token: string, id: string, status: Signal['status']) => {
    try {
      await axios.patch(`${baseUrl}/api/signals/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({
        signals: get().signals.map((s) => (s.id === id ? { ...s, status } : s)),
      });
    } catch (error) {
      throw error;
    }
  },
  deleteSignal: async (baseUrl: string, token: string, id: string) => {
    try {
      await axios.delete(`${baseUrl}/api/signals/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ signals: get().signals.filter((s) => s.id !== id) });
    } catch (error) {
      throw error;
    }
  },
}));
