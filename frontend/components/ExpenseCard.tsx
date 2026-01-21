import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, SPACING, BORDER_RADIUS, SHADOWS } from '@/constants/theme';
import { CATEGORY_ICONS, CATEGORY_COLORS } from '@/constants/dummy';
import { Expense } from '@/constants/types';

interface ExpenseCardProps {
  expense: Expense;
  onDelete?: (id: string) => void;
  onPress?: () => void;
  paidByName?: string;
  splitWithNames?: string[];
}

export const ExpenseCard: React.FC<ExpenseCardProps> = ({
  expense,
  onDelete,
  onPress,
  paidByName = expense.paidBy,
  splitWithNames = expense.splitWith,
}) => {
  const [deleteProgress] = useState(new Animated.Value(0));

  const handleDelete = () => {
    Alert.alert('Delete Expense', 'Are you sure you want to delete this expense?', [
      { text: 'Cancel', onPress: () => {}, style: 'cancel' },
      {
        text: 'Delete',
        onPress: () => {
          if (onDelete) {
            Animated.timing(deleteProgress, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }).start(() => onDelete(expense.id));
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const categoryColor = CATEGORY_COLORS[expense.category] || '#CCCCCC';

  return (
    <TouchableOpacity
      style={[styles.card, { ...SHADOWS.medium }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.container}>
        <View style={[styles.categoryIcon, { backgroundColor: categoryColor }]}>
          <Text style={styles.icon}>{CATEGORY_ICONS[expense.category]}</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.description} numberOfLines={1}>
            {expense.description}
          </Text>
          <Text style={styles.paidBy}>paid by {paidByName}</Text>
          <View style={styles.splitContainer}>
            <Text style={styles.splitLabel}>with {splitWithNames.length} people</Text>
          </View>
        </View>

        <View style={styles.amountContainer}>
          <Text style={styles.amount}>₹{expense.amount}</Text>
          <Text style={styles.date}>
            {new Date(expense.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Text>
        </View>

        {onDelete && (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <MaterialCommunityIcons name="trash-can" size={18} color="#FF3B30" />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: BORDER_RADIUS.large,
    marginVertical: SPACING.sm,
    marginHorizontal: SPACING.md,
    overflow: 'hidden',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: BORDER_RADIUS.medium,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  icon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: SPACING.xs,
  },
  paidBy: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginBottom: SPACING.xs,
  },
  splitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  splitLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontStyle: 'italic',
  },
  amountContainer: {
    alignItems: 'flex-end',
    marginRight: SPACING.md,
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.primary,
    marginBottom: SPACING.xs,
  },
  date: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  deleteButton: {
    padding: SPACING.sm,
  },
});

export default ExpenseCard;
