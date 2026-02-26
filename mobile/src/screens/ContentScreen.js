import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Card from '../components/Card';
import ListItem from '../components/ListItem';
import AddForm from '../components/AddForm';
import { colors, fonts, spacing, borderRadius } from '../theme';
import * as api from '../api';

const TABS = ['Messages', 'Jokes', 'Reasons', 'Compliments', 'Quotes'];

export default function ContentScreen() {
  const [tab, setTab] = useState('Messages');
  const [messages, setMessages] = useState([]);
  const [jokes, setJokes] = useState([]);
  const [reasons, setReasons] = useState({ reasons: [], nextNumber: 1 });
  const [compliments, setCompliments] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadAll = async () => {
    try {
      const [m, j, r, c, q] = await Promise.all([
        api.getMessages(),
        api.getInsideJokes(),
        api.getReasons(),
        api.getCompliments(),
        api.getQuotes(),
      ]);
      setMessages(m);
      setJokes(j);
      setReasons(r);
      setCompliments(c);
      setQuotes(q);
    } catch (err) {
      // ignore
    }
  };

  useFocusEffect(useCallback(() => { loadAll(); }, []));

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  };

  // ── Message handlers ─────────────────
  const handleAddMessage = async (text) => {
    await api.addMessage(text, 'sweet', 'any');
    loadAll();
  };

  const handleDeleteMessage = async (id) => {
    Alert.alert('Delete', 'Remove this message?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await api.deleteMessage(id); loadAll(); } },
    ]);
  };

  const handleAddJoke = async (text) => {
    await api.addInsideJoke(text);
    loadAll();
  };

  const handleDeleteJoke = async (idx) => {
    Alert.alert('Delete', 'Remove this joke?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await api.deleteInsideJoke(idx); loadAll(); } },
    ]);
  };

  const handleAddReason = async (text) => {
    await api.addReason(text);
    loadAll();
  };

  const handleAddCompliment = async (text) => {
    await api.addCompliment(text);
    loadAll();
  };

  const handleAddQuote = async (text) => {
    // Simple: "quote text — author" format
    const parts = text.split(' — ');
    const quoteText = parts[0];
    const author = parts[1] || 'Unknown';
    await api.addQuote(quoteText, author);
    loadAll();
  };

  const renderContent = () => {
    switch (tab) {
      case 'Messages':
        return (
          <View>
            {messages.map((m) => (
              <ListItem
                key={m.id}
                text={m.text}
                badge={m.category}
                onDelete={() => handleDeleteMessage(m.id)}
              />
            ))}
            <AddForm placeholder="New love note..." onSubmit={handleAddMessage} />
          </View>
        );

      case 'Jokes':
        return (
          <View>
            <Text style={styles.sectionNote}>Inside jokes that only you two get</Text>
            {jokes.length === 0 ? (
              <Text style={styles.emptyText}>No inside jokes yet</Text>
            ) : (
              jokes.map((j, i) => (
                <ListItem key={i} text={j.text} onDelete={() => handleDeleteJoke(i)} />
              ))
            )}
            <AddForm placeholder="Add an inside joke..." onSubmit={handleAddJoke} />
          </View>
        );

      case 'Reasons':
        return (
          <View>
            <Text style={styles.sectionNote}>Reasons I love you — sent as a numbered series</Text>
            {reasons.reasons.map((r, i) => (
              <ListItem key={i} text={r} prefix={`#${i + 1}`} />
            ))}
            <AddForm placeholder="the way you..." onSubmit={handleAddReason} />
          </View>
        );

      case 'Compliments':
        return (
          <View>
            <Text style={styles.sectionNote}>Compliments paired with a love note</Text>
            {compliments.map((c, i) => (
              <ListItem key={i} text={c} />
            ))}
            <AddForm placeholder="Add a compliment..." onSubmit={handleAddCompliment} />
          </View>
        );

      case 'Quotes':
        return (
          <View>
            <Text style={styles.sectionNote}>Romantic quotes from famous people</Text>
            {quotes.map((q, i) => (
              <ListItem key={i} text={`"${q.text}" — ${q.author}`} />
            ))}
            <AddForm placeholder={'"Quote" — Author'} onSubmit={handleAddQuote} />
          </View>
        );
    }
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
      {/* Tab Bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar} contentContainerStyle={styles.tabBarContent}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
            onPress={() => setTab(t)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabBtnText, tab === t && styles.tabBtnTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Card>{renderContent()}</Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.pinkBg },
  content: { padding: spacing.lg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.pinkBg },

  tabBar: { marginBottom: spacing.lg, flexGrow: 0 },
  tabBarContent: { gap: 6 },
  tabBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.gray100,
    borderRadius: borderRadius.sm,
  },
  tabBtnActive: { backgroundColor: colors.pink },
  tabBtnText: { fontSize: 13, color: colors.gray500, ...fonts.medium },
  tabBtnTextActive: { color: colors.white },

  sectionNote: { fontSize: 13, color: colors.gray500, marginBottom: 12 },
  emptyText: { fontSize: 14, color: colors.gray400, textAlign: 'center', paddingVertical: 20 },
});
