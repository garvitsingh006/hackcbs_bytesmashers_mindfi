export interface Transaction {
  id: string;
  amount: number;
  merchant: string;
  category: string;
  date: string;
  isReckless: boolean;
  riskScore: number;
}

export interface LinkedAccount {
  id: string;
  name: string;
  email: string;
  avatar: string;
  hasApproved: boolean;
}

export interface SavingsData {
  totalSaved: number;
  blockedTransactions: number;
  warningsPrevented: number;
  monthsActive: number;
}
