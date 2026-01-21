import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '@/constants/theme';
import { useAuthStore } from '@/lib/auth';

export default function SignupScreen() {
  const router = useRouter();
  const { signup, error, clearError } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    clearError();

    try {
      const success = await signup(name, email, password);
      
      if (success) {
        Alert.alert('Success', 'Account created successfully!', [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)'),
          },
        ]);
      } else {
        Alert.alert('Signup Failed', error || 'Please try again');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Signup failed';
      Alert.alert('Signup Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.light.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Account</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.content}>
          <View style={styles.titleSection}>
            <Text style={styles.title}>Join BillBreak AI</Text>
            <Text style={styles.subtitle}>Split expenses the smart way</Text>
          </View>

          {error && (
            <View style={[styles.errorContainer, SHADOWS.small]}>
              <MaterialCommunityIcons name="alert-circle" size={20} color={Colors.light.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.formSection}>
            {/* Full Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={[styles.inputWrapper, SHADOWS.small]}>
                <MaterialCommunityIcons name="account-outline" size={20} color={Colors.light.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="John Doe"
                  placeholderTextColor={Colors.light.textTertiary}
                  value={name}
                  onChangeText={setName}
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={[styles.inputWrapper, SHADOWS.small]}>
                <MaterialCommunityIcons name="email-outline" size={20} color={Colors.light.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor={Colors.light.textTertiary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  editable={!isLoading}
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={[styles.inputWrapper, SHADOWS.small]}>
                <MaterialCommunityIcons name="lock-outline" size={20} color={Colors.light.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={Colors.light.textTertiary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!isLoading}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <MaterialCommunityIcons 
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                    size={20} 
                    color={Colors.light.textSecondary} 
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles.passwordHint}>At least 6 characters</Text>
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={[styles.inputWrapper, SHADOWS.small]}>
                <MaterialCommunityIcons name="lock-check-outline" size={20} color={Colors.light.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={Colors.light.textTertiary}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  editable={!isLoading}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <MaterialCommunityIcons 
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} 
                    size={20} 
                    color={Colors.light.textSecondary} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Terms */}
            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                By signing up, you agree to our{' '}
                <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.signupButton, isLoading && styles.buttonDisabled, SHADOWS.medium]}
            onPress={handleSignup}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <MaterialCommunityIcons name="loading" size={20} color="#FFFFFF" style={{ marginRight: SPACING.sm }} />
                <Text style={styles.signupButtonText}>Creating account...</Text>
              </>
            ) : (
              <Text style={styles.signupButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginSection}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.loginLink}>Log in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.medium,
    backgroundColor: Colors.light.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: Colors.light.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  titleSection: {
    marginBottom: SPACING.xxl,
    marginTop: SPACING.lg,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: Colors.light.text,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: Colors.light.textSecondary,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.dangerLight,
    borderRadius: BORDER_RADIUS.medium,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    gap: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.danger,
  },
  errorText: {
    flex: 1,
    ...TYPOGRAPHY.bodySmall,
    color: Colors.light.danger,
    fontWeight: '500',
  },
  formSection: {
    marginBottom: SPACING.xl,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    ...TYPOGRAPHY.label,
    color: Colors.light.text,
    marginBottom: SPACING.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: BORDER_RADIUS.medium,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: SPACING.sm,
  },
  input: {
    flex: 1,
    paddingVertical: SPACING.md,
    fontSize: 16,
    color: Colors.light.text,
  },
  passwordHint: {
    ...TYPOGRAPHY.labelSmall,
    color: Colors.light.textTertiary,
    marginTop: SPACING.xs,
  },
  termsContainer: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  termsText: {
    ...TYPOGRAPHY.labelSmall,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: Colors.light.primary,
    fontWeight: '600',
  },
  signupButton: {
    flexDirection: 'row',
    backgroundColor: Colors.light.primary,
    borderRadius: BORDER_RADIUS.large,
    paddingVertical: SPACING.md + 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  signupButtonText: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loginSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    ...TYPOGRAPHY.body,
    color: Colors.light.textSecondary,
  },
  loginLink: {
    ...TYPOGRAPHY.body,
    color: Colors.light.primary,
    fontWeight: '700',
  },
});
