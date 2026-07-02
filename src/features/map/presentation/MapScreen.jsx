import React from 'react';
import { View, Text, StyleSheet, StatusBar, SafeAreaView, Image } from 'react-native';
import { COLORS, FONTS, SPACING } from '../../../core/theme/theme';
import Header from '../../../shared/components/Header';
import Card from '../../../shared/components/Card';

export const MapScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <Header title="Culinary Heritage Map" showBack={false} showAvatar={true} />
      
      <View style={styles.container}>
        <Card variant="heritage" style={styles.mapCard}>
          <Text style={styles.sectionTagline}>E X P L O R E</Text>
          <Text style={styles.sectionTitle}>Interactive Culinary Atlas</Text>
          <Text style={styles.description}>
            Trace India's recipes back to their origin. This museum-grade visual map will let you filter recipes by state, ecosystem, and era.
          </Text>
          
          {/* Mock Map Canvas */}
          <View style={styles.mapCanvas}>
            <Image
              source={require('../../../assets/images/screen.png')}
              style={StyleSheet.absoluteFillObject}
              resizeMode="cover"
            />
            <View style={styles.mapOverlay} />
            <Text style={styles.mapPlaceholderText}>
              [ Culinary Heritage Map Interface ]
            </Text>
            <Text style={styles.mapSubtext}>
              Pinpoints authentic recipes and spice trails across states
            </Text>
          </View>
        </Card>
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
    justifyContent: 'center',
    paddingVertical: SPACING.md,
  },
  mapCard: {
    padding: SPACING.lg,
    flex: 1,
    justifyContent: 'space-between',
  },
  sectionTagline: {
    ...FONTS.bodyBold,
    fontSize: 10,
    color: COLORS.primary,
    letterSpacing: 2,
  },
  sectionTitle: {
    ...FONTS.title,
    fontSize: 24,
    color: COLORS.secondary,
    marginTop: 4,
    marginBottom: SPACING.sm,
  },
  description: {
    ...FONTS.body,
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  mapCanvas: {
    flex: 1,
    backgroundColor: COLORS.secondaryBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    overflow: 'hidden',
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(251, 249, 244, 0.85)',
  },
  mapPlaceholderText: {
    ...FONTS.titleMedium,
    fontSize: 16,
    color: COLORS.primary,
  },
  mapSubtext: {
    ...FONTS.caption,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
});

export default MapScreen;
