import { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useUser } from '../contexts/UserContext';
import { userService } from '../services/userService';

interface PMSInvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
}

export function PMSInvestmentModal({ isOpen, onClose, currentBalance }: PMSInvestmentModalProps) {
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addTransaction, userId } = useUser();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const investmentAmount = parseFloat(amount);
    
    if (isNaN(investmentAmount) || investmentAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsSubmitting(true);
    try {
      // First, make the PMS investment API call
      const result = await userService.investInPMS('U001', investmentAmount);
      
      // Then add the transaction to local state
      await addTransaction({
        transaction_id: `pms-${Date.now()}`,
        timestamp: new Date(),
        type: 'investment',
        category: 'PMS Investment',
        amount: -Math.abs(investmentAmount),
        is_reckless: false
      });
      
      toast.success(result.message || 'Funds invested successfully!');
      setAmount('');
      onClose();
    } catch (error: any) {
      console.error('Error processing investment:', error);
      toast.error(error.response?.data?.message || 'Failed to process investment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Invest in PMS</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Investment Amount (INR)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter amount"
              min="1"
              step="0.01"
              disabled={isSubmitting}
              required
            />
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Invest'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
