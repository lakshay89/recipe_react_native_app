import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, SafeAreaView, FlatList, TouchableOpacity, Image, ScrollView } from 'react-native';
import { COLORS, FONTS, SPACING, BORDERS, SHADOWS } from '../../../core/theme/theme';
import { useAuth } from '../../../shared/services/AuthContext';
import Header from '../../../shared/components/Header';
import Card from '../../../shared/components/Card';
import Input from '../../../shared/components/Input';
import Button from '../../../shared/components/Button';
import { recipeDraftService } from '../../recipes/services/recipeDraftService';

export const MyArchiveDashboard = ({ navigation }) => {
  const { myRecipes, duplicateRecipe, deleteRecipe } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('Newest');
  const [draftCount, setDraftCount] = useState(0);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      recipeDraftService.getAllDrafts().then((list) => {
        setDraftCount(list.length);
      });
    });
    return unsubscribe;
  }, [navigation]);

  // Archive stats
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

  // Filter & Search Logic
  const filteredRecipes = myRecipes.filter((recipe) => {
    // 1. Search Query match
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = query === '' || 
      (recipe.title || '').toLowerCase().includes(query) ||
      (recipe.localName || '').toLowerCase().includes(query) ||
      (recipe.region || '').toLowerCase().includes(query) ||
      (recipe.district || '').toLowerCase().includes(query) ||
      (recipe.community || '').toLowerCase().includes(query) ||
      (recipe.festival || '').toLowerCase().includes(query);

    // 2. Active Filter chip match
    let matchesFilter = true;
    const statusLower = (recipe.status || '').toLowerCase();
    if (activeFilter === 'Draft') {
      matchesFilter = statusLower === 'draft';
    } else if (activeFilter === 'Pending') {
      matchesFilter = statusLower === 'pending_review' || statusLower === 'pending review' || statusLower === 'update_under_review' || statusLower === 'update under review';
    } else if (activeFilter === 'Published') {
      matchesFilter = statusLower === 'approved' || statusLower === 'published';
    } else if (activeFilter === 'Rejected') {
      matchesFilter = statusLower === 'rejected';
    } else if (activeFilter === 'Update Review') {
      matchesFilter = statusLower === 'update_under_review' || statusLower === 'update under review';
    }

    return matchesSearch && matchesFilter;
  });

  // Sort Logic
  const sortedRecipes = [...filteredRecipes].sort((a, b) => {
    const timeA = new Date(a.createdAt || 0).getTime();
    const timeB = new Date(b.createdAt || 0).getTime();
    return sortOrder === 'Newest' ? timeB - timeA : timeA - timeB;
  });

  const handleDuplicate = (id) => {
    duplicateRecipe(id);
  };

  const handleDelete = (id) => {
    deleteRecipe(id);
  };

  const getStatusBadgeStyle = (status) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'approved':
      case 'published':
        return styles.badgePublished;
      case 'pending review':
      case 'pending_review':
      case 'update under review':
      case 'update_under_review':
        return styles.badgePending;
      case 'rejected':
        return styles.badgeRejected;
      case 'needs changes':
      case 'changes_requested':
        return styles.badgeNeedsChanges;
      default:
        return styles.badgeDraft;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <Header title="My Archive" showBack={false} showAvatar={true} />

      {/* Floating Add Button */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => navigation.navigate('AddRecipe')}
        style={styles.floatingAddBtn}
      >
        <Text style={styles.floatingAddIcon}>+</Text>
      </TouchableOpacity>

      <FlatList
        data={sortedRecipes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {/* Header Greetings & Guideline links */}
            <View style={styles.welcomeRow}>
              <View style={styles.welcomeTextGroup}>
                <Text style={styles.welcomeTitle}>Culinary Archives</Text>
                <Text style={styles.welcomeSubtitle}>Your verified heritage preservation records.</Text>
              </View>
              <Button
                title="Guidelines"
                variant="outline"
                onPress={() => navigation.navigate('Tutorial')}
                style={styles.guideBtn}
                textStyle={styles.guideBtnText}
              />
            </View>

            {/* Statistics Cards */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsScroll}>
              <Card variant="heritage" style={styles.statCard}>
                <Text style={styles.statVal}>{totalCount}</Text>
                <Text style={styles.statLabel}>Total Recipes</Text>
              </Card>
              
              <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('PublishedRecipes')}>
                <Card variant="default" style={styles.statCard}>
                  <Text style={[styles.statVal, { color: COLORS.secondary }]}>{publishedCount}</Text>
                  <Text style={styles.statLabel}>Published</Text>
                </Card>
              </TouchableOpacity>

              <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('PendingReview')}>
                <Card variant="default" style={styles.statCard}>
                  <Text style={[styles.statVal, { color: COLORS.primary }]}>{pendingCount}</Text>
                  <Text style={styles.statLabel}>Pending</Text>
                </Card>
              </TouchableOpacity>

              <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('RejectedRecipes')}>
                <Card variant="default" style={styles.statCard}>
                  <Text style={[styles.statVal, { color: COLORS.error }]}>{rejectedCount}</Text>
                  <Text style={styles.statLabel}>Rejected</Text>
                </Card>
              </TouchableOpacity>

              <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('DraftRecipes')}>
                <Card variant="default" style={styles.statCard}>
                  <Text style={[styles.statVal, { color: COLORS.textMuted }]}>{draftCount}</Text>
                  <Text style={styles.statLabel}>Drafts</Text>
                </Card>
              </TouchableOpacity>
            </ScrollView>

            {/* Search Bar */}
            <Input
              placeholder="Search by name, local dialect, region, tribe..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchBar}
            />

            {/* Status Filter Chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
              {['All', 'Draft', 'Pending', 'Published', 'Rejected', 'Update Review'].map((filter) => {
                const isSelected = activeFilter === filter;
                return (
                  <TouchableOpacity
                    key={filter}
                    activeOpacity={0.8}
                    onPress={() => setActiveFilter(filter)}
                    style={[styles.chip, isSelected ? styles.chipSelected : styles.chipUnselected]}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                      {filter}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Sorting toggle */}
            <View style={styles.sortRow}>
              <Text style={styles.resultsCount}>
                Showing {sortedRecipes.length} records
              </Text>
              <TouchableOpacity
                onPress={() => setSortOrder(sortOrder === 'Newest' ? 'Oldest' : 'Newest')}
                activeOpacity={0.7}
              >
                <Text style={styles.sortToggleText}>Order: {sortOrder} ⇅</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <Card variant="default" style={styles.recipeCard}>
            <View style={styles.cardContentRow}>
              {/* Card Image Thumbnail */}
              <View style={styles.imgContainer}>
                {item.coverImage === 'thali.png' || item.hasHero ? (
                  <Image source={require('../../../assets/images/thali.png')} style={styles.thumbImg} resizeMode="cover" />
                ) : item.coverImage === 'sweets.png' ? (
                  <Image source={require('../../../assets/images/sweets.png')} style={styles.thumbImg} resizeMode="cover" />
                ) : (
                  <Image source={require('../../../assets/images/logo.png')} style={[styles.thumbImg, { opacity: 0.3 }]} resizeMode="contain" />
                )}
              </View>

              {/* Card Text Content */}
              <View style={styles.infoCol}>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.recipeTitle} numberOfLines={1}>{item.title}</Text>
                  <View style={[styles.statusBadge, getStatusBadgeStyle(item.status)]}>
                    <Text style={styles.badgeText}>{item.status.toUpperCase()}</Text>
                  </View>
                </View>

                {item.localName ? (
                  <Text style={styles.localName} numberOfLines={1}>({item.localName})</Text>
                ) : null}

                <Text style={styles.locationText} numberOfLines={1}>
                  📍 {item.region || 'Unknown State'}, {item.district || 'Unknown District'}
                </Text>

                <Text style={styles.dateText}>
                  Submitted: {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                </Text>

                {/* Quick actions panel */}
                <View style={styles.actionsPanel}>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('MyRecipeDetails', { recipeId: item.id })}
                    style={styles.actionBtn}
                  >
                    <Text style={styles.actionText}>View</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => navigation.navigate('EditRecipe', { recipeId: item.id })}
                    style={styles.actionBtn}
                  >
                    <Text style={styles.actionText}>Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleDuplicate(item.id)}
                    style={styles.actionBtn}
                  >
                    <Text style={styles.actionText}>Duplicate</Text>
                  </TouchableOpacity>

                  {item.status === 'Draft' && (
                    <TouchableOpacity
                      onPress={() => handleDelete(item.id)}
                      style={[styles.actionBtn, styles.deleteBtn]}
                    >
                      <Text style={styles.deleteText}>Delete</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          </Card>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Image
              source={require('../../../assets/images/logo.png')}
              style={styles.emptyWatermark}
              resizeMode="contain"
            />
            <Text style={styles.emptyTitle}>No archives found</Text>
            <Text style={styles.emptyDesc}>
              {activeFilter === 'All'
                ? "Start preserving India's culinary heritage by contributing your first family recipe."
                : `You currently have no records marked as ${activeFilter}.`}
            </Text>
            <Button
              title="Add Heritage Recipe"
              variant="primary"
              onPress={() => navigation.navigate('AddRecipe')}
              style={styles.emptyBtn}
            />
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingBottom: 120, // Prevents bottom tab bar clipping
  },
  welcomeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  welcomeTextGroup: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  welcomeTitle: {
    ...FONTS.titleLarge,
    fontSize: 24,
    color: COLORS.secondary,
  },
  welcomeSubtitle: {
    ...FONTS.body,
    fontSize: 13,
    color: COLORS.textMuted,
  },
  guideBtn: {
    paddingVertical: 6,
    paddingHorizontal: SPACING.sm,
    borderColor: COLORS.primary,
    height: 34,
  },
  guideBtnText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '700',
  },
  statsScroll: {
    paddingVertical: SPACING.xs,
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  statCard: {
    width: 105,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderColor: COLORS.borderLight,
  },
  statVal: {
    ...FONTS.titleLarge,
    fontSize: 20,
    color: COLORS.primary,
  },
  statLabel: {
    ...FONTS.caption,
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
  searchBar: {
    marginVertical: 0,
    marginBottom: SPACING.md,
  },
  chipsScroll: {
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: BORDERS.radiusRound,
    borderWidth: 1,
  },
  chipUnselected: {
    borderColor: COLORS.border,
    backgroundColor: 'transparent',
  },
  chipSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.secondaryBackground,
  },
  chipText: {
    ...FONTS.bodyMedium,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  chipTextSelected: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  sortRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  resultsCount: {
    ...FONTS.caption,
    color: COLORS.textMuted,
  },
  sortToggleText: {
    ...FONTS.caption,
    color: COLORS.primary,
    fontWeight: '700',
  },
  recipeCard: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.borderLight,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.soft,
  },
  cardContentRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  imgContainer: {
    width: 85,
    height: 85,
    borderRadius: BORDERS.radiusMd,
    overflow: 'hidden',
    backgroundColor: COLORS.secondaryBackground,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  thumbImg: {
    width: '100%',
    height: '100%',
  },
  infoCol: {
    flex: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  recipeTitle: {
    ...FONTS.titleMedium,
    fontSize: 16,
    color: COLORS.text,
    flex: 1,
  },
  localName: {
    ...FONTS.body,
    fontSize: 12,
    fontStyle: 'italic',
    color: COLORS.textMuted,
    marginTop: -2,
    marginBottom: 2,
  },
  locationText: {
    ...FONTS.caption,
    fontSize: 11,
    color: COLORS.text,
    marginVertical: 1,
  },
  dateText: {
    ...FONTS.caption,
    fontSize: 10,
    color: COLORS.textMuted,
  },
  statusBadge: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    ...FONTS.labelCaps,
    fontSize: 8,
    color: COLORS.background,
    fontWeight: '700',
  },
  badgePublished: {
    backgroundColor: COLORS.secondary, // Deep Forest Green success badge
  },
  badgePending: {
    backgroundColor: COLORS.primary, // Terracotta warning badge
  },
  badgeRejected: {
    backgroundColor: COLORS.error, // Deep Red error badge
  },
  badgeNeedsChanges: {
    backgroundColor: '#d1a100', // Ochre/Gold attention warning badge
  },
  badgeDraft: {
    backgroundColor: COLORS.textMuted,
  },
  actionsPanel: {
    flexDirection: 'row',
    marginTop: SPACING.sm,
    gap: SPACING.md,
  },
  actionBtn: {
    paddingVertical: 2,
  },
  actionText: {
    ...FONTS.caption,
    fontWeight: '700',
    color: COLORS.primary,
  },
  deleteBtn: {
    marginLeft: 'auto',
  },
  deleteText: {
    ...FONTS.caption,
    fontWeight: '700',
    color: COLORS.error,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
    marginTop: SPACING.xl,
  },
  emptyWatermark: {
    width: 90,
    height: 90,
    opacity: 0.1,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    ...FONTS.titleMedium,
    fontSize: 18,
    color: COLORS.secondary,
    marginBottom: SPACING.xs,
  },
  emptyDesc: {
    ...FONTS.body,
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  emptyBtn: {
    width: 200,
  },
  floatingAddBtn: {
    position: 'absolute',
    bottom: 90,
    right: 25,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    ...SHADOWS.medium,
  },
  floatingAddIcon: {
    color: COLORS.background,
    fontSize: 30,
    fontWeight: '300',
    lineHeight: 32,
  },
});

export default MyArchiveDashboard;
