import React from 'react';
import { View, Text, StyleSheet, StatusBar, SafeAreaView, ScrollView, Image, TouchableOpacity, FlatList } from 'react-native';
import { COLORS, FONTS, SPACING, BORDERS, SHADOWS } from '../../../core/theme/theme';
import Header from '../../../shared/components/Header';
import Card from '../../../shared/components/Card';
import { ALL_COLLECTIONS } from '../services/collectionsData';

export const CollectionDetailsScreen = ({ route, navigation }) => {
  const { collectionId } = route.params;

  const collection = ALL_COLLECTIONS.find((c) => c.id === collectionId);

  if (!collection) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Collection Detail" showBack={true} />
        <View style={styles.center}>
          <Text style={styles.errorText}>Collection record not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Get related collections details
  const relatedCollectionsList = ALL_COLLECTIONS.filter((c) =>
    collection.relatedCollections.includes(c.id)
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <Header title="Collection Detail" showBack={true} showAvatar={false} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Cover Header Banner */}
        <View style={styles.coverContainer}>
          <Image source={collection.coverImage} style={styles.coverImage} resizeMode="cover" />
          <View style={styles.scrim} />
          
          <View style={styles.badgeRow}>
            <View style={styles.periodBadge}>
              <Text style={styles.periodBadgeText}>{collection.period.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>{collection.title}</Text>
        <Text style={styles.subtitle}>{collection.subtitle}</Text>

        {/* Origin / Region Information Plaque */}
        <Card variant="heritage" style={styles.plaqueCard}>
          <Text style={styles.plaqueLabel}>GEOGRAPHIC INFLUENCE</Text>
          <Text style={styles.plaqueVal}>{collection.region}</Text>
        </Card>

        {/* Historical Description */}
        <Card variant="default" style={styles.descriptionCard}>
          <Text style={styles.sectionLabel}>HISTORICAL ANTECEDENTS</Text>
          <Text style={styles.descriptionText}>{collection.description}</Text>
        </Card>

        {/* Timeline block */}
        <Text style={styles.groupHeader}>Chronological Timeline</Text>
        <View style={styles.timelineContainer}>
          {collection.timeline.map((item, index) => (
            <View key={index} style={styles.timelineItem}>
              <View style={styles.timelineLineColumn}>
                <View style={styles.timelineDot} />
                {index < collection.timeline.length - 1 && <View style={styles.timelineLine} />}
              </View>
              <Card variant="default" style={styles.timelineContentCard}>
                <Text style={styles.timelineYear}>{item.year}</Text>
                <Text style={styles.timelineTitle}>{item.title}</Text>
                <Text style={styles.timelineDesc}>{item.description}</Text>
              </Card>
            </View>
          ))}
        </View>

        {/* Recipes Inside */}
        <Text style={styles.groupHeader}>Archived Recipes</Text>
        <View style={styles.recipesList}>
          {collection.recipes.map((item) => (
            <Card key={item.id} variant="default" style={styles.recipeCard}>
              <View style={styles.recipeRow}>
                <View style={styles.recipeThumbBox}>
                  {item.coverImage === 'thali.png' ? (
                    <Image source={require('../../../assets/images/thali.png')} style={styles.recipeThumb} resizeMode="cover" />
                  ) : item.coverImage === 'kesar.png' ? (
                    <Image source={require('../../../assets/images/kesar.png')} style={styles.recipeThumb} resizeMode="cover" />
                  ) : item.coverImage === 'sweets.png' ? (
                    <Image source={require('../../../assets/images/sweets.png')} style={styles.recipeThumb} resizeMode="cover" />
                  ) : item.coverImage === 'kelapatta.png' ? (
                    <Image source={require('../../../assets/images/kelapatta.png')} style={styles.recipeThumb} resizeMode="cover" />
                  ) : item.coverImage === 'silbata.png' ? (
                    <Image source={require('../../../assets/images/silbata.png')} style={styles.recipeThumb} resizeMode="cover" />
                  ) : (
                    <Image source={require('../../../assets/images/dal.png')} style={styles.recipeThumb} resizeMode="cover" />
                  )}
                </View>
                <View style={styles.recipeInfo}>
                  <Text style={styles.recipeTitle}>{item.title}</Text>
                  <Text style={styles.recipeSub}>{item.localName || 'Traditional variant'} • {item.region}</Text>
                  
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate('MyRecipeDetails', { recipeId: item.id })}
                    style={styles.viewRecipeBtn}
                  >
                    <Text style={styles.viewRecipeBtnText}>View Archive File →</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          ))}
        </View>

        {/* Mock Contributor List */}
        <Text style={styles.groupHeader}>Preserved By (Contributors)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.contributorsRow}>
          {[
            { id: '1', name: 'Aarav S.', badge: '🏺' },
            { id: '2', name: 'Meera K.', badge: '🌱' },
            { id: '3', name: 'Ishaan D.', badge: '👑' },
            { id: '4', name: 'Kabir B.', badge: '🏺' },
          ].map((item) => (
            <View key={item.id} style={styles.contributorItem}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarSymbol}>{item.badge}</Text>
              </View>
              <Text style={styles.contributorName}>{item.name}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Related Collections */}
        {relatedCollectionsList.length > 0 && (
          <View>
            <Text style={styles.groupHeader}>Related Curations</Text>
            <FlatList
              horizontal
              data={relatedCollectionsList}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.relatedScroll}
              renderItem={({ item }) => (
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => navigation.push('CollectionDetails', { collectionId: item.id })}
                  style={styles.relatedCard}
                >
                  <Card variant="default" style={styles.innerRelatedCard}>
                    <Image source={item.coverImage} style={styles.relatedImg} resizeMode="cover" />
                    <Text style={styles.relatedTitle} numberOfLines={1}>{item.title}</Text>
                  </Card>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...FONTS.bodyBold,
    color: COLORS.error,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingBottom: 110,
  },
  coverContainer: {
    height: 180,
    width: '100%',
    borderRadius: BORDERS.radiusLg,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    ...SHADOWS.medium,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  badgeRow: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.md,
  },
  periodBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 4,
  },
  periodBadgeText: {
    ...FONTS.labelCaps,
    fontSize: 9,
    color: COLORS.background,
    fontWeight: '700',
  },
  title: {
    ...FONTS.titleLarge,
    fontSize: 26,
    color: COLORS.secondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  subtitle: {
    ...FONTS.body,
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  plaqueCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  plaqueLabel: {
    ...FONTS.labelCaps,
    fontSize: 9,
    color: COLORS.primary,
    letterSpacing: 1.5,
    marginBottom: 4,
    textAlign: 'center',
  },
  plaqueVal: {
    ...FONTS.titleMedium,
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
  },
  descriptionCard: {
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderColor: COLORS.borderLight,
    marginBottom: SPACING.md,
    ...SHADOWS.soft,
  },
  sectionLabel: {
    ...FONTS.labelCaps,
    fontSize: 10,
    color: COLORS.primary,
    letterSpacing: 1.5,
    marginBottom: SPACING.sm,
  },
  descriptionText: {
    ...FONTS.body,
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 18,
  },
  groupHeader: {
    ...FONTS.labelCaps,
    fontSize: 11,
    color: COLORS.primary,
    letterSpacing: 1.8,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
    marginLeft: 4,
  },
  timelineContainer: {
    paddingLeft: SPACING.xs,
    marginBottom: SPACING.md,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  timelineLineColumn: {
    alignItems: 'center',
    width: 14,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
    marginTop: 12,
  },
  timelineLine: {
    width: 1.5,
    backgroundColor: COLORS.border,
    flex: 1,
    marginVertical: 4,
  },
  timelineContentCard: {
    flex: 1,
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderColor: COLORS.borderLight,
    ...SHADOWS.soft,
  },
  timelineYear: {
    ...FONTS.bodyBold,
    fontSize: 13,
    color: COLORS.primary,
  },
  timelineTitle: {
    ...FONTS.bodyBold,
    fontSize: 13,
    color: COLORS.text,
    marginTop: 2,
  },
  timelineDesc: {
    ...FONTS.body,
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 16,
    marginTop: 2,
  },
  recipesList: {
    gap: SPACING.sm,
  },
  recipeCard: {
    padding: SPACING.sm,
    backgroundColor: COLORS.white,
    borderColor: COLORS.borderLight,
    ...SHADOWS.soft,
  },
  recipeRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  recipeThumbBox: {
    width: 70,
    height: 70,
    borderRadius: BORDERS.radiusMd,
    overflow: 'hidden',
    backgroundColor: COLORS.secondaryBackground,
  },
  recipeThumb: {
    width: '100%',
    height: '100%',
  },
  recipeInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  recipeTitle: {
    ...FONTS.titleMedium,
    fontSize: 15,
    color: COLORS.text,
  },
  recipeSub: {
    ...FONTS.caption,
    fontSize: 11,
    color: COLORS.textMuted,
  },
  viewRecipeBtn: {
    marginTop: 2,
  },
  viewRecipeBtnText: {
    ...FONTS.caption,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  contributorsRow: {
    gap: SPACING.md,
    paddingVertical: SPACING.xs,
    marginBottom: SPACING.md,
  },
  contributorItem: {
    alignItems: 'center',
    width: 70,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.secondaryBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#d1a100', // Gold border ring
  },
  avatarSymbol: {
    fontSize: 20,
  },
  contributorName: {
    ...FONTS.caption,
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
    color: COLORS.text,
  },
  relatedScroll: {
    gap: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  relatedCard: {
    width: 140,
  },
  innerRelatedCard: {
    padding: 0,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
    borderColor: COLORS.borderLight,
    alignItems: 'center',
    ...SHADOWS.soft,
  },
  relatedImg: {
    width: '100%',
    height: 80,
  },
  relatedTitle: {
    ...FONTS.bodyBold,
    fontSize: 12,
    color: COLORS.text,
    padding: SPACING.sm,
    textAlign: 'center',
  },
});

export default CollectionDetailsScreen;
