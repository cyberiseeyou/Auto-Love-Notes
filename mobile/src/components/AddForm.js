import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, borderRadius, fonts } from '../theme';

export default function AddForm({ placeholder, buttonText = 'Add', onSubmit }) {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setText('');
  };

  return (
    <View style={styles.row}>
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder={placeholder}
        placeholderTextColor={colors.gray400}
        returnKeyType="send"
        onSubmitEditing={handleSubmit}
      />
      <TouchableOpacity style={styles.button} onPress={handleSubmit} activeOpacity={0.7}>
        <Text style={styles.buttonText}>{buttonText}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  input: {
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
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.pink,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
  },
  buttonText: {
    color: colors.white,
    ...fonts.semibold,
    fontSize: 14,
  },
});
