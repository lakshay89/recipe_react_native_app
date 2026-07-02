import React, { useState } from 'react';
import { View, Text, StyleSheet, StatusBar, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { COLORS, FONTS, SPACING, BORDERS, SHADOWS } from '../../../core/theme/theme';
import Header from '../../../shared/components/Header';
import Card from '../../../shared/components/Card';
import Input from '../../../shared/components/Input';
import Button from '../../../shared/components/Button';

export const ForgotPasswordScreen = ({ navigation }) => {
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState('');

  const handleSendCode = () => {
    if (!identifier.trim()) {
      setError('Mobile Number or Email is required');
      return;
    }

    navigation.navigate('OTP', {
      authData: { identifier, isSignUp: false },
      flow: 'forgot_password',
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <Header title="Recovery" showBack={true} showAvatar={false} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.headerContainer}>
            <View style={styles.brandIconContainer}>
              <Text style={styles.brandIcon}>🔑</Text>
            </View>
            <Text style={styles.portalTag}>ACCOUNT RECOVERY</Text>
            <Text style={styles.title}>Reset Your Password</Text>
            <Text style={styles.description}>
              Enter the mobile number or email address associated with your Edible India contributor account.
            </Text>
          </View>

          <Card variant="default" style={styles.card}>
            <Input
              label="Mobile Number or Email"
              placeholder="guardian@archives.in"
              value={identifier}
              onChangeText={(text) => {
                setError('');
                setIdentifier(text);
              }}
              error={error}
              keyboardType="email-address"
            />

            <Button
              title="Request Reset Code"
              variant="primary"
              onPress={handleSendCode}
              style={styles.sendButton}
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
  brandIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.secondaryBackground,
    borderWidth: BORDERS.widthThin,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.soft,
  },
  brandIcon: {
    fontSize: 28,
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
  sendButton: {
    marginTop: SPACING.md,
  },
});

export default ForgotPasswordScreen;
