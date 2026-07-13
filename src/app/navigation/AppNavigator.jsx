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
import ProfileScreen from '../../features/profile/presentation/ProfileScreen';
import SettingsScreen from '../../features/settings/presentation/SettingsScreen';
import ExhibitDetailsScreen from '../../features/exhibits/presentation/ExhibitDetailsScreen';
import TabNavigator from './TabNavigator';

// My Archive screens
import MyRecipeDetails from '../../features/myArchive/presentation/MyRecipeDetails';
import EditRecipeScreen from '../../features/myArchive/presentation/EditRecipeScreen';
import RecipeVersionHistory from '../../features/myArchive/presentation/RecipeVersionHistory';
import PendingReviewScreen from '../../features/myArchive/presentation/PendingReviewScreen';
import PublishedRecipesScreen from '../../features/myArchive/presentation/PublishedRecipesScreen';
import RejectedRecipesScreen from '../../features/myArchive/presentation/RejectedRecipesScreen';
import DraftRecipesScreen from '../../features/myArchive/presentation/DraftRecipesScreen';
import TutorialScreen from '../../features/myArchive/presentation/TutorialScreen';

// Heritage Collections screens
import CollectionsDashboardScreen from '../../features/collections/presentation/CollectionsDashboardScreen';
import CollectionDetailsScreen from '../../features/collections/presentation/CollectionDetailsScreen';

// Notifications screen
import NotificationListScreen from '../../features/notifications/presentation/NotificationListScreen';

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
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="ExhibitDetails" component={ExhibitDetailsScreen} />
      <Stack.Screen name="MainApp" component={TabNavigator} />

      {/* My Archive Stack */}
      <Stack.Screen name="MyRecipeDetails" component={MyRecipeDetails} />
      <Stack.Screen name="EditRecipe" component={EditRecipeScreen} />
      <Stack.Screen name="RecipeVersionHistory" component={RecipeVersionHistory} />
      <Stack.Screen name="PendingReview" component={PendingReviewScreen} />
      <Stack.Screen name="PublishedRecipes" component={PublishedRecipesScreen} />
      <Stack.Screen name="RejectedRecipes" component={RejectedRecipesScreen} />
      <Stack.Screen name="DraftRecipes" component={DraftRecipesScreen} />
      <Stack.Screen name="Tutorial" component={TutorialScreen} />

      {/* Heritage Collections Stack */}
      <Stack.Screen name="CollectionsDashboard" component={CollectionsDashboardScreen} />
      <Stack.Screen name="CollectionDetails" component={CollectionDetailsScreen} />

      {/* Notifications Stack */}
      <Stack.Screen name="Notifications" component={NotificationListScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
