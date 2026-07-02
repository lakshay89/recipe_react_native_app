import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING, BORDERS } from '../../core/theme/theme';

export const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry,
  style,
  inputStyle,
  keyboardType = 'default',
  autoCapitalize = 'none',
  multiline = false,
  numberOfLines,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const containerStyles = [
    styles.inputContainer,
    isFocused && styles.focusedInputContainer,
    error && styles.errorInputContainer,
    multiline && styles.multilineInputContainer,
    inputStyle,
  ];

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={containerStyles}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted + '80'}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={numberOfLines}
          style={[styles.textInput, multiline && styles.multilineTextInput]}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.sm,
    width: '100%',
  },
  label: {
    ...FONTS.labelCaps,
    color: COLORS.textMuted,
    fontSize: 12,
    marginBottom: SPACING.xs,
    letterSpacing: 1.2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderBottomWidth: BORDERS.widthThin,
    borderBottomColor: COLORS.border,
    height: 48,
    paddingHorizontal: SPACING.xs,
  },
  focusedInputContainer: {
    borderBottomColor: COLORS.primary, // Terracotta highlight
    borderBottomWidth: BORDERS.widthThick,
  },
  errorInputContainer: {
    borderBottomColor: COLORS.error, // Brick Red error
    borderBottomWidth: BORDERS.widthThick,
  },
  multilineInputContainer: {
    height: 90,
    alignItems: 'flex-start',
    paddingVertical: SPACING.xs,
  },
  textInput: {
    flex: 1,
    ...FONTS.body,
    fontSize: 16,
    color: COLORS.text,
    paddingVertical: 0,
  },
  multilineTextInput: {
    textAlignVertical: 'top',
    height: '100%',
  },
  errorText: {
    ...FONTS.caption,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
});

export default Input;
