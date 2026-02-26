import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, RefreshControl, Alert, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Card from '../components/Card';
import StatBox from '../components/StatBox';
import Toggle from '../components/Toggle';
import { colors, fonts, spacing, borderRadius } from '../theme';
import * as api from '../api';

export default function HomeScreen() {
  const [status, setStatus] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [sending, setSending] = useState(false);
  const [customMsg, setCustomMsg] = useState('');
  const [showDndOptions, setShowDndOptions] = useState(false);

  const loadStatus = async () => {
    try {
      const s = await api.getStatus();
      setStatus(s);
    } catch (err) {
      // silently fail if not configured yet
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadStatus();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStatus();
    setRefreshing(false);
  };

  const handleThinkingOfYou = async () => {
    setSending(true);
    try {
      await api.sendThinkingOfYou();
      Alert.alert('Sent!', 'Love note sent with love \u2764\uFE0F');
      loadStatus();
    } catch (err) {
      Alert.alert('Error', err.message);
    }
    setSending(false);
  };

  const handleCustomSend = async () => {
    if (!customMsg.trim()) return;
    setSending(true);
    try {
      await api.sendThinkingOfYou(customMsg);
      Alert.alert('Sent!', `"${customMsg}"`);
      setCustomMsg('');
      loadStatus();
    } catch (err) {
      Alert.alert('Error', err.message);
    }
    setSending(false);
  };

  const handleDndToggle = async () => {
    if (!status) return;
    if (status.dnd.enabled) {
      await api.setDND(false);
      loadStatus();
    } else {
      setShowDndOptions(true);
    }
  };

  const handleDndSet = async (hours) => {
    setShowDndOptions(false);
    await api.setDND(true, hours || null);
    loadStatus();
  };

  if (!api.isConfigured()) {
    return (
      <View style={styles.centered}>
        <Text style={styles.setupTitle}>Welcome to Love Notes</Text>
        <Text style={styles.setupText}>
          Go to Settings and enter your server URL to get started.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.pink} />}
    >
      {/* Days Together */}
      {status?.daysTogether != null && (
        <View style={styles.daysCounter}>
          <Text style={styles.daysText}>{status.daysTogether} days together</Text>
        </View>
      )}

      {/* Thinking of You */}
      <TouchableOpacity
        style={styles.thinkBtn}
        onPress={handleThinkingOfYou}
        activeOpacity={0.8}
        disabled={sending}
      >
        {sending ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.thinkBtnText}>{'\uD83D\uDCAD'} Thinking of You</Text>
        )}
      </TouchableOpacity>

      <View style={styles.customRow}>
        <TextInput
          style={styles.customInput}
          value={customMsg}
          onChangeText={setCustomMsg}
          placeholder="Or type a custom message..."
          placeholderTextColor={colors.gray400}
          returnKeyType="send"
          onSubmitEditing={handleCustomSend}
        />
        <TouchableOpacity style={styles.customBtn} onPress={handleCustomSend} activeOpacity={0.7}>
          <Text style={styles.customBtnText}>Send</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      {status && (
        <Card>
          <View style={styles.statsRow}>
            <StatBox value={status.scheduledCount} label="Scheduled" />
            <View style={{ width: 10 }} />
            <StatBox value={status.totalSent} label="Total Sent" />
            <View style={{ width: 10 }} />
            <StatBox value={status.totalMessages} label="Messages" />
          </View>
        </Card>
      )}

      {/* DND */}
      <Card>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionIcon}>{'\uD83D\uDD15'}</Text>
          <Text style={styles.sectionTitle}>Do Not Disturb</Text>
        </View>
        <View style={styles.dndRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.dndLabel}>Pause sending</Text>
            <Text style={styles.dndStatus}>
              {status?.dnd?.enabled
                ? 'Active' + (status.dnd.until ? ` until ${new Date(status.dnd.until).toLocaleTimeString()}` : '')
                : 'Off'}
            </Text>
          </View>
          <Toggle value={status?.dnd?.enabled ?? false} onToggle={handleDndToggle} />
        </View>

        {showDndOptions && (
          <View style={styles.dndOptions}>
            {[1, 2, 4].map((h) => (
              <TouchableOpacity key={h} style={styles.dndOptionBtn} onPress={() => handleDndSet(h)}>
                <Text style={styles.dndOptionText}>{h}h</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.dndOptionBtn} onPress={() => handleDndSet(0)}>
              <Text style={styles.dndOptionText}>Indefinite</Text>
            </TouchableOpacity>
          </View>
        )}
      </Card>

      {/* Connection Status */}
      {status && (
        <Card>
          <View style={styles.sectionHeader}>
            <View style={[styles.statusDot, { backgroundColor: status.messengerConfigured ? colors.green : colors.red }]} />
            <Text style={styles.sectionTitle}>
              Messenger: {status.messengerConfigured ? 'Connected' : 'Not configured'}
            </Text>
          </View>
          <Text style={styles.metaText}>
            {status.schedule.minPerDay}-{status.schedule.maxPerDay} messages/day
            {' \u2022 '}
            {status.schedule.earliestHour}:00-{status.schedule.latestHour}:00
          </Text>
          {status.totalPhotos > 0 && (
            <Text style={styles.metaText}>{status.totalPhotos} photos available</Text>
          )}
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.pinkBg },
  content: { padding: spacing.lg, paddingTop: spacing.lg },
  centered: {
    flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, backgroundColor: colors.pinkBg,
  },
  setupTitle: { fontSize: 22, color: colors.pink, ...fonts.bold, marginBottom: 12, textAlign: 'center' },
  setupText: { fontSize: 15, color: colors.gray500, textAlign: 'center', lineHeight: 22 },

  daysCounter: {
    alignSelf: 'center',
    backgroundColor: colors.pink,
    borderRadius: borderRadius.xl,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: spacing.lg,
  },
  daysText: { color: colors.white, fontSize: 13, ...fonts.semibold },

  thinkBtn: {
    paddingVertical: 16,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginBottom: spacing.sm,
    backgroundColor: colors.pink,
    shadowColor: colors.pink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  thinkBtnText: { color: colors.white, fontSize: 18, ...fonts.bold },

  customRow: { flexDirection: 'row', gap: 8, marginBottom: spacing.lg },
  customInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: colors.gray200,
    borderRadius: borderRadius.md,
    fontSize: 14,
    color: colors.gray900,
    backgroundColor: colors.white,
  },
  customBtn: {
    paddingHorizontal: 16,
    backgroundColor: colors.pink,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
  },
  customBtnText: { color: colors.white, ...fonts.semibold },

  statsRow: { flexDirection: 'row' },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionIcon: { fontSize: 18 },
  sectionTitle: { fontSize: 16, ...fonts.bold, color: colors.gray900 },

  dndRow: { flexDirection: 'row', alignItems: 'center' },
  dndLabel: { fontSize: 15, ...fonts.semibold, color: colors.gray900 },
  dndStatus: { fontSize: 13, color: colors.gray500, marginTop: 2 },
  dndOptions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  dndOptionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: colors.gray200,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.white,
  },
  dndOptionText: { fontSize: 13, color: colors.gray700 },

  statusDot: { width: 8, height: 8, borderRadius: 4 },
  metaText: { fontSize: 13, color: colors.gray500, marginTop: 4 },
});
