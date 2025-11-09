import { useState } from 'react';
import { X, TrendingUp, ShieldCheck, AlertTriangle, DollarSign } from 'lucide-react';
import type { SavingsData } from '../types';

interface SavingsChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  savingsData: SavingsData;
}

export function SavingsChatbot({ isOpen, onClose, savingsData }: SavingsChatbotProps) {
  const [messages] = useState([
    {
      type: 'bot',
      text: `Hi! You've been with us for ${savingsData.monthsActive} months now. Let me share your financial safety achievements!`,
    },
    {
      type: 'bot',
      text: `You've saved a total of $${savingsData.totalSaved.toFixed(2)} thanks to our intervention system.`,
    },
    {
      type: 'bot',
      text: `We've blocked ${savingsData.blockedTransactions} potentially harmful transactions and provided ${savingsData.warningsPrevented} warnings that helped you make better decisions.`,
    },
    {
      type: 'bot',
      text: `Keep up the great work! Your financial health is improving every day. 💪`,
    },
  ]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Your Financial Safety Report</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
              <DollarSign className="w-8 h-8 text-green-600 mb-2" />
              <p className="text-sm text-green-700 font-medium">Total Saved</p>
              <p className="text-2xl font-bold text-green-900">${savingsData.totalSaved.toFixed(2)}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
              <ShieldCheck className="w-8 h-8 text-blue-600 mb-2" />
              <p className="text-sm text-blue-700 font-medium">Blocked Transactions</p>
              <p className="text-2xl font-bold text-blue-900">{savingsData.blockedTransactions}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-200">
              <AlertTriangle className="w-8 h-8 text-orange-600 mb-2" />
              <p className="text-sm text-orange-700 font-medium">Warnings Given</p>
              <p className="text-2xl font-bold text-orange-900">{savingsData.warningsPrevented}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
              <TrendingUp className="w-8 h-8 text-purple-600 mb-2" />
              <p className="text-sm text-purple-700 font-medium">Months Active</p>
              <p className="text-2xl font-bold text-purple-900">{savingsData.monthsActive}</p>
            </div>
          </div>

          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.type === 'bot' ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.type === 'bot'
                      ? 'bg-gray-100 text-gray-900'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
