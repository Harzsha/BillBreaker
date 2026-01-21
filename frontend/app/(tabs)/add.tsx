import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, SPACING, BORDER_RADIUS, SHADOWS } from '@/constants/theme';
import { apiService } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import { Group, Expense } from '@/constants/types';
import VoiceRecorder from '@/components/VoiceRecorder';

type InputMode = 'voice' | 'manual';

const CATEGORY_ICONS: Record<string, string> = {
  food: '🍔',
  transport: '🚗',
  entertainment: '🎬',
  utilities: '💡',
  shopping: '🛍️',
  other: '📌',
};

export default function AddExpenseScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [mode, setMode] = useState<InputMode>('manual');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [groups, setGroups] = useState<Group[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Manual input state
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('food');
  const [selectedSplitWith, setSelectedSplitWith] = useState<string[]>([]);

  const categories = ['food', 'transport', 'entertainment', 'utilities', 'shopping', 'other'];
  const currentGroup = groups.find((g) => g.id === selectedGroup);
  const groupMembers = currentGroup
    ? (currentGroup.members || []).filter((id) => id !== user?.id)
    : [];

  // Fetch groups on mount
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoadingGroups(true);
        const response = await apiService.getGroups();
        const groupsData = response.data.data || [];
        setGroups(groupsData);
        if (groupsData.length > 0) {
          setSelectedGroup(groupsData[0].id);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load groups';
        setError(errorMessage);
        console.error('Error fetching groups:', err);
      } finally {
        setLoadingGroups(false);
      }
    };

    fetchGroups();
  }, []);

  const toggleMember = (memberId: string) => {
    setSelectedSplitWith((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  const handleVoiceComplete = async (expenseData: any) => {
    // Voice processing is now handled in the backend
    // The expense is already created, just navigate back
    Alert.alert('Success', 'Expense created from voice recording!', [
      {
        text: 'OK',
        onPress: () => {
          router.back();
        },
      },
    ]);
  };

  const handleManualSubmit = async () => {
    if (!description || !amount || selectedSplitWith.length === 0 || !selectedGroup) {
      Alert.alert('Error', 'Please fill in all fields and select at least one person');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const expenseData = {
        description,
        amount: parseFloat(amount),
        category: selectedCategory,
        groupId: selectedGroup,
        splitWith: selectedSplitWith,
        paidBy: user?.id,
      };

      await apiService.createExpense(expenseData);

      Alert.alert('Success', 'Expense added successfully!', [
        {
          text: 'OK',
          onPress: () => {
            setDescription('');
            setAmount('');
            setSelectedSplitWith([]);
            router.back();
          },
        },
      ]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add expense';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
      console.error('Error creating expense:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingGroups) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Add Expense</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.modeToggleContainer}>
        <View style={styles.modeToggle}>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'voice' && styles.modeButtonActive]}
            onPress={() => setMode('voice')}
          >
            <MaterialCommunityIcons size={18} name="microphone" color={mode === 'voice' ? '#FFFFFF' : Colors.light.textSecondary} />
            <Text style={[styles.modeButtonText, mode === 'voice' && styles.modeButtonTextActive]}>
              Voice
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'manual' && styles.modeButtonActive]}
            onPress={() => setMode('manual')}
          >
            <MaterialCommunityIcons size={18} name="keyboard" color={mode === 'manual' ? '#FFFFFF' : Colors.light.textSecondary} />
            <Text style={[styles.modeButtonText, mode === 'manual' && styles.modeButtonTextActive]}>
              Manual
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {error && (
          <View style={styles.errorContainer}>
            <MaterialCommunityIcons name="alert-circle" size={20} color={Colors.light.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {mode === 'voice' ? (
          <View style={styles.voiceSection}>
            <VoiceRecorder 
              groupId={selectedGroup}
              onRecordingComplete={handleVoiceComplete}
              onProcessing={(isProcessing) => setIsLoading(isProcessing)}
            />
            <Text style={styles.voiceDescription}>
              Tap the microphone to record your expense. Our AI will extract the details automatically.
            </Text>
          </View>
        ) : (
          <View style={styles.manualSection}>
            {/* Description Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Lunch at restaurant"
                placeholderTextColor={Colors.light.textSecondary}
                value={description}
                onChangeText={setDescription}
                editable={!isLoading}
              />
            </View>

            {/* Amount Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Amount (₹)</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                placeholderTextColor={Colors.light.textSecondary}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                editable={!isLoading}
              />
            </View>

            {/* Category Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.categoryList}>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryButton,
                        selectedCategory === cat && styles.categoryButtonActive,
                      ]}
                      onPress={() => setSelectedCategory(cat)}
                    >
                      <Text style={styles.categoryIcon}>{CATEGORY_ICONS[cat]}</Text>
                      <Text
                        style={[
                          styles.categoryLabel,
                          selectedCategory === cat && styles.categoryLabelActive,
                        ]}
                      >
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Group Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Group</Text>
              <View style={styles.groupSelector}>
                {groups.map((group) => (
                  <TouchableOpacity
                    key={group.id}
                    style={[
                      styles.groupButton,
                      selectedGroup === group.id && styles.groupButtonActive,
                    ]}
                    onPress={() => {
                      setSelectedGroup(group.id);
                      setSelectedSplitWith([]);
                    }}
                  >
                    <Text style={[styles.groupName, selectedGroup === group.id && styles.groupNameActive]}>
                      {group.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Split With */}
            {groupMembers.length > 0 && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Split With</Text>
                <View style={styles.membersList}>
                  {groupMembers.map((memberId) => (
                    <TouchableOpacity
                      key={memberId}
                      style={[
                        styles.memberButton,
                        selectedSplitWith.includes(memberId) && styles.memberButtonActive,
                      ]}
                      onPress={() => toggleMember(memberId)}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          selectedSplitWith.includes(memberId) && styles.checkboxActive,
                        ]}
                      >
                        {selectedSplitWith.includes(memberId) && (
                          <Text style={styles.checkmark}>✓</Text>
                        )}
                      </View>
                      <Text style={styles.memberName}>{memberId}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleManualSubmit}
              disabled={isLoading}
            >
              <Text style={styles.submitButtonText}>
                {isLoading ? 'Creating Expense...' : 'Create Expense'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    width: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
  },
  modeToggleContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  modeToggle: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.medium,
    backgroundColor: Colors.light.card,
    borderWidth: 2,
    borderColor: Colors.light.border,
    gap: SPACING.sm,
  },
  modeButtonActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  modeButtonTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderRadius: BORDER_RADIUS.medium,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.danger,
    fontWeight: '500',
  },
  voiceSection: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  voiceDescription: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xxl,
    lineHeight: 20,
  },
  manualSection: {
    paddingVertical: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: Colors.light.card,
    borderRadius: BORDER_RADIUS.medium,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: 16,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  categoryList: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  categoryButton: {
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.medium,
    backgroundColor: Colors.light.card,
    borderWidth: 2,
    borderColor: Colors.light.border,
  },
  categoryButtonActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: SPACING.xs,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.light.text,
  },
  categoryLabelActive: {
    color: '#FFFFFF',
  },
  groupSelector: {
    flexDirection: 'row',
    gap: SPACING.sm,
    flexWrap: 'wrap',
  },
  groupButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.medium,
    backgroundColor: Colors.light.card,
    borderWidth: 2,
    borderColor: Colors.light.border,
  },
  groupButtonActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  groupName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  groupNameActive: {
    color: '#FFFFFF',
  },
  membersList: {
    gap: SPACING.sm,
  },
  memberButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.medium,
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  memberButtonActive: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderColor: Colors.light.primary,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: BORDER_RADIUS.small,
    borderWidth: 2,
    borderColor: Colors.light.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  checkboxActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  checkmark: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  memberName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  submitButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: BORDER_RADIUS.large,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.lg,
    ...SHADOWS.medium,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
});
