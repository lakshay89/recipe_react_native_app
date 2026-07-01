import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Image,
  ActivityIndicator,
} from 'react-native';

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Language');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FAF7F2"
      />

      <View style={styles.container}>

        {/* Background Circles */}
        <View style={styles.circleOne} />
        <View style={styles.circleTwo} />

        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* App Name */}
        <Text style={styles.title}>
          Edible India
        </Text>

        {/* Tagline */}
        <Text style={styles.tagline}>
          Discover • Preserve • Celebrate
        </Text>

        <Text style={styles.subtitle}>
          India's Culinary Heritage
        </Text>

        {/* Description */}
        <Text style={styles.description}>
          Preserving authentic regional recipes,
          culinary traditions and food stories
          from every corner of India.
        </Text>

        {/* Loader */}
        <ActivityIndicator
          size="small"
          color="#C96A1B"
          style={{ marginTop: 45 }}
        />

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Version 1.0
          </Text>

          <Text style={styles.copy}>
            © Edible India
          </Text>
        </View>

      </View>
    </>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#FAF7F2',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },

  circleOne: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#F4E0B7',
    top: -80,
    left: -80,
    opacity: 0.35,
  },

  circleTwo: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#E7C18F',
    bottom: -120,
    right: -120,
    opacity: 0.25,
  },

  logoContainer: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    marginBottom: 30,
  },

  logo: {
    width: 75,
    height: 75,
  },

  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#2F2B28',
    letterSpacing: 0.5,
  },

  tagline: {
    marginTop: 14,
    fontSize: 16,
    color: '#C96A1B',
    fontWeight: '600',
    textAlign: 'center',
  },

  subtitle: {
    marginTop: 6,
    fontSize: 22,
    color: '#2F5E4E',
    fontWeight: '700',
    textAlign: 'center',
  },

  description: {
    marginTop: 25,
    fontSize: 15,
    color: '#6D6A65',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 15,
  },

  footer: {
    position: 'absolute',
    bottom: 35,
    alignItems: 'center',
  },

  footerText: {
    fontSize: 13,
    color: '#777',
  },

  copy: {
    marginTop: 4,
    fontSize: 12,
    color: '#999',
  },

});