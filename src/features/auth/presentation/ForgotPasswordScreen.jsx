import React, { useState } from 'react';
import { View, Text, StyleSheet, StatusBar, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { COLORS, FONTS, SPACING, SHADOWS } from '../../../core/theme/theme';
import Header from '../../../shared/components/Header';
import Card from '../../../shared/components/Card';
import Input from '../../../shared/components/Input';
import Button from '../../../shared/components/Button';

export const ForgotPasswordScreen = ({ navigation }) => {
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState('');

  const handleSendCode = () => {
    if (!identifier.trim()) {
      setError('Please enter your email or mobile number');
      return;
    }
    setError('');
    // Navigate to OTP for verification code validation flow
    navigation.navigate('OTP', {
      authData: { identifier, isSignUp: false },
      flow: 'forgot_password',
    });
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <Header title="Recovery" showBack={true} showAvatar={false} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.headerContainer}>
            <Image
              source={require('../../../assets/images/logo.png')}
              style={styles.authLogo}
              resizeMode="contain"
            />
            <Text style={styles.portalTag}>ACCOUNT RECOVERY</Text>
            <Text style={styles.title}>Reset Your Password</Text>
            <Text style={styles.description}>
              Enter the mobile number or email address associated with your Edible India contributor account.
            </Text>
          </View>

          <Card variant="heritage" style={styles.formCard}>
            <Input
              label="Email Address / Mobile Number"
              placeholder="e.g. aditya@gmail.com"
              value={identifier}
              onChangeText={(text) => {
                setError('');
                setIdentifier(text);
              }}
              error={error}
              autoCapitalize="none"
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
  sendButton: {
    marginTop: SPACING.md,
  },
});

export default ForgotPasswordScreen;
