import { useMemo } from 'react';
import type { Transaction } from '../types';

interface SpendingChartProps {
  transactions: Transaction[];
}

export function SpendingChart({ transactions }: SpendingChartProps) {
  const chartData = useMemo(() => {
    const dailySpending = new Map<string, { total: number; hasReckless: boolean }>();

    transactions.forEach(tx => {
      const date = new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const existing = dailySpending.get(date) || { total: 0, hasReckless: false };
      dailySpending.set(date, {
        total: existing.total + tx.amount,
        hasReckless: existing.hasReckless || tx.isReckless
      });
    });

    const sortedEntries = Array.from(dailySpending.entries())
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .slice(-30);

    const maxValue = Math.max(...sortedEntries.map(([, data]) => data.total), 1);

    return sortedEntries.map(([date, data]) => ({
      date,
      amount: data.total,
      percentage: (data.total / maxValue) * 100,
      isReckless: data.hasReckless
    }));
  }, [transactions]);

  const maxAmount = Math.max(...chartData.map(d => d.amount), 1);

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
          Transactions Value
        </h3>
        <div className="flex gap-2">
          <button className="px-3 py-1 text-sm text-gray-400 hover:bg-gray-700 rounded-md transition-colors" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
            Daily
          </button>
          <button className="px-3 py-1 text-sm text-gray-400 hover:bg-gray-700 rounded-md transition-colors" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
            Weekly
          </button>
          <button className="px-4 py-1 text-sm bg-white text-gray-900 rounded-md" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
            Monthly
          </button>
        </div>
      </div>

      <div className="relative h-64">
        <div className="absolute inset-0 flex items-end justify-between gap-1">
          {chartData.map((data, index) => (
            <div key={index} className="flex-1 flex flex-col items-center group">
              <div className="w-full flex items-end justify-center h-full pb-8">
                <div
                  className={`w-full transition-all duration-300 relative ${
                    data.isReckless
                      ? 'bg-gradient-to-t from-red-400 to-red-300'
                      : 'bg-gradient-to-t from-orange-200 to-orange-100'
                  } rounded-t-sm hover:opacity-80 cursor-pointer`}
                  style={{ height: `${data.percentage}%` }}
                >
                  {data.isReckless && (
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
              <span className="text-xs text-gray-400 mt-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                {data.date}
              </span>
              <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bg-white text-gray-900 text-xs rounded px-2 py-1 -top-8 whitespace-nowrap" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500 }}>
                ₹{data.amount.toLocaleString('en-IN')}
              </div>
            </div>
          ))}
        </div>

        <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>
          <span>₹{maxAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
          <span>₹{(maxAmount * 0.75).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
          <span>₹{(maxAmount * 0.5).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
          <span>₹{(maxAmount * 0.25).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
          <span>0</span>
        </div>
      </div>

      <div className="flex items-center gap-4 mt-4 text-xs text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gradient-to-t from-orange-200 to-orange-100 rounded"></div>
          <span>Normal Spending</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gradient-to-t from-red-400 to-red-300 rounded"></div>
          <span>Reckless Spending</span>
        </div>
      </div>
    </div>
  );
}
