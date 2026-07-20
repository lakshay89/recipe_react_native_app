import React, { useMemo } from 'react';
import { View, TextInput, StyleSheet, ScrollView, Text } from 'react-native';
import { COLORS, FONTS, BORDERS } from '../../../../core/theme/theme';

export const OCRTextEditor = ({ value, onChangeText, style }) => {
  // Compute line count to render code-editor style line numbers
  const lineNumbers = useMemo(() => {
    const lineCount = (value || '').split('\n').length;
    return Array.from({ length: Math.max(lineCount, 1) }, (_, idx) => idx + 1);
  }, [value]);

  return (
    <View style={[styles.editorContainer, style]}>
      {/* Line Numbers Sidebar */}
      <View style={styles.sidebar}>
        {lineNumbers.map(num => (
          <Text key={num} style={styles.lineNumberText}>
            {num}
          </Text>
        ))}
      </View>

      {/* Main Multi-line Editor Textarea */}
      <TextInput
        style={styles.textInput}
        multiline
        value={value}
        onChangeText={onChangeText}
        textAlignVertical="top"
        placeholder="Extracted recipe text will appear here. Correct any spelling or layout mistakes..."
        placeholderTextColor={COLORS.textMuted}
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  editorContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#ECE3D7',
    borderRadius: 12,
    minHeight: 220,
    maxHeight: 400,
    overflow: 'hidden',
  },
  sidebar: {
    backgroundColor: '#F5ECE1',
    width: 35,
    paddingVertical: 12,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#ECE3D7',
  },
  lineNumberText: {
    ...FONTS.caption,
    fontSize: 11,
    color: '#8D7F70',
    lineHeight: 18,
    fontFamily: 'monospace',
  },
  textInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.text,
    fontFamily: 'monospace',
    ...FONTS.body,
  },
});

export default OCRTextEditor;
