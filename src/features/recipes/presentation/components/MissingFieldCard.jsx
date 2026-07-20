import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { AlertCircle, HelpCircle, Edit, Sparkles, Check } from 'lucide-react-native';
import { COLORS, FONTS, SPACING } from '../../../../core/theme/theme';

export const MissingFieldCard = ({
  fieldKey,
  fieldName,
  onResolve,
  onGetSuggestion,
  isGeneratingSuggestion,
  suggestedValue,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [suggestionAccepted, setSuggestionAccepted] = useState(false);

  const handleSubmitManual = () => {
    if (inputValue.trim()) {
      onResolve(inputValue.trim(), 'manually_entered');
    }
  };

  const handleAcceptSuggestion = () => {
    if (suggestedValue) {
      setSuggestionAccepted(true);
      onResolve(suggestedValue, 'ai_suggested');
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <AlertCircle size={18} color={COLORS.primary} style={styles.icon} />
        <Text style={styles.title}>Missing {fieldName}</Text>
      </View>
      
      <Text style={styles.description}>
        This field could not be extracted from the recipe image. Please provide it to complete the archive record.
      </Text>

      {/* Suggestion Display */}
      {suggestedValue && !suggestionAccepted && (
        <View style={styles.suggestionBox}>
          <Text style={styles.suggestionLabel}>💡 Suggested Value:</Text>
          <Text style={styles.suggestionText}>{suggestedValue}</Text>
          <TouchableOpacity 
            style={styles.acceptBtn} 
            onPress={handleAcceptSuggestion}
            activeOpacity={0.8}
          >
            <Check size={14} color={COLORS.white} style={styles.btnIcon} />
            <Text style={styles.acceptBtnText}>Accept AI Suggestion</Text>
          </TouchableOpacity>
        </View>
      )}

      {showInput ? (
        <View style={styles.inputForm}>
          <TextInput
            style={styles.textInput}
            value={inputValue}
            onChangeText={setInputValue}
            placeholder={`Enter ${fieldName.toLowerCase()}...`}
            placeholderTextColor={COLORS.textMuted}
            autoFocus
          />
          <View style={styles.inputActionRow}>
            <TouchableOpacity 
              style={[styles.smallBtn, styles.cancelBtn]} 
              onPress={() => setShowInput(false)}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.smallBtn, styles.submitBtn]} 
              onPress={handleSubmitManual}
            >
              <Text style={styles.submitBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => setShowInput(true)}
            activeOpacity={0.8}
          >
            <Edit size={13} color={COLORS.secondary} style={styles.btnIcon} />
            <Text style={styles.actionBtnText}>Add Manually</Text>
          </TouchableOpacity>

          {onGetSuggestion && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.aiBtn]} 
              onPress={onGetSuggestion}
              disabled={isGeneratingSuggestion || !!suggestedValue}
              activeOpacity={0.8}
            >
              {isGeneratingSuggestion ? (
                <ActivityIndicator size="small" color={COLORS.primary} style={styles.btnIcon} />
              ) : (
                <Sparkles size={13} color={COLORS.primary} style={styles.btnIcon} />
              )}
              <Text style={[styles.actionBtnText, { color: COLORS.primary }]}>
                {isGeneratingSuggestion ? 'Thinking...' : 'AI Suggest'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderColor: '#ECE3D7',
    borderWidth: 1,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  icon: {
    marginRight: 6,
  },
  title: {
    ...FONTS.bodyBold,
    fontSize: 14,
    color: COLORS.secondary,
  },
  description: {
    ...FONTS.caption,
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 16,
    marginBottom: SPACING.md,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: '#ECE3D7',
    backgroundColor: '#FAF5EE',
  },
  aiBtn: {
    backgroundColor: '#FAF0E6',
    borderColor: COLORS.primary,
  },
  btnIcon: {
    marginRight: 6,
  },
  actionBtnText: {
    ...FONTS.caption,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  inputForm: {
    marginTop: SPACING.xs,
  },
  textInput: {
    borderWidth: 0.5,
    borderColor: '#ECE3D7',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 13,
    color: COLORS.text,
    backgroundColor: '#FAF8F4',
    marginBottom: 8,
    ...FONTS.body,
  },
  inputActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  smallBtn: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  cancelBtn: {
    backgroundColor: '#F5F5F5',
  },
  cancelBtnText: {
    ...FONTS.caption,
    fontSize: 11,
    color: COLORS.textMuted,
  },
  submitBtn: {
    backgroundColor: COLORS.secondary,
  },
  submitBtnText: {
    ...FONTS.caption,
    fontSize: 11,
    color: COLORS.white,
    fontWeight: '700',
  },
  suggestionBox: {
    backgroundColor: '#FAF0E6',
    borderColor: COLORS.primary,
    borderWidth: 0.5,
    borderRadius: 6,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  suggestionLabel: {
    ...FONTS.caption,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 2,
  },
  suggestionText: {
    ...FONTS.body,
    fontSize: 12,
    color: COLORS.text,
    marginBottom: 8,
  },
  acceptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  acceptBtnText: {
    ...FONTS.caption,
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.white,
  },
});

export default MissingFieldCard;
