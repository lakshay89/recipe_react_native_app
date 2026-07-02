import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AddRecipeIntroScreen from '../../features/recipes/presentation/AddRecipeIntroScreen';
import RecipeIdentityScreen from '../../features/recipes/presentation/RecipeIdentityScreen';
import RecipeLocationScreen from '../../features/recipes/presentation/RecipeLocationScreen';
import RecipeHeritageSourceScreen from '../../features/recipes/presentation/RecipeHeritageSourceScreen';
import RecipeIngredientsScreen from '../../features/recipes/presentation/RecipeIngredientsScreen';
import RecipeCookingMethodScreen from '../../features/recipes/presentation/RecipeCookingMethodScreen';
import RecipeCultureScreen from '../../features/recipes/presentation/RecipeCultureScreen';
import RecipeMediaUploadScreen from '../../features/recipes/presentation/RecipeMediaUploadScreen';
import RecipePreviewScreen from '../../features/recipes/presentation/RecipePreviewScreen';
import RecipeSubmitSuccessScreen from '../../features/recipes/presentation/RecipeSubmitSuccessScreen';

const Stack = createNativeStackNavigator();

export const AddRecipeNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="AddRecipeIntro"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#fbf9f4' }, // Stitch Warm Cream background
      }}
    >
      <Stack.Screen name="AddRecipeIntro" component={AddRecipeIntroScreen} />
      <Stack.Screen name="RecipeIdentity" component={RecipeIdentityScreen} />
      <Stack.Screen name="RecipeLocation" component={RecipeLocationScreen} />
      <Stack.Screen name="RecipeHeritageSource" component={RecipeHeritageSourceScreen} />
      <Stack.Screen name="RecipeIngredients" component={RecipeIngredientsScreen} />
      <Stack.Screen name="RecipeCookingMethod" component={RecipeCookingMethodScreen} />
      <Stack.Screen name="RecipeCulture" component={RecipeCultureScreen} />
      <Stack.Screen name="RecipeMediaUpload" component={RecipeMediaUploadScreen} />
      <Stack.Screen name="RecipePreview" component={RecipePreviewScreen} />
      <Stack.Screen name="RecipeSubmitSuccess" component={RecipeSubmitSuccessScreen} />
    </Stack.Navigator>
  );
};

export default AddRecipeNavigator;
