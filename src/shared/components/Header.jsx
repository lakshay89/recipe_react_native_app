import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
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
          <TouchableOpacity onPress={handleBack} style={styles.iconButton} activeOpacity={0.7}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
      </View>

      <View style={styles.rightContainer}>
        {rightComponent ? (
          rightComponent
        ) : showAvatar ? (
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
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    height: 64,
    backgroundColor: COLORS.background,
    borderBottomWidth: BORDERS.widthThin,
    borderColor: COLORS.borderLight, // Soft ivory/gray border
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
  },
  leftContainer: {
    width: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightContainer: {
    width: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  headerTitle: {
    ...FONTS.titleLarge,
    fontSize: 22,
    color: COLORS.secondary, // Deep Forest Green title
  },
  iconButton: {
    padding: SPACING.xs,
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
  },
  backArrow: {
    fontSize: 22,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  avatarButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
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
    fontSize: 15,
  },
});

export default Header;
