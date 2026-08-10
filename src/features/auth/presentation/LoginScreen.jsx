import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { User } from 'lucide-react-native';
import { COLORS, FONTS, SPACING, BORDERS, SHADOWS } from '../../../core/theme/theme';
import { useAuth } from '../../../shared/services/AuthContext';
import Input from '../../../shared/components/Input';
import Button from '../../../shared/components/Button';
import Card from '../../../shared/components/Card';
import { recipeApiService } from '../../recipes/services/recipeApiService';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

const GoogleIcon = () => (
  <Svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: 10 }}>
    <Path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <Path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <Path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <Path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </Svg>
);

const AppleIcon = () => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="#FFFFFF" style={{ marginRight: 10 }}>
    <Path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.21.67-2.93 1.49-.62.69-1.16 1.84-1.01 2.96 1.12.09 2.27-.57 2.95-1.39z" />
  </Svg>
);

export const LoginScreen = ({ navigation }) => {
  const { login, registerUser, loginWithGoogle } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '654643216698-ht9c5v3noi88qjsui9tike6en01s7dsn.apps.googleusercontent.com',
      offlineAccess: true,
    });
  }, []);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken || userInfo.idToken;
      
      if (!idToken) {
        throw new Error('Google Sign-In returned an empty ID token.');
      }

      const loggedUser = await loginWithGoogle(idToken);
      setIsLoading(false);

      if (loggedUser && loggedUser.isProfileComplete) {
        navigation.replace('MainApp');
      } else {
        navigation.replace('ProfileSetup');
      }
    } catch (error) {
      setIsLoading(false);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        Alert.alert('Cancelled', 'Google Sign-In was cancelled.');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        Alert.alert('In Progress', 'Google Sign-In is already in progress.');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Play Services Unavailable', 'Google Play Services are not available on this device.');
      } else {
        Alert.alert('Sign-In Error', error.message || 'An error occurred during Google Sign-In.');
      }
    }
  };

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
      } else if (signupPassword.length < 8) {
        newErrors.signupPassword = 'Password must be at least 8 characters';
      } else if (!/[A-Za-z]/.test(signupPassword) || !/\d/.test(signupPassword)) {
        newErrors.signupPassword = 'Password must contain both letters and numbers';
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
    setIsLoading(true);

    if (isLogin) {
      try {
        await login(loginIdentifier, loginPassword);
        setIsLoading(false);
        navigation.replace('MainApp');
      } catch (err) {
        setIsLoading(false);
        const errMsg = err.message || '';
        if (errMsg.toLowerCase().includes('verification') || errMsg.toLowerCase().includes('verified')) {
          Alert.alert(
            'Verification Required',
            'Your email has not been verified yet. Click below to resend a verification code.',
            [
              {
                text: 'Verify Now',
                onPress: async () => {
                  try {
                    setIsLoading(true);
                    const resendRes = await recipeApiService.resendVerification(loginIdentifier);
                    setIsLoading(false);
                    const newVerificationId = resendRes.data?.verificationId || resendRes.verificationId;
                    const developmentOtp = resendRes.data?.developmentOtp || resendRes.developmentOtp;

                    if (developmentOtp) {
                      Alert.alert('Development Code', `OTP Code (Dev Mode): ${developmentOtp}`);
                    }

                    const authData = {
                      identifier: loginIdentifier,
                      verificationId: newVerificationId,
                      developmentOtp,
                      password: loginPassword,
                    };
                    navigation.navigate('OTP', { authData, flow: 'signup' });
                  } catch (resendErr) {
                    setIsLoading(false);
                    Alert.alert('Error', resendErr.message || 'Failed to send verification code.');
                  }
                }
              },
              { text: 'Cancel', style: 'cancel' }
            ]
          );
        } else {
          Alert.alert('Login Failed', err.message || 'Check your credentials and try again.');
        }
      }
    } else {
      try {
        const response = await registerUser(signupName, signupEmail, signupMobile, signupPassword);
        setIsLoading(false);
        const verificationId = response.data?.verificationId || response.verificationId;
        const developmentOtp = response.data?.developmentOtp || response.developmentOtp;

        if (developmentOtp) {
          Alert.alert('Development Code', `OTP Code (Dev Mode): ${developmentOtp}`);
        }

        const authData = {
          identifier: signupEmail,
          verificationId,
          developmentOtp,
          password: signupPassword,
        };
        navigation.navigate('OTP', { authData, flow: 'signup' });
      } catch (err) {
        setIsLoading(false);
        Alert.alert('Registration Failed', err.message || 'Failed to create your account. Please try again.');
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Brand Header Section */}
          <View style={styles.header}>
            <Image
              source={require('../../../assets/images/logo.png')}
              style={styles.authLogo}
              resizeMode="contain"
            />
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
              loading={isLoading}
              style={styles.submitButton}
            />
          </Card>

          {/* Social Logins Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Premium Material design buttons */}
          <View style={styles.socialContainer}>
            <TouchableOpacity
              style={styles.googleBtn}
              onPress={handleGoogleLogin}
              activeOpacity={0.85}
            >
              <GoogleIcon />
              <Text style={styles.googleBtnText}>Continue with Google</Text>
            </TouchableOpacity>

            {Platform.OS === 'ios' && (
              <TouchableOpacity
                style={styles.appleBtn}
                onPress={() => navigation.navigate('MainApp')}
                activeOpacity={0.85}
              >
                <AppleIcon />
                <Text style={styles.appleBtnText}>Continue with Apple</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.guestBtn}
              onPress={() => navigation.navigate('MainApp')}
              activeOpacity={0.85}
            >
              <User size={18} color={COLORS.secondary} style={{ marginRight: 10 }} />
              <Text style={styles.guestBtnText}>Continue as Guest</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  googleBtn: {
    height: 46,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DADCE0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.soft,
    elevation: 1,
  },
  googleBtnText: {
    ...FONTS.bodyBold,
    fontSize: 14,
    color: '#3C4043',
  },
  appleBtn: {
    height: 46,
    backgroundColor: '#000000',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.soft,
    elevation: 1,
  },
  appleBtnText: {
    ...FONTS.bodyBold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  guestBtn: {
    height: 46,
    backgroundColor: '#FBF7F1',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  guestBtnText: {
    ...FONTS.bodyBold,
    fontSize: 14,
    color: COLORS.secondary,
  },
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
  socialSymbol: {
    marginRight: 10,
    fontSize: 18,
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
