import { MessageCircle, AlertCircle, User, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { PMSInvestmentModal } from './PMSInvestmentModal';
import { useUser } from '../contexts/UserContext';

interface HeaderProps {
  onOpenChatbot: () => void;
  onOpenEmergencyFund: () => void;
  monthsActive: number;
}

export function Header({ onOpenChatbot, onOpenEmergencyFund }: HeaderProps) {
  const [isPMSModalOpen, setIsPMSModalOpen] = useState(false);
  const { userCaps } = useUser();
  
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-gray-900" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
              MindFi Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 rounded-md border border-red-200">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-sm text-red-700" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>Test Mode</span>
            </div>

            <button
              onClick={onOpenEmergencyFund}
              className="px-4 py-2 text-sm bg-white text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 border border-gray-200"
              style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
            >
              <AlertCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Emergency Fund</span>
            </button>

            <button
              onClick={() => setIsPMSModalOpen(true)}
              className="px-4 py-2 text-sm bg-white text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 border border-gray-200"
              style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
              title="Invest in PMS"
            >
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Invest in PMS</span>
            </button>

            <button
              onClick={onOpenChatbot}
              className="px-4 py-2 text-sm bg-white text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 border border-gray-200"
              title="Chat with AI Assistant"
              style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">AI Assistant</span>
            </button>

            <button className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
              <User className="w-5 h-5 text-gray-600" />
            </button>
            
            <PMSInvestmentModal 
              isOpen={isPMSModalOpen}
              onClose={() => setIsPMSModalOpen(false)}
              currentBalance={userCaps?.monthly_income || 0}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
