import { ShieldAlert } from 'lucide-react';
import type { LinkedAccount } from '../types';

interface PaymentBlockedModalProps {
  isOpen: boolean;
  onClose: () => void;
  linkedAccounts: LinkedAccount[];
}

export function PaymentBlockedModal({ isOpen, onClose, linkedAccounts }: PaymentBlockedModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
          <ShieldAlert className="w-8 h-8 text-red-600" />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Payment Flow Blocked</h2>
        <p className="text-gray-600 text-center mb-6">
          Due to multiple reckless transactions, your payment flow has been temporarily restricted for your financial safety.
        </p>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Request Approval from Linked Accounts</h3>
          <div className="space-y-3">
            {linkedAccounts.map((account) => (
              <div key={account.id} className="flex items-center justify-between bg-white rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <img
                    src={account.avatar}
                    alt={account.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{account.name}</p>
                    <p className="text-xs text-gray-500">{account.email}</p>
                  </div>
                </div>
                {account.hasApproved ? (
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
                    Approved
                  </span>
                ) : (
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    Pending
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full px-4 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
        >
          I Understand
        </button>
      </div>
    </div>
  );
}
