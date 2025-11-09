import { Shield, MessageCircle, AlertCircle } from 'lucide-react';

interface HeaderProps {
  onOpenChatbot: () => void;
  onOpenEmergencyFund: () => void;
  monthsActive: number;
}

export function Header({ onOpenChatbot, onOpenEmergencyFund, monthsActive }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">SafeSpend</h1>
              <p className="text-xs text-gray-500">Smart Financial Protection</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenEmergencyFund}
              className="px-4 py-2 bg-orange-50 text-orange-700 rounded-lg font-medium hover:bg-orange-100 transition-colors flex items-center gap-2 border border-orange-200"
            >
              <AlertCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Emergency Fund</span>
            </button>

            <button
              onClick={onOpenChatbot}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
              title="Chat with AI Assistant"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">AI Assistant</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
