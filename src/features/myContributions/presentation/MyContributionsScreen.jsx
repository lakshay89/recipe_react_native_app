import React, { useState } from 'react';
import { View, Text, StyleSheet, StatusBar, SafeAreaView, FlatList, TouchableOpacity, ScrollView, Modal, Alert, Image } from 'react-native';
import { COLORS, FONTS, SPACING } from '../../../core/theme/theme';
import { useAuth } from '../../../shared/services/AuthContext';
import Header from '../../../shared/components/Header';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';
import Input from '../../../shared/components/Input';

export const MyContributionsScreen = () => {
  const { myRecipes, isAuthenticated, editRecipe } = useAuth();
  
  // Editing state
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editRegion, setEditRegion] = useState('');
  const [editHistory, setEditHistory] = useState('');
  const [editIngredients, setEditIngredients] = useState('');
  const [editInstructions, setEditInstructions] = useState('');

  const openEditModal = (recipe) => {
    setEditingRecipe(recipe);
    setEditTitle(recipe.title);
    setEditRegion(recipe.region);
    setEditHistory(recipe.history);
    setEditIngredients(recipe.ingredients);
    setEditInstructions(recipe.instructions);
  };

  const closeEditModal = () => {
    setEditingRecipe(null);
  };

  const handleSaveEdit = () => {
    if (!editTitle.trim() || !editRegion.trim() || !editHistory.trim()) {
      Alert.alert('Validation Error', 'Please fill in required fields');
      return;
    }

    editRecipe(editingRecipe.id, {
      title: editTitle,
      region: editRegion,
      history: editHistory,
      ingredients: editIngredients,
      instructions: editInstructions,
    });

    closeEditModal();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return COLORS.success;
      case 'Pending Review':
      case 'Pending Edits Review':
        return COLORS.primary;
      default:
        return COLORS.textMuted;
    }
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <Header title="My Contributions" showBack={false} showAvatar={true} />
        <View style={styles.centerContainer}>
          <Card variant="heritage" style={styles.authCard}>
            <Text style={styles.authTitle}>Login Required</Text>
            <Text style={styles.authText}>
              Please sign in to view your culinary contributions, edit drafts, and monitor the review status of your recipes.
            </Text>
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <Header title="My Contributions" showBack={false} showAvatar={true} />

      <View style={styles.container}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.sectionTitle}>Your Culinary Archives</Text>
          <Text style={styles.sectionSubtitle}>
            Track your submissions. Only approved items are visible on the public culinary map.
          </Text>
        </View>

        <FlatList
          data={myRecipes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Card variant="heritage" style={styles.contributionCard}>
              <View style={styles.cardHorizontal}>
                <Image
                  source={require('../../../assets/images/sweets.png')} // Default contribution thumbnail
                  style={styles.contributionThumbnail}
                  resizeMode="cover"
                />
                
                <View style={styles.contributionBody}>
                  <View style={styles.cardHeader}>
                    <View style={[styles.statusBadge, { borderColor: getStatusColor(item.status) }]}>
                      <Text style={[styles.statusBadgeText, { color: getStatusColor(item.status) }]}>
                        {item.status.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.regionText}>{item.region}</Text>
                  </View>

                  <Text style={styles.recipeTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.recipeHistory} numberOfLines={1}>
                    {item.history}
                  </Text>

                  <Button
                    title="Edit Recipe"
                    variant="outline"
                    onPress={() => openEditModal(item)}
                    style={styles.editButton}
                    textStyle={styles.editButtonText}
                  />
                </View>
              </View>
            </Card>
          )}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Image
                source={require('../../../assets/images/logo.png')}
                style={styles.emptyWatermark}
                resizeMode="contain"
              />
              <Text style={styles.emptyTextTitle}>No Contributions Yet</Text>
              <Text style={styles.emptyTextDesc}>
                You haven't contributed any recipes. Add your first recipe to see it listed here!
              </Text>
            </View>
          }
        />
      </View>

      {/* Edit Recipe Modal */}
      {editingRecipe && (
        <Modal visible={true} animationType="slide" transparent={false}>
          <SafeAreaView style={styles.modalSafeArea}>
            <Header
              title="Edit Heritage Recipe"
              showBack={false}
              showAvatar={false}
              rightComponent={
                <TouchableOpacity onPress={closeEditModal} style={styles.closeButton}>
                  <Text style={styles.closeText}>Close</Text>
                </TouchableOpacity>
              }
            />
            <ScrollView contentContainerStyle={styles.modalScrollContent} keyboardShouldPersistTaps="handled">
              <Text style={styles.modalWarnTitle}>Editing Contribution</Text>
              <Text style={styles.modalWarnText}>
                Important: Saving updates to this recipe will resubmit it to administration for review.
              </Text>

              <Card variant="heritage" style={styles.modalFormCard}>
                <Input
                  label="Recipe Title / Name"
                  value={editTitle}
                  onChangeText={setEditTitle}
                />
                <Input
                  label="State / Region"
                  value={editRegion}
                  onChangeText={setEditRegion}
                />
                <Input
                  label="Culinary History / Story"
                  value={editHistory}
                  onChangeText={setEditHistory}
                  multiline={true}
                  numberOfLines={4}
                  style={styles.textArea}
                />
                <Input
                  label="Ingredients"
                  value={editIngredients}
                  onChangeText={setEditIngredients}
                  multiline={true}
                  numberOfLines={4}
                  style={styles.textArea}
                />
                <Input
                  label="Preparation Instructions"
                  value={editInstructions}
                  onChangeText={setEditInstructions}
                  multiline={true}
                  numberOfLines={4}
                  style={styles.textArea}
                />

                <Button
                  title="Resubmit for Review"
                  variant="primary"
                  onPress={handleSaveEdit}
                  style={styles.saveBtn}
                />
              </Card>
            </ScrollView>
          </SafeAreaView>
        </Modal>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  headerTitleContainer: {
    marginVertical: SPACING.md,
  },
  sectionTitle: {
    ...FONTS.title,
    fontSize: 24,
    color: COLORS.secondary,
  },
  sectionSubtitle: {
    ...FONTS.body,
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 18,
    marginTop: 4,
  },
  listContent: {
    paddingBottom: 100,
  },
  contributionCard: {
    padding: 0,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  cardHorizontal: {
    flexDirection: 'row',
    height: 120,
  },
  contributionThumbnail: {
    width: 110,
    height: '100%',
  },
  contributionBody: {
    flex: 1,
    padding: SPACING.sm,
    justifyContent: 'space-between',
  },
  emptyWatermark: {
    width: 100,
    height: 100,
    opacity: 0.15,
    marginBottom: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusBadgeText: {
    ...FONTS.bodyBold,
    fontSize: 9,
    letterSpacing: 0.5,
  },
  regionText: {
    ...FONTS.caption,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  recipeTitle: {
    ...FONTS.titleMedium,
    fontSize: 18,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  recipeHistory: {
    ...FONTS.body,
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 18,
    marginBottom: SPACING.md,
  },
  editButton: {
    height: 38,
    minHeight: 38,
    paddingVertical: 0,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  editButtonText: {
    color: COLORS.primary,
    fontSize: 13,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
  },
  emptyTextTitle: {
    ...FONTS.titleMedium,
    fontSize: 18,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  emptyTextDesc: {
    ...FONTS.body,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  authCard: {
    padding: SPACING.xl,
    alignItems: 'center',
    width: '100%',
  },
  authTitle: {
    ...FONTS.titleMedium,
    fontSize: 20,
    color: COLORS.secondary,
    marginBottom: SPACING.sm,
  },
  authText: {
    ...FONTS.body,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalSafeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalScrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  modalWarnTitle: {
    ...FONTS.titleMedium,
    fontSize: 20,
    color: COLORS.primary,
  },
  modalWarnText: {
    ...FONTS.body,
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
    marginBottom: SPACING.md,
  },
  modalFormCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  saveBtn: {
    marginTop: SPACING.md,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  closeText: {
    ...FONTS.bodyBold,
    fontSize: 14,
    color: COLORS.primary,
  },
});

export default MyContributionsScreen;
