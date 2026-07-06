import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, Platform } from 'react-native';
import { Home, MapPin, Search, BookPlus, Archive } from 'lucide-react-native';

import { COLORS, FONTS, SHADOWS } from '../../core/theme/theme';
import { useAuth } from '../../shared/services/AuthContext';

// Screens
import HomeScreen from '../../features/home/presentation/HomeScreen';
import MapScreen from '../../features/map/presentation/MapScreen';
import SearchScreen from '../../features/search/presentation/SearchScreen';
import AddRecipeNavigator from './AddRecipeNavigator';
import MyArchiveDashboard from '../../features/myArchive/presentation/MyArchiveDashboard';

const Tab = createBottomTabNavigator();

// Static Icon Renderers to prevent re-creation warnings
const RenderHomeIcon = ({ color }) => <Home size={22} color={color} strokeWidth={2.2} />;
const RenderMapIcon = ({ color }) => <MapPin size={22} color={color} strokeWidth={2.2} />;
const RenderSearchIcon = ({ color }) => <Search size={22} color={color} strokeWidth={2.2} />;
const RenderAddIcon = ({ color }) => <BookPlus size={22} color={color} strokeWidth={2.2} />;
const RenderArchiveIcon = ({ color }) => <Archive size={22} color={color} strokeWidth={2.2} />;

export const TabNavigator = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.secondary, // Deep Forest Green active icon/label
        tabBarInactiveTintColor: COLORS.textMuted, // Muted inactive icon/label
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
          tabBarIcon: RenderHomeIcon,
        }}
      />

      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          tabBarLabel: 'Map',
          tabBarIcon: RenderMapIcon,
        }}
      />

      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarLabel: 'Search',
          tabBarIcon: RenderSearchIcon,
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
          tabBarIcon: RenderAddIcon,
        }}
      />

      <Tab.Screen
        name="MyArchive"
        component={MyArchiveDashboard}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            if (!isAuthenticated) {
              e.preventDefault();
              navigation.navigate('Auth');
            }
          },
        })}
        options={{
          tabBarLabel: 'My Archive',
          tabBarIcon: RenderArchiveIcon,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 14,
    left: 16,
    right: 16,
    height: 58,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E7D8C5', // Subtle warm border
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 8 : 8,
    ...SHADOWS.medium,
    elevation: 4,
  },
  tabBarLabel: {
    ...FONTS.bodyMedium,
    fontSize: 10.5,
    fontWeight: '600',
    letterSpacing: 0.1,
    marginTop: 2,
    marginBottom: Platform.OS === 'ios' ? 0 : 2,
    textAlign: 'center',
  },
});

export default TabNavigator;
