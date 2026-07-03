import React from 'react';
import { View, Text, StyleSheet, StatusBar, SafeAreaView, FlatList, Image, TouchableOpacity, Alert } from 'react-native';
import { COLORS, FONTS, SPACING, SHADOWS } from '../../../core/theme/theme';
import { useAuth } from '../../../shared/services/AuthContext';
import Header from '../../../shared/components/Header';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';

export const DraftRecipesScreen = ({ navigation }) => {
  const { myRecipes, duplicateRecipe, deleteRecipe } = useAuth();

  const draftRecipes = myRecipes.filter((r) => r.status === 'Draft');

  const handleDuplicate = (id) => {
    duplicateRecipe(id);
    Alert.alert('Draft Cloned', 'A new draft copy has been added to your lists.');
  };

  const handleDeletePrompt = (id) => {
    Alert.alert(
      'Delete Draft',
      'Are you sure you want to permanently discard this draft recipe?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteRecipe(id) },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <Header title="My Drafts" showBack={true} showAvatar={false} />

      <FlatList
        data={draftRecipes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <Card variant="default" style={styles.recipeCard}>
            <View style={styles.contentRow}>
              <View style={styles.infoCol}>
                <Text style={styles.recipeTitle}>{item.title || 'Untitled Draft'}</Text>
                <Text style={styles.locationText}>
                  📍 {item.region || 'No region'} • Created: {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                </Text>
                {item.history ? (
                  <Text style={styles.previewStory} numberOfLines={1}>
                    Story: {item.history}
                  </Text>
                ) : null}

                <View style={styles.actionsPanel}>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('EditRecipe', { recipeId: item.id })}
                    style={styles.actionBtn}
                  >
                    <Text style={styles.actionText}>Continue Editing</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleDuplicate(item.id)}
                    style={styles.actionBtn}
                  >
                    <Text style={styles.actionText}>Duplicate</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleDeletePrompt(item.id)}
                    style={[styles.actionBtn, styles.deleteBtn]}
                  >
                    <Text style={styles.deleteText}>Delete Draft</Text>
                  </TouchableOpacity>
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
            <Text style={styles.emptyText}>You have no drafts</Text>
            <Text style={styles.emptySub}>
              All your edits have been submitted. Tap below to start documenting a new regional food tradition.
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
  contentRow: {
    flexDirection: 'row',
  },
  infoCol: {
    flex: 1,
  },
  recipeTitle: {
    ...FONTS.titleMedium,
    fontSize: 17,
    color: COLORS.text,
  },
  locationText: {
    ...FONTS.caption,
    fontSize: 11,
    color: COLORS.textMuted,
    marginVertical: 2,
  },
  previewStory: {
    ...FONTS.caption,
    fontSize: 11,
    color: COLORS.text,
    marginVertical: 2,
  },
  actionsPanel: {
    flexDirection: 'row',
    marginTop: SPACING.sm,
    gap: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: SPACING.xs,
  },
  actionBtn: {
    paddingVertical: SPACING.xs,
  },
  actionText: {
    ...FONTS.caption,
    fontWeight: '700',
    color: COLORS.primary,
  },
  deleteBtn: {
    marginLeft: 'auto',
  },
  deleteText: {
    ...FONTS.caption,
    fontWeight: '700',
    color: COLORS.error,
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

export default DraftRecipesScreen;
