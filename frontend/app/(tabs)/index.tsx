import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, RefreshControl, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, SPACING, BORDER_RADIUS, SHADOWS } from '@/constants/theme';
import { useAuthStore } from '@/lib/auth';
import { apiService } from '@/lib/api';
import { Group, Expense } from '@/constants/types';
import GroupCard from '@/components/GroupCard';
import ExpenseCard from '@/components/ExpenseCard';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<Group[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [netBalance, setNetBalance] = useState(0);

  // Fetch groups and expenses
  const fetchData = useCallback(async () => {
    try {
      setError(null);
      
      // Fetch groups
      const groupsResponse = await apiService.getGroups();
      const groupsData = groupsResponse.data.data || [];
      setGroups(groupsData);

      // Fetch recent expenses from first group or all expenses
      if (groupsData.length > 0) {
        const expensesResponse = await apiService.getExpenses(groupsData[0].id);
        const expensesData = (expensesResponse.data.data || []).slice(0, 5);
        setExpenses(expensesData);

        // Calculate net balance from all groups
        const balance = groupsData.reduce((sum: number, group: Group) => sum + (group.yourBalance || 0), 0);
        setNetBalance(balance);
      } else {
        setExpenses([]);
        setNetBalance(0);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
      setError(errorMessage);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data on component mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refresh data when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchData();
    } finally {
      setRefreshing(false);
    }
  }, [fetchData]);

  const handleAddExpense = () => {
    router.push('./add');
  };

  const handleGroupPress = (groupId: string) => {
    router.push(`../group/${groupId}`);
  };

  const isPositiveBalance = netBalance >= 0;

  if (loading && !groups.length) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Greeting and Balance */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name || 'User'}! 👋</Text>
          <Text style={styles.date}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        </View>
        <View style={[styles.balanceCard, { ...SHADOWS.medium }]}>
          <Text style={styles.balanceLabel}>Net Balance</Text>
          <Text style={[styles.balanceAmount, { color: isPositiveBalance ? Colors.light.success : Colors.light.danger }]}>
            ₹{Math.abs(netBalance).toFixed(2)}
          </Text>
          <Text style={styles.balanceStatus}>
            {isPositiveBalance ? 'You get' : 'You owe'}
          </Text>
        </View>
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={onRefresh}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={[{ type: 'groups' }, { type: 'expenses' }]}
        renderItem={({ item }) => {
          if (item.type === 'groups') {
            return (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>My Groups</Text>
                  <TouchableOpacity onPress={() => router.push('../group/all')}>
                    <Text style={styles.seeAll}>See All</Text>
                  </TouchableOpacity>
                </View>
                {groups.length > 0 ? (
                  <FlatList
                    data={groups}
                    renderItem={({ item: group }) => (
                      <GroupCard
                        group={group}
                        onPress={() => handleGroupPress(group.id)}
                      />
                    )}
                    keyExtractor={(item) => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    scrollEnabled={true}
                    contentContainerStyle={styles.groupsList}
                  />
                ) : (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyStateIcon}>👥</Text>
                    <Text style={styles.emptyStateText}>No groups yet</Text>
                    <Text style={styles.emptyStateSubtext}>
                      Create a group to start splitting expenses
                    </Text>
                  </View>
                )}
              </View>
            );
          } else if (item.type === 'expenses') {
            return (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Recent Expenses</Text>
                  <TouchableOpacity onPress={handleAddExpense}>
                    <Text style={styles.seeAll}>Add</Text>
                  </TouchableOpacity>
                </View>
                {expenses.length > 0 ? (
                  <FlatList
                    data={expenses}
                    renderItem={({ item: expense }) => (
                      <ExpenseCard
                        expense={expense}
                        onPress={() => {}}
                      />
                    )}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                    contentContainerStyle={styles.expensesList}
                  />
                ) : (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyStateIcon}>📊</Text>
                    <Text style={styles.emptyStateText}>No expenses yet</Text>
                    <Text style={styles.emptyStateSubtext}>
                      Add your first expense to get started
                    </Text>
                  </View>
                )}
              </View>
            );
          }
          return null;
        }}
        keyExtractor={(item) => item.type}
        scrollEnabled={true}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContent}
      />

      <TouchableOpacity
        style={[styles.fab, { ...SHADOWS.large }]}
        onPress={handleAddExpense}
        activeOpacity={0.8}
      >
        <MaterialIcons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
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
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: SPACING.xs,
  },
  date: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  balanceCard: {
    backgroundColor: Colors.light.card,
    borderRadius: BORDER_RADIUS.large,
    padding: SPACING.md,
    minWidth: 140,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginBottom: SPACING.xs,
  },
  balanceAmount: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  balanceStatus: {
    fontSize: 11,
    color: Colors.light.textSecondary,
  },
  errorBanner: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.danger,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: Colors.light.danger,
    fontSize: 13,
    flex: 1,
  },
  retryText: {
    color: Colors.light.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  listContent: {
    paddingBottom: SPACING.xl * 2,
  },
  section: {
    marginVertical: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
  },
  seeAll: {
    fontSize: 13,
    color: Colors.light.primary,
    fontWeight: '600',
  },
  groupsList: {
    paddingLeft: SPACING.lg,
  },
  expensesList: {
    paddingHorizontal: SPACING.lg,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    marginHorizontal: SPACING.lg,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: SPACING.sm,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.xl + 60,
    right: SPACING.lg,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});