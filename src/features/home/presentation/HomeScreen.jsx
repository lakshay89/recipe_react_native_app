import React from 'react';
import { View, Text, StyleSheet, StatusBar, SafeAreaView, ScrollView, Image, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SPACING, BORDERS, SHADOWS } from '../../../core/theme/theme';
import Header from '../../../shared/components/Header';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';
import { useAuth } from '../../../shared/services/AuthContext';

const SEASONAL_COLLECTIONS = [
  {
    id: 's1',
    title: 'Monsoon Kadhai Dal',
    desc: 'Traditional clay-pot lentil curry.',
    image: require('../../../assets/images/dal.png'),
  },
  {
    id: 's2',
    title: 'Saffron Kheer',
    desc: 'Slow-simmered rice pudding with pure kesar.',
    image: require('../../../assets/images/kesar.png'),
  },
  {
    id: 's3',
    title: 'Winter Tandoor Bread',
    desc: 'Charcoal-fired whole wheat flatbread.',
    image: require('../../../assets/images/tandoorroti.png'),
  },
];

export const HomeScreen = ({ navigation }) => {
  const { user, myRecipes } = useAuth();

  const handleAddFirstRecipe = () => {
    navigation.navigate('AddRecipe');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <Header title="Edible India" showBack={false} showAvatar={true} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.greeting}>
            Namaste, {user?.name || 'Explorer'}
          </Text>
          <Text style={styles.subGreeting}>
            Preserving and celebrating India's living culinary archives.
          </Text>
        </View>

        {/* Hero Banner image matching Google Arts & Culture style */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate('ExhibitDetails', { exhibitId: 'grand-feasts' })}
          style={styles.heroContainer}
        >
          <Image
            source={require('../../../assets/images/thali.png')}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroScrim} />
          <View style={styles.heroTextContainer}>
            <Text style={styles.heroTag}>DIGITAL EXHIBIT</Text>
            <Text style={styles.heroTitle}>Grand Feasts of Ancient India</Text>
          </View>
        </TouchableOpacity>

        {/* Add Your First Recipe CTA */}
        {myRecipes.length === 0 ? (
          <Card variant="dark" style={styles.ctaCard}>
            <Text style={styles.ctaTagline}>C O N T R I B U T E</Text>
            <Text style={styles.ctaTitle}>Add Your First Recipe</Text>
            <Text style={styles.ctaDescription}>
              Document a regional family recipe, state-specific ingredient, or a traditional technique to preserve our heritage.
            </Text>
            <Button
              title="Begin Documenting"
              variant="primary"
              onPress={handleAddFirstRecipe}
              style={styles.ctaButton}
            />
          </Card>
        ) : (
          <Card variant="heritage" style={styles.statusCard}>
            <Text style={styles.statusLabel}>Y O U R   A R C H I V E S</Text>
            <Text style={styles.statusTitle}>You have documented {myRecipes.length} recipe(s)</Text>
            <Text style={styles.statusDescription}>
              View details or edit your submissions under the My Archive tab.
            </Text>
            <Button
              title="View My Archive"
              variant="outline"
              onPress={() => navigation.navigate('MyArchive')}
              style={styles.statusButton}
            />
          </Card>
        )}

        {/* Featured Heritage Card with local Forgotten Heritage image */}
        <Card variant="heritage" style={styles.featuredCard} onPress={() => navigation.navigate('ExhibitDetails', { exhibitId: 'spice-routes' })}>
          <Image
            source={require('../../../assets/images/chaicup.png')}
            style={styles.featuredImage}
            resizeMode="cover"
          />
          <View style={styles.featuredBody}>
            <View style={styles.featuredBadge}>
              <Text style={styles.featuredBadgeText}>FORGOTTEN HERITAGE</Text>
            </View>
            <Text style={styles.featuredTitle}>The Story of Galmya Spice</Text>
            <Text style={styles.featuredDesc}>
              Discover the almost forgotten culinary traditions of the Konkan coast and how local communities are reviving indigenous coastal spices.
            </Text>
          </View>
        </Card>

        {/* Seasonal Collections Section */}
        <View style={styles.seasonalHeaderRow}>
          <Text style={styles.seasonalLabel}>SEASONAL COLLECTIONS</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('CollectionsDashboard')}
            style={styles.browseAllBtn}
          >
            <Text style={styles.browseAllText}>Browse All →</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.seasonalScroll}
        >
          {SEASONAL_COLLECTIONS.map((item) => {
            const getExhibitId = (id) => {
              if (id === 's1') return 'grand-feasts';
              if (id === 's2') return 'royal-kitchens';
              return 'spice-routes';
            };
            return (
              <Card 
                key={item.id} 
                variant="default" 
                style={styles.seasonalCard}
                onPress={() => navigation.navigate('ExhibitDetails', { exhibitId: getExhibitId(item.id) })}
              >
                <Image source={item.image} style={styles.seasonalImage} resizeMode="cover" />
                <Text style={styles.seasonalCardTitle}>{item.title}</Text>
                <Text style={styles.seasonalCardDesc} numberOfLines={2}>{item.desc}</Text>
              </Card>
            );
          })}
        </ScrollView>

      </ScrollView>
    </SafeAreaView>
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
    paddingBottom: 110, // Safe space for floating tab bar
  },
  welcomeSection: {
    marginVertical: SPACING.md,
  },
  greeting: {
    ...FONTS.titleLarge,
    fontSize: 28,
    color: COLORS.secondary,
  },
  subGreeting: {
    ...FONTS.body,
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  heroContainer: {
    height: 180,
    width: '100%',
    borderRadius: BORDERS.radiusLg,
    overflow: 'hidden',
    marginVertical: SPACING.md,
    ...SHADOWS.medium,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  heroTextContainer: {
    position: 'absolute',
    bottom: SPACING.md,
    left: SPACING.md,
  },
  heroTag: {
    ...FONTS.labelCaps,
    color: COLORS.accent,
    fontSize: 10,
    letterSpacing: 1.5,
  },
  heroTitle: {
    ...FONTS.title,
    fontSize: 20,
    color: COLORS.white,
    marginTop: 4,
  },
  ctaCard: {
    marginVertical: SPACING.lg,
    alignItems: 'center',
    padding: SPACING.lg,
  },
  ctaTagline: {
    ...FONTS.labelCaps,
    color: COLORS.accent,
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: SPACING.xs,
  },
  ctaTitle: {
    ...FONTS.title,
    fontSize: 24,
    color: COLORS.background,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  ctaDescription: {
    ...FONTS.body,
    fontSize: 14,
    color: COLORS.borderLight,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  ctaButton: {
    width: '100%',
  },
  statusCard: {
    marginVertical: SPACING.lg,
    padding: SPACING.lg,
  },
  statusLabel: {
    ...FONTS.labelCaps,
    fontSize: 10,
    color: COLORS.primary,
    letterSpacing: 2,
    marginBottom: SPACING.xs,
  },
  statusTitle: {
    ...FONTS.titleMedium,
    fontSize: 20,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  statusDescription: {
    ...FONTS.body,
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  statusButton: {
    width: '100%',
  },
  featuredCard: {
    padding: 0, // Borderless card padding so image aligns
    overflow: 'hidden',
    marginVertical: SPACING.lg,
  },
  featuredImage: {
    width: '100%',
    height: 150,
  },
  featuredBody: {
    padding: SPACING.md,
  },
  featuredBadge: {
    backgroundColor: COLORS.secondaryBackground,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: SPACING.sm,
    borderWidth: 0.5,
    borderColor: COLORS.primary,
  },
  featuredBadgeText: {
    ...FONTS.labelCaps,
    fontSize: 9,
    color: COLORS.primary,
    letterSpacing: 1,
  },
  featuredTitle: {
    ...FONTS.titleMedium,
    fontSize: 22,
    color: COLORS.secondary,
    marginBottom: SPACING.xs,
  },
  featuredDesc: {
    ...FONTS.body,
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 20,
  },
  seasonalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  browseAllBtn: {
    paddingVertical: 4,
    // backgroundColor:'#d1a100',
  },
  browseAllText: {
    ...FONTS.caption,
    fontWeight: '700',
    color: COLORS.primary,
  },
  seasonalLabel: {
    ...FONTS.labelCaps,
    fontSize: 12,
    color: COLORS.primary,
    letterSpacing: 2,
  },
  seasonalScroll: {
    paddingBottom: SPACING.md,
  },
  seasonalCard: {
    width: 200,
    padding: 0,
    overflow: 'hidden',
    marginRight: SPACING.md,
  },
  seasonalImage: {
    width: '100%',
    height: 110,
  },
  seasonalCardTitle: {
    ...FONTS.titleMedium,
    fontSize: 15,
    color: COLORS.text,
    paddingHorizontal: SPACING.sm,
    paddingTop: SPACING.sm,
  },
  seasonalCardDesc: {
    ...FONTS.caption,
    fontSize: 12,
    paddingHorizontal: SPACING.sm,
    paddingBottom: SPACING.sm,
  },
});

export default HomeScreen;
