import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, StatusBar } from 'react-native';
import { 
  Award, 
  Flame, 
  Edit3, 
  BookOpen, 
  Settings as SettingsIcon, 
  Bell, 
  Book, 
  MapPin, 
  ChevronRight 
} from 'lucide-react-native';

import { COLORS, FONTS, SPACING, BORDERS } from '../../../core/theme/theme';
import Header from '../../../shared/components/Header';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';
import { useAuth } from '../../../shared/services/AuthContext';

export const ProfileScreen = ({ navigation }) => {
  const { user, myRecipes, logout } = useAuth();



  // Compute stats from myRecipes
  const totalCount = myRecipes.length;
  const pendingCount = myRecipes.filter((r) => {
    const s = (r.status || '').toLowerCase();
    return s === 'pending_review' || s === 'pending review' || s === 'update_under_review' || s === 'update under review';
  }).length;
  const publishedCount = myRecipes.filter((r) => {
    const s = (r.status || '').toLowerCase();
    return s === 'approved' || s === 'published';
  }).length;
  const rejectedCount = myRecipes.filter((r) => (r.status || '').toLowerCase() === 'rejected').length;

  // Streak details (mock or dynamic fallback)
  const streakInfo = {
    current: user?.currentStreak || 4,
    longest: user?.longestStreak || 8,
    lastContribution: user?.lastContributionDate || '3 days ago',
  };

  // Achievements dataset
  const achievements = [
    {
      id: 'first-recipe',
      title: 'First Archive Placed',
      description: 'Submitted your first traditional culinary record.',
      unlocked: totalCount > 0,
      badge: '🏺',
    },
    {
      id: 'five-recipes',
      title: 'Heritage Preserver',
      description: 'Documented 5 or more distinct regional recipes.',
      unlocked: totalCount >= 5,
      badge: '📜',
    },
    {
      id: 'storyteller',
      title: 'Konkan Chronicler',
      description: 'Added detailed oral history records for coastal areas.',
      unlocked: true, // Mock unlocked status based on bio
      badge: '🌾',
    },
    {
      id: 'audio-collector',
      title: 'Voice Archivist',
      description: 'Recorded pronunciation guide audio tracks.',
      unlocked: myRecipes.some(r => r.oralHistoryAudio || r.hasAudio),
      badge: '🎙️',
    },
  ];

  const handleLogoutPress = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out of your Edible India contributor account?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Log Out', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.replace('Auth');
          }
        }
      ]
    );
  };

  const getInitials = () => {
    if (user?.name) {
      const parts = user.name.split(' ');
      if (parts.length > 1) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return user.name.substring(0, 2).toUpperCase();
    }
    return 'HC';
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <Header title="My Profile" showBack={true} showAvatar={false} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Hero Card */}
        <Card variant="heritage" style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            {user?.profileImage ? (
              <Image source={{ uri: user.profileImage }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarText}>{getInitials()}</Text>
              </View>
            )}
            <View style={styles.heroDetails}>
              <Text style={styles.contributorName}>{user?.name || 'Heritage Contributor'}</Text>
              <View style={styles.badgeWrapper}>
                <Award size={14} color={COLORS.primary} style={styles.awardIcon} />
                <Text style={styles.contributorBadge}>{user?.badge || 'Heritage Guardian'}</Text>
              </View>
              <Text style={styles.contributorType}>{user?.role || 'Traditional Home Chef'}</Text>
              
              <View style={styles.locationRow}>
                <MapPin size={13} color={COLORS.textMuted} />
                <Text style={styles.locationText}>{user?.location || 'Delhi, India'}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.bioContainer}>
            <Text style={styles.bioTitle}>BIOGRAPHY</Text>
            <Text style={styles.bioText}>
              {user?.bio || 'Dedicated to preserving traditional family recipes and cooking customs of regional India.'}
            </Text>
            <Text style={styles.memberSince}>Contributor since {user?.memberSince || 'July 2026'}</Text>
          </View>
        </Card>

        {/* Contribution Statistics Grid */}
        <Text style={styles.sectionTitle}>ARCHIVAL ARCHIVE STATS</Text>
        <View style={styles.statsGrid}>
          <Card variant="default" style={styles.statCard}>
            <Text style={styles.statNumber}>{totalCount}</Text>
            <Text style={styles.statLabel}>Total Saved</Text>
          </Card>
          <Card variant="default" style={styles.statCard}>
            <Text style={[styles.statNumber, { color: COLORS.success }]}>{publishedCount}</Text>
            <Text style={styles.statLabel}>Approved</Text>
          </Card>
          <Card variant="default" style={styles.statCard}>
            <Text style={[styles.statNumber, { color: COLORS.gold }]}>{pendingCount}</Text>
            <Text style={styles.statLabel}>Pending Review</Text>
          </Card>
          <Card variant="default" style={styles.statCard}>
            <Text style={[styles.statNumber, { color: COLORS.error }]}>{rejectedCount}</Text>
            <Text style={styles.statLabel}>Changes Req.</Text>
          </Card>
        </View>

        {/* Streak details */}
        <Card variant="default" style={styles.streakCard}>
          <View style={styles.streakRow}>
            <View style={styles.streakLeft}>
              <Flame size={24} color={COLORS.accent} />
              <View style={styles.streakTextCol}>
                <Text style={styles.streakHeadline}>Active contribution streak</Text>
                <Text style={styles.streakSub}>Last upload: {streakInfo.lastContribution}</Text>
              </View>
            </View>
            <View style={styles.streakRight}>
              <Text style={styles.streakVal}>{streakInfo.current} weeks</Text>
              <Text style={styles.streakLongest}>Record: {streakInfo.longest}w</Text>
            </View>
          </View>
        </Card>

        {/* Achievements Section */}
        <Text style={styles.sectionTitle}>HERITAGE PLAQUE HONORS</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.achievementsScroll}>
          {achievements.map((item) => (
            <Card 
              key={item.id} 
              variant="default" 
              style={[styles.achievementCard, !item.unlocked && styles.achievementCardLocked]}
            >
              <View style={[styles.achievementIconBox, !item.unlocked && styles.achievementIconBoxLocked]}>
                <Text style={styles.achievementBadgeEmoji}>{item.badge}</Text>
              </View>
              <Text style={[styles.achievementTitle, !item.unlocked && styles.achievementTextMuted]} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.achievementDesc} numberOfLines={2}>
                {item.description}
              </Text>
              {!item.unlocked && (
                <View style={styles.lockedBadge}>
                  <Text style={styles.lockedText}>LOCKED</Text>
                </View>
              )}
            </Card>
          ))}
        </ScrollView>

        {/* Quick Actions Shortcuts */}
        <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
        <Card variant="default" style={styles.actionsCard}>
          <TouchableOpacity 
            activeOpacity={0.7} 
            onPress={() => navigation.navigate('ProfileSetup')}
            style={styles.actionRow}
          >
            <View style={styles.actionLeft}>
              <Edit3 size={18} color={COLORS.secondary} />
              <Text style={styles.actionText}>Edit My Profile</Text>
            </View>
            <ChevronRight size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
          
          <View style={styles.rowDivider} />

          <TouchableOpacity 
            activeOpacity={0.7} 
            onPress={() => navigation.navigate('MainApp', { screen: 'MyArchive' })}
            style={styles.actionRow}
          >
            <View style={styles.actionLeft}>
              <BookOpen size={18} color={COLORS.secondary} />
              <Text style={styles.actionText}>My Recipe Archive</Text>
            </View>
            <ChevronRight size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
          
          <View style={styles.rowDivider} />

          <TouchableOpacity 
            activeOpacity={0.7} 
            onPress={() => navigation.navigate('Settings')}
            style={styles.actionRow}
          >
            <View style={styles.actionLeft}>
              <SettingsIcon size={18} color={COLORS.secondary} />
              <Text style={styles.actionText}>Application Settings</Text>
            </View>
            <ChevronRight size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
          
          <View style={styles.rowDivider} />

          <TouchableOpacity 
            activeOpacity={0.7} 
            onPress={() => navigation.navigate('Notifications')}
            style={styles.actionRow}
          >
            <View style={styles.actionLeft}>
              <Bell size={18} color={COLORS.secondary} />
              <Text style={styles.actionText}>Alert System Logs</Text>
            </View>
            <ChevronRight size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
          
          <View style={styles.rowDivider} />

          <TouchableOpacity 
            activeOpacity={0.7} 
            onPress={() => navigation.navigate('Tutorial')}
            style={styles.actionRow}
          >
            <View style={styles.actionLeft}>
              <Book size={18} color={COLORS.secondary} />
              <Text style={styles.actionText}>Archiving Video Guides & Tutorial</Text>
            </View>
            <ChevronRight size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        </Card>

        {/* Logout Destructive Button */}
        <Button 
          title="Sign Out Account" 
          variant="outline" 
          onPress={handleLogoutPress}
          style={styles.logoutButton}
          textStyle={{ color: COLORS.error }}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingBottom: 40,
  },
  heroCard: {
    padding: SPACING.md,
    borderColor: '#E7D8C5',
    marginVertical: SPACING.sm,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarImage: {
    width: 72,
    height: 72,
    borderRadius: BORDERS.radiusRound,
  },
  avatarFallback: {
    width: 72,
    height: 72,
    borderRadius: BORDERS.radiusRound,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.gold,
  },
  avatarText: {
    ...FONTS.titleLarge,
    fontSize: 22,
    color: COLORS.background,
  },
  heroDetails: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  contributorName: {
    ...FONTS.titleMedium,
    fontSize: 19,
    color: COLORS.text,
  },
  badgeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  awardIcon: {
    marginRight: 4,
  },
  contributorBadge: {
    ...FONTS.labelCaps,
    fontSize: 10,
    color: COLORS.primary,
  },
  contributorType: {
    ...FONTS.body,
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  locationText: {
    ...FONTS.caption,
    fontSize: 11,
    color: COLORS.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.md,
  },
  bioContainer: {
    marginTop: 0,
  },
  bioTitle: {
    ...FONTS.labelCaps,
    fontSize: 10,
    color: COLORS.textMuted,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  bioText: {
    ...FONTS.body,
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.text,
  },
  memberSince: {
    ...FONTS.caption,
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 8,
    fontStyle: 'italic',
  },
  sectionTitle: {
    ...FONTS.labelCaps,
    fontSize: 11,
    color: COLORS.secondary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.xs,
    letterSpacing: 1.5,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    justifyContent: 'space-between',
    marginVertical: SPACING.xs,
  },
  statCard: {
    width: '48%',
    marginVertical: 0,
    padding: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNumber: {
    ...FONTS.titleLarge,
    fontSize: 22,
    color: COLORS.text,
  },
  statLabel: {
    ...FONTS.caption,
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  streakCard: {
    padding: SPACING.md,
    marginVertical: SPACING.sm,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  streakLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  streakTextCol: {
    marginLeft: SPACING.md,
  },
  streakHeadline: {
    ...FONTS.bodyBold,
    fontSize: 13.5,
    color: COLORS.text,
  },
  streakSub: {
    ...FONTS.caption,
    fontSize: 11,
    marginTop: 2,
  },
  streakRight: {
    alignItems: 'flex-end',
  },
  streakVal: {
    ...FONTS.bodyBold,
    fontSize: 15,
    color: COLORS.primary,
  },
  streakLongest: {
    ...FONTS.caption,
    fontSize: 10,
    marginTop: 2,
  },
  achievementsScroll: {
    gap: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  achievementCard: {
    width: 140,
    padding: SPACING.sm,
    alignItems: 'center',
    marginVertical: 0,
    position: 'relative',
    height: 145,
  },
  achievementCardLocked: {
    opacity: 0.5,
  },
  achievementIconBox: {
    width: 44,
    height: 44,
    borderRadius: BORDERS.radiusRound,
    backgroundColor: COLORS.secondaryBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  achievementIconBoxLocked: {
    backgroundColor: '#e4e2dd',
  },
  achievementBadgeEmoji: {
    fontSize: 20,
  },
  achievementTitle: {
    ...FONTS.bodyBold,
    fontSize: 11.5,
    color: COLORS.text,
    textAlign: 'center',
    width: '100%',
  },
  achievementTextMuted: {
    color: COLORS.textMuted,
  },
  achievementDesc: {
    ...FONTS.caption,
    fontSize: 9.5,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 13,
  },
  lockedBadge: {
    position: 'absolute',
    bottom: SPACING.xs,
    backgroundColor: '#c4c7c7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BORDERS.radiusSm,
  },
  lockedText: {
    fontSize: 8,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  actionsCard: {
    paddingVertical: SPACING.xs,
    marginVertical: SPACING.xs,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: SPACING.sm,
    height: 48,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionText: {
    ...FONTS.body,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  rowDivider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginHorizontal: SPACING.sm,
  },
  logoutButton: {
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
    borderColor: COLORS.error,
    borderWidth: 1,
  },
});

export default ProfileScreen;
