import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, SPACING, BORDER_RADIUS, TYPOGRAPHY, SHADOWS } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function WelcomeScreen() {
  const router = useRouter();
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.9);
  const slideAnim = new Animated.Value(40);
  const containerTranslateAnim = new Animated.Value(20);

  useEffect(() => {
    // Logo fade in + scale
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
    ]).start();

    // Content slide and fade in
    setTimeout(() => {
      Animated.timing(containerTranslateAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }).start();
    }, 300);

    // Button slide up
    setTimeout(() => {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }, 600);
  }, []);

  return (
    <View style={styles.container}>
      {/* Soft gradient background using layered views */}
      <View style={styles.backgroundDecor}>
        <View style={styles.decorCircle1} />
        <View style={styles.decorCircle2} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo Section */}
        <Animated.View
          style={[
            styles.logoSection,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.logoContainer}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoEmoji}>💰</Text>
            </View>
          </View>
        </Animated.View>

        {/* Title and Subtitle */}
        <Animated.View
          style={[
            styles.titleSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: containerTranslateAnim }],
            },
          ]}
        >
          <Text style={styles.appName}>BillBreak AI</Text>
          <Text style={styles.tagline}>Split expenses, not friendships</Text>
        </Animated.View>

        {/* Features Section */}
        <Animated.View
          style={[
            styles.featuresSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: containerTranslateAnim }],
            },
          ]}
        >
          <FeatureCard 
            icon="lightning-bolt" 
            title="Lightning Fast" 
            description="Split expenses in seconds, not minutes"
          />
          <FeatureCard 
            icon="microphone" 
            title="Voice-Powered" 
            description="Just speak, our AI handles the rest"
          />
          <FeatureCard 
            icon="bank" 
            title="Easy Settlements" 
            description="Instant UPI payment links"
          />
          <FeatureCard 
            icon="people" 
            title="Smart Groups" 
            description="Organize expenses by trip or household"
          />
        </Animated.View>

        {/* Benefits Section */}
        <Animated.View
          style={[
            styles.benefitsSection,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <View style={styles.benefitRow}>
            <View style={styles.benefitIcon}>
              <MaterialCommunityIcons name="check-circle" size={24} color={Colors.light.success} />
            </View>
            <Text style={styles.benefitText}>No hidden fees</Text>
          </View>
          <View style={styles.benefitRow}>
            <View style={styles.benefitIcon}>
              <MaterialCommunityIcons name="check-circle" size={24} color={Colors.light.success} />
            </View>
            <Text style={styles.benefitText}>Totally free forever</Text>
          </View>
          <View style={styles.benefitRow}>
            <View style={styles.benefitIcon}>
              <MaterialCommunityIcons name="check-circle" size={24} color={Colors.light.success} />
            </View>
            <Text style={styles.benefitText}>Your data, your control</Text>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Action Buttons */}
      <Animated.View
        style={[
          styles.buttonSection,
          {
            transform: [{ translateY: slideAnim }],
            opacity: fadeAnim,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.primaryButton, SHADOWS.medium]}
          onPress={() => router.push('/(auth)/signup')}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryButtonText}>Create Account</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push('/(auth)/login')}
          activeOpacity={0.7}
        >
          <Text style={styles.secondaryButtonText}>I already have an account</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <View style={[styles.featureCard, SHADOWS.small]}>
      <View style={styles.featureIconContainer}>
        <MaterialCommunityIcons name={icon} size={28} color={Colors.light.primary} />
      </View>
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  backgroundDecor: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  decorCircle1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: Colors.light.primaryLight,
    opacity: 0.4,
  },
  decorCircle2: {
    position: 'absolute',
    bottom: -80,
    left: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: Colors.light.secondaryLight,
    opacity: 0.3,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xl,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBadge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.light.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  logoEmoji: {
    fontSize: 56,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  appName: {
    ...TYPOGRAPHY.h1,
    color: Colors.light.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  tagline: {
    ...TYPOGRAPHY.bodyLarge,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  featuresSection: {
    gap: SPACING.md,
    marginBottom: SPACING.xxl,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: Colors.light.card,
    borderRadius: BORDER_RADIUS.large,
    padding: SPACING.lg,
    gap: SPACING.md,
    alignItems: 'flex-start',
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.medium,
    backgroundColor: Colors.light.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    ...TYPOGRAPHY.h4,
    color: Colors.light.text,
    marginBottom: SPACING.xs,
  },
  featureDescription: {
    ...TYPOGRAPHY.bodySmall,
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
  benefitsSection: {
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  benefitIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    ...TYPOGRAPHY.body,
    color: Colors.light.text,
    flex: 1,
  },
  buttonSection: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    gap: SPACING.md,
    backgroundColor: Colors.light.background,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  primaryButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: SPACING.md + 2,
    borderRadius: BORDER_RADIUS.large,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryButton: {
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.large,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.card,
  },
  secondaryButtonText: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
});
