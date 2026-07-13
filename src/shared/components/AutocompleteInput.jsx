import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS, FONTS, SPACING, BORDERS, SHADOWS } from '../../core/theme/theme';

export const AutocompleteInput = ({
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
  suggestions = [],
  maxSuggestions = 6,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const containerStyles = [
    styles.inputContainer,
    isFocused && styles.focusedInputContainer,
    error && styles.errorInputContainer,
    multiline && styles.multilineInputContainer,
    inputStyle,
  ];

  const getFilteredSuggestions = () => {
    if (!value || value.trim() === '') return [];
    
    const query = value.toLowerCase().trim();
    const filtered = suggestions
      .filter((item) => {
        if (typeof item === 'string') {
          return item.toLowerCase().includes(query);
        } else if (item && typeof item === 'object' && item.name) {
          const nameMatch = item.name.toLowerCase().includes(query);
          const aliasMatch = item.aliases && item.aliases.some(alias => alias.toLowerCase().includes(query));
          return nameMatch || aliasMatch;
        }
        return false;
      })
      .slice(0, maxSuggestions);

    return filtered;
  };

  const filtered = getFilteredSuggestions();

  const handleSelect = (item) => {
    const selectedText = typeof item === 'string' ? item : item.name;
    onChangeText(selectedText);
    setShowDropdown(false);
  };

  return (
    <View style={[styles.container, style, { zIndex: isFocused && filtered.length > 0 ? 999 : 1 }]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={containerStyles}>
        <TextInput
          value={value}
          onChangeText={(text) => {
            onChangeText(text);
            setShowDropdown(true);
          }}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted + '80'}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={numberOfLines}
          style={[styles.textInput, multiline && styles.multilineTextInput]}
          onFocus={() => {
            setIsFocused(true);
            setShowDropdown(true);
          }}
          onBlur={() => {
            setTimeout(() => {
              setIsFocused(false);
              setShowDropdown(false);
            }, 200);
          }}
          {...props}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}

      {isFocused && showDropdown && filtered.length > 0 && (
        <View style={styles.dropdownContainer}>
          <ScrollView 
            keyboardShouldPersistTaps="always" 
            style={styles.scrollView}
            showsVerticalScrollIndicator={true}
          >
            {filtered.map((item, index) => {
              const text = typeof item === 'string' ? item : item.name;
              const category = typeof item === 'object' ? item.category : null;
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.suggestionItem,
                    index < filtered.length - 1 && styles.suggestionBorder
                  ]}
                  onPress={() => handleSelect(item)}
                >
                  <View style={styles.suggestionTextRow}>
                    <Text style={styles.suggestionText}>{text}</Text>
                    {category && (
                      <Text style={styles.suggestionCategory}>{category}</Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.sm,
    width: '100%',
    position: 'relative',
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
    borderBottomColor: COLORS.primary,
    borderBottomWidth: BORDERS.widthThick,
  },
  errorInputContainer: {
    borderBottomColor: COLORS.error,
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
  dropdownContainer: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderRadius: BORDERS.radiusMd,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.medium,
    maxHeight: 220,
    zIndex: 10000,
  },
  scrollView: {
    flex: 1,
  },
  suggestionItem: {
    paddingVertical: 12,
    paddingHorizontal: SPACING.md,
  },
  suggestionBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.borderLight,
  },
  suggestionTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  suggestionText: {
    ...FONTS.bodyMedium,
    fontSize: 15,
    color: COLORS.text,
  },
  suggestionCategory: {
    ...FONTS.caption,
    fontSize: 11,
    color: COLORS.primary,
    backgroundColor: '#FAF5EE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
});

export default AutocompleteInput;
