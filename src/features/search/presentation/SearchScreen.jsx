import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, StatusBar, SafeAreaView, FlatList } from 'react-native';
import { COLORS, FONTS, SPACING } from '../../../core/theme/theme';
import Header from '../../../shared/components/Header';
import Input from '../../../shared/components/Input';
import Card from '../../../shared/components/Card';
import ImageLoader from '../../../shared/components/ImageLoader';
import TransitionView from '../../../shared/components/TransitionView';

const FEATURED_ARCHIVES = [
  { 
    id: '1', 
    title: 'Monsoon Kadhai Lentil', 
    region: 'Goa / Konkan', 
    tag: 'Forgotten Heritage',
    image: require('../../../assets/images/dal.png')
  },
  { 
    id: '2', 
    title: 'Winter Tandoor Bread', 
    region: 'Punjab', 
    tag: 'Traditional Classic',
    image: require('../../../assets/images/tandoorroti.png')
  },
  { 
    id: '3', 
    title: 'Heritage Royal Thali', 
    region: 'Rajasthan', 
    tag: 'Palace Collection',
    image: require('../../../assets/images/thali.png')
  },
];

export const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const filteredArchives = useMemo(() => {
    const query = debouncedQuery.toLowerCase().trim();
    if (!query) return FEATURED_ARCHIVES;
    return FEATURED_ARCHIVES.filter((item) =>
      item.title.toLowerCase().includes(query) ||
      item.region.toLowerCase().includes(query)
    );
  }, [debouncedQuery]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <Header title="Search Archives" showBack={false} showAvatar={true} />

      <View style={styles.container}>
        <Input
          placeholder="Search by ingredients, regions, or stories..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchBar}
        />

        <Text style={styles.sectionHeader}>F E A T U R E D  A R C H I V E S</Text>

        <TransitionView style={{ flex: 1 }}>
          <FlatList
            data={filteredArchives}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            initialNumToRender={10}
            maxToRenderPerBatch={5}
            windowSize={5}
            removeClippedSubviews={true}
            renderItem={({ item }) => (
              <Card variant="heritage" style={styles.recipeCard}>
                {/* Split layout: Image on the left, details on the right */}
                <ImageLoader source={item.image} style={styles.recipeThumbnail} resizeMode="cover" />
                
                <View style={styles.recipeCardBody}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.tagText}>{item.tag.toUpperCase()}</Text>
                    <Text style={styles.regionText}>{item.region}</Text>
                  </View>
                  <Text style={styles.recipeTitle}>{item.title}</Text>
                </View>
              </Card>
            )}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No heritage recipes found matching your query.</Text>
              </View>
            }
          />
        </TransitionView>
      </View>
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
    paddingTop: SPACING.sm,
  },
  searchBar: {
    marginBottom: SPACING.md,
  },
  sectionHeader: {
    ...FONTS.labelCaps,
    fontSize: 11,
    color: COLORS.primary,
    letterSpacing: 2,
    marginVertical: SPACING.md,
  },
  recipeCard: {
    padding: 0, // Zero padding for split image border
    flexDirection: 'row',
    marginBottom: SPACING.md,
    overflow: 'hidden',
    height: 100,
  },
  recipeThumbnail: {
    width: 100,
    height: '100%',
  },
  recipeCardBody: {
    flex: 1,
    padding: SPACING.sm,
    justifyContent: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  tagText: {
    ...FONTS.labelCaps,
    fontSize: 8,
    color: COLORS.primary,
    letterSpacing: 0.8,
  },
  regionText: {
    ...FONTS.caption,
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  recipeTitle: {
    ...FONTS.titleMedium,
    fontSize: 16,
    color: COLORS.text,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyText: {
    ...FONTS.body,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 100,
  },
});

export default SearchScreen;
