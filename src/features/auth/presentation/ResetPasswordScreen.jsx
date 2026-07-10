import React, { useState } from 'react';
import { View, Text, StyleSheet, StatusBar, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Alert, Image } from 'react-native';
import { COLORS, FONTS, SPACING, SHADOWS } from '../../../core/theme/theme';
import Header from '../../../shared/components/Header';
import Card from '../../../shared/components/Card';
import Input from '../../../shared/components/Input';
import Button from '../../../shared/components/Button';

export const ResetPasswordScreen = ({ navigation }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});

  const handleReset = () => {
    let newErrors = {};
    if (!password.trim()) {
      newErrors.password = 'New Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirm Password is required';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      Alert.alert(
        'Password Reset Successful',
        'Your password has been updated. Please login with your new password.',
        [
          {
            text: 'Go to Login',
            onPress: () => navigation.replace('Auth'),
          },
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <Header title="Security" showBack={false} showAvatar={false} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.headerContainer}>
            <Image
              source={require('../../../assets/images/logo.png')}
              style={styles.authLogo}
              resizeMode="contain"
            />
            <Text style={styles.portalTag}>ACCOUNT SECURITY</Text>
            <Text style={styles.title}>Define New Password</Text>
            <Text style={styles.description}>
              Create a secure password to protect your contributor account credentials.
            </Text>
          </View>

          <Card variant="default" style={styles.card}>
            <Input
              label="New Password"
              placeholder="Minimum 6 characters"
              value={password}
              onChangeText={(text) => {
                setErrors((prev) => ({ ...prev, password: '' }));
                setPassword(text);
              }}
              secureTextEntry={true}
              error={errors.password}
            />

            <Input
              label="Confirm New Password"
              placeholder="Re-enter your new password"
              value={confirmPassword}
              onChangeText={(text) => {
                setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                setConfirmPassword(text);
              }}
              secureTextEntry={true}
              error={errors.confirmPassword}
            />

            <Button
              title="Save & Update Password"
              variant="primary"
              onPress={handleReset}
              style={styles.resetBtn}
            />
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
    paddingHorizontal: SPACING.marginMobile,
    paddingVertical: SPACING.xl,
    justifyContent: 'center',
    flexGrow: 1,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  authLogo: {
    width: 68,
    height: 68,
    marginBottom: SPACING.md,
  },
  portalTag: {
    ...FONTS.labelCaps,
    color: COLORS.primary,
    marginBottom: 4,
  },
  title: {
    ...FONTS.titleLarge,
    fontSize: 26,
    color: COLORS.secondary,
    textAlign: 'center',
  },
  description: {
    ...FONTS.body,
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  card: {
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderColor: COLORS.borderLight,
    ...SHADOWS.medium,
  },
  resetBtn: {
    marginTop: SPACING.md,
  },
});

export default ResetPasswordScreen;
