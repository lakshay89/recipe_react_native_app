import React from 'react';
import { View, Text, StyleSheet, StatusBar, SafeAreaView, ScrollView } from 'react-native';
import { COLORS, FONTS, SPACING, SHADOWS } from '../../../core/theme/theme';
import { useAuth } from '../../../shared/services/AuthContext';
import Header from '../../../shared/components/Header';
import Card from '../../../shared/components/Card';

export const RecipeVersionHistory = ({ route, navigation }) => {
  const { recipeId } = route.params;
  const { myRecipes } = useAuth();
  
  const recipe = myRecipes.find((r) => r.id === recipeId);

  if (!recipe) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Version History" showBack={true} />
        <View style={styles.center}>
          <Text style={styles.errorText}>Recipe record not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Pre-populate default versions array if empty
  const versionsList = recipe.versions && recipe.versions.length > 0
    ? recipe.versions
    : [
        {
          version: 1,
          date: recipe.createdAt || new Date().toISOString(),
          status: recipe.status,
          changes: 'Original Submission',
        }
      ];

  // Render newest version on top
  const sortedVersions = [...versionsList].reverse();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <Header title="Archival History" showBack={true} showAvatar={false} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Intro Card */}
        <Card variant="heritage" style={styles.headerCard}>
          <Text style={styles.recipeTitle}>{recipe.title}</Text>
          <Text style={styles.helperText}>
            Every edit to this archival record is logged and cataloged. Review the version history timeline below.
          </Text>
        </Card>

        {/* Timeline container */}
        <View style={styles.timelineContainer}>
          {sortedVersions.map((item, index) => {
            const isLatest = index === 0;
            const formattedDate = new Date(item.date).toLocaleDateString() + ' ' + new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            return (
              <View key={index} style={styles.timelineItem}>
                {/* Timeline connector nodes */}
                <View style={styles.nodeColumn}>
                  <View style={[styles.nodeDot, isLatest ? styles.nodeDotActive : styles.nodeDotInactive]} />
                  {index < sortedVersions.length - 1 && <View style={styles.nodeLine} />}
                </View>

                {/* Timeline content blocks */}
                <Card variant={isLatest ? 'heritage' : 'default'} style={styles.timelineContentCard}>
                  <View style={styles.cardHeader}>
                    <Text style={[styles.versionLabel, isLatest && styles.versionLabelActive]}>
                      Version #{item.version} {isLatest ? '(Current)' : ''}
                    </Text>
                    <Text style={styles.dateText}>{formattedDate}</Text>
                  </View>

                  <Text style={styles.statusLabel}>
                    Status Checkpoint: <Text style={styles.statusVal}>{item.status}</Text>
                  </Text>

                  <Text style={styles.changeDescription}>
                    Edits Made: {item.changes}
                  </Text>
                </Card>
              </View>
            );
          })}
        </View>
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
  headerCard: {
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  recipeTitle: {
    ...FONTS.titleMedium,
    fontSize: 20,
    color: COLORS.secondary,
    textAlign: 'center',
    marginBottom: 4,
  },
  helperText: {
    ...FONTS.caption,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  timelineContainer: {
    paddingLeft: SPACING.xs,
    marginTop: SPACING.sm,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  nodeColumn: {
    alignItems: 'center',
    width: 20,
  },
  nodeDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    backgroundColor: COLORS.white,
    zIndex: 2,
  },
  nodeDotActive: {
    borderColor: COLORS.primary, // Terracotta active node
    backgroundColor: COLORS.primary,
  },
  nodeDotInactive: {
    borderColor: COLORS.border,
  },
  nodeLine: {
    width: 2,
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  versionLabel: {
    ...FONTS.bodyBold,
    fontSize: 13,
    color: COLORS.text,
  },
  versionLabelActive: {
    color: COLORS.primary,
  },
  dateText: {
    ...FONTS.caption,
    fontSize: 10,
    color: COLORS.textMuted,
  },
  statusLabel: {
    ...FONTS.caption,
    fontSize: 11,
    color: COLORS.text,
  },
  statusVal: {
    fontWeight: '700',
    color: COLORS.secondary,
  },
  changeDescription: {
    ...FONTS.body,
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 16,
    marginTop: 4,
  },
});

export default RecipeVersionHistory;
