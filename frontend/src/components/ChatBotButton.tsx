import { MessageCircle } from 'lucide-react';

interface ChatBotButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

export function ChatBotButton({ onClick, isOpen }: ChatBotButtonProps) {
  if (isOpen) return null;

  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-br from-blue-600 to-cyan-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 flex items-center justify-center group"
      aria-label="Open chat"
    >
      <MessageCircle className="w-6 h-6" />
      <span className="absolute bottom-full right-0 mb-2 whitespace-nowrap bg-gray-900 text-white text-sm px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        Chat with us
      </span>
    </button>
  );
}
