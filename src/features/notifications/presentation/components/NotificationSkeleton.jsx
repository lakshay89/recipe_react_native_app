import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS, BORDERS } from '../../../../core/theme/theme';

export const NotificationSkeleton = () => {
  const skeletons = Array(4).fill(0);

  return (
    <View style={styles.container}>
      {skeletons.map((_, index) => (
        <View key={index} style={styles.skeletonCard}>
          <View style={styles.leftCol}>
            <View style={styles.circlePlaceholder} />
          </View>
          <View style={styles.rightCol}>
            <View style={styles.badgeRow}>
              <View style={styles.badgePlaceholder} />
              <View style={styles.timePlaceholder} />
            </View>
            <View style={styles.titlePlaceholder} />
            <View style={styles.descPlaceholder1} />
            <View style={styles.descPlaceholder2} />
            <View style={styles.btnPlaceholder} />
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  skeletonCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderColor: '#E7D8C5',
    borderWidth: BORDERS.widthThin,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  leftCol: {
    marginRight: 12,
  },
  circlePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3EDE4',
  },
  rightCol: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgePlaceholder: {
    width: 70,
    height: 16,
    borderRadius: 4,
    backgroundColor: '#EAE1D5',
  },
  timePlaceholder: {
    width: 50,
    height: 12,
    borderRadius: 3,
    backgroundColor: '#F3EDE4',
  },
  titlePlaceholder: {
    width: '70%',
    height: 18,
    borderRadius: 4,
    backgroundColor: '#EAE1D5',
    marginBottom: 6,
  },
  descPlaceholder1: {
    width: '95%',
    height: 12,
    borderRadius: 3,
    backgroundColor: '#F3EDE4',
    marginBottom: 4,
  },
  descPlaceholder2: {
    width: '60%',
    height: 12,
    borderRadius: 3,
    backgroundColor: '#F3EDE4',
    marginBottom: 12,
  },
  btnPlaceholder: {
    width: 100,
    height: 32,
    borderRadius: 14,
    backgroundColor: '#EAE1D5',
  },
});

export default NotificationSkeleton;
