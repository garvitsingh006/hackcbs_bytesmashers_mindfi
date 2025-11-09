import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'orange' | 'red';
  onViewTips?: () => void;
}

const colorClasses = {
  blue: 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 text-blue-600',
  green: 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 text-green-600',
  orange: 'bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 text-orange-600',
  red: 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200 text-red-600',
};

export function StatsCard({ title, value, icon: Icon, color, onViewTips }: StatsCardProps) {
  return (
    <div className={`${colorClasses[color]} rounded-xl p-6 border transition-all hover:shadow-md`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium opacity-80 mb-1">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          {onViewTips && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewTips();
              }}
              className="mt-2 text-xs font-medium text-blue-600 hover:underline flex items-center gap-1"
            >
              <span>View Budget Tips</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-up-right">
                <path d="M7 7h10v10"/>
                <path d="M7 17 17 7"/>
              </svg>
            </button>
          )}
        </div>
        <div className="p-3 bg-white bg-opacity-50 rounded-lg">
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
