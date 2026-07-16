import React, { useState } from 'react';
import { View, Text, StyleSheet, StatusBar, SafeAreaView, FlatList, TouchableOpacity, Image } from 'react-native';
import { COLORS, FONTS, SPACING, BORDERS, SHADOWS } from '../../../core/theme/theme';
import Header from '../../../shared/components/Header';
import Card from '../../../shared/components/Card';
import Input from '../../../shared/components/Input';
import { ALL_COLLECTIONS } from '../services/collectionsData';
import ImageLoader from '../../../shared/components/ImageLoader';
import TransitionView from '../../../shared/components/TransitionView';

export const CollectionsDashboardScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');

  // Gather unique tags for filter chips
  const allTags = ['All', ...new Set(ALL_COLLECTIONS.flatMap((item) => item.tags))];

  // Filtering collections based on search and tag chips
  const filteredCollections = ALL_COLLECTIONS.filter((col) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = query === '' ||
      col.title.toLowerCase().includes(query) ||
      col.subtitle.toLowerCase().includes(query) ||
      (col.region || '').toLowerCase().includes(query) ||
      col.tags.some(tag => tag.toLowerCase().includes(query));

    const matchesTag = selectedTag === 'All' || col.tags.includes(selectedTag);

    return matchesSearch && matchesTag;
  });

  const featuredCollection = ALL_COLLECTIONS[0]; // Mughal Cuisine as Featured

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <Header title="Heritage Collections" showBack={true} showAvatar={true} />

      <TransitionView style={{ flex: 1 }}>
        <FlatList
        data={filteredCollections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {/* Description */}
            <Text style={styles.manifestoText}>
              Explore India's living culinary archives through historical timelines, geographical peninsulas, and ancestral spice trade routes.
            </Text>

            {/* Search Bar */}
            <Input
              placeholder="Search by collection title, era, region..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchBar}
            />

            {/* Tag Filter Chips */}
            <FlatList
              horizontal
              data={allTags}
              keyExtractor={(tag) => tag}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsScroll}
              renderItem={({ item: tag }) => {
                const isSelected = selectedTag === tag;
                return (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setSelectedTag(tag)}
                    style={[styles.chip, isSelected ? styles.chipSelected : styles.chipUnselected]}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                      {tag}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />

            {/* Featured Collection Section */}
            {searchQuery === '' && selectedTag === 'All' && featuredCollection && (
              <View style={styles.featuredContainer}>
                <Text style={styles.sectionLabel}>FEATURED CURATION</Text>
                <Card variant="heritage" style={styles.featuredCard}>
                  <ImageLoader source={featuredCollection.coverImage} style={styles.featuredCover} resizeMode="cover" />
                  <View style={styles.featuredContent}>
                    <Text style={styles.featuredTitle}>{featuredCollection.title}</Text>
                    <Text style={styles.featuredSubtitle}>{featuredCollection.subtitle}</Text>
                    <Text style={styles.featuredPeriod}>Period: {featuredCollection.period}</Text>
                    
                    <View style={styles.featuredStatsRow}>
                      <Text style={styles.featuredStat}>Recipes: {featuredCollection.recipeCount}</Text>
                      <Text style={styles.featuredStat}>Contributors: {featuredCollection.contributors}</Text>
                    </View>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => navigation.navigate('CollectionDetails', { collectionId: featuredCollection.id })}
                      style={styles.exploreBtn}
                    >
                      <Text style={styles.exploreBtnText}>Explore Curation</Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              </View>
            )}

            <Text style={styles.sectionLabel}>ALL ARCHIVAL COLLECTIONS</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Card variant="default" style={styles.collectionCard}>
            <ImageLoader source={item.coverImage} style={styles.cardImage} resizeMode="cover" />
            <View style={styles.cardInfo}>
              <View style={styles.badgeRow}>
                {item.tags.map((tag) => (
                  <View key={tag} style={styles.tagBadge}>
                    <Text style={styles.tagBadgeText}>{tag.toUpperCase()}</Text>
                  </View>
                ))}
              </View>

              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardSubtitle} numberOfLines={2}>{item.subtitle}</Text>
              
              <View style={styles.cardMetaRow}>
                <Text style={styles.cardMetaItem}>📜 {item.recipeCount} Recipes</Text>
                <Text style={styles.cardMetaItem}>🏺 {item.contributors} Contribs</Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => navigation.navigate('CollectionDetails', { collectionId: item.id })}
                style={styles.cardActionBtn}
              >
                <Text style={styles.cardActionText}>Explore Collection →</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No Collections Found</Text>
            <Text style={styles.emptyText}>No curation files match your search criteria. Try a different query.</Text>
          </View>
        }
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={5}
        removeClippedSubviews={true}
      />
      </TransitionView>
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
    paddingBottom: 110,
  },
  manifestoText: {
    ...FONTS.body,
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 18,
    marginBottom: SPACING.md,
  },
  searchBar: {
    marginVertical: 0,
    marginBottom: SPACING.md,
  },
  chipsScroll: {
    gap: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: BORDERS.radiusRound,
    borderWidth: 1,
    marginRight: 6,
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
  sectionLabel: {
    ...FONTS.labelCaps,
    fontSize: 10,
    color: COLORS.primary,
    letterSpacing: 1.5,
    marginVertical: SPACING.sm,
    marginLeft: 2,
  },
  featuredContainer: {
    marginBottom: SPACING.lg,
  },
  featuredCard: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.borderLight,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  featuredCover: {
    width: '100%',
    height: 140,
  },
  featuredContent: {
    padding: SPACING.md,
  },
  featuredTitle: {
    ...FONTS.titleLarge,
    fontSize: 22,
    color: COLORS.secondary,
  },
  featuredSubtitle: {
    ...FONTS.body,
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  featuredPeriod: {
    ...FONTS.caption,
    fontSize: 11,
    marginTop: 4,
    color: COLORS.primary,
    fontWeight: '700',
  },
  featuredStatsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginVertical: SPACING.sm,
  },
  featuredStat: {
    ...FONTS.caption,
    fontSize: 12,
    color: COLORS.text,
  },
  exploreBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    borderRadius: BORDERS.radiusRound,
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  exploreBtnText: {
    ...FONTS.bodyBold,
    fontSize: 13,
    color: COLORS.background,
  },
  collectionCard: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.borderLight,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    padding: SPACING.sm,
    gap: SPACING.md,
    ...SHADOWS.soft,
  },
  cardImage: {
    width: 100,
    height: 120,
    borderRadius: BORDERS.radiusMd,
    backgroundColor: COLORS.secondaryBackground,
  },
  cardInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  tagBadge: {
    backgroundColor: COLORS.secondaryBackground,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  tagBadgeText: {
    ...FONTS.labelCaps,
    fontSize: 7,
    color: COLORS.secondary,
  },
  cardTitle: {
    ...FONTS.titleMedium,
    fontSize: 16,
    color: COLORS.text,
    marginTop: 2,
  },
  cardSubtitle: {
    ...FONTS.body,
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 15,
  },
  cardMetaRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: 4,
  },
  cardMetaItem: {
    ...FONTS.caption,
    fontSize: 10,
    color: COLORS.text,
  },
  cardActionBtn: {
    paddingVertical: SPACING.xs,
    marginTop: 4,
  },
  cardActionText: {
    ...FONTS.caption,
    fontWeight: '700',
    color: COLORS.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyTitle: {
    ...FONTS.titleMedium,
    color: COLORS.secondary,
  },
  emptyText: {
    ...FONTS.body,
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
});

export default CollectionsDashboardScreen;
