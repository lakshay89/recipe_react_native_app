import React from 'react';
import { View, Text, StyleSheet, StatusBar, SafeAreaView, ScrollView, Image } from 'react-native';
import { COLORS, FONTS, SPACING, BORDERS, SHADOWS } from '../../../core/theme/theme';
import Header from '../../../shared/components/Header';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';

export const TutorialScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <Header title="Archival Guidelines" showBack={true} showAvatar={false} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Editorial Header Banner */}
        <View style={styles.heroContainer}>
          <Image
            source={require('../../../assets/images/silbata.png')}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.scrim} />
          <Text style={styles.heroText}>Curation Manifesto</Text>
        </View>

        {/* Introduction */}
        <Card variant="heritage" style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Documenting Living History</Text>
          <Text style={styles.bodyText}>
            Edible India is a living digital museum. When you catalog a recipe, you are preserving a community's heritage. To maintain historical authenticity, we require verifiable records of oral history, geography, and native ingredients.
          </Text>
        </Card>

        {/* Step-by-Step Curation Guide */}
        <Text style={styles.groupHeader}>The Curation Steps</Text>
        
        <Card variant="default" style={styles.sectionCard}>
          <Text style={styles.stepNum}>01</Text>
          <Text style={styles.stepTitle}>Record Identity & Alternate Dialects</Text>
          <Text style={styles.stepDesc}>
            Specify the standard English name alongside regional naming keys, local script spelling, and alternative dialect titles. Record native pronunciations where possible.
          </Text>
        </Card>

        <Card variant="default" style={styles.sectionCard}>
          <Text style={styles.stepNum}>02</Text>
          <Text style={styles.stepTitle}>Verify Coordinates & State Origin</Text>
          <Text style={styles.stepDesc}>
            Provide exact administrative detail: State, District, Tehsil, and Village origin. Tag the coordinate pin so the dish can be mapped correctly on the Heritage Atlas.
          </Text>
        </Card>

        <Card variant="default" style={styles.sectionCard}>
          <Text style={styles.stepNum}>03</Text>
          <Text style={styles.stepTitle}>Oral Lineage & Narrative Lore</Text>
          <Text style={styles.stepDesc}>
            How did you receive this recipe? Map the transmission sequence (e.g., Grandmother → Mother → Me) and document the story, lore, or memories behind the tradition.
          </Text>
        </Card>

        <Card variant="default" style={styles.sectionCard}>
          <Text style={styles.stepNum}>04</Text>
          <Text style={styles.stepTitle}>Ingredients & Traditional Cookware</Text>
          <Text style={styles.stepDesc}>
            Detail local native names for wild greens, grains, and spices. Identify specialized traditional cookware vessels (such as clay Degs or copper Handis) and oil mediums.
          </Text>
        </Card>

        {/* Badges system */}
        <Text style={styles.groupHeader}>Contributor Badge Ranks</Text>
        <Card variant="default" style={styles.sectionCard}>
          <View style={styles.badgeRow}>
            <View style={styles.badgeIconBox}><Text style={styles.badgeIcon}>🌱</Text></View>
            <View style={styles.badgeInfo}>
              <Text style={styles.badgeTitle}>Heritage Initiate</Text>
              <Text style={styles.badgeDesc}>Unlocked upon your first verified recipe submission.</Text>
            </View>
          </View>
          
          <View style={styles.separator} />

          <View style={styles.badgeRow}>
            <View style={styles.badgeIconBox}><Text style={styles.badgeIcon}>🏺</Text></View>
            <View style={styles.badgeInfo}>
              <Text style={styles.badgeTitle}>Regional Archivist</Text>
              <Text style={styles.badgeDesc}>Granted once 5 recipes from a single state are verified.</Text>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.badgeRow}>
            <View style={styles.badgeIconBox}><Text style={styles.badgeIcon}>👑</Text></View>
            <View style={styles.badgeInfo}>
              <Text style={styles.badgeTitle}>Grand Guardian</Text>
              <Text style={styles.badgeDesc}>Reserved for curators preserving rare/extinct recipes.</Text>
            </View>
          </View>
        </Card>

        {/* Verification Timeline */}
        <Text style={styles.groupHeader}>The Verification Timeline</Text>
        <Card variant="heritage" style={styles.sectionCard}>
          <Text style={styles.bodyText}>
            • **Draft**: Saved locally on your device. Accessible only to you.{"\n"}
            • **Pending Review**: Awaiting verification by administrative historians.{"\n"}
            • **Needs Changes**: Notes left by curators requesting adjustments.{"\n"}
            • **Approved**: Verification successful. Published onto the global index.
          </Text>
        </Card>

        <Button
          title="Return to Dashboard"
          variant="primary"
          onPress={() => navigation.goBack()}
          style={styles.closeBtn}
        />
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
    paddingBottom: 110,
  },
  heroContainer: {
    height: 150,
    borderRadius: BORDERS.radiusLg,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(47, 43, 40, 0.45)',
  },
  heroText: {
    position: 'absolute',
    ...FONTS.titleLarge,
    fontSize: 24,
    color: COLORS.background,
    letterSpacing: 1.5,
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
  sectionCard: {
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderColor: COLORS.borderLight,
    marginBottom: SPACING.md,
    ...SHADOWS.soft,
  },
  sectionTitle: {
    ...FONTS.titleMedium,
    color: COLORS.secondary,
    fontSize: 18,
    marginBottom: 6,
  },
  bodyText: {
    ...FONTS.body,
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 19,
  },
  stepNum: {
    ...FONTS.labelCaps,
    fontSize: 24,
    color: COLORS.primary,
    opacity: 0.8,
    marginBottom: 2,
  },
  stepTitle: {
    ...FONTS.bodyBold,
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 4,
  },
  stepDesc: {
    ...FONTS.body,
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 17,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  badgeIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.secondaryBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  badgeIcon: {
    fontSize: 22,
  },
  badgeInfo: {
    flex: 1,
  },
  badgeTitle: {
    ...FONTS.bodyBold,
    fontSize: 14,
    color: COLORS.text,
  },
  badgeDesc: {
    ...FONTS.caption,
    fontSize: 11,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.sm,
  },
  closeBtn: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
});

export default TutorialScreen;
