import { useState } from 'react';
import { AlertCircle, Unlock, Loader2 } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useEmergencyFund } from '../hooks/useEmergencyFund';
import api from '../services/api';
import toast from 'react-hot-toast';

interface EmergencyFundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlock: () => void;
}

export function EmergencyFundModal({ isOpen, onClose, onUnlock }: EmergencyFundModalProps) {
  const [input, setInput] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { userId, userCaps } = useUser();
  const { withdrawEmergencyFund } = useEmergencyFund(userId || '');

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!userId) {
      setError('User not authenticated');
      return;
    }

    if (input.toLowerCase() !== 'confirm') {
      setError('Type "confirm" to confirm this is a real emergency.');
      return;
    }

    if (!reason.trim()) {
      setError('Please provide a reason for the emergency fund request.');
      return;
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (userCaps?.emergency_fund && Number(amount) > userCaps.emergency_fund) {
      setError(`Amount cannot exceed available emergency fund of ₹${amount}`);
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      
      // Call the emergency alert endpoint
      await api.post('/api/v1/others/emergency/alert', {
        user_id: userId,
        amount: Number(amount),
        emergency_reason: reason
      });

      // If approved, withdraw the amount and show success toast
      await withdrawEmergencyFund(Number(amount));
        toast.success('Emergency fund request approved!', {
          duration: 4000,
          position: 'top-center',
          style: {
            background: '#4CAF50',
            color: '#fff',
            fontWeight: 'bold',
            padding: '12px 24px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }
        });
        onUnlock();
    } catch (err: any) {
      console.error('Error processing emergency request:', err);
      setError(err.response?.data?.message || 'Failed to process emergency request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-orange-600" />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Emergency Fund Access</h2>
        <p className="text-gray-600 text-center mb-6">
          Your emergency fund will be immediately available. A notification will be sent to your linked accounts about this transaction.
        </p>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6 space-y-4">
          <p className="text-sm text-orange-800">
            <strong>Available Emergency Fund:</strong> ₹{userCaps?.emergency_fund?.toLocaleString('en-IN') || '0'}
          </p>
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Amount (₹)
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              disabled={isSubmitting}
              min="1"
              max={userCaps?.emergency_fund}
            />
          </div>
        </div>

        <div className="space-y-4 mb-4">
          <div>
            <label htmlFor="emergency-confirm" className="block text-sm font-medium text-gray-700 mb-1">
              Type "confirm" to proceed
            </label>
            <input
              id="emergency-confirm"
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setError('');
              }}
              placeholder="Type 'confirm' to proceed"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label htmlFor="emergency-reason" className="block text-sm font-medium text-gray-700 mb-1">
              Purpose of emergency funds
              <span className="text-xs text-gray-500 ml-1">(This will be shared with your linked accounts)</span>
            </label>
            <textarea
              id="emergency-reason"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError('');
              }}
              placeholder="Please describe what you need these funds for..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className={`flex-1 px-4 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
<Unlock className="w-4 h-4" />
                Access Emergency Funds
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
