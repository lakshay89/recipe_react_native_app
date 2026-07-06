import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Bell } from 'lucide-react-native';
import { COLORS, FONTS, SPACING, BORDERS, SHADOWS } from '../../core/theme/theme';
import { useAuth } from '../services/AuthContext';

export const Header = ({
  title,
  showBack = false,
  showAvatar = true,
  rightComponent,
}) => {
  const navigation = useNavigation();
  const { user, isAuthenticated } = useAuth();

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleProfilePress = () => {
    if (isAuthenticated) {
      navigation.navigate('ProfileSetup');
    } else {
      navigation.navigate('Auth');
    }
  };

  const handleNotificationPress = () => {
    Alert.alert('Notifications', 'No new notifications at this time.');
  };

  const getInitials = () => {
    if (user && user.name) {
      return user.name.charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.leftContainer}>
        {showBack ? (
          <TouchableOpacity onPress={handleBack} style={styles.backButtonWrapper} activeOpacity={0.7}>
            <ArrowLeft size={20} color={COLORS.text} strokeWidth={2.2} />
          </TouchableOpacity>
        ) : (
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        )}
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
      </View>

      <View style={styles.rightContainer}>
        {rightComponent ? (
          rightComponent
        ) : (
          <View style={styles.rightRow}>
            {isAuthenticated && (
              <TouchableOpacity onPress={handleNotificationPress} style={styles.bellButton} activeOpacity={0.7}>
                <Bell size={21} color={COLORS.secondary} strokeWidth={2.2} />
              </TouchableOpacity>
            )}
            {showAvatar && (
              <TouchableOpacity
                onPress={handleProfilePress}
                style={styles.avatarButton}
                activeOpacity={0.8}
              >
                {user && user.profileImage ? (
                  <Image source={{ uri: user.profileImage }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>{getInitials()}</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    height: 60,
    backgroundColor: COLORS.background,
    borderBottomWidth: BORDERS.widthThin,
    borderColor: '#E7D8C5', // Subtle warm border matching specs
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
  },
  leftContainer: {
    width: 80,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightContainer: {
    width: 80,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  bellButton: {
    padding: SPACING.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 32,
    height: 32,
  },
  headerTitle: {
    ...FONTS.titleLarge,
    fontSize: 20,
    color: COLORS.secondary, // Deep Forest Green title
    fontWeight: '700',
    textAlign: 'center',
  },
  backButtonWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E7D8C5',
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.soft,
    elevation: 1,
  },
  avatarButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: BORDERS.widthThin,
    borderColor: COLORS.gold, // Muted Gold border
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    ...SHADOWS.soft,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.primary, // Terracotta background
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: COLORS.background, // Cream text
    fontWeight: '700',
    fontSize: 14,
  },
});

export default Header;
