import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  CheckCircle,
  XCircle,
  MessageSquare,
  History,
  Clock,
  FileText,
  Bell,
  Award,
  ChevronRight
} from 'lucide-react-native';
import { COLORS, FONTS, BORDERS, SHADOWS } from '../../../../core/theme/theme';

// Map notification types to their corresponding Lucide icons and colors
const getIconConfig = (type) => {
  switch (type) {
    case 'recipe_approved':
      return { Icon: CheckCircle, color: '#137333', bg: '#E6F4EA' };
    case 'recipe_rejected':
      return { Icon: XCircle, color: '#C5221F', bg: '#FCE8E6' };
    case 'curator_feedback':
    case 'info_requested':
      return { Icon: MessageSquare, color: '#B26A00', bg: '#FEF7E0' };
    case 'version_created':
    case 'version_restored':
      return { Icon: History, color: '#A3441F', bg: '#FBEBE4' };
    case 'submission_under_review':
    case 'submission_received':
      return { Icon: Clock, color: '#5F6368', bg: '#F1F3F4' };
    case 'recipe_published':
    case 'community_comment':
      return { Icon: FileText, color: '#2F5D4A', bg: '#EAF0EC' };
    case 'achievement_unlocked':
    case 'badge_earned':
      return { Icon: Award, color: '#D4A373', bg: '#FCF5EC' };
    default:
      return { Icon: Bell, color: '#A3441F', bg: '#FBEBE4' };
  }
};

// Map status strings to custom style keys
const getBadgeStyles = (status) => {
  const norm = (status || '').toLowerCase();
  if (norm.includes('approved')) return { bg: '#E6F4EA', text: '#137333' };
  if (norm.includes('rejected')) return { bg: '#FCE8E6', text: '#C5221F' };
  if (norm.includes('pending') || norm.includes('review')) return { bg: '#F1F3F4', text: '#5F6368' };
  if (norm.includes('published')) return { bg: '#E6F4EA', text: '#137333' };
  if (norm.includes('draft')) return { bg: '#FFF4E5', text: '#B26A00' };
  return { bg: '#FBEBE4', text: '#A3441F' }; // Default / Version History
};

export const NotificationCard = ({ notification, onPress, onLongPress, onActionPress }) => {
  const {
    type,
    recipeTitle,
    message,
    description,
    status,
    createdAt,
    isRead,
    actionLabel
  } = notification;

  const iconConfig = getIconConfig(type);
  const badgeConfig = getBadgeStyles(status);
  const IconComponent = iconConfig.Icon;

  // Format date helper
  const formatTime = (isoString) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 6000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${Math.floor(diffMins / 60)}h ago`;
      return new Date(isoString).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      onLongPress={onLongPress}
      style={[
        styles.card,
        !isRead ? styles.cardUnread : styles.cardRead
      ]}
    >
      {/* Visual Unread Ring watermarked */}
      {!isRead && <View style={styles.unreadDot} />}

      {/* Main Info Row */}
      <View style={styles.contentRow}>
        {/* Left Side Icon */}
        <View style={[styles.iconContainer, { backgroundColor: iconConfig.bg }]}>
          <IconComponent size={20} color={iconConfig.color} strokeWidth={2.2} />
        </View>

        {/* Content Side */}
        <View style={styles.infoContainer}>
          <View style={styles.cardHeaderRow}>
            {/* Type/Status Badge */}
            <View style={[styles.statusBadge, { backgroundColor: badgeConfig.bg }]}>
              <Text style={[styles.statusText, { color: badgeConfig.text }]}>
                {status.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.timeText}>{formatTime(createdAt)}</Text>
          </View>

          {/* Title and Recipe Link Context */}
          <Text style={styles.messageText}>{message}</Text>
          {recipeTitle ? (
            <Text style={styles.recipeTitleText}>
              Recipe: <Text style={styles.recipeTitleTextBold}>{recipeTitle}</Text>
            </Text>
          ) : null}

          {/* Detailed Message Text */}
          <Text style={styles.descriptionText} numberOfLines={3}>
            {description}
          </Text>

          {/* Interactive Button Action */}
          {actionLabel ? (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onActionPress}
              style={styles.actionButton}
            >
              <Text style={styles.actionButtonText}>{actionLabel}</Text>
              <ChevronRight size={14} color={COLORS.primary} strokeWidth={2.5} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: BORDERS.widthThin,
    marginBottom: 12,
    position: 'relative',
    ...SHADOWS.soft,
  },
  cardUnread: {
    backgroundColor: '#FAF5ED', // Warm offset color highlight for unread
    borderColor: '#E7D8C5',
  },
  cardRead: {
    backgroundColor: COLORS.white,
    borderColor: '#ECE3D7',
  },
  unreadDot: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary, // Heritage Green unread dot
  },
  contentRow: {
    flexDirection: 'row',
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  timeText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginRight: 10,
  },
  messageText: {
    ...FONTS.bodyMedium,
    fontSize: 15,
    fontWeight: '700',
    color: '#2B2B2B',
    marginBottom: 2,
  },
  recipeTitleText: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 4,
  },
  recipeTitleTextBold: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  descriptionText: {
    ...FONTS.body,
    fontSize: 13,
    color: '#666666',
    lineHeight: 18,
    marginBottom: 8,
  },
  actionButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondaryBackground,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginTop: 4,
  },
  actionButtonText: {
    ...FONTS.bodyMedium,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    marginRight: 2,
  },
});

export default NotificationCard;
