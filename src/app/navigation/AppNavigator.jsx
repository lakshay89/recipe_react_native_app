import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../../shared/services/AuthContext';

// Screens
import SplashScreen from '../../features/splash/presentation/SplashScreen';
import LanguageScreen from '../../features/language/presentation/LanguageScreen';
import OnboardingScreen from '../../features/onboarding/presentation/OnboardingScreen';
import LoginScreen from '../../features/auth/presentation/LoginScreen';
import OTPScreen from '../../features/auth/presentation/OTPScreen';
import ForgotPasswordScreen from '../../features/auth/presentation/ForgotPasswordScreen';
import ResetPasswordScreen from '../../features/auth/presentation/ResetPasswordScreen';
import ProfileSetupScreen from '../../features/profile/presentation/ProfileSetupScreen';
import TabNavigator from './TabNavigator';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  const { isLoading } = useAuth();

  // Show a blank/loader screen while loading stored auth state
  if (isLoading) {
    return null; 
  }

  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#FAF7F2' },
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Language" component={LanguageScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Auth" component={LoginScreen} />
      <Stack.Screen name="OTP" component={OTPScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
      <Stack.Screen name="MainApp" component={TabNavigator} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
