import React from 'react';
import { TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { colors } from '../theme';

export default function Toggle({ value, onToggle }) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onToggle}
      style={[styles.track, value && styles.trackActive]}
    >
      <Animated.View style={[styles.thumb, value && styles.thumbActive]} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 52,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.gray200,
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  trackActive: {
    backgroundColor: colors.pink,
  },
  thumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  thumbActive: {
    alignSelf: 'flex-end',
  },
});
