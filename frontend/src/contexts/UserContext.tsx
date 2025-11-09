import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { userService } from '../services/userService';
import type { UserCaps } from '../services/userService';

interface UserContextType {
  userId: string | null;
  userCaps: UserCaps | null;
  transactions: any[];
  loading: boolean;
  error: string | null;
  fetchUserCaps: (userId: string) => Promise<void>;
  updateUserCaps: (userId: string, data: UserCaps) => Promise<void>;
  fetchTransactions: (userId: string) => Promise<void>;
  refreshTransactions: () => Promise<void>;
  addTransaction: (transactionData: {
    transaction_id: string;
    timestamp: Date;
    type: string;
    category: string;
    amount: number;
    is_reckless: boolean;
  }) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const userId = 'U001'; // Hardcoded user ID
  // Removed unused setUserId state setter
  const [userCaps, setUserCaps] = useState<UserCaps | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      if (userId) {
        await Promise.all([
          fetchUserCaps(userId),
          fetchTransactions(userId)
        ]);
      }
    };
    
    fetchUserData();
  }, [userId]);

  const fetchUserCaps = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const caps = await userService.getCaps(userId);
      setUserCaps(caps);
    } catch (err) {
      setError('Failed to fetch user data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateUserCaps = async (userId: string, data: UserCaps) => {
    setLoading(true);
    setError(null);
    try {
      const updatedCaps = await userService.updateIncomeAndCaps(userId, data);
      setUserCaps(updatedCaps);
    } catch (err) {
      setError('Failed to update user data');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getTransactions(userId);
      // Transform the data to match the expected format
      const formattedTransactions = data.map((tx: any) => ({
        ...tx,
        // Convert snake_case to camelCase for React component
        isReckless: tx.is_reckless,
        // Ensure date is in a valid format
        date: tx.date ? new Date(tx.date).toISOString() : new Date().toISOString(),
        // Add merchant if missing
        merchant: tx.merchant || 'Unknown Merchant',
        // Ensure amount is a number
        amount: Number(tx.amount) || 0,
        // Add riskScore if missing
        riskScore: tx.riskScore || 0
      }));
      setTransactions(formattedTransactions);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async (transactionData: any) => {
    setLoading(true);
    setError(null);
    try {
      await userService.addTransaction({
        ...transactionData,
        user_id: userId
      });
      await fetchTransactions(userId);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add transaction');
      console.error(err);
      throw err; // Re-throw the error to handle it in the component
    } finally {
      setLoading(false);
    }
  };

  const refreshTransactions = async () => {
    if (userId) {
      await fetchTransactions(userId);
    }
  };

  return (
    <UserContext.Provider
      value={{
        userId,
        userCaps,
        transactions,
        loading,
        error,
        fetchUserCaps,
        updateUserCaps,
        fetchTransactions,
        addTransaction,
        refreshTransactions,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
