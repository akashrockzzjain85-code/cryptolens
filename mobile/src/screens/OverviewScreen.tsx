import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useMarketStore } from '../store/marketStore';
import { useAuthStore } from '../store/authStore';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export default function OverviewScreen() {
  const { coins, isLoading, fetchCoins } = useMarketStore();
  const { token } = useAuthStore();
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    if (token) {
      fetchCoins(BASE_URL, token);
    }
  }, [token]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    if (token) {
      fetchCoins(BASE_URL, token).finally(() => setRefreshing(false));
    }
  }, [token]);

  if (isLoading && !coins.length) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  const gainers = coins.filter((c) => c.change24h > 0).sort((a, b) => b.change24h - a.change24h).slice(0, 5);
  const losers = coins.filter((c) => c.change24h < 0).sort((a, b) => a.change24h - b.change24h).slice(0, 5);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />}
    >
      <Text style={styles.header}>Market Overview</Text>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Total Coins</Text>
          <Text style={styles.statValue}>{coins.length}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Avg Change 24h</Text>
          <Text style={[styles.statValue, { color: coins.reduce((a, b) => a + b.change24h, 0) / coins.length > 0 ? '#10b981' : '#ef4444' }]}>
            {(coins.reduce((a, b) => a + b.change24h, 0) / coins.length).toFixed(2)}%
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>🚀 Top Gainers (24h)</Text>
      {gainers.map((coin) => (
        <View key={coin.id} style={styles.coinRow}>
          <View>
            <Text style={styles.coinName}>{coin.name}</Text>
            <Text style={styles.coinPrice}>${coin.price.toFixed(2)}</Text>
          </View>
          <Text style={[styles.change, { color: '#10b981' }]}>+{coin.change24h.toFixed(2)}%</Text>
        </View>
      ))}

      <Text style={styles.sectionTitle}>📉 Top Losers (24h)</Text>
      {losers.map((coin) => (
        <View key={coin.id} style={styles.coinRow}>
          <View>
            <Text style={styles.coinName}>{coin.name}</Text>
            <Text style={styles.coinPrice}>${coin.price.toFixed(2)}</Text>
          </View>
          <Text style={[styles.change, { color: '#ef4444' }]}>{coin.change24h.toFixed(2)}%</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  stat: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 8,
    padding: 16,
    marginRight: 8,
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 8,
  },
  statValue: {
    color: '#3b82f6',
    fontSize: 20,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    marginBottom: 12,
  },
  coinRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  coinName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  coinPrice: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 4,
  },
  change: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
