import api from './api';

export interface UserCaps {
  monthly_income?: number;
  weekly_cap?: number;
  max_single_spend?: number;
  category_caps?: Record<string, number>;
  emergency_fund?: number;
  balance?: number;
}

export interface Transaction {
  transaction_id: string;
  user_id: string;
  timestamp: Date | string;
  type?: string;  // Made optional
  category: string;
  amount: number;
  is_reckless: boolean;
}

export const userService = {
  // Get user's spending caps and income
  getCaps: async (userId: string): Promise<UserCaps> => {
    try {
      const response = await api.get(`/api/v1/users/caps/${userId}`);
      console.log('getCaps response:', response.data.data);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching user caps:', error);
      throw error;
    }
  },

  // Update user's income and caps
  updateIncomeAndCaps: async (userId: string, data: UserCaps): Promise<UserCaps> => {
    try {
      const response = await api.put('/api/v1/users/caps', { user_id: userId, ...data });
      return response.data.data;
    } catch (error) {
      console.error('Error updating user caps:', error);
      throw error;
    }
  },

  // Get user's transactions
  getTransactions: async (userId: string): Promise<Transaction[]> => {
    try {
      const response = await api.get(`/api/v1/transactions/get/${userId}`);
      return response.data.data.transactions;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  },

  // Add a new transaction
  addTransaction: async (transactionData: Omit<Transaction, 'transaction_id'>): Promise<Transaction> => {
    try {
      const response = await api.put('/api/v1/others/classify', transactionData);
      return response.data.data;
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  },

  // Upload transactions via CSV
  uploadTransactions: async (file: File): Promise<{ count: number }> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/api/v1/transactions/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data.data;
    } catch (error) {
      console.error('Error uploading transactions:', error);
      throw error;
    }
  },

  // Invest in PMS
  investInPMS: async (userId: string, amount: number) => {
    try {
      const response = await api.post('/api/v1/others/pms/invest', {
        user_id: userId,
        amount: amount
      });
      return response.data.data;
    } catch (error) {
      console.error('Error investing in PMS:', error);
      throw error;
    }
  }
};
