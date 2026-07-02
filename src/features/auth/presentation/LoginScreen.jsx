import React, { useState } from 'react';
import { View, Text, StyleSheet, StatusBar, SafeAreaView, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { COLORS, FONTS, SPACING, BORDERS, SHADOWS } from '../../../core/theme/theme';
import { useAuth } from '../../../shared/services/AuthContext';
import Input from '../../../shared/components/Input';
import Button from '../../../shared/components/Button';
import Card from '../../../shared/components/Card';

export const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  
  // Login Form States
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Signup Form States
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupMobile, setSignupMobile] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupTermsAccepted, setSignupTermsAccepted] = useState(false);

  // Errors
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    let newErrors = {};
    if (isLogin) {
      if (!loginIdentifier.trim()) {
        newErrors.loginIdentifier = 'Mobile Number or Email is required';
      }
      if (!loginPassword.trim()) {
        newErrors.loginPassword = 'Password is required';
      }
    } else {
      if (!signupName.trim()) {
        newErrors.signupName = 'Full Name is required';
      }
      if (!signupEmail.trim()) {
        newErrors.signupEmail = 'Email is required';
      }
      if (!signupMobile.trim()) {
        newErrors.signupMobile = 'Mobile Number is required';
      }
      if (!signupPassword.trim()) {
        newErrors.signupPassword = 'Password is required';
      } else if (signupPassword.length < 6) {
        newErrors.signupPassword = 'Password must be at least 6 characters';
      }
      
      if (!signupConfirmPassword.trim()) {
        newErrors.signupConfirmPassword = 'Confirm Password is required';
      } else if (signupPassword !== signupConfirmPassword) {
        newErrors.signupConfirmPassword = 'Passwords do not match';
      }

      if (!signupTermsAccepted) {
        newErrors.terms = 'You must accept the terms & conditions';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (isLogin) {
      const userPayload = {
        identifier: loginIdentifier,
        name: 'Heritage Contributor',
        isProfileComplete: true,
      };
      await login(userPayload);
      navigation.replace('MainApp');
    } else {
      const authData = {
        identifier: signupEmail,
        mobile: signupMobile,
        name: signupName,
        password: signupPassword,
        isSignUp: true,
      };
      navigation.navigate('OTP', { authData, flow: 'signup' });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          
          {/* Brand Header Section */}
          <View style={styles.header}>
            <View style={styles.brandIconContainer}>
              <Text style={styles.brandIcon}>🏛</Text>
            </View>
            <Text style={styles.portalTag}>CONTRIBUTOR PORTAL</Text>
            <Text style={styles.title}>
              {isLogin ? 'Welcome Back, Guardian' : 'Create Your Heritage Profile'}
            </Text>
            <Text style={styles.subtitle}>
              {isLogin ? 'Enter the archive to continue your curation.' : 'Step into the digital museum. Begin your journey as a custodian.'}
            </Text>
          </View>

          {/* Form Plaque Card */}
          <Card variant="default" style={styles.formCard}>
            {/* Tab Swapping Switcher */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                onPress={() => {
                  setIsLogin(true);
                  setErrors({});
                }}
                style={[styles.tabButton, isLogin && styles.activeTabButton]}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, isLogin && styles.activeTabText]}>Login</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setIsLogin(false);
                  setErrors({});
                }}
                style={[styles.tabButton, !isLogin && styles.activeTabButton]}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, !isLogin && styles.activeTabText]}>Sign Up</Text>
              </TouchableOpacity>
            </View>

            {/* Inputs Container */}
            {isLogin ? (
              <View style={styles.fieldsContainer}>
                <Input
                  label="Mobile Number or Email"
                  placeholder="guardian@archives.in"
                  value={loginIdentifier}
                  onChangeText={setLoginIdentifier}
                  error={errors.loginIdentifier}
                  keyboardType="email-address"
                />

                <Input
                  label="Password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChangeText={setLoginPassword}
                  secureTextEntry={true}
                  error={errors.loginPassword}
                />

                <TouchableOpacity
                  style={styles.forgotBtn}
                  onPress={() => navigation.navigate('ForgotPassword')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.forgotText}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.fieldsContainer}>
                <Input
                  label="Full Name *"
                  placeholder="Enter full name"
                  value={signupName}
                  onChangeText={setSignupName}
                  error={errors.signupName}
                  autoCapitalize="words"
                />
                
                <Input
                  label="Email *"
                  placeholder="contributor@edibleindia.in"
                  value={signupEmail}
                  onChangeText={setSignupEmail}
                  error={errors.signupEmail}
                  keyboardType="email-address"
                />

                <Input
                  label="Mobile Number *"
                  placeholder="e.g. +91 99999 88888"
                  value={signupMobile}
                  onChangeText={setSignupMobile}
                  error={errors.signupMobile}
                  keyboardType="phone-pad"
                />

                <Input
                  label="Password *"
                  placeholder="••••••••"
                  value={signupPassword}
                  onChangeText={setSignupPassword}
                  secureTextEntry={true}
                  error={errors.signupPassword}
                />

                <Input
                  label="Confirm Password *"
                  placeholder="••••••••"
                  value={signupConfirmPassword}
                  onChangeText={setSignupConfirmPassword}
                  secureTextEntry={true}
                  error={errors.signupConfirmPassword}
                />

                {/* Custom Interactive Checkbox */}
                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={() => setSignupTermsAccepted(!signupTermsAccepted)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.checkbox, signupTermsAccepted && styles.checkboxChecked]}>
                    {signupTermsAccepted && <Text style={styles.checkboxTick}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxLabel}>
                    I agree to the Terms of Service & Privacy Policy *
                  </Text>
                </TouchableOpacity>
                {errors.terms && <Text style={styles.errorText}>{errors.terms}</Text>}
              </View>
            )}

            {/* Primary Action Button */}
            <Button
              title={isLogin ? 'Enter the Archive' : 'Create Account'}
              variant="primary"
              onPress={handleSubmit}
              style={styles.submitButton}
            />
          </Card>

          {/* Social Logins Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Premium Google & Apple Options */}
          <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialBtn} activeOpacity={0.8}>
              <Text style={styles.socialSymbol}>🇬</Text>
              <Text style={styles.socialBtnText}>Continue with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialBtn} activeOpacity={0.8}>
              <Text style={styles.socialSymbol}>🍎</Text>
              <Text style={styles.socialBtnText}>Continue with Apple</Text>
            </TouchableOpacity>
          </View>

          {/* Guest Link */}
          <TouchableOpacity
            style={styles.guestButton}
            onPress={() => navigation.navigate('MainApp')}
            activeOpacity={0.7}
          >
            <Text style={styles.guestText}>Explore as Guest</Text>
          </TouchableOpacity>

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
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
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
    marginBottom: 6,
  },
  subtitle: {
    ...FONTS.body,
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingHorizontal: SPACING.md,
  },
  formCard: {
    width: '100%',
    padding: SPACING.lg,
    borderWidth: BORDERS.widthThin,
    borderColor: COLORS.borderLight,
    backgroundColor: COLORS.white,
    ...SHADOWS.medium,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: BORDERS.widthThin,
    borderColor: COLORS.borderLight,
    marginBottom: SPACING.md,
  },
  tabButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  activeTabButton: {
    borderBottomWidth: BORDERS.widthThick,
    borderColor: COLORS.primary,
  },
  tabText: {
    ...FONTS.bodyMedium,
    fontSize: 16,
    color: COLORS.textMuted,
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  fieldsContainer: {
    marginVertical: SPACING.sm,
  },
  submitButton: {
    marginTop: SPACING.lg,
    width: '100%',
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  forgotText: {
    ...FONTS.bodyMedium,
    fontSize: 13,
    color: COLORS.primary,
    fontStyle: 'italic',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 4,
    marginRight: SPACING.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxTick: {
    color: COLORS.background,
    fontSize: 11,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    ...FONTS.body,
    fontSize: 13,
    color: COLORS.text,
    flex: 1,
  },
  errorText: {
    ...FONTS.caption,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: SPACING.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.borderLight,
  },
  dividerText: {
    ...FONTS.body,
    paddingHorizontal: SPACING.md,
    color: COLORS.textMuted,
    fontSize: 14,
  },
  socialContainer: {
    width: '100%',
    gap: SPACING.sm,
  },
  socialBtn: {
    width: '100%',
    height: 48,
    backgroundColor: COLORS.white,
    borderWidth: BORDERS.widthThin,
    borderColor: COLORS.border,
    borderRadius: BORDERS.radiusMd,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.soft,
  },
  socialSymbol: {
    marginRight: 10,
    fontSize: 18,
  },
  socialBtnText: {
    ...FONTS.bodyMedium,
    fontSize: 14,
    color: COLORS.text,
  },
  guestButton: {
    marginTop: SPACING.xl,
    paddingVertical: SPACING.sm,
  },
  guestText: {
    ...FONTS.bodyBold,
    fontSize: 15,
    color: COLORS.secondary,
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;
