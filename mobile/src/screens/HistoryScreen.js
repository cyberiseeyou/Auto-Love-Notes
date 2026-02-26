import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Card from '../components/Card';
import { colors, fonts, spacing, borderRadius } from '../theme';
import * as api from '../api';

export default function HistoryScreen() {
  const [history, setHistory] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const data = await api.getHistory(50);
      setHistory(data);
    } catch (err) {
      // ignore
    }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (!api.isConfigured()) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>Configure server URL in Settings</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.pink} />}
    >
      <Card>
        <View style={styles.header}>
          <Text style={styles.title}>{'\uD83D\uDCEC'} Send History</Text>
          <Text style={styles.subtitle}>{history.length} recent messages</Text>
        </View>

        {history.length === 0 ? (
          <Text style={styles.emptyText}>No messages sent yet</Text>
        ) : (
          history.map((h, i) => (
            <View key={i} style={styles.item}>
              <Text style={styles.messageText}>"{h.message}"</Text>
              <View style={styles.meta}>
                <Text style={styles.metaTime}>
                  {new Date(h.sentAt).toLocaleString()}
                </Text>
                <View style={styles.typeBadge}>
                  <Text style={styles.typeBadgeText}>
                    {h.type || h.channel || 'message'}
                  </Text>
                </View>
                {h.error && (
                  <Text style={styles.errorText}>Failed</Text>
                )}
              </View>
            </View>
          ))
        )}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.pinkBg },
  content: { padding: spacing.lg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.pinkBg },

  header: { marginBottom: 16 },
  title: { fontSize: 18, ...fonts.bold, color: colors.gray900 },
  subtitle: { fontSize: 13, color: colors.gray500, marginTop: 2 },

  item: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  messageText: { fontSize: 14, color: colors.gray900, lineHeight: 20 },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  metaTime: { fontSize: 12, color: colors.gray500 },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    backgroundColor: colors.gray100,
    borderRadius: 6,
  },
  typeBadgeText: { fontSize: 11, color: colors.gray500, ...fonts.medium },
  errorText: { fontSize: 12, color: colors.red },
  emptyText: { fontSize: 14, color: colors.gray400, textAlign: 'center', paddingVertical: 30 },
});
