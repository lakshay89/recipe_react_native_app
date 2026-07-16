import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, Platform, View } from 'react-native';
import { Home, Search, BookPlus, Archive } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import { COLORS, FONTS, SHADOWS } from '../../core/theme/theme';
import { useAuth } from '../../shared/services/AuthContext';

// Screens
import HomeScreen from '../../features/home/presentation/HomeScreen';
import SearchScreen from '../../features/search/presentation/SearchScreen';
import AddRecipeNavigator from './AddRecipeNavigator';
import MyArchiveDashboard from '../../features/myArchive/presentation/MyArchiveDashboard';

const Tab = createBottomTabNavigator();

const AnimatedTabIcon = ({ Icon, focused }) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withSpring(focused ? 1.15 : 1, { damping: 15, stiffness: 150 });
  }, [focused, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const activeColor = COLORS.secondary;
  const inactiveColor = COLORS.textMuted;
  const color = focused ? activeColor : inactiveColor;

  return (
    <Animated.View style={[{ alignItems: 'center', justifyContent: 'center', height: 26 }, animatedStyle]}>
      <Icon size={21} color={color} strokeWidth={2.2} />
      <Animated.View
        style={[{
          width: 4,
          height: 4,
          borderRadius: 2,
          backgroundColor: activeColor,
          marginTop: 2,
          opacity: focused ? 1 : 0,
        }]}
      />
    </Animated.View>
  );
};

const RenderHomeIcon = ({ focused }) => <AnimatedTabIcon Icon={Home} focused={focused} />;
const RenderSearchIcon = ({ focused }) => <AnimatedTabIcon Icon={Search} focused={focused} />;
const RenderAddIcon = ({ focused }) => <AnimatedTabIcon Icon={BookPlus} focused={focused} />;
const RenderArchiveIcon = ({ focused }) => <AnimatedTabIcon Icon={Archive} focused={focused} />;

import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const TabNavigator = () => {
  const { isAuthenticated } = useAuth();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.secondary, // Deep Forest Green active icon/label
        tabBarInactiveTintColor: COLORS.textMuted, // Muted inactive icon/label
        tabBarStyle: [
          styles.tabBar,
          { bottom: insets.bottom > 0 ? insets.bottom + 4 : 14 }
        ],
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
