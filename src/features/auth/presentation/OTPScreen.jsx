import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, Alert, Platform, Image } from 'react-native';
import { COLORS, FONTS, SPACING, SHADOWS } from '../../../core/theme/theme';
import { useAuth } from '../../../shared/services/AuthContext';
import Input from '../../../shared/components/Input';
import Button from '../../../shared/components/Button';
import Card from '../../../shared/components/Card';
import Header from '../../../shared/components/Header';
import { recipeApiService } from '../../recipes/services/recipeApiService';

export const OTPScreen = ({ route, navigation }) => {
  const { login } = useAuth();
  const { authData, flow = 'signup' } = route.params || { authData: { identifier: 'User' }, flow: 'signup' };
  const [currentVerificationId, setCurrentVerificationId] = useState(authData.verificationId || '');
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(30);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      await recipeApiService.verifyEmail(currentVerificationId, otp);

      // Automated login post-verification
      if (authData.password) {
        try {
          await login(authData.identifier, authData.password);
          setIsVerifying(false);
          if (flow === 'signup') {
            navigation.replace('ProfileSetup');
          } else {
            navigation.replace('MainApp');
          }
        } catch (loginErr) {
          setIsVerifying(false);
          Alert.alert(
            'Verification Successful',
            'Your account has been verified. Please log in with your credentials.',
            [{ text: 'OK', onPress: () => navigation.navigate('Auth') }]
          );
        }
      } else {
        setIsVerifying(false);
        Alert.alert(
          'Verification Successful',
          'Your account has been verified. Please log in with your credentials.',
          [{ text: 'OK', onPress: () => navigation.navigate('Auth') }]
        );
      }
    } catch (err) {
      setIsVerifying(false);
      setError(err.message || 'OTP verification failed. Please try again.');
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setError('');

    try {
      const res = await recipeApiService.resendVerification(authData.identifier);
      setIsResending(false);
      
      const newVerificationId = res.data?.verificationId || res.verificationId;
      const developmentOtp = res.data?.developmentOtp || res.developmentOtp;

      setCurrentVerificationId(newVerificationId);
      setTimer(30);

      Alert.alert('OTP Sent', 'A new verification code has been issued.');

      if (developmentOtp) {
        Alert.alert('Development Code', `OTP Code (Dev Mode): ${developmentOtp}`);
      }
    } catch (err) {
      setIsResending(false);
      Alert.alert('Error', err.message || 'Failed to resend verification code.');
    }
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <Header title="Verification" showBack={true} showAvatar={false} />

      <View style={styles.container}>
        <Card variant="heritage" style={styles.otpCard}>
          {/* Fingerprint branding */}
          <Image
            source={require('../../../assets/images/logo.png')}
            style={styles.authLogo}
            resizeMode="contain"
          />

          <Text style={styles.title}>Verify Your Identity</Text>

          <Text style={styles.description}>
            A code has been sent to{'\n'}
            <Text style={styles.boldIdentifier}>{authData.identifier}</Text>
          </Text>

          {/* Styled centered OTP input container */}
          <Input
            label="Verification Code (6-Digit OTP)"
            placeholder="e.g. 123456"
            value={otp}
            onChangeText={(text) => {
              setError('');
              setOtp(text.replace(/[^0-9]/g, ''));
            }}
            keyboardType="number-pad"
            maxLength={6}
            error={error}
            style={styles.otpInput}
            inputStyle={styles.textInputCentered}
          />

          <View style={styles.timerContainer}>
            {timer > 0 ? (
              <Text style={styles.timerText}>Resend code in {timer}s</Text>
            ) : (
              <Button
                title="Resend OTP"
                variant="text"
                onPress={handleResend}
                loading={isResending}
                disabled={isVerifying || isResending}
                textStyle={styles.resendText}
              />
            )}
          </View>

          <Button
            title="Verify & Continue"
            variant="primary"
            onPress={handleVerify}
            loading={isVerifying}
            disabled={isVerifying || isResending}
            style={styles.verifyButton}
          />
        </Card>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: SPACING.marginMobile,
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpCard: {
    width: '100%',
    padding: SPACING.lg,
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderColor: COLORS.borderLight,
    ...SHADOWS.medium,
  },
  authLogo: {
    width: 68,
    height: 68,
    marginBottom: SPACING.lg,
    alignSelf: 'center',
  },
  title: {
    ...FONTS.titleLarge,
    fontSize: 24,
    color: COLORS.secondary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  description: {
    ...FONTS.body,
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  boldIdentifier: {
    ...FONTS.bodyBold,
    color: COLORS.text,
  },
  otpInput: {
    alignItems: 'center',
  },
  textInputCentered: {
    textAlign: 'center',
    fontSize: 22,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
    fontWeight: '700',
    letterSpacing: 8,
  },
  timerContainer: {
    marginVertical: SPACING.md,
    alignItems: 'center',
  },
  timerText: {
    ...FONTS.caption,
    fontSize: 13,
    color: COLORS.textMuted,
  },
  resendText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  verifyButton: {
    width: '100%',
    marginTop: SPACING.md,
  },
});

export default OTPScreen;
