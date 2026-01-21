import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, SPACING, BORDER_RADIUS, SHADOWS } from '@/constants/theme';
import { Group } from '@/constants/types';

interface GroupCardProps {
  group: Group;
  onPress?: () => void;
}

export const GroupCard: React.FC<GroupCardProps> = ({ group, onPress }) => {
  const isPositiveBalance = group.yourBalance >= 0;
  const balanceColor = isPositiveBalance ? Colors.light.success : Colors.light.danger;

  return (
    <TouchableOpacity
      style={[styles.card, { ...SHADOWS.medium }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.groupName}>{group.name}</Text>
          <View style={styles.badge}>
            <Text style={styles.memberCount}>{group.members.length}</Text>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={1}>
          {group.description || `${group.totalExpenses} expenses`}
        </Text>

        <View style={styles.footer}>
          <View style={styles.infoContainer}>
            <Text style={styles.label}>Total Expenses</Text>
            <Text style={styles.value}>₹{group.totalExpenses * 100}</Text>
          </View>

          <View style={[styles.balanceContainer, { borderLeftColor: balanceColor }]}>
            <Text style={styles.balanceLabel}>
              {isPositiveBalance ? 'You get' : 'You owe'}
            </Text>
            <Text style={[styles.balanceAmount, { color: balanceColor }]}>
              ₹{Math.abs(group.yourBalance)}
            </Text>
          </View>
        </View>

        <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.light.textSecondary} style={styles.chevron} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: BORDER_RADIUS.large,
    marginRight: SPACING.md,
    width: 280,
    overflow: 'hidden',
  },
  container: {
    padding: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
    flex: 1,
  },
  badge: {
    backgroundColor: Colors.light.primary,
    borderRadius: BORDER_RADIUS.small,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  memberCount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  description: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginBottom: SPACING.md,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  infoContainer: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginBottom: SPACING.xs,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  balanceContainer: {
    flex: 1,
    paddingLeft: SPACING.md,
    borderLeftWidth: 2,
  },
  balanceLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginBottom: SPACING.xs,
  },
  balanceAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  chevron: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
  },
});

export default GroupCard;
