import React, { useState } from 'react';
import { View, Text, StyleSheet, SectionList } from 'react-native';
import { Colors, SPACING, BORDER_RADIUS, SHADOWS } from '@/constants/theme';
import { dummyBalances, dummyUsers, dummyUser } from '@/constants/dummy';
import BalanceCard from '@/components/BalanceCard';

export default function BalancesScreen() {
  const [balances] = useState(dummyBalances);

  // Separate balances into "You Owe" and "Owes You"
  const youOwe = balances.filter((b) => b.type === 'owe');
  const oweYou = balances.filter((b) => b.type === 'owed');

  // Calculate totals
  const totalOwe = youOwe.reduce((sum, b) => sum + b.amount, 0);
  const totalOwedToYou = oweYou.reduce((sum, b) => sum + b.amount, 0);
  const netBalance = totalOwedToYou - totalOwe;

  const sections = [
    {
      title: 'Net Balance',
      data: [{ type: 'netBalance', id: 'net-balance' }],
    },
    {
      title: `You Owe (₹${totalOwe})`,
      data: youOwe.length > 0 ? youOwe.map((b) => ({ ...b, type: 'owe' })) : [],
    },
    {
      title: `Owes You (₹${totalOwedToYou})`,
      data: oweYou.length > 0 ? oweYou.map((b) => ({ ...b, type: 'owed' })) : [],
    },
  ];

  const renderItem = ({ item }: any) => {
    if (item.type === 'netBalance') {
      return (
        <View style={[styles.netBalanceCard, { ...SHADOWS.large }]}>
          <Text style={styles.netBalanceLabel}>Total Balance</Text>
          <Text
            style={[
              styles.netBalanceAmount,
              { color: netBalance >= 0 ? Colors.light.success : Colors.light.danger },
            ]}
          >
            ₹{Math.abs(netBalance)}
          </Text>
          <Text style={styles.netBalanceStatus}>
            {netBalance > 0
              ? `You're owed ₹${netBalance}`
              : netBalance < 0
                ? `You owe ₹${Math.abs(netBalance)}`
                : 'All settled up! 🎉'}
          </Text>
        </View>
      );
    }

    if (item.type === 'owe' || item.type === 'owed') {
      const otherUser = dummyUsers.find((u) => u.id === item.otherUserId);
      return (
        <BalanceCard
          balance={item}
          otherUser={otherUser}
          currentUser={dummyUser}
        />
      );
    }

    return null;
  };

  const renderSectionHeader = ({ section }: any) => {
    if (section.title === 'Net Balance') {
      return null;
    }
    if (section.data.length === 0) {
      return null;
    }
    return <Text style={styles.sectionHeader}>{section.title}</Text>;
  };

  const isEmpty = youOwe.length === 0 && oweYou.length === 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Balances</Text>
        <Text style={styles.subtitle}>Manage your expenses with friends</Text>
      </View>

      {isEmpty ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>✨</Text>
          <Text style={styles.emptyStateText}>All settled up!</Text>
          <Text style={styles.emptyStateSubtext}>
            You have no pending balances with anyone
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sections.filter((s) => s.data.length > 0 || s.title === 'Net Balance')}
          keyExtractor={(item, index) => item.id || `${item.type}-${index}`}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          scrollEnabled={true}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
    marginLeft: SPACING.md,
  },
  netBalanceCard: {
    backgroundColor: Colors.light.card,
    borderRadius: BORDER_RADIUS.large,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 2,
    borderColor: Colors.light.primary,
  },
  netBalanceLabel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: SPACING.sm,
    fontWeight: '500',
  },
  netBalanceAmount: {
    fontSize: 42,
    fontWeight: '800',
    marginBottom: SPACING.sm,
  },
  netBalanceStatus: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: SPACING.sm,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
});
