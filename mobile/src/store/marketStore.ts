import { create } from 'zustand';
import axios from 'axios';

interface Coin {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  marketCap: number;
  volume: number;
}

interface MarketStore {
  coins: Coin[];
  isLoading: boolean;
  error: string | null;
  fetchCoins: (baseUrl: string, token: string) => Promise<void>;
  getCoinById: (id: string) => Coin | undefined;
}

export const useMarketStore = create<MarketStore>((set, get) => ({
  coins: [],
  isLoading: false,
  error: null,
  fetchCoins: async (baseUrl: string, token: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await axios.get(`${baseUrl}/api/coins`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ coins: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
  getCoinById: (id: string) => get().coins.find((c) => c.id === id),
}));
