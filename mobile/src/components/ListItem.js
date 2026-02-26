import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, borderRadius, fonts } from '../theme';

export default function ListItem({ text, badge, onDelete, prefix }) {
  return (
    <View style={styles.item}>
      {prefix && <Text style={styles.prefix}>{prefix}</Text>}
      <Text style={styles.text} numberOfLines={3}>{text}</Text>
      {badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
      {onDelete && (
        <TouchableOpacity onPress={onDelete} style={styles.deleteBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.deleteText}>{'\u00D7'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.gray50,
    borderRadius: borderRadius.md,
    marginBottom: 8,
  },
  prefix: {
    fontSize: 13,
    color: colors.pink,
    ...fonts.bold,
  },
  text: {
    flex: 1,
    fontSize: 14,
    color: colors.gray900,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: colors.pinkBg,
    borderRadius: borderRadius.sm,
  },
  badgeText: {
    fontSize: 11,
    color: colors.pink,
    ...fonts.semibold,
  },
  deleteBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  deleteText: {
    fontSize: 20,
    color: colors.gray400,
    lineHeight: 22,
  },
});
