import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  FlatList, 
  StatusBar,
  Alert 
} from 'react-native';
import { 
  Play, 
  Volume2, 
  Clock, 
  Compass, 
  ChevronRight, 
  BookOpen, 
  Calendar 
} from 'lucide-react-native';

import { COLORS, FONTS, SPACING, BORDERS, SHADOWS } from '../../../core/theme/theme';
import Header from '../../../shared/components/Header';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';
import { EXHIBITS } from '../../../core/data/exhibitsData';

export const ExhibitDetailsScreen = ({ route, navigation }) => {
  const { exhibitId } = route.params || {};

  const exhibit = EXHIBITS.find((e) => e.id === exhibitId);

  if (!exhibit) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <Header title="Exhibit Details" showBack={true} showAvatar={false} />
        <View style={styles.center}>
          <Text style={styles.errorText}>Historical exhibit file not found.</Text>
          <Button 
            title="Return to Home" 
            variant="primary" 
            onPress={() => navigation.navigate('MainApp', { screen: 'Home' })}
            style={styles.errorBtn}
          />
        </View>
      </SafeAreaView>
    );
  }

  const handleRecipePress = (recipeId) => {
    // Navigate to RecipeDetails (which is mapped to MyRecipeDetails stack in AppNavigator)
    navigation.navigate('MyRecipeDetails', { recipeId });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <Header title="Digital Exhibit" showBack={true} showAvatar={false} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Cover Hero Banner */}
        <View style={styles.heroContainer}>
          <Image source={exhibit.coverImage} style={styles.heroImage} resizeMode="cover" />
          <View style={styles.heroScrim} />
          
          <View style={styles.heroBadgeRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{exhibit.category.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* Text Header */}
        <View style={styles.titleSection}>
          <Text style={styles.exhibitTitle}>{exhibit.title}</Text>
          <Text style={styles.exhibitSubtitle}>{exhibit.subtitle}</Text>
          
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Clock size={14} color={COLORS.textMuted} />
              <Text style={styles.metaText}>{exhibit.readingTime}</Text>
            </View>
            <View style={styles.metaItem}>
              <Compass size={14} color={COLORS.textMuted} />
              <Text style={styles.metaText}>{exhibit.era}</Text>
            </View>
          </View>
        </View>

        {/* Introductory Narrative plaque */}
        <Card variant="heritage" style={styles.introCard}>
          <Text style={styles.introHeading}>PRESERVATION MANIFESTO</Text>
          <Text style={styles.introText}>{exhibit.introduction}</Text>
        </Card>

        {/* Audio Narration Playback Widget */}
        <Card variant="default" style={styles.narrationCard}>
          <View style={styles.narrationRow}>
            <View style={styles.narrationLeft}>
              <Volume2 size={22} color={COLORS.primary} />
              <View style={styles.narrationTextCol}>
                <Text style={styles.narrationTitle}>Listen to Exhibit Narration</Text>
                <Text style={styles.narrationDuration}>Duration: {exhibit.narrationDuration || 'Coming Soon'}</Text>
              </View>
            </View>
            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={() => Alert.alert('Coming Soon', 'Audio oral guide for this exhibit is currently being compiled in our museum recording studio.')}
              style={styles.playBtn}
            >
              <Play size={14} color={COLORS.background} fill={COLORS.background} />
            </TouchableOpacity>
          </View>
          <View style={styles.progressBarBg}>
            <View style={styles.progressBarProgress} />
          </View>
          <Text style={styles.narrationStatus}>Audio narration features: coming soon</Text>
        </Card>

        {/* Chronological Timeline */}
        <Text style={styles.sectionHeaderTitle}>Chronological Timeline</Text>
        <View style={styles.timelineContainer}>
          {exhibit.timeline.map((item, index) => (
            <View key={index} style={styles.timelineItem}>
              <View style={styles.timelineIconCol}>
                <View style={styles.timelineDot} />
                {index < exhibit.timeline.length - 1 && <View style={styles.timelineLine} />}
              </View>
              <Card variant="default" style={styles.timelineContentCard}>
                <View style={styles.timelineYearRow}>
                  <Calendar size={14} color={COLORS.primary} />
                  <Text style={styles.timelineYear}>{item.year}</Text>
                </View>
                <Text style={styles.timelineTitle}>{item.title}</Text>
                <Text style={styles.timelineDesc}>{item.description}</Text>
              </Card>
            </View>
          ))}
        </View>

        {/* Narrative Sections */}
        {exhibit.sections.map((section, idx) => (
          <View key={idx} style={styles.narrativeBlock}>
            <Text style={styles.sectionHeaderTitle}>{section.heading}</Text>
            {section.image && (
              <Card variant="default" style={styles.illustrationCard}>
                <Image source={section.image} style={styles.illustrationImage} resizeMode="cover" />
                <Text style={styles.illustrationCaption}>{section.caption}</Text>
              </Card>
            )}
            <Text style={styles.narrativeBodyText}>{section.content}</Text>
          </View>
        ))}

        {/* Horizontal Photo Gallery */}
        <Text style={styles.sectionHeaderTitle}>Exhibit Gallery Catalog</Text>
        <FlatList
          horizontal
          data={exhibit.gallery}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.galleryContainer}
          renderItem={({ item }) => (
            <Card variant="default" style={styles.galleryCard}>
              <Image source={item.image} style={styles.galleryImage} resizeMode="cover" />
              <Text style={styles.galleryCaption} numberOfLines={2}>{item.caption}</Text>
            </Card>
          )}
        />

        {/* Related Recipes */}
        {exhibit.relatedRecipes && exhibit.relatedRecipes.length > 0 && (
          <View style={styles.recipesSection}>
            <Text style={styles.sectionHeaderTitle}>Preserved Recipes Linked</Text>
            {exhibit.relatedRecipes.map((item) => (
              <Card key={item.id} variant="heritage" style={styles.recipeRowCard}>
                <View style={styles.recipeRow}>
                  <View style={styles.recipeInfo}>
                    <Text style={styles.recipeTitle}>{item.title}</Text>
                    <Text style={styles.recipeRegion}>{item.region} Culinary Tradition</Text>
                  </View>
                  <TouchableOpacity 
                    activeOpacity={0.7}
                    onPress={() => handleRecipePress(item.id)}
                    style={styles.exploreRecipeBtn}
                  >
                    <Text style={styles.exploreRecipeText}>Explore File</Text>
                    <ChevronRight size={14} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* References Section */}
        {exhibit.references && exhibit.references.length > 0 && (
          <View style={styles.referencesSection}>
            <Text style={styles.sectionHeaderTitle}>Archival References</Text>
            <Card variant="default" style={styles.referencesCard}>
              {exhibit.references.map((ref, idx) => (
                <View key={idx}>
                  <View style={styles.refItem}>
                    <BookOpen size={15} color={COLORS.secondary} />
                    <View style={styles.refTextCol}>
                      <Text style={styles.refTitle}>{ref.title}</Text>
                      <Text style={styles.refSource}>{ref.source} ({ref.year})</Text>
                    </View>
                  </View>
                  {idx < exhibit.references.length - 1 && <View style={styles.refDivider} />}
                </View>
              ))}
            </Card>
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
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  errorText: {
    ...FONTS.titleMedium,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  errorBtn: {
    marginTop: SPACING.md,
  },
  heroContainer: {
    height: 200,
    width: '100%',
    borderRadius: BORDERS.radiusLg,
    overflow: 'hidden',
    position: 'relative',
    ...SHADOWS.medium,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  heroBadgeRow: {
    position: 'absolute',
    bottom: SPACING.md,
    left: SPACING.md,
  },
  categoryBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BORDERS.radiusSm,
  },
  categoryBadgeText: {
    ...FONTS.labelCaps,
    fontSize: 9,
    color: COLORS.background,
  },
  titleSection: {
    marginVertical: SPACING.md,
  },
  exhibitTitle: {
    ...FONTS.titleLarge,
    fontSize: 25,
    color: COLORS.secondary,
  },
  exhibitSubtitle: {
    ...FONTS.body,
    fontSize: 14.5,
    color: COLORS.textMuted,
    marginTop: 4,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    ...FONTS.caption,
    fontSize: 11,
    color: COLORS.textMuted,
  },
  introCard: {
    padding: SPACING.md,
    borderColor: '#E7D8C5',
    marginVertical: SPACING.sm,
  },
  introHeading: {
    ...FONTS.labelCaps,
    fontSize: 10,
    color: COLORS.primary,
    marginBottom: 4,
  },
  introText: {
    ...FONTS.body,
    fontSize: 13.5,
    lineHeight: 20,
    color: COLORS.text,
  },
  narrationCard: {
    padding: SPACING.md,
    marginVertical: SPACING.sm,
  },
  narrationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  narrationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  narrationTextCol: {
    marginLeft: 12,
  },
  narrationTitle: {
    ...FONTS.bodyBold,
    fontSize: 13.5,
    color: COLORS.text,
  },
  narrationDuration: {
    ...FONTS.caption,
    fontSize: 11,
    marginTop: 2,
  },
  playBtn: {
    width: 32,
    height: 32,
    borderRadius: BORDERS.radiusRound,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBarBg: {
    height: 4,
    backgroundColor: COLORS.borderLight,
    borderRadius: 2,
    marginTop: SPACING.md,
  },
  progressBarProgress: {
    height: '100%',
    width: '0%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  narrationStatus: {
    ...FONTS.caption,
    fontSize: 9,
    textAlign: 'right',
    marginTop: 4,
    fontStyle: 'italic',
  },
  sectionHeaderTitle: {
    ...FONTS.titleMedium,
    fontSize: 17,
    color: COLORS.secondary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.xs,
  },
  timelineContainer: {
    marginVertical: SPACING.xs,
    paddingLeft: SPACING.sm,
  },
  timelineItem: {
    flexDirection: 'row',
  },
  timelineIconCol: {
    alignItems: 'center',
    marginRight: 12,
    width: 14,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: BORDERS.radiusRound,
    backgroundColor: COLORS.primary,
    marginTop: 20,
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: COLORS.primary + '40', // Muted line
  },
  timelineContentCard: {
    flex: 1,
    padding: SPACING.sm,
    marginVertical: 4,
  },
  timelineYearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
    marginTop: 4,
  },
  timelineDesc: {
    ...FONTS.body,
    fontSize: 12.5,
    lineHeight: 17,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  narrativeBlock: {
    marginVertical: SPACING.sm,
  },
  illustrationCard: {
    padding: 0,
    overflow: 'hidden',
    marginVertical: SPACING.sm,
  },
  illustrationImage: {
    height: 160,
    width: '100%',
  },
  illustrationCaption: {
    ...FONTS.caption,
    fontSize: 10.5,
    padding: SPACING.sm,
    textAlign: 'center',
  },
  narrativeBodyText: {
    ...FONTS.body,
    fontSize: 13.5,
    lineHeight: 20,
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
  galleryContainer: {
    gap: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  galleryCard: {
    width: 200,
    padding: 0,
    overflow: 'hidden',
    marginVertical: 0,
    marginRight: 10,
  },
  galleryImage: {
    height: 120,
    width: '100%',
  },
  galleryCaption: {
    ...FONTS.caption,
    fontSize: 11,
    padding: SPACING.sm,
    textAlign: 'center',
  },
  recipesSection: {
    marginVertical: SPACING.sm,
  },
  recipeRowCard: {
    padding: SPACING.sm,
    marginVertical: 4,
    borderColor: COLORS.borderLight,
  },
  recipeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recipeInfo: {
    flex: 1,
  },
  recipeTitle: {
    ...FONTS.bodyBold,
    fontSize: 14,
    color: COLORS.text,
  },
  recipeRegion: {
    ...FONTS.caption,
    fontSize: 11,
    marginTop: 2,
  },
  exploreRecipeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  exploreRecipeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  referencesSection: {
    marginVertical: SPACING.sm,
  },
  referencesCard: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    marginVertical: 0,
  },
  refItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  refTextCol: {
    flex: 1,
  },
  refTitle: {
    ...FONTS.bodyBold,
    fontSize: 12.5,
    color: COLORS.text,
  },
  refSource: {
    ...FONTS.caption,
    fontSize: 11,
    marginTop: 2,
  },
  refDivider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
  },
});

export default ExhibitDetailsScreen;
