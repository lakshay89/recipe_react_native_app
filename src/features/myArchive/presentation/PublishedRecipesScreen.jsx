import React from 'react';
import { View, Text, StyleSheet, StatusBar, SafeAreaView, FlatList, Image } from 'react-native';
import { COLORS, FONTS, SPACING, BORDERS, SHADOWS } from '../../../core/theme/theme';
import { useAuth } from '../../../shared/services/AuthContext';
import Header from '../../../shared/components/Header';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';

export const PublishedRecipesScreen = ({ navigation }) => {
  const { myRecipes } = useAuth();

  const publishedRecipes = myRecipes.filter(
    (r) => r.status === 'Approved' || r.status === 'Published'
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <Header title="Published Archive" showBack={true} showAvatar={false} />

      <FlatList
        data={publishedRecipes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <Card variant="default" style={styles.recipeCard}>
            <View style={styles.cardContentRow}>
              {/* Thumbnail */}
              <View style={styles.imgContainer}>
                {item.coverImage === 'thali.png' || item.hasHero ? (
                  <Image source={require('../../../assets/images/thali.png')} style={styles.thumbImg} resizeMode="cover" />
                ) : item.coverImage === 'sweets.png' ? (
                  <Image source={require('../../../assets/images/sweets.png')} style={styles.thumbImg} resizeMode="cover" />
                ) : (
                  <Image source={require('../../../assets/images/logo.png')} style={[styles.thumbImg, { opacity: 0.3 }]} resizeMode="contain" />
                )}
              </View>

              {/* Info Column */}
              <View style={styles.infoCol}>
                <Text style={styles.recipeTitle}>{item.title}</Text>
                <Text style={styles.locationText}>📍 {item.region || 'Unknown Region'}</Text>
                <Text style={styles.lineageText}>Lineage: {item.heritageSource || 'Oral Tradition'}</Text>
                
                <View style={styles.actionRow}>
                  <Button
                    title="View Details"
                    variant="outline"
                    onPress={() => navigation.navigate('MyRecipeDetails', { recipeId: item.id })}
                    style={styles.actionBtn}
                    textStyle={styles.actionText}
                  />
                  <Button
                    title="Edit Record"
                    variant="outline"
                    onPress={() => navigation.navigate('EditRecipe', { recipeId: item.id })}
                    style={styles.actionBtn}
                    textStyle={styles.actionText}
                  />
                </View>
              </View>
            </View>
          </Card>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Image
              source={require('../../../assets/images/logo.png')}
              style={styles.emptyLogo}
              resizeMode="contain"
            />
            <Text style={styles.emptyText}>No published recipes yet</Text>
            <Text style={styles.emptySub}>
              Start preserving India's culinary heritage by submitting family recipes for expert verification.
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
    paddingBottom: 110,
  },
  recipeCard: {
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderColor: COLORS.borderLight,
    marginBottom: SPACING.md,
    ...SHADOWS.soft,
  },
  cardContentRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  imgContainer: {
    width: 80,
    height: 80,
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
    justifyContent: 'space-between',
  },
  recipeTitle: {
    ...FONTS.titleMedium,
    fontSize: 16,
    color: COLORS.text,
  },
  locationText: {
    ...FONTS.caption,
    fontSize: 11,
    color: COLORS.text,
  },
  lineageText: {
    ...FONTS.caption,
    fontSize: 11,
    color: COLORS.textMuted,
  },
  actionRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  actionBtn: {
    flex: 1,
    height: 30,
  },
  actionText: {
    fontSize: 11,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    marginTop: SPACING.xl,
  },
  emptyLogo: {
    width: 80,
    height: 80,
    opacity: 0.1,
    marginBottom: SPACING.md,
  },
  emptyText: {
    ...FONTS.titleMedium,
    color: COLORS.secondary,
  },
  emptySub: {
    ...FONTS.body,
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
    marginVertical: SPACING.sm,
  },
  emptyBtn: {
    width: 200,
    marginTop: SPACING.md,
  },
});

export default PublishedRecipesScreen;
