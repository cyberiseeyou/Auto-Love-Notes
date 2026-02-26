import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, Alert, Linking,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Card from '../components/Card';
import Toggle from '../components/Toggle';
import { colors, fonts, spacing, borderRadius } from '../theme';
import * as api from '../api';

const FEATURE_NAMES = {
  aiGenerated: 'AI-Generated Messages',
  weatherAware: 'Weather-Aware Notes',
  photoNotes: 'Photo Attachments',
  quotes: 'Romantic Quotes',
  reasons: '"Reasons I Love You" Series',
  compliments: 'Daily Compliment Combos',
  insideJokes: 'Inside Jokes',
};

export default function SettingsScreen() {
  const [serverUrl, setServerUrl] = useState(api.getServerUrl());
  const [pin, setPin] = useState('');
  const [features, setFeatures] = useState(null);
  const [testing, setTesting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setServerUrl(api.getServerUrl());
      loadFeatures();
    }, [])
  );

  const loadFeatures = async () => {
    if (!api.isConfigured()) return;
    try {
      const status = await api.getStatus();
      setFeatures(status.features);
    } catch (err) {
      // ignore
    }
  };

  const handleSaveUrl = async () => {
    if (!serverUrl.trim()) {
      Alert.alert('Error', 'Enter a server URL');
      return;
    }
    await api.setServerUrl(serverUrl.trim());
    Alert.alert('Saved', 'Server URL saved');
    loadFeatures();
  };

  const handleSavePin = async () => {
    await api.setPin(pin);
    Alert.alert('Saved', pin ? 'PIN saved' : 'PIN cleared');
  };

  const handleTestConnection = async () => {
    if (!api.isConfigured()) {
      Alert.alert('Error', 'Save a server URL first');
      return;
    }
    setTesting(true);
    try {
      const status = await api.getStatus();
      Alert.alert(
        'Connected!',
        `Messenger: ${status.messengerConfigured ? 'Yes' : 'No'}\n` +
        `Messages: ${status.totalMessages}\n` +
        `Total sent: ${status.totalSent}`
      );
    } catch (err) {
      Alert.alert('Connection Failed', err.message);
    }
    setTesting(false);
  };

  const handleToggleFeature = async (key, currentValue) => {
    if (!api.isConfigured()) return;
    try {
      await api.updateFeatures({ [key]: !currentValue });
      setFeatures((prev) => ({ ...prev, [key]: !currentValue }));
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Server Connection */}
      <Card>
        <Text style={styles.sectionTitle}>Server Connection</Text>
        <Text style={styles.label}>Server URL</Text>
        <TextInput
          style={styles.input}
          value={serverUrl}
          onChangeText={setServerUrl}
          placeholder="http://192.168.1.100:3000"
          placeholderTextColor={colors.gray400}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
        />
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.primaryBtn} onPress={handleSaveUrl} activeOpacity={0.7}>
            <Text style={styles.primaryBtnText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={handleTestConnection}
            activeOpacity={0.7}
            disabled={testing}
          >
            <Text style={styles.secondaryBtnText}>
              {testing ? 'Testing...' : 'Test Connection'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.label, { marginTop: 16 }]}>Dashboard PIN (optional)</Text>
        <View style={styles.buttonRow}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            value={pin}
            onChangeText={setPin}
            placeholder="PIN"
            placeholderTextColor={colors.gray400}
            secureTextEntry
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.secondaryBtn} onPress={handleSavePin} activeOpacity={0.7}>
            <Text style={styles.secondaryBtnText}>Save PIN</Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Features */}
      {features && (
        <Card>
          <Text style={styles.sectionTitle}>Features</Text>
          <Text style={styles.sectionNote}>Toggle which message types are active</Text>
          {Object.entries(FEATURE_NAMES).map(([key, name]) => (
            <View key={key} style={styles.featureRow}>
              <Text style={styles.featureName}>{name}</Text>
              <Toggle
                value={features[key] ?? false}
                onToggle={() => handleToggleFeature(key, features[key])}
              />
            </View>
          ))}
        </Card>
      )}

      {/* About */}
      <Card>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.aboutText}>Auto Love Notes v2.0</Text>
        <Text style={styles.aboutSubtext}>
          AI-powered love notes via Messenger with weather awareness, photo notes, and more.
        </Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.pinkBg },
  content: { padding: spacing.lg },

  sectionTitle: { fontSize: 18, ...fonts.bold, color: colors.gray900, marginBottom: 4 },
  sectionNote: { fontSize: 13, color: colors.gray500, marginBottom: 16 },

  label: { fontSize: 13, color: colors.gray500, ...fonts.medium, marginBottom: 6, marginTop: 4 },
  input: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: colors.gray200,
    borderRadius: borderRadius.md,
    fontSize: 15,
    color: colors.gray900,
    backgroundColor: colors.white,
    marginBottom: 12,
  },

  buttonRow: { flexDirection: 'row', gap: 8 },
  primaryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.pink,
    borderRadius: borderRadius.md,
  },
  primaryBtnText: { color: colors.white, ...fonts.semibold, fontSize: 14 },
  secondaryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: colors.gray200,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
  },
  secondaryBtnText: { color: colors.gray700, ...fonts.medium, fontSize: 14 },

  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  featureName: { fontSize: 15, color: colors.gray900, ...fonts.medium },

  aboutText: { fontSize: 15, color: colors.gray900, ...fonts.semibold, marginTop: 8 },
  aboutSubtext: { fontSize: 13, color: colors.gray500, marginTop: 4, lineHeight: 19 },
});
