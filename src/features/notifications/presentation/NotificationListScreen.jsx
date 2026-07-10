import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  FlatList,
  TextInput,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Modal,
  Alert,
  Share,
  Platform
} from 'react-native';
import {
  Search,
  SlidersHorizontal,
  BellRing,
  Trash2,
  Bookmark,
  Copy,
  Share2,
  Check,
  CheckCheck,
  ArrowLeft
} from 'lucide-react-native';
import { COLORS, FONTS, BORDERS, SHADOWS } from '../../../core/theme/theme';
import { MOCK_NOTIFICATIONS } from '../services/notificationsData';
import NotificationCard from './components/NotificationCard';
import NotificationFilterChip from './components/NotificationFilterChip';
import NotificationEmptyState from './components/NotificationEmptyState';
import NotificationSkeleton from './components/NotificationSkeleton';

const CHIPS_CONFIG = [
  { id: 'all', label: 'All', types: [] },
  { id: 'approved', label: 'Approved', types: ['recipe_approved'] },
  { id: 'rejected', label: 'Rejected', types: ['recipe_rejected'] },
  { id: 'feedback', label: 'Feedback', types: ['curator_feedback', 'info_requested'] },
  { id: 'draft', label: 'Draft', types: ['draft_saved', 'recipe_archived'] },
  { id: 'pending', label: 'Pending Review', types: ['submission_under_review', 'submission_received', 'info_requested'] },
  { id: 'published', label: 'Published', types: ['recipe_published', 'community_comment'] },
  { id: 'version', label: 'Version History', types: ['version_created', 'version_restored'] },
  { id: 'archive', label: 'Archive Updates', types: ['recipe_archived', 'recipe_published'] }
];

export const NotificationListScreen = ({ navigation }) => {
  // Notification State Store
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChip, setActiveChip] = useState('all');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'unread', 'approved', 'rejected'

  // Layout Loading States
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  // Sorting & Modal Dialog overlays
  const [showSortModal, setShowSortModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showOptionsModal, setShowOptionsModal] = useState(false);

  // Initialize view skeleton trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Compute counts for filter chip badges
  const filterCounts = useMemo(() => {
    const counts = { all: notifications.length };
    CHIPS_CONFIG.forEach(chip => {
      if (chip.id === 'all') return;
      counts[chip.id] = notifications.filter(n => chip.types.includes(n.type)).length;
    });
    return counts;
  }, [notifications]);

  // Pull to refresh simulation handler
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      // Reset database mockup back to state
      setNotifications(MOCK_NOTIFICATIONS);
      setPage(1);
      setRefreshing(false);
    }, 1500);
  }, []);

  // Infinite Scroll mock list simulator
  const handleLoadMore = useCallback(() => {
    if (loadingMore || page >= 2) return;
    setLoadingMore(true);
    setTimeout(() => {
      // Append a duplicate set with new IDs to simulate next page loads
      const moreItems = MOCK_NOTIFICATIONS.map(n => ({
        ...n,
        id: n.id + '_page' + page,
        createdAt: new Date(new Date(n.createdAt).getTime() - 86400000 * 3).toISOString() // Shuffled to older dates
      }));
      setNotifications(prev => [...prev, ...moreItems]);
      setPage(prev => prev + 1);
      setLoadingMore(false);
    }, 1500);
  }, [loadingMore, page]);

  // Actions dispatcher
  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    Alert.alert('Notifications', 'All notifications marked as read.');
  }, []);

  const markSingleRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: !n.isRead } : n));
  }, []);

  const deleteNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const archiveNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    Alert.alert('Archive', 'Notification moved to historical archives.');
  }, []);

  const handleShare = async (title, desc) => {
    try {
      await Share.share({
        message: `${title}\n\n${desc}`,
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  // Navigations dispatcher matching card navigation specifications
  const handleActionPress = useCallback((item) => {
    markSingleRead(item.id);
    const target = item.navigationTarget;
    const params = item.recipeId ? { recipeId: item.recipeId } : {};

    if (target === 'MyRecipeDetails') {
      navigation.navigate('MyRecipeDetails', params);
    } else if (target === 'EditRecipe') {
      navigation.navigate('EditRecipe', params);
    } else if (target === 'RecipeVersionHistory') {
      navigation.navigate('RecipeVersionHistory', params);
    } else if (target === 'MyArchive') {
      navigation.navigate('MyArchive');
    }
  }, [navigation, markSingleRead]);

  // Live filter and search computations
  const processedNotifications = useMemo(() => {
    let result = [...notifications];

    // 1. Text Search query filter
    if (searchQuery.trim().length > 0) {
      const query = searchQuery.toLowerCase();
      result = result.filter(n =>
        n.recipeTitle.toLowerCase().includes(query) ||
        n.message.toLowerCase().includes(query) ||
        n.description.toLowerCase().includes(query) ||
        (n.metadata?.curatorName || '').toLowerCase().includes(query) ||
        (n.metadata?.region || '').toLowerCase().includes(query) ||
        n.status.toLowerCase().includes(query)
      );
    }

    // 2. Filter chip mapping filter
    const activeConfig = CHIPS_CONFIG.find(c => c.id === activeChip);
    if (activeConfig && activeConfig.types.length > 0) {
      result = result.filter(n => activeConfig.types.includes(n.type));
    }

    // 3. Sorting filters
    result.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();

      switch (sortBy) {
        case 'oldest':
          return timeA - timeB;
        case 'unread':
          // Unread first, then newest
          if (a.isRead === b.isRead) return timeB - timeA;
          return a.isRead ? 1 : -1;
        case 'approved':
          const isAppA = a.status.toLowerCase().includes('approved');
          const isAppB = b.status.toLowerCase().includes('approved');
          if (isAppA === isAppB) return timeB - timeA;
          return isAppA ? -1 : 1;
        case 'rejected':
          const isRejA = a.status.toLowerCase().includes('rejected');
          const isRejB = b.status.toLowerCase().includes('rejected');
          if (isRejA === isRejB) return timeB - timeA;
          return isRejA ? -1 : 1;
        case 'newest':
        default:
          return timeB - timeA;
      }
    });

    return result;
  }, [notifications, searchQuery, activeChip, sortBy]);

  // Options bottom sheet helper callbacks
  const openOptionsSheet = useCallback((item) => {
    setSelectedNotification(item);
    setShowOptionsModal(true);
  }, []);

  const closeOptionsSheet = useCallback(() => {
    setSelectedNotification(null);
    setShowOptionsModal(false);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FBF7F1" />

      {/* Dynamic Header Structure */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <ArrowLeft size={20} color={COLORS.primary} strokeWidth={2.5} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Notifications</Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              Review approvals, curation feedback, and history edits.
            </Text>
          </View>
        </View>

        {processedNotifications.length > 0 && (
          <TouchableOpacity activeOpacity={0.8} onPress={markAllRead}>
            <Text style={styles.markAllReadBtn}>Mark All Read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Real-time Search Box & Sort Trigger */}
      <View style={styles.searchBarRow}>
        <View style={styles.searchContainer}>
          <Search size={18} color={COLORS.textMuted} style={styles.searchIcon} />
          <TextInput
            placeholder="Search by recipe, curator, status..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            clearButtonMode="while-editing"
          />
        </View>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setShowSortModal(true)}
          style={styles.sortTriggerBtn}
        >
          <SlidersHorizontal size={18} color={COLORS.primary} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* Horizontally Scrollable Filter Chips */}
      <View style={styles.chipsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsScrollContent}
        >
          {CHIPS_CONFIG.map(chip => (
            <NotificationFilterChip
              key={chip.id}
              label={chip.label}
              count={filterCounts[chip.id] || 0}
              active={activeChip === chip.id}
              onPress={() => setActiveChip(chip.id)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Shimmer Skeleton or Render List */}
      {loading ? (
        <NotificationSkeleton />
      ) : processedNotifications.length === 0 ? (
        <NotificationEmptyState onNavigateToArchive={() => navigation.navigate('MyArchive')} />
      ) : (
        <FlatList
          data={processedNotifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NotificationCard
              notification={item}
              onPress={() => handleActionPress(item)}
              onLongPress={() => openOptionsSheet(item)}
              onActionPress={() => handleActionPress(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.2}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.loadingMoreFooter}>
                <ActivityIndicator size="small" color={COLORS.primary} />
              </View>
            ) : null
          }
        />
      )}

      {/* Sort Options Modal */}
      <Modal
        visible={showSortModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSortModal(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowSortModal(false)}
          style={styles.modalOverlay}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Sort Notifications</Text>
            
            {[
              { key: 'newest', label: 'Newest First' },
              { key: 'oldest', label: 'Oldest First' },
              { key: 'unread', label: 'Unread First' },
              { key: 'approved', label: 'Approved First' },
              { key: 'rejected', label: 'Rejected First' }
            ].map(option => (
              <TouchableOpacity
                key={option.key}
                activeOpacity={0.8}
                onPress={() => {
                  setSortBy(option.key);
                  setShowSortModal(false);
                }}
                style={styles.modalOptionRow}
              >
                <Text style={[
                  styles.modalOptionText,
                  sortBy === option.key && styles.modalOptionTextActive
                ]}>
                  {option.label}
                </Text>
                {sortBy === option.key && (
                  <Check size={18} color={COLORS.primary} strokeWidth={2.5} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Context Actions Bottom Sheet Modal */}
      <Modal
        visible={showOptionsModal}
        transparent
        animationType="slide"
        onRequestClose={closeOptionsSheet}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={closeOptionsSheet}
          style={styles.bottomSheetOverlay}
        >
          <View style={styles.bottomSheetCard}>
            <View style={styles.bottomSheetDragIndicator} />
            <Text style={styles.bottomSheetHeader}>Notification Options</Text>
            {selectedNotification && (
              <Text style={styles.bottomSheetSubtext} numberOfLines={2}>
                {selectedNotification.message}
              </Text>
            )}

            {/* Read/Unread Toggle */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                markSingleRead(selectedNotification.id);
                closeOptionsSheet();
              }}
              style={styles.bottomSheetRow}
            >
              <View style={styles.bottomSheetIconCol}>
                {selectedNotification?.isRead ? (
                  <BellRing size={20} color={COLORS.primary} />
                ) : (
                  <CheckCheck size={20} color={COLORS.primary} />
                )}
              </View>
              <Text style={styles.bottomSheetText}>
                {selectedNotification?.isRead ? 'Mark as Unread' : 'Mark as Read'}
              </Text>
            </TouchableOpacity>

            {/* Archive Option */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                archiveNotification(selectedNotification.id);
                closeOptionsSheet();
              }}
              style={styles.bottomSheetRow}
            >
              <View style={styles.bottomSheetIconCol}>
                <Bookmark size={20} color="#D4A373" />
              </View>
              <Text style={styles.bottomSheetText}>Archive Notification</Text>
            </TouchableOpacity>

            {/* Copy Description Link Option */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                Alert.alert('Copy Link', 'Link successfully copied to clipboard.');
                closeOptionsSheet();
              }}
              style={styles.bottomSheetRow}
            >
              <View style={styles.bottomSheetIconCol}>
                <Copy size={20} color="#666" />
              </View>
              <Text style={styles.bottomSheetText}>Copy Link</Text>
            </TouchableOpacity>

            {/* Share Option */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                handleShare(selectedNotification.message, selectedNotification.description);
                closeOptionsSheet();
              }}
              style={styles.bottomSheetRow}
            >
              <View style={styles.bottomSheetIconCol}>
                <Share2 size={20} color="#666" />
              </View>
              <Text style={styles.bottomSheetText}>Share Update</Text>
            </TouchableOpacity>

            {/* Delete Option */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                deleteNotification(selectedNotification.id);
                closeOptionsSheet();
              }}
              style={[styles.bottomSheetRow, styles.bottomSheetRowDelete]}
            >
              <View style={styles.bottomSheetIconCol}>
                <Trash2 size={20} color="#C5221F" />
              </View>
              <Text style={[styles.bottomSheetText, styles.bottomSheetTextDelete]}>
                Delete Notification
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FBF7F1', // Primary Cream Background
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 60,
    backgroundColor: COLORS.white,
    borderBottomWidth: BORDERS.widthThin,
    borderColor: '#ECE3D7',
    ...SHADOWS.soft,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F7EFE4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  headerTitle: {
    ...FONTS.titleLarge,
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  headerSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
    width: '90%',
  },
  markAllReadBtn: {
    ...FONTS.bodyMedium,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    gap: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    backgroundColor: COLORS.white,
    borderWidth: BORDERS.widthThin,
    borderColor: '#ECE3D7',
    borderRadius: 20,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#2B2B2B',
    padding: 0,
  },
  sortTriggerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: BORDERS.widthThin,
    borderColor: '#ECE3D7',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.soft,
  },
  chipsContainer: {
    height: 46,
    marginBottom: 6,
  },
  chipsScrollContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 24,
  },
  loadingMoreFooter: {
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    ...SHADOWS.medium,
  },
  modalTitle: {
    ...FONTS.titleLarge,
    fontSize: 18,
    color: COLORS.secondary,
    marginBottom: 16,
  },
  modalOptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#ECE3D7',
  },
  modalOptionText: {
    ...FONTS.body,
    fontSize: 14,
    color: '#666666',
  },
  modalOptionTextActive: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  bottomSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  bottomSheetCard: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    paddingTop: 12,
    ...SHADOWS.medium,
  },
  bottomSheetDragIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#EAE1D5',
    alignSelf: 'center',
    marginBottom: 16,
  },
  bottomSheetHeader: {
    ...FONTS.titleLarge,
    fontSize: 18,
    color: COLORS.secondary,
    marginBottom: 4,
  },
  bottomSheetSubtext: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 16,
  },
  bottomSheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#ECE3D7',
  },
  bottomSheetIconCol: {
    width: 32,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  bottomSheetText: {
    ...FONTS.bodyMedium,
    fontSize: 14,
    color: '#333333',
  },
  bottomSheetRowDelete: {
    borderBottomWidth: 0,
  },
  bottomSheetTextDelete: {
    color: '#C5221F',
    fontWeight: '700',
  },
});

export default NotificationListScreen;
