import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, SafeAreaView, ScrollView, Alert, Switch, Image } from 'react-native';
import { COLORS, FONTS, SPACING, BORDERS, SHADOWS } from '../../../core/theme/theme';
import { useAuth } from '../../../shared/services/AuthContext';
import Header from '../../../shared/components/Header';
import Input from '../../../shared/components/Input';
import Button from '../../../shared/components/Button';
import Card from '../../../shared/components/Card';

export const RecipeLocationScreen = ({ navigation }) => {
  const { recipeDraft, saveRecipeDraft } = useAuth();
  
  const [region, setRegion] = useState(''); // State / Primary Region
  const [district, setDistrict] = useState('');
  const [tehsil, setTehsil] = useState('');
  const [village, setVillage] = useState('');
  const [gpsCoords, setGpsCoords] = useState('');
  const [isBorderRegion, setIsBorderRegion] = useState(false);
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (recipeDraft) {
      setRegion(recipeDraft.region || '');
      setDistrict(recipeDraft.district || '');
      setTehsil(recipeDraft.tehsil || '');
      setVillage(recipeDraft.village || '');
      setGpsCoords(recipeDraft.gpsCoords || '');
      setIsBorderRegion(recipeDraft.isBorderRegion || false);
    }
  }, [recipeDraft]);

  const saveCurrentDraft = (silent = true) => {
    const updatedDraft = {
      ...(recipeDraft || {}),
      region,
      district,
      tehsil,
      village,
      gpsCoords,
      isBorderRegion,
    };
    saveRecipeDraft(updatedDraft);
    if (!silent) {
      Alert.alert('Draft Saved', 'Your progress has been saved locally.');
    }
    return updatedDraft;
  };

  const handleNext = () => {
    let newErrors = {};
    if (!region.trim()) {
      newErrors.region = 'State / Region of origin is required';
    }
    if (!district.trim()) {
      newErrors.district = 'District is required';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      saveCurrentDraft(true);
      navigation.navigate('RecipeHeritageSource');
    } else {
      Alert.alert('Validation Error', 'Please fill in all required fields.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <Header title="Add Recipe" showBack={true} showAvatar={false} />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Step Indicator */}
        <View style={styles.progressContainer}>
          <Text style={styles.stepText}>STEP 2 OF 8</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: '25%' }]} />
          </View>
        </View>

        {/* Section Header */}
        <Text style={styles.sectionTitle}>Geographic Origin</Text>
        <Text style={styles.sectionSubtitle}>
          Map the specific regional location where this recipe was nurtured.
        </Text>

        {/* Form Card */}
        <Card variant="default" style={styles.formCard}>
          <Input
            label="State / Primary Region *"
            placeholder="e.g. Jammu & Kashmir"
            value={region}
            onChangeText={(text) => {
              setErrors((prev) => ({ ...prev, region: '' }));
              setRegion(text);
            }}
            error={errors.region}
          />

          <Input
            label="District *"
            placeholder="e.g. Anantnag"
            value={district}
            onChangeText={(text) => {
              setErrors((prev) => ({ ...prev, district: '' }));
              setDistrict(text);
            }}
            error={errors.district}
          />

          <Input
            label="Tehsil / Sub-division"
            placeholder="e.g. Bijbehara"
            value={tehsil}
            onChangeText={setTehsil}
          />

          <Input
            label="Village / Community Settlement"
            placeholder="e.g. Waghama"
            value={village}
            onChangeText={setVillage}
          />

          <Input
            label="GPS Pin Coordinates (Latitude, Longitude)"
            placeholder="e.g. 33.7915° N, 75.1098° E"
            value={gpsCoords}
            onChangeText={setGpsCoords}
          />

          {/* Border Region Toggle */}
          <View style={styles.switchRow}>
            <View style={styles.switchTextContainer}>
              <Text style={styles.switchLabel}>Cross-Border / Shared Region</Text>
              <Text style={styles.switchDesc}>Toggle if this recipe is shared with neighboring countries/states</Text>
            </View>
            <Switch
              value={isBorderRegion}
              onValueChange={setIsBorderRegion}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={isBorderRegion ? COLORS.white : COLORS.background}
            />
          </View>

          {/* Mini Map Placeholder */}
          <View style={styles.mapContainer}>
            <Image
              source={require('../../../assets/images/screen.png')}
              style={StyleSheet.absoluteFillObject}
              resizeMode="cover"
            />
            <View style={styles.mapOverlay} />
            <Text style={styles.mapText}>📍 Location Mapping Registered</Text>
          </View>
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
    </SafeAreaView>
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
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  switchTextContainer: {
    flex: 1,
    marginRight: SPACING.md,
  },
  switchLabel: {
    ...FONTS.bodyMedium,
    fontSize: 14,
    color: COLORS.text,
  },
  switchDesc: {
    ...FONTS.caption,
    fontSize: 11,
  },
  mapContainer: {
    height: 120,
    borderRadius: BORDERS.radiusMd,
    overflow: 'hidden',
    marginTop: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(251, 249, 244, 0.85)',
  },
  mapText: {
    ...FONTS.bodyBold,
    fontSize: 13,
    color: COLORS.primary,
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
});

export default RecipeLocationScreen;
