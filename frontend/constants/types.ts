// Types and interfaces for BillBreak AI

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  upiId?: string;
}

export interface Group {
  id: string;
  name: string;
  members: string[]; // user IDs
  totalExpenses: number;
  yourBalance: number;
  createdAt: string;
  description?: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  date: string;
  category: 'food' | 'transport' | 'entertainment' | 'utilities' | 'shopping' | 'other';
  splitWith: string[];
  groupId: string;
  receipt?: string;
}

export interface Balance {
  id: string;
  userId: string;
  otherUserId: string;
  amount: number;
  type: 'owe' | 'owed'; // 'owe' means userId owes money, 'owed' means otherUserId owes userId
  groupId?: string;
}

export interface Transaction {
  id: string;
  from: string;
  to: string;
  amount: number;
  date: string;
  groupId?: string;
  method: 'upi' | 'cash' | 'bank';
}

export interface CategoryIcon {
  [key: string]: string;
}
