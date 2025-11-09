import { AlertTriangle, CheckCircle } from 'lucide-react';
import type { Transaction } from '../types';
import { useUser } from '../contexts/UserContext';

interface TransactionCardProps {
  transaction: Transaction;
  onProceed?: () => void;
  onCancel?: () => void;
}

export function TransactionCard({ transaction, onProceed, onCancel }: TransactionCardProps) {
  const { userCaps, transactions } = useUser();
  
  // Calculate total spent this month and this week
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const oneWeekAgo = new Date(now);
  oneWeekAgo.setDate(now.getDate() - 7);

  const monthlySpent = transactions
    .filter(tx => {
      const txDate = new Date(tx.date);
      return txDate.getMonth() === currentMonth && 
             txDate.getFullYear() === currentYear;
    })
    .reduce((sum, tx) => sum + (tx.amount || 0), 0);

  const weeklySpent = transactions
    .filter(tx => {
      const txDate = new Date(tx.date);
      return txDate >= oneWeekAgo;
    })
    .reduce((sum, tx) => sum + (tx.amount || 0), 0);

  // Check if caps are exceeded
  const isMonthlyCapExceeded = userCaps?.monthly_income && monthlySpent > userCaps.monthly_income;
  const isWeeklyCapExceeded = userCaps?.weekly_cap && weeklySpent > userCaps.weekly_cap;
  const isAnyCapExceeded = isMonthlyCapExceeded || isWeeklyCapExceeded;
  return (
    <div className={`bg-white rounded-xl shadow-sm border-2 transition-all ₹{
      transaction.isReckless ? 'border-red-200' : 'border-gray-100'
    } p-6 hover:shadow-md`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">
            {transaction.merchant === 'Unknown Merchant' ? transaction.category : transaction.merchant}
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            {transaction.date ? new Date(transaction.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }) : 'Date not available'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">₹{transaction.amount.toFixed(2)}</p>
        </div>
      </div>

      {transaction.isReckless && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-red-900 mb-1">Reckless Transaction Detected</h4>
              <p className="text-xs text-red-700">
                This transaction appears unusual based on your spending patterns.
              </p>
              {!isAnyCapExceeded && (
                <p className="text-xs text-red-600 mt-2 font-medium">
                  Continued reckless spending may result in payment flow restrictions.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {!transaction.isReckless && (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm font-medium">Normal transaction</span>
        </div>
      )}

      {transaction.isReckless && onProceed && onCancel && (
        <div className="flex gap-3 mt-4">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onProceed}
            className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            Proceed Anyway
          </button>
        </div>
      )}
    </div>
  );
}
