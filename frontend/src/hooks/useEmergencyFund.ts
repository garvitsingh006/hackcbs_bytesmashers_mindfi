import { useState } from 'react';

export const useEmergencyFund = (userId: string) => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handles emergency fund withdrawal
   * @param amount The amount to withdraw from the emergency fund
   * @returns Promise<boolean> True if successful, false otherwise
   */
  const withdrawEmergencyFund = async (amount: number): Promise<boolean> => {
    if (!userId) {
      setError('User ID is required');
      return false;
    }

    if (amount <= 0) {
      setError('Withdrawal amount must be greater than 0');
      return false;
    }

    setSaving(true);
    setError(null);

    try {
      // In a real app, this would be an API call to update the emergency fund
      // For now, we'll simulate the API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log(`Withdrew $${amount} from emergency fund for user ${userId}`);
      return true;
    } catch (err) {
      console.error('Error withdrawing from emergency fund:', err);
      setError('Failed to process emergency fund withdrawal');
      return false;
    } finally {
      setSaving(false);
    }
  };

  /**
   * Handles depositing to emergency fund
   * @param amount The amount to deposit to the emergency fund
   * @returns Promise<boolean> True if successful, false otherwise
   */
  const depositToEmergencyFund = async (amount: number): Promise<boolean> => {
    if (!userId) {
      setError('User ID is required');
      return false;
    }

    if (amount <= 0) {
      setError('Deposit amount must be greater than 0');
      return false;
    }

    setSaving(true);
    setError(null);

    try {
      // In a real app, this would be an API call to update the emergency fund
      // For now, we'll simulate the API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log(`Deposited $${amount} to emergency fund for user ${userId}`);
      return true;
    } catch (err) {
      console.error('Error depositing to emergency fund:', err);
      setError('Failed to process emergency fund deposit');
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    withdrawEmergencyFund,
    depositToEmergencyFund,
    saving,
    error,
  };
};
