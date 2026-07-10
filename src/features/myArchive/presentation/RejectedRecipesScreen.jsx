import React from 'react';
import { View, Text, StyleSheet, StatusBar, SafeAreaView, FlatList, Image } from 'react-native';
import { MapPin, AlertTriangle } from 'lucide-react-native';
import { COLORS, FONTS, SPACING, BORDERS, SHADOWS } from '../../../core/theme/theme';
import { useAuth } from '../../../shared/services/AuthContext';
import Header from '../../../shared/components/Header';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';

export const RejectedRecipesScreen = ({ navigation }) => {
  const { myRecipes } = useAuth();

  const rejectedRecipes = myRecipes.filter((r) => (r.status || '').toLowerCase() === 'rejected');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <Header title="Rejected Submissions" showBack={true} showAvatar={false} />

      <FlatList
        data={rejectedRecipes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          // Find rejection reason from logs or fallback
          const lastLog = item.reviewHistory && item.reviewHistory.length > 0
            ? item.reviewHistory[item.reviewHistory.length - 1]
            : null;
          const rejectionNotes = item.rejectionReason || lastLog?.notes || 'Incomplete lineage history or duplicate entry detected.';

          return (
            <Card variant="default" style={styles.recipeCard}>
              <Text style={styles.recipeTitle}>{item.title}</Text>
              
              <View style={styles.locationRow}>
                <MapPin size={13} color={COLORS.primary} style={styles.pinIcon} />
                <Text style={styles.locationText}>{item.region || 'N/A'}, {item.district || 'N/A'}</Text>
              </View>
              
              {/* Rejection Alert Box */}
              <View style={styles.rejectionBox}>
                <View style={styles.rejectionHeader}>
                  <AlertTriangle size={14} color="#C5221F" style={styles.warnIcon} />
                  <Text style={styles.rejectionTitle}>Rejection Reason:</Text>
                </View>
                <Text style={styles.rejectionNotes}>{rejectionNotes}</Text>
              </View>

              <View style={styles.actionRow}>
                <Button
                  title="View Detail"
                  variant="outline"
                  onPress={() => navigation.navigate('MyRecipeDetails', { recipeId: item.id })}
                  style={styles.actionBtn}
                  textStyle={styles.actionBtnText}
                />
                <Button
                  title="Edit & Resubmit"
                  variant="primary"
                  onPress={() => navigation.navigate('EditRecipe', { recipeId: item.id })}
                  style={styles.actionBtn}
                  textStyle={styles.actionBtnText}
                />
              </View>
            </Card>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Image
              source={require('../../../assets/images/logo.png')}
              style={styles.emptyLogo}
              resizeMode="contain"
            />
            <Text style={styles.emptyText}>No rejected recipes</Text>
            <Text style={styles.emptySub}>Great work! None of your heritage submissions have been rejected by the catalog curators.</Text>
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
  recipeTitle: {
    ...FONTS.titleMedium,
    fontSize: 18,
    color: COLORS.text,
  },
  locationText: {
    ...FONTS.caption,
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  rejectionBox: {
    backgroundColor: 'rgba(186, 26, 26, 0.05)',
    borderColor: COLORS.error,
    borderWidth: 1,
    borderRadius: BORDERS.radiusMd,
    padding: SPACING.sm,
    marginVertical: SPACING.sm,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pinIcon: {
    marginRight: 4,
  },
  rejectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  warnIcon: {
    marginRight: 4,
  },
  rejectionTitle: {
    ...FONTS.bodyBold,
    fontSize: 12,
    color: COLORS.error,
  },
  rejectionNotes: {
    ...FONTS.body,
    fontSize: 12,
    color: COLORS.text,
    lineHeight: 16,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.xs,
  },
  actionBtn: {
    flex: 1,
    height: 36,
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
});

export default RejectedRecipesScreen;
