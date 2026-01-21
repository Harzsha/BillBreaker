import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SectionList,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, SPACING, BORDER_RADIUS, SHADOWS } from '@/constants/theme';
import { dummyGroups, dummyExpenses, dummyUsers } from '@/constants/dummy';
import ExpenseCard from '@/components/ExpenseCard';

export default function GroupDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  
  const group = dummyGroups.find((g) => g.id === id);
  const groupExpenses = dummyExpenses.filter((e) => e.groupId === id);
  const groupMembers = dummyUsers.filter((u) => group?.members.includes(u.id));

  if (!group) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.light.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Group not found</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>
    );
  }

  const sections = [
    {
      title: 'Overview',
      data: [{ type: 'overview', id: 'overview' }],
    },
    {
      title: 'Members',
      data: [{ type: 'members', id: 'members' }],
    },
    {
      title: 'Expenses',
      data: groupExpenses.length > 0 
        ? groupExpenses.map((e) => ({ ...e, type: 'expense' })) 
        : [{ type: 'emptyExpenses', id: 'empty-expenses' }],
    },
  ];

  const renderItem = ({ item }: any) => {
    if (item.type === 'overview') {
      return (
        <View style={[styles.overviewCard, { ...SHADOWS.medium }]}>
          <View style={styles.overviewRow}>
            <View>
              <Text style={styles.overviewLabel}>Total Expenses</Text>
              <Text style={styles.overviewValue}>₹{group.totalExpenses * 100}</Text>
            </View>
            <View>
              <Text style={styles.overviewLabel}>Your Balance</Text>
              <Text
                style={[
                  styles.overviewValue,
                  {
                    color:
                      group.yourBalance >= 0
                        ? Colors.light.success
                        : Colors.light.danger,
                  },
                ]}
              >
                ₹{Math.abs(group.yourBalance)}
              </Text>
            </View>
            <View>
              <Text style={styles.overviewLabel}>Members</Text>
              <Text style={styles.overviewValue}>{group.members.length}</Text>
            </View>
          </View>
        </View>
      );
    }

    if (item.type === 'members') {
      return (
        <View style={styles.membersContainer}>
          {groupMembers.map((member) => (
            <View key={member.id} style={styles.memberItem}>
              <Image
                source={{ uri: member.avatar }}
                style={styles.memberAvatar}
                contentFit="cover"
              />
              <Text style={styles.memberName}>{member.name}</Text>
            </View>
          ))}
        </View>
      );
    }

    if (item.type === 'expense') {
      return <ExpenseCard expense={item} onPress={() => {}} />;
    }

    if (item.type === 'emptyExpenses') {
      return (
        <View style={styles.emptyExpenses}>
          <Text style={styles.emptyExpensesText}>No expenses yet</Text>
        </View>
      );
    }

    return null;
  };

  const renderSectionHeader = ({ section }: any) => (
    <Text style={styles.sectionHeader}>{section.title}</Text>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.title}>{group.name}</Text>
        <TouchableOpacity onPress={() => router.push('./add')}>
          <MaterialCommunityIcons name="plus" size={24} color={Colors.light.primary} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <SectionList
        sections={sections}
        keyExtractor={(item, index) => item.id || `${item.type}-${index}`}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        scrollEnabled={true}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
    marginLeft: SPACING.md,
  },
  overviewCard: {
    backgroundColor: Colors.light.card,
    borderRadius: BORDER_RADIUS.large,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  overviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  overviewLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginBottom: SPACING.sm,
    fontWeight: '500',
  },
  overviewValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
  },
  membersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  memberItem: {
    alignItems: 'center',
    width: '33%',
  },
  memberAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: SPACING.sm,
  },
  memberName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.text,
    textAlign: 'center',
  },
  emptyExpenses: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  emptyExpensesText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
});
