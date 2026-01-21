import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '@/constants/theme';
import { useAuthStore } from '@/lib/auth';

export default function LoginScreen() {
  const router = useRouter();
  const { login, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    clearError();

    try {
      const success = await login(email, password);
      
      if (success) {
        router.replace('/(tabs)');
      } else {
        Alert.alert('Login Failed', error || 'Please check your credentials');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      Alert.alert('Login Error', errorMessage);
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
          <Text style={styles.headerTitle}>Log In</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.content}>
          <View style={styles.titleSection}>
            <Text style={styles.title}>Welcome Back!</Text>
            <Text style={styles.subtitle}>Log in to your BillBreak AI account</Text>
          </View>

          {error && (
            <View style={[styles.errorContainer, SHADOWS.small]}>
              <MaterialCommunityIcons name="alert-circle" size={20} color={Colors.light.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.formSection}>
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
            </View>

            <TouchableOpacity style={styles.forgotPasswordButton}>
              <Text style={styles.forgotPassword}>Forgot password?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.buttonDisabled, SHADOWS.medium]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <MaterialCommunityIcons name="loading" size={20} color="#FFFFFF" style={{ marginRight: SPACING.sm }} />
                <Text style={styles.loginButtonText}>Logging in...</Text>
              </>
            ) : (
              <Text style={styles.loginButtonText}>Log In</Text>
            )}
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.divider} />
          </View>

          <View style={styles.signupSection}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
              <Text style={styles.signupLink}>Create one</Text>
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
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: SPACING.sm,
  },
  forgotPassword: {
    ...TYPOGRAPHY.bodySmall,
    color: Colors.light.primary,
    fontWeight: '600',
  },
  loginButton: {
    flexDirection: 'row',
    backgroundColor: Colors.light.primary,
    borderRadius: BORDER_RADIUS.large,
    paddingVertical: SPACING.md + 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  loginButtonText: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
    gap: SPACING.md,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.light.border,
  },
  dividerText: {
    ...TYPOGRAPHY.labelSmall,
    color: Colors.light.textSecondary,
  },
  signupSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    ...TYPOGRAPHY.body,
    color: Colors.light.textSecondary,
  },
  signupLink: {
    ...TYPOGRAPHY.body,
    color: Colors.light.primary,
    fontWeight: '700',
  },
});
