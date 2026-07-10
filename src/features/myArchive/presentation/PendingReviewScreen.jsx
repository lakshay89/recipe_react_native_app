import React from 'react';
import { View, Text, StyleSheet, StatusBar, SafeAreaView, FlatList, Image } from 'react-native';
import { COLORS, FONTS, SPACING, SHADOWS } from '../../../core/theme/theme';
import { useAuth } from '../../../shared/services/AuthContext';
import Header from '../../../shared/components/Header';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';

import { MapPin } from 'lucide-react-native';

export const PendingReviewScreen = ({ navigation }) => {
  const { myRecipes } = useAuth();

  const pendingRecipes = myRecipes.filter((r) => {
    const s = (r.status || '').toLowerCase();
    return s === 'pending_review' || s === 'pending review' || s === 'update_under_review' || s === 'update under review';
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <Header title="Pending Review" showBack={true} showAvatar={false} />

      <FlatList
        data={pendingRecipes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Card variant="heritage" style={styles.infoCard}>
            <Text style={styles.infoTitle}>Expert Verification In Progress</Text>
            <Text style={styles.infoDesc}>
              Heritage experts are reviewing your submissions. They will verify coordinates, ingredient classifications, and oral traditions.
            </Text>
          </Card>
        }
        renderItem={({ item }) => (
          <Card variant="default" style={styles.recipeCard}>
            <View style={styles.cardContent}>
              <Text style={styles.recipeTitle}>{item.title}</Text>
              <View style={styles.metaRow}>
                <View style={styles.regionRow}>
                  <MapPin size={13} color={COLORS.primary} style={styles.pinIcon} />
                  <Text style={styles.locationText}>{item.region || 'N/A'}</Text>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.status.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={styles.dateText}>
                Submitted: {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
              </Text>
              
              <View style={styles.actions}>
                <Button
                  title="View Detail"
                  variant="outline"
                  onPress={() => navigation.navigate('MyRecipeDetails', { recipeId: item.id })}
                  style={styles.actionBtn}
                  textStyle={styles.actionBtnText}
                />
                <Button
                  title="Edit Info"
                  variant="outline"
                  onPress={() => navigation.navigate('EditRecipe', { recipeId: item.id })}
                  style={styles.actionBtn}
                  textStyle={styles.actionBtnText}
                />
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
            <Text style={styles.emptyText}>No pending reviews</Text>
            <Text style={styles.emptySub}>All your cataloged recipe cards are either approved or in draft states.</Text>
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
  infoCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  infoTitle: {
    ...FONTS.titleMedium,
    fontSize: 16,
    color: COLORS.primary,
    marginBottom: 4,
  },
  infoDesc: {
    ...FONTS.caption,
    fontSize: 12,
    lineHeight: 16,
  },
  recipeCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.white,
    borderColor: COLORS.borderLight,
    ...SHADOWS.soft,
  },
  cardContent: {
    gap: 4,
  },
  recipeTitle: {
    ...FONTS.titleMedium,
    fontSize: 17,
    color: COLORS.text,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 2,
  },
  regionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pinIcon: {
    marginRight: 4,
  },
  locationText: {
    ...FONTS.caption,
    color: COLORS.text,
  },
  badge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    ...FONTS.labelCaps,
    color: COLORS.background,
    fontSize: 8,
  },
  dateText: {
    ...FONTS.caption,
    fontSize: 10,
    color: COLORS.textMuted,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.sm,
  },
  actionBtn: {
    flex: 1,
    height: 34,
  },
  actionBtnText: {
    fontSize: 12,
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

export default PendingReviewScreen;
