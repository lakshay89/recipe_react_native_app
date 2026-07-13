import React, { useState } from 'react';
import { View, Text, StyleSheet, StatusBar, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Alert } from 'react-native';
import { COLORS, FONTS, SPACING, SHADOWS } from '../../../core/theme/theme';
import { useAuth } from '../../../shared/services/AuthContext';
import Input from '../../../shared/components/Input';
import Button from '../../../shared/components/Button';
import Card from '../../../shared/components/Card';
import Header from '../../../shared/components/Header';

export const ProfileSetupScreen = ({ navigation }) => {
  const { user, completeProfileSetup } = useAuth();
  
  const [name, setName] = useState(user?.name || '');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('');
  const [contributorType, setContributorType] = useState('');
  const [instituteName, setInstituteName] = useState(user?.instituteName || '');
  const [bio, setBio] = useState('');

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    let newErrors = {};
    if (!name.trim()) newErrors.name = 'Full Name is required';
    if (!state.trim()) newErrors.state = 'State is required';
    if (!district.trim()) newErrors.district = 'District is required';
    if (!preferredLanguage.trim()) newErrors.preferredLanguage = 'Preferred Language is required';
    if (!contributorType.trim()) newErrors.contributorType = 'Contributor Type is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill in all required fields.');
      return;
    }

    const profileData = {
      name,
      state,
      district,
      preferredLanguage,
      contributorType,
      instituteName,
      bio,
    };

    await completeProfileSetup(profileData);
    
    // Redirect directly to Home
    navigation.replace('MainApp');
  };

  const handlePhotoPress = () => {
    Alert.alert('Upload Photo', 'In a production app, this would open the native photo library picker.');
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <Header title="Create Profile" showBack={false} showAvatar={false} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.sectionTitle}>Welcome to Edible India</Text>
          <Text style={styles.sectionSubtitle}>
            Complete your contributor profile to join the living archive of India's culinary history.
          </Text>

          {/* Profile Photo Placeholder */}
          <TouchableOpacity
            style={styles.photoContainer}
            onPress={handlePhotoPress}
            activeOpacity={0.8}
          >
            <View style={styles.photoCircle}>
              <Text style={styles.photoEmoji}>📸</Text>
              <Text style={styles.photoText}>Add Photo</Text>
            </View>
          </TouchableOpacity>

          <Card variant="heritage" style={styles.card}>
            <Input
              label="Full Name *"
              placeholder="Enter your full name"
              value={name}
              onChangeText={setName}
              error={errors.name}
              autoCapitalize="words"
            />

            <Input
              label="State *"
              placeholder="e.g. West Bengal"
              value={state}
              onChangeText={setState}
              error={errors.state}
              autoCapitalize="words"
            />

            <Input
              label="District *"
              placeholder="e.g. Darjeeling"
              value={district}
              onChangeText={setDistrict}
              error={errors.district}
              autoCapitalize="words"
            />

            <Input
              label="Preferred Language *"
              placeholder="e.g. English / Hindi"
              value={preferredLanguage}
              onChangeText={setPreferredLanguage}
              error={errors.preferredLanguage}
              autoCapitalize="words"
            />

            <Input
              label="Contributor Type * (e.g. Home Chef, Food Historian, Student)"
              placeholder="e.g. Home Chef / Historian"
              value={contributorType}
              onChangeText={setContributorType}
              error={errors.contributorType}
              autoCapitalize="words"
            />

            <Input
              label="Institute Name (Optional)"
              placeholder="e.g. IHM Pusa"
              value={instituteName}
              onChangeText={setInstituteName}
              autoCapitalize="words"
            />

            <Input
              label="Short Bio"
              placeholder="Describe your culinary focus or connection to heritage recipes..."
              value={bio}
              onChangeText={setBio}
              multiline={true}
              numberOfLines={4}
              style={styles.textArea}
            />

            <Button
              title="Save Profile & Continue"
              variant="primary"
              onPress={handleSave}
              style={styles.saveButton}
            />
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  sectionTitle: {
    ...FONTS.title,
    fontSize: 26,
    color: COLORS.secondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  sectionSubtitle: {
    ...FONTS.body,
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  photoContainer: {
    alignSelf: 'center',
    marginBottom: SPACING.lg,
  },
  photoCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.soft,
  },
  photoEmoji: {
    fontSize: 24,
  },
  photoText: {
    ...FONTS.caption,
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: 2,
  },
  card: {
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    marginTop: SPACING.lg,
  },
});

export default ProfileSetupScreen;
