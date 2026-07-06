import React from 'react';
import { View, Text, StyleSheet, StatusBar, SafeAreaView, ScrollView, Image } from 'react-native';
import { COLORS, FONTS, SPACING, BORDERS, SHADOWS } from '../../../core/theme/theme';
import { useAuth } from '../../../shared/services/AuthContext';
import Header from '../../../shared/components/Header';
import Button from '../../../shared/components/Button';
import Card from '../../../shared/components/Card';

import { ALL_COLLECTIONS } from '../../collections/services/collectionsData';

export const MyRecipeDetails = ({ route, navigation }) => {
  const { recipeId } = route.params;
  const { myRecipes } = useAuth();
  
  let recipe = myRecipes.find((r) => r.id === recipeId);
  const isContributorRecipe = !!recipe;

  if (!recipe) {
    for (const col of ALL_COLLECTIONS) {
      const found = col.recipes.find((r) => r.id === recipeId);
      if (found) {
        recipe = found;
        break;
      }
    }
  }

  if (!recipe) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Archival Detail" showBack={true} />
        <View style={styles.center}>
          <Text style={styles.errorText}>Recipe record not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Approved':
      case 'Published':
        return styles.badgePublished;
      case 'Pending Review':
      case 'Update Under Review':
        return styles.badgePending;
      case 'Rejected':
        return styles.badgeRejected;
      case 'Needs Changes':
        return styles.badgeNeedsChanges;
      default:
        return styles.badgeDraft;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <Header title="Archival Detail" showBack={true} showAvatar={false} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Cover Visual Header */}
        <View style={styles.coverContainer}>
          {recipe.coverImage === 'thali.png' || recipe.hasHero ? (
            <Image source={require('../../../assets/images/thali.png')} style={styles.coverImage} resizeMode="cover" />
          ) : recipe.coverImage === 'sweets.png' ? (
            <Image source={require('../../../assets/images/sweets.png')} style={styles.coverImage} resizeMode="cover" />
          ) : (
            <Image source={require('../../../assets/images/logo.png')} style={[styles.coverImage, { opacity: 0.3 }]} resizeMode="contain" />
          )}
          <View style={styles.scrim} />
          
          <View style={[styles.badgeOverlay, getStatusBadgeStyle(recipe.status)]}>
            <Text style={styles.badgeText}>{recipe.status.toUpperCase()}</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.recipeTitle}>{recipe.title}</Text>
        {recipe.localName ? (
          <Text style={styles.localName}>({recipe.localName}) {recipe.nativeScript ? `- ${recipe.nativeScript}` : ''}</Text>
        ) : null}

        {/* Geographics Plaque */}
        <Card variant="heritage" style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>GEOGRAPHY & COORDINATES</Text>
          <Text style={styles.locationTitle}>
            {recipe.region || 'Unknown Region'}
          </Text>
          <Text style={styles.locationSubtitle}>
            District: {recipe.district || 'N/A'} • Tehsil: {recipe.tehsil || 'N/A'} • Village: {recipe.village || 'N/A'}
          </Text>
          {recipe.gpsCoords ? (
            <Text style={styles.gpsCoords}>GPS: {recipe.gpsCoords}</Text>
          ) : null}
        </Card>

        {/* Story / Lineage */}
        <Card variant="default" style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>HERITAGE & SOURCE LORE</Text>
          <Text style={styles.lineageHeader}>Transmission: {recipe.heritageSource || 'Oral history'}</Text>
          {recipe.whoTaughtYou ? (
            <Text style={styles.lineageInstructor}>Passed down by: {recipe.whoTaughtYou}</Text>
          ) : null}
          {recipe.numGenerations ? (
            <Text style={styles.lineageGenerations}>Generations Preserved: {recipe.numGenerations}</Text>
          ) : null}
          <Text style={styles.narrativeBody}>{recipe.history || 'No oral history documentation.'}</Text>
        </Card>

        {/* Ingredients */}
        <Card variant="default" style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>INGREDIENTS (Serves - {recipe.serves || '4'})</Text>
          <Text style={styles.ingredientsBody}>
            {recipe.ingredients || 'No ingredients configured.'}
          </Text>
        </Card>

        {/* Timings & Instructions */}
        <Card variant="default" style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>PREPARATION METHOD</Text>
          <View style={styles.timingsRow}>
            <Text style={styles.timingItem}>Prep: <Text style={styles.boldTime}>{recipe.prepTime || '0'}m</Text></Text>
            <Text style={styles.timingItem}>Cook: <Text style={styles.boldTime}>{recipe.cookTime || '0'}m</Text></Text>
            <Text style={styles.timingItem}>Total: <Text style={styles.boldTime}>{recipe.totalTime || '0'}m</Text></Text>
          </View>
          <View style={styles.separator} />
          <Text style={styles.instructionsBody}>
            {recipe.instructions || 'No preparation steps listed.'}
          </Text>
          {recipe.traditionalTips ? (
            <View style={styles.tipsBox}>
              <Text style={styles.tipsTitle}>💡 Traditional Tip:</Text>
              <Text style={styles.tipsText}>{recipe.traditionalTips}</Text>
            </View>
          ) : null}
        </Card>

        {/* Cultural Metadata */}
        <Card variant="default" style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>CULTURAL CLASSIFICATION</Text>
          <View style={styles.metaGrid}>
            <View style={styles.metaItem}><Text style={styles.metaLabel}>Festival:</Text><Text style={styles.metaVal}>{recipe.festival || 'None'}</Text></View>
            <View style={styles.metaItem}><Text style={styles.metaLabel}>Season:</Text><Text style={styles.metaVal}>{recipe.season || 'All Year'}</Text></View>
            <View style={styles.metaItem}><Text style={styles.metaLabel}>Diet Type:</Text><Text style={styles.metaVal}>{recipe.dietType || 'N/A'}</Text></View>
            <View style={styles.metaItem}><Text style={styles.metaLabel}>Rarity:</Text><Text style={styles.metaVal}>{recipe.rarityStatus || 'Common'}</Text></View>
            <View style={styles.metaItem}><Text style={styles.metaLabel}>Vessel:</Text><Text style={styles.metaVal}>{recipe.cookingVessel || 'General Cookware'}</Text></View>
            <View style={styles.metaItem}><Text style={styles.metaLabel}>Medium:</Text><Text style={styles.metaVal}>{recipe.cookingMedium || 'N/A'}</Text></View>
          </View>
        </Card>

        {/* Admin Review Log */}
        {recipe.reviewHistory && recipe.reviewHistory.length > 0 ? (
          <Card variant="default" style={styles.sectionCard}>
            <Text style={styles.sectionLabel}>ADMINISTRATIVE VERIFICATION LOG</Text>
            {recipe.reviewHistory.map((log, index) => (
              <View key={index} style={styles.logRow}>
                <View style={styles.logBullet} />
                <View style={styles.logContent}>
                  <Text style={styles.logMeta}>
                    Date: {new Date(log.date).toLocaleDateString()} | Status: {log.status}
                  </Text>
                  <Text style={styles.logNotes}>Notes: {log.notes}</Text>
                </View>
              </View>
            ))}
          </Card>
        ) : null}

        {/* Bottom Actions */}
        {isContributorRecipe && (
          <View style={styles.buttonRow}>
            <Button
              title="View History Timeline"
              variant="outline"
              onPress={() => navigation.navigate('RecipeVersionHistory', { recipeId: recipe.id })}
              style={styles.actionBtn}
            />
            <Button
              title="Edit Recipe Card"
              variant="primary"
              onPress={() => navigation.navigate('EditRecipe', { recipeId: recipe.id })}
              style={styles.actionBtn}
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
  badgeOverlay: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    ...FONTS.labelCaps,
    fontSize: 9,
    color: COLORS.background,
    fontWeight: '700',
  },
  badgePublished: {
    backgroundColor: COLORS.secondary,
  },
  badgePending: {
    backgroundColor: COLORS.primary,
  },
  badgeRejected: {
    backgroundColor: COLORS.error,
  },
  badgeNeedsChanges: {
    backgroundColor: '#d1a100',
  },
  badgeDraft: {
    backgroundColor: COLORS.textMuted,
  },
  recipeTitle: {
    ...FONTS.titleLarge,
    fontSize: 26,
    color: COLORS.secondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  localName: {
    ...FONTS.body,
    fontSize: 13,
    fontStyle: 'italic',
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  sectionCard: {
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
  locationTitle: {
    ...FONTS.titleMedium,
    fontSize: 17,
    color: COLORS.text,
  },
  locationSubtitle: {
    ...FONTS.body,
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  gpsCoords: {
    ...FONTS.caption,
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 4,
  },
  lineageHeader: {
    ...FONTS.bodyBold,
    fontSize: 14,
    color: COLORS.text,
  },
  lineageInstructor: {
    ...FONTS.bodyMedium,
    fontSize: 13,
    color: COLORS.secondary,
    marginTop: 2,
  },
  lineageGenerations: {
    ...FONTS.caption,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  narrativeBody: {
    ...FONTS.body,
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 19,
    marginTop: SPACING.sm,
  },
  ingredientsBody: {
    ...FONTS.body,
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 22,
  },
  timingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  timingItem: {
    ...FONTS.body,
    fontSize: 13,
    color: COLORS.textMuted,
  },
  boldTime: {
    fontWeight: '700',
    color: COLORS.text,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.sm,
  },
  instructionsBody: {
    ...FONTS.body,
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 22,
  },
  tipsBox: {
    backgroundColor: COLORS.secondaryBackground,
    padding: SPACING.sm,
    borderRadius: BORDERS.radiusMd,
    marginTop: SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  tipsTitle: {
    ...FONTS.bodyBold,
    fontSize: 13,
    color: COLORS.primary,
  },
  tipsText: {
    ...FONTS.body,
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  metaItem: {
    width: '47%',
    padding: SPACING.xs,
    backgroundColor: COLORS.secondaryBackground,
    borderRadius: 4,
  },
  metaLabel: {
    ...FONTS.caption,
    fontSize: 9,
    color: COLORS.textMuted,
  },
  metaVal: {
    ...FONTS.bodyBold,
    fontSize: 12,
    color: COLORS.text,
  },
  logRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  logBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginTop: 6,
  },
  logContent: {
    flex: 1,
  },
  logMeta: {
    ...FONTS.caption,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.text,
  },
  logNotes: {
    ...FONTS.caption,
    fontSize: 11,
    color: COLORS.textMuted,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xl,
    gap: SPACING.md,
  },
  actionBtn: {
    flex: 1,
  },
});

export default MyRecipeDetails;
