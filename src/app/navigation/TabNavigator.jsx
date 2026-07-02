import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, StyleSheet, Platform } from 'react-native';
import { COLORS, FONTS, BORDERS, SHADOWS } from '../../core/theme/theme';
import { useAuth } from '../../shared/services/AuthContext';

// Screens
import HomeScreen from '../../features/home/presentation/HomeScreen';
import MapScreen from '../../features/map/presentation/MapScreen';
import SearchScreen from '../../features/search/presentation/SearchScreen';
import AddRecipeNavigator from './AddRecipeNavigator';
import MyContributionsScreen from '../../features/myContributions/presentation/MyContributionsScreen';

const Tab = createBottomTabNavigator();

const TabIcon = ({ symbol, focused }) => (
  <Text style={[styles.tabIcon, focused && styles.tabIconActive]}>
    {symbol}
  </Text>
);

const HomeIcon = ({ focused }) => <TabIcon symbol="🏛" focused={focused} />;
const MapIcon = ({ focused }) => <TabIcon symbol="🗺" focused={focused} />;
const SearchIcon = ({ focused }) => <TabIcon symbol="🔍" focused={focused} />;
const AddRecipeIcon = ({ focused }) => <TabIcon symbol="✍" focused={focused} />;
const ContributionsIcon = ({ focused }) => <TabIcon symbol="📜" focused={focused} />;

export const TabNavigator = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: HomeIcon,
        }}
      />
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          tabBarLabel: 'Map',
          tabBarIcon: MapIcon,
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarLabel: 'Search',
          tabBarIcon: SearchIcon,
        }}
      />
      <Tab.Screen
        name="AddRecipe"
        component={AddRecipeNavigator}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            if (!isAuthenticated) {
              e.preventDefault();
              navigation.navigate('Auth');
            }
          },
        })}
        options={{
          tabBarLabel: 'Add Recipe',
          tabBarIcon: AddRecipeIcon,
        }}
      />
      <Tab.Screen
        name="MyContributions"
        component={MyContributionsScreen}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            if (!isAuthenticated) {
              e.preventDefault();
              navigation.navigate('Auth');
            }
          },
        })}
        options={{
          tabBarLabel: 'Contributions',
          tabBarIcon: ContributionsIcon,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 28 : 16,
    left: 16,
    right: 16,
    backgroundColor: COLORS.white, // Floating card style
    borderRadius: 30, // Fully rounded container
    height: 64,
    paddingBottom: 0,
    paddingTop: 0,
    borderWidth: BORDERS.widthThin,
    borderColor: COLORS.borderLight,
    ...SHADOWS.medium,
    elevation: 4,
    flexDirection: 'row',
  },
  tabBarLabel: {
    ...FONTS.bodyMedium,
    fontSize: 10,
    letterSpacing: 0.1,
    marginBottom: 4,
  },
  tabIcon: {
    fontSize: 18,
    opacity: 0.5,
    marginTop: 6,
  },
  tabIconActive: {
    opacity: 1,
    color: COLORS.primary,
  },
});

export default TabNavigator;
