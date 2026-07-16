import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SPACING, BORDERS, SHADOWS } from '../../../core/theme/theme';
import { useAuth } from '../../../shared/services/AuthContext';
import Header from '../../../shared/components/Header';
import Input from '../../../shared/components/Input';
import Button from '../../../shared/components/Button';
import Card from '../../../shared/components/Card';
import recentCacheService from '../../../core/services/recentCacheService';
import RecipeNameAutocomplete from './components/RecipeNameAutocomplete';
import { normalizeRecipeName, addCustomRecipeName } from '../services/recipeNameService';
import TransitionView from '../../../shared/components/TransitionView';

export const RecipeIdentityScreen = ({ navigation }) => {
  const { recipeDraft, saveRecipeDraft } = useAuth();
  
  const [title, setTitle] = useState('');
  const [localName, setLocalName] = useState('');
  const [nativeScript, setNativeScript] = useState('');
  const [altNames, setAltNames] = useState('');
  const [history, setHistory] = useState(''); // description/history
  const [recentRecipes, setRecentRecipes] = useState([]);
  
  const [errors, setErrors] = useState({});
  
  // Initialize fields from draft
  useEffect(() => {
    if (recipeDraft) {
      setTitle(recipeDraft.title || '');
      setLocalName(recipeDraft.localName || '');
      setNativeScript(recipeDraft.nativeScript || '');
      setAltNames(recipeDraft.altNames || '');
      setHistory(recipeDraft.history || '');
    }
  }, [recipeDraft]);

  // Load recent entries
  useEffect(() => {
    recentCacheService.getRecentItems('recipe_names').then(setRecentRecipes);
  }, []);

  const saveCurrentDraft = (silent = true) => {
    const updatedDraft = {
      ...(recipeDraft || {}),
      title,
      localName,
      nativeScript,
      altNames,
      history,
    };
    saveRecipeDraft(updatedDraft);
    if (!silent) {
      Alert.alert('Draft Saved', 'Your progress has been saved locally.');
    }
    return updatedDraft;
  };

  const handleNext = () => {
    let newErrors = {};
    if (!title.trim()) {
      newErrors.title = 'Recipe Title is required';
    }
    if (!history.trim()) {
      newErrors.history = 'Short Description is required';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // Auto-save title if it is a new custom entry
      const normalizedTitle = normalizeRecipeName(title);
      if (normalizedTitle) {
        addCustomRecipeName(normalizedTitle).catch((err) =>
          console.error('Failed to auto-persist custom recipe name', err)
        );
      }
      
      recentCacheService.addRecentItem('recipe_names', normalizedTitle || title);
      saveCurrentDraft(true);
      navigation.navigate('RecipeLocation');
    } else {
      Alert.alert('Validation Error', 'Please fill in all required fields.');
    }
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <Header title="Add Recipe" showBack={true} showAvatar={false} />

      <TransitionView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Step Indicator */}
        <View style={styles.progressContainer}>
          <Text style={styles.stepText}>STEP 1 OF 8</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: '12.5%' }]} />
          </View>
        </View>

        {/* Section Header */}
        <Text style={styles.sectionTitle}>Recipe Identity</Text>
        <Text style={styles.sectionSubtitle}>
          Define the culinary record title and native naming keys.
        </Text>

        {/* Form Card */}
        <Card variant="default" style={styles.formCard}>
          <RecipeNameAutocomplete
            value={title}
            onChangeText={(text) => {
              setErrors((prev) => ({ ...prev, title: '' }));
              setTitle(text);
            }}
            error={errors.title}
          />

          {recentRecipes.length > 0 && (
            <View style={styles.chipRow}>
              {recentRecipes.map((r) => (
                <TouchableOpacity
                  key={r}
                  style={styles.suggestionChip}
                  onPress={() => {
                    setTitle(r);
                    setErrors((prev) => ({ ...prev, title: '' }));
                  }}
                >
                  <Text style={styles.suggestionChipText}>🕒 {r}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Input
            label="Local Regional Name"
            placeholder="e.g. Dum Oluv"
            value={localName}
            onChangeText={setLocalName}
          />

          <Input
            label="Native Script / Character Name"
            placeholder="e.g. दम आलू"
            value={nativeScript}
            onChangeText={setNativeScript}
          />

          <Input
            label="Alternative/Dialect Names"
            placeholder="e.g. Alu Dum, Dum Alu"
            value={altNames}
            onChangeText={setAltNames}
          />

          <Input
            label="Short Description / History *"
            placeholder="Describe the dish origin and unique history..."
            value={history}
            onChangeText={(text) => {
              setErrors((prev) => ({ ...prev, history: '' }));
              setHistory(text);
            }}
            multiline={true}
            numberOfLines={3}
            error={errors.history}
          />

          <View style={styles.chipRow}>
            {['Traditional Family Recipe', 'Festival Dish', 'Temple Offering', 'Community Speciality'].map((chip) => (
              <TouchableOpacity
                key={chip}
                style={styles.suggestionChip}
                onPress={() => {
                  setHistory((prev) => {
                    const cleanPrev = prev.trim();
                    if (!cleanPrev) return chip;
                    if (cleanPrev.endsWith('.') || cleanPrev.endsWith('!')) {
                      return `${cleanPrev} This is a ${chip.toLowerCase()}.`;
                    }
                    return `${cleanPrev}, ${chip.toLowerCase()}`;
                  });
                }}
              >
                <Text style={styles.suggestionChipText}>+ {chip}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Audio Pronunciation Placeholder */}
          {/* <View style={styles.audioPlaceholder}>
            <Text style={styles.audioIcon}>🎙</Text>
            <Text style={styles.audioLabel}>Native Pronunciation Recording</Text>
            <Text style={styles.audioDesc}>(Record pronunciation helper in regional dialect)</Text>
          </View> */}
        </Card>

        {/* Footer Actions */}
        <View style={styles.buttonRow}>
          <Button
            title="Save Draft"
            variant="outline"
            onPress={() => saveCurrentDraft(false)}
            style={styles.actionBtn}
          />
          <Button
            title="Next Step"
            variant="primary"
            onPress={handleNext}
            style={styles.actionBtn}
          />
        </View>
      </ScrollView>
      </TransitionView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingBottom: 110,
  },
  progressContainer: {
    marginBottom: SPACING.lg,
  },
  stepText: {
    ...FONTS.labelCaps,
    fontSize: 11,
    color: COLORS.primary,
    marginBottom: 6,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: COLORS.borderLight,
    borderRadius: 2,
    width: '100%',
  },
  progressBarFill: {
    height: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  sectionTitle: {
    ...FONTS.titleLarge,
    fontSize: 26,
    color: COLORS.secondary,
  },
  sectionSubtitle: {
    ...FONTS.body,
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 20,
    marginTop: 4,
    marginBottom: SPACING.lg,
  },
  formCard: {
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderColor: COLORS.borderLight,
    ...SHADOWS.medium,
  },
  audioPlaceholder: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    borderRadius: BORDERS.radiusMd,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.md,
    backgroundColor: COLORS.background,
  },
  audioIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  audioLabel: {
    ...FONTS.bodyBold,
    fontSize: 14,
    color: COLORS.text,
  },
  audioDesc: {
    ...FONTS.caption,
    fontSize: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xl,
    gap: SPACING.md,
  },
  actionBtn: {
    flex: 1,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  suggestionChip: {
    backgroundColor: '#FAF5EE',
    borderWidth: 1,
    borderColor: '#ECE3D7',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  suggestionChipText: {
    ...FONTS.caption,
    fontSize: 12,
    color: COLORS.primary,
  },
});

export default RecipeIdentityScreen;
