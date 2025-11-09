import type { Transaction, LinkedAccount, SavingsData } from '../types';

export const sampleTransactions: Transaction[] = [
  {
    id: '1',
    amount: 1250.00,
    merchant: 'Luxury Fashion Store',
    category: 'Shopping',
    date: '2025-11-08',
    isReckless: true,
    riskScore: 85,
  },
  {
    id: '2',
    amount: 45.50,
    merchant: 'Grocery Mart',
    category: 'Groceries',
    date: '2025-11-07',
    isReckless: false,
    riskScore: 10,
  },
  {
    id: '3',
    amount: 890.00,
    merchant: 'Premium Electronics',
    category: 'Electronics',
    date: '2025-11-06',
    isReckless: true,
    riskScore: 78,
  },
  {
    id: '4',
    amount: 32.00,
    merchant: 'Coffee House',
    category: 'Food & Drink',
    date: '2025-11-05',
    isReckless: false,
    riskScore: 5,
  },
  {
    id: '5',
    amount: 2500.00,
    merchant: 'Online Casino',
    category: 'Entertainment',
    date: '2025-11-04',
    isReckless: true,
    riskScore: 95,
  },
];

export const linkedAccounts: LinkedAccount[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
    hasApproved: false,
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'mchen@email.com',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100',
    hasApproved: true,
  },
];

export const savingsData: SavingsData = {
  totalSaved: 4820.50,
  blockedTransactions: 12,
  warningsPrevented: 28,
  monthsActive: 3,
};
