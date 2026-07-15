import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import {
  Trash2,
  Edit3,
  Eye,
  MapPin,
  Clock,
  BookOpen
} from 'lucide-react-native';
import { COLORS, FONTS, SPACING, BORDERS, SHADOWS } from '../../../core/theme/theme';
import { useAuth } from '../../../shared/services/AuthContext';
import Header from '../../../shared/components/Header';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';
import { recipeDraftService } from '../../recipes/services/recipeDraftService';

export const DraftRecipesScreen = ({ navigation }) => {
  const { saveRecipeDraft } = useAuth();
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load saved drafts on screen mount
  const loadDrafts = async () => {
    setLoading(true);
    const savedDrafts = await recipeDraftService.getAllDrafts();
    setDrafts(savedDrafts);
    setLoading(false);
  };

  useEffect(() => {
    loadDrafts();
  }, []);

  const handleContinueEditing = async (item) => {
    // 1. Restore this draft in active context
    await saveRecipeDraft(item, item.currentStep);
    
    // 2. Navigate user to correct Add Recipe wizard step
    navigation.navigate('AddRecipe', { screen: item.currentStep || 'RecipeIdentity' });
  };

  const handlePreviewDraft = async (item) => {
    // 1. Restore active context
    await saveRecipeDraft(item, item.currentStep);
    
    // 2. Route directly to preview layout
    navigation.navigate('AddRecipe', { screen: 'RecipePreview' });
  };

  const handleDeletePrompt = (draftId) => {
    Alert.alert(
      'Delete Draft',
      'Are you sure you want to permanently discard this recipe draft curation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updated = await recipeDraftService.deleteDraft(draftId);
            setDrafts(updated);
          }
        }
      ]
    );
  };

  const formatRelativeTime = (isoString) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return new Date(isoString).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FBF7F1" />
      <Header title="My Drafts" showBack={true} showAvatar={false} />

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loaderText}>Loading Curation Drafts...</Text>
        </View>
      ) : (
        <FlatList
          data={drafts}
          keyExtractor={(item) => item.draftId}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Card variant="default" style={styles.recipeCard}>
              <View style={styles.infoCol}>
                {/* Draft Header */}
                <View style={styles.cardHeader}>
                  <Text style={styles.recipeTitle}>
                    {item.recipeName || item.title || 'Untitled Draft'}
                  </Text>
                  <Text style={styles.timeText}>
                    <Clock size={12} color={COLORS.textMuted} style={styles.inlineIcon} />{' '}
                    {formatRelativeTime(item.updatedAt)}
                  </Text>
                </View>

                {/* Region Watermark */}
                <View style={styles.metaRow}>
                  <MapPin size={13} color={COLORS.primary} style={styles.inlineIcon} />
                  <Text style={styles.locationText}>
                    {item.region || 'Region undefined'}
                  </Text>
                </View>

                {/* Progress bar percentage */}
                <View style={styles.progressRow}>
                  <View style={styles.progressBarOuter}>
                    <View style={[styles.progressBarFill, { width: `${item.completionPercentage || 0}%` }]} />
                  </View>
                  <Text style={styles.percentageText}>
                    {Math.round(item.completionPercentage || 0)}% Complete
                  </Text>
                </View>

                {/* Action Controls */}
                <View style={styles.actionsPanel}>
                  <TouchableOpacity
                    onPress={() => handleContinueEditing(item)}
                    style={styles.actionBtn}
                    activeOpacity={0.7}
                  >
                    <Edit3 size={14} color={COLORS.primary} style={styles.btnIcon} />
                    <Text style={styles.actionText}>Continue</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => navigation.navigate('EditRecipe', { recipeId: item.draftId, isDraft: true })}
                    style={styles.actionBtn}
                    activeOpacity={0.7}
                  >
                    <Edit3 size={14} color={COLORS.gold} style={styles.btnIcon} />
                    <Text style={[styles.actionText, { color: COLORS.gold }]}>Form Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handlePreviewDraft(item)}
                    style={styles.actionBtn}
                    activeOpacity={0.7}
                  >
                    <Eye size={14} color={COLORS.secondary} style={styles.btnIcon} />
                    <Text style={[styles.actionText, { color: COLORS.secondary }]}>Preview</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleDeletePrompt(item.draftId)}
                    style={[styles.actionBtn, styles.deleteBtn]}
                    activeOpacity={0.7}
                  >
                    <Trash2 size={14} color={COLORS.error} style={styles.btnIcon} />
                    <Text style={styles.deleteText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <BookOpen size={40} color={COLORS.gold} />
              </View>
              <Text style={styles.emptyText}>No Active Drafts Found</Text>
              <Text style={styles.emptySub}>
                All your edits have been completed and archived. Begin a new heritage recipe curation below.
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
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FBF7F1', // Primary Cream
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    ...FONTS.bodyMedium,
    color: COLORS.textMuted,
    marginTop: 12,
  },
  listContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingBottom: 110,
  },
  recipeCard: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderColor: '#ECE3D7',
    borderWidth: BORDERS.widthThin,
    borderRadius: 16,
    marginBottom: SPACING.md,
    ...SHADOWS.soft,
  },
  infoCol: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  recipeTitle: {
    ...FONTS.titleMedium,
    fontSize: 16,
    fontWeight: '700',
    color: '#2B2B2B',
    flex: 1,
    marginRight: 10,
  },
  timeText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  inlineIcon: {
    marginRight: 4,
  },
  locationText: {
    ...FONTS.caption,
    fontSize: 12,
    color: '#666666',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBarOuter: {
    flex: 1,
    height: 6,
    backgroundColor: '#F3EDE4',
    borderRadius: 3,
    marginRight: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  percentageText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  actionsPanel: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F0E6D8',
    paddingTop: 12,
    rowGap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FBF8F4',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#ECE3D7',
    width: '48%',
  },
  btnIcon: {
    marginRight: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  deleteBtn: {
    marginLeft: 'auto',
    backgroundColor: '#FCE8E6',
  },
  deleteText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.error,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
    marginTop: 40,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#ECE3D7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    ...SHADOWS.soft,
  },
  emptyText: {
    ...FONTS.titleMedium,
    fontSize: 18,
    color: COLORS.secondary,
    marginBottom: 8,
  },
  emptySub: {
    ...FONTS.body,
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  emptyBtn: {
    minWidth: 180,
  },
});

export default DraftRecipesScreen;
