import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, borderRadius, fonts } from '../theme';

export default function StatBox({ value, label }) {
  return (
    <View style={styles.box}>
      <Text style={styles.value}>{value ?? '-'}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: colors.gray50,
    borderRadius: borderRadius.md,
  },
  value: {
    fontSize: 24,
    color: colors.pink,
    ...fonts.extrabold,
  },
  label: {
    fontSize: 11,
    color: colors.gray500,
    marginTop: 2,
    textAlign: 'center',
  },
});
