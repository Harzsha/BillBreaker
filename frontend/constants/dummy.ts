// Dummy data for testing without backend
import { Group, Expense, Balance, User } from './types';

export const dummyUser: User = {
  id: 'user-1',
  name: 'You',
  email: 'user@example.com',
  avatar: 'https://i.pravatar.cc/150?img=1',
  upiId: 'you@upi',
};

export const dummyUsers: User[] = [
  { id: 'user-1', name: 'You', email: 'you@example.com', avatar: 'https://i.pravatar.cc/150?img=1' },
  { id: 'user-2', name: 'Raj', email: 'raj@example.com', avatar: 'https://i.pravatar.cc/150?img=2' },
  { id: 'user-3', name: 'Priya', email: 'priya@example.com', avatar: 'https://i.pravatar.cc/150?img=3' },
  { id: 'user-4', name: 'Amit', email: 'amit@example.com', avatar: 'https://i.pravatar.cc/150?img=4' },
  { id: 'user-5', name: 'Sara', email: 'sara@example.com', avatar: 'https://i.pravatar.cc/150?img=5' },
];

export const dummyGroups: Group[] = [
  {
    id: '1',
    name: 'Roommates',
    members: ['user-1', 'user-2', 'user-3'],
    totalExpenses: 5,
    yourBalance: -150,
    createdAt: '2025-12-01',
    description: 'Shared apartment expenses',
  },
  {
    id: '2',
    name: 'Trip to Goa',
    members: ['user-1', 'user-2', 'user-3', 'user-4', 'user-5'],
    totalExpenses: 12,
    yourBalance: 320,
    createdAt: '2026-01-10',
    description: 'New Year vacation expenses',
  },
  {
    id: '3',
    name: 'Office Lunch Club',
    members: ['user-1', 'user-2', 'user-4'],
    totalExpenses: 8,
    yourBalance: 45,
    createdAt: '2025-11-15',
    description: 'Weekly lunch expenses',
  },
];

export const dummyExpenses: Expense[] = [
  {
    id: '1',
    description: 'Lunch at restaurant',
    amount: 500,
    paidBy: 'You',
    date: '2026-01-20',
    category: 'food',
    splitWith: ['user-2', 'user-3'],
    groupId: '1',
  },
  {
    id: '2',
    description: 'Uber ride',
    amount: 150,
    paidBy: 'user-2',
    date: '2026-01-19',
    category: 'transport',
    splitWith: ['user-1', 'user-3'],
    groupId: '1',
  },
  {
    id: '3',
    description: 'Movie tickets',
    amount: 600,
    paidBy: 'You',
    date: '2026-01-18',
    category: 'entertainment',
    splitWith: ['user-2', 'user-3'],
    groupId: '1',
  },
  {
    id: '4',
    description: 'Hotel booking',
    amount: 8000,
    paidBy: 'user-2',
    date: '2026-01-15',
    category: 'utilities',
    splitWith: ['user-1', 'user-3', 'user-4', 'user-5'],
    groupId: '2',
  },
  {
    id: '5',
    description: 'Beach activities',
    amount: 2000,
    paidBy: 'You',
    date: '2026-01-14',
    category: 'entertainment',
    splitWith: ['user-2', 'user-3', 'user-4'],
    groupId: '2',
  },
];

export const dummyBalances: Balance[] = [
  {
    id: '1',
    userId: 'user-1',
    otherUserId: 'user-2',
    amount: 200,
    type: 'owe',
    groupId: '1',
  },
  {
    id: '2',
    userId: 'user-1',
    otherUserId: 'user-3',
    amount: 150,
    type: 'owed',
    groupId: '1',
  },
  {
    id: '3',
    userId: 'user-1',
    otherUserId: 'user-4',
    amount: 400,
    type: 'owed',
    groupId: '2',
  },
];

export const CATEGORY_ICONS: { [key: string]: string } = {
  food: '🍽️',
  transport: '🚗',
  entertainment: '🎬',
  utilities: '💡',
  shopping: '🛍️',
  other: '📌',
};

export const CATEGORY_COLORS: { [key: string]: string } = {
  food: '#FF6B6B',
  transport: '#4ECDC4',
  entertainment: '#FFE66D',
  utilities: '#95E1D3',
  shopping: '#F38181',
  other: '#CCCCCC',
};
