import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSignalStore } from '../store/signalStore';
import { useAuthStore } from '../store/authStore';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export default function SignalsScreen() {
  const { signals, isLoading, fetchSignals, updateSignalStatus, deleteSignal } = useSignalStore();
  const { token } = useAuthStore();

  useEffect(() => {
    if (token) {
      fetchSignals(BASE_URL, token);
    }
  }, [token]);

  const handleMarkHit = (id: string) => {
    Alert.alert('Mark as Hit?', 'This signal performed well.', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Mark Hit',
        onPress: () => {
          if (token) {
            updateSignalStatus(BASE_URL, token, id, 'HIT');
          }
        },
      },
    ]);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Signal?', 'This action cannot be undone.', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Delete',
        onPress: () => {
          if (token) {
            deleteSignal(BASE_URL, token, id);
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const activeSignals = signals.filter((s) => s.status === 'ACTIVE');
  const hitSignals = signals.filter((s) => s.status === 'HIT');
  const missedSignals = signals.filter((s) => s.status === 'MISSED');

  if (isLoading && !signals.length) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Trading Signals</Text>

      <View style={styles.tabs}>
        <Text style={styles.tabLabel}>Active ({activeSignals.length})</Text>
      </View>

      {activeSignals.length === 0 ? (
        <Text style={styles.emptyState}>No active signals. Create one from Markets tab!</Text>
      ) : (
        activeSignals.map((signal) => (
          <View key={signal.id} style={styles.signalCard}>
            <View style={styles.signalHeader}>
              <Text style={[styles.direction, { color: signal.direction === 'UP' ? '#10b981' : '#ef4444' }]}>
                {signal.direction === 'UP' ? '🚀' : '📉'} {signal.direction}
              </Text>
              <Text style={styles.confidence}>Confidence: {signal.confidence}%</Text>
            </View>
            <View style={styles.signalDetails}>
              <View>
                <Text style={styles.label}>Target</Text>
                <Text style={styles.value}>${signal.target.toFixed(2)}</Text>
              </View>
              <View>
                <Text style={styles.label}>Stop Loss</Text>
                <Text style={styles.value}>${signal.stopLoss.toFixed(2)}</Text>
              </View>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.button, styles.hitButton]}
                onPress={() => handleMarkHit(signal.id)}
              >
                <Text style={styles.buttonText}>✓ Hit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.deleteButton]}
                onPress={() => handleDelete(signal.id)}
              >
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      <Text style={[styles.tabLabel, { marginTop: 24 }]}>Hit Signals ({hitSignals.length})</Text>
      {hitSignals.map((signal) => (
        <View key={signal.id} style={[styles.signalCard, styles.hitCard]}>
          <Text style={styles.hitBadge}>✓ HIT</Text>
          <Text style={styles.direction}>{signal.direction} @ ${signal.target.toFixed(2)}</Text>
        </View>
      ))}

      <Text style={[styles.tabLabel, { marginTop: 24 }]}>Missed Signals ({missedSignals.length})</Text>
      {missedSignals.map((signal) => (
        <View key={signal.id} style={[styles.signalCard, styles.missedCard]}>
          <Text style={styles.missedBadge}>✕ MISSED</Text>
          <Text style={styles.direction}>{signal.direction} @ ${signal.target.toFixed(2)}</Text>
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
  tabs: {
    marginBottom: 16,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 12,
  },
  emptyState: {
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 40,
  },
  signalCard: {
    backgroundColor: '#1e293b',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  hitCard: {
    borderLeftColor: '#10b981',
    opacity: 0.7,
  },
  missedCard: {
    borderLeftColor: '#ef4444',
    opacity: 0.7,
  },
  signalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  direction: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  confidence: {
    color: '#64748b',
    fontSize: 12,
  },
  signalDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  label: {
    color: '#94a3b8',
    fontSize: 11,
  },
  value: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  hitButton: {
    backgroundColor: '#10b981',
  },
  deleteButton: {
    backgroundColor: '#64748b',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  hitBadge: {
    color: '#10b981',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  missedBadge: {
    color: '#ef4444',
    fontWeight: 'bold',
    marginBottom: 8,
  },
});
