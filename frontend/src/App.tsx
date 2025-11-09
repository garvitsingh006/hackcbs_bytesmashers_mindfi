import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Header } from './components/Header';
import { EmergencyFundModal } from './components/EmergencyFundModal';
import { ChatBot } from './components/ChatBot';
import SpendingChartStatic  from './components/SpendingChart';
import { useUser } from './contexts/UserContext';
import api from './services/api';

function App() {
  const {
    transactions,
    loading,
    error,
    userCaps,
    fetchTransactions,
    userId
  } = useUser();

  const [categoryCaps, setCategoryCaps] = useState<{ category_caps?: Record<string, number> } | null>(null);
  const monthsActive = 3;
  const [showChatbot, setShowChatbot] = useState(false);
  const toggleChatbot = () => setShowChatbot(!showChatbot);

  useEffect(() => {
    const fetchCategoryCaps = async () => {
      if (!userId) return;

      try {
        const response = await api.get(`/api/v1/users/caps/${userId}`);
        const capsData = response.data?.data;

        if (capsData?.category_caps) {
          setCategoryCaps(capsData);
        } else {
          setCategoryCaps({ category_caps: {} });
        }
      } catch (error) {
        console.error('Error fetching category caps:', error);
      }
    };

    fetchCategoryCaps();
  }, [userId]);

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

  const emergencyFunds = userCaps?.monthly_income ? userCaps.monthly_income * 2 : 0;
  if (userCaps && !userCaps.emergency_fund && userCaps.monthly_income) {
    userCaps.emergency_fund = emergencyFunds;
  }

  const isMonthlyCapExceeded = userCaps?.monthly_income && monthlySpent > userCaps.monthly_income;
  const isWeeklyCapExceeded = userCaps?.weekly_cap && weeklySpent > userCaps.weekly_cap;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const [isEmergencyFundOpen, setIsEmergencyFundOpen] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [transactionData, setTransactionData] = useState({
    timestamp: new Date().toISOString(),
    category: '',
    amount: 0,
    is_reckless: false
  });

  const formatTimestamp = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const handleTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!transactionData.category) {
      toast.error('Please select a category');
      return;
    }

    if (!transactionData.amount || Number(transactionData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const loadingToast = toast.loading('Adding transaction...');

    try {
      const now = new Date();
      const timestamp = formatTimestamp(now);

      const transactionPayload = {
        user_id: 'U001',
        amount: Number(transactionData.amount),
        timestamp: timestamp,
        category: transactionData.category,
        is_reckless: false,
        transaction_id: `tx_${Date.now()}`,
        type: 'expense'
      };

      await api.put('/api/v1/others/classify', transactionPayload);

      toast.dismiss(loadingToast);
      toast.success('Transaction added successfully!');

      setShowTransactionForm(false);

      setTransactionData({
        timestamp: '',
        category: '',
        amount: 0,
        is_reckless: false
      });

      if (fetchTransactions) {
        await fetchTransactions(userId || 'U001');
      }

      return;

    } catch (error) {
      console.error('Error adding transaction:', error);
      toast.error('Failed to add transaction. Please try again.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTransactionData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    }));
  };

  const recklessCount = transactions.filter(t => t.is_reckless).length;

  const handleEmergencyUnlock = () => {
    setTimeout(() => {
      setIsEmergencyFundOpen(false);
    }, 2000);
  };

  const parseCategoryCaps = (): Array<[string, number]> => {
    if (!categoryCaps?.category_caps) return [];

    try {
      const caps: any = categoryCaps.category_caps;
      let parsedCaps: Record<string, number> = {};

      if (caps instanceof Map) {
        parsedCaps = Object.fromEntries(caps);
      } else if (typeof caps === 'string') {
        parsedCaps = JSON.parse(caps.trim());
      } else if (typeof caps === 'object' && caps !== null) {
        parsedCaps = { ...caps };
      }

      return Object.entries(parsedCaps)
        .filter(([, amount]) => amount !== undefined && amount !== null)
        .map(([category, amount]) => [String(category), Number(amount) || 0]);
    } catch (error) {
      console.error('Error parsing category caps:', error);
      return [];
    }
  };

  const categoryCapsList = parseCategoryCaps();

  return (
    <div className="min-h-screen bg-gray-900" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Header
        onOpenChatbot={toggleChatbot}
        onOpenEmergencyFund={() => setIsEmergencyFundOpen(true)}
        monthsActive={monthsActive}
      />

      <ChatBot isOpen={showChatbot} onClose={toggleChatbot} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <div className="text-sm text-gray-400 mb-2" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                  Account Balance
                </div>
                <div className="text-4xl font-semibold text-white mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {userCaps?.balance !== undefined ? formatCurrency(userCaps.balance) : '₹0'}
                </div>
                <button
                  onClick={() => setShowTransactionForm(!showTransactionForm)}
                  className="w-full mt-2 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                  style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
                >
                  {showTransactionForm ? 'Cancel' : 'Add Transaction'}
                </button>
              </div>

              <div className="lg:col-span-2 bg-gray-800 rounded-xl border border-gray-700 p-6">
                <div className="text-sm text-gray-400 mb-2" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                  Analytics
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      <span className="text-xs text-gray-400" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>Total Value</span>
                    </div>
                    <div className="text-2xl font-semibold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {formatCurrency(monthlySpent)}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-xs text-gray-400" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>Volume</span>
                    </div>
                    <div className="text-2xl font-semibold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {transactions.length}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <span className="text-xs text-gray-400" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>Reckless</span>
                    </div>
                    <div className="text-2xl font-semibold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {recklessCount}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {showTransactionForm && (
              <form onSubmit={handleTransactionSubmit} className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-6">
                <h3 className="text-lg font-semibold text-white mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>Add New Transaction</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Amount (₹)</label>
                    <input
                      type="number"
                      name="amount"
                      value={transactionData.amount}
                      onChange={handleInputChange}
                      className="w-full p-2.5 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required
                      min="0"
                      step="0.01"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Category</label>
                    <select
                      name="category"
                      value={transactionData.category}
                      onChange={handleInputChange}
                      className="w-full p-2.5 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      <option value="">Select a category</option>
                      <option value="Food">Food</option>
                      <option value="Shopping">Shopping</option>
                      <option value="Transportation">Transportation</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Bills">Bills</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
                >
                  Add Transaction
                </button>
              </form>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <h3 className="text-sm font-medium text-gray-400 mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>Spending vs Caps</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-300" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>Monthly Spending</span>
                      <span className={`text-sm font-semibold ${isMonthlyCapExceeded ? 'text-red-600' : 'text-white'}`} style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {formatCurrency(monthlySpent)} / {formatCurrency(userCaps?.monthly_income || 0)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${isMonthlyCapExceeded ? 'bg-red-500' : 'bg-blue-500'}`}
                        style={{ width: `${Math.min((monthlySpent / (userCaps?.monthly_income || 1)) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-300" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>Weekly Spending</span>
                      <span className={`text-sm font-semibold ${isWeeklyCapExceeded ? 'text-red-600' : 'text-white'}`} style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {formatCurrency(weeklySpent)} / {formatCurrency(userCaps?.weekly_cap || 0)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${isWeeklyCapExceeded ? 'bg-red-500' : 'bg-green-500'}`}
                        style={{ width: `${Math.min((weeklySpent / (userCaps?.weekly_cap || 1)) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <h3 className="text-sm font-medium text-gray-400 mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>Category Caps</h3>
                <div className="space-y-3">
                  {categoryCapsList.length > 0 ? (
                    categoryCapsList.map(([category, limit]) => (
                      <div key={category} className="flex items-center justify-between">
                        <span className="text-sm text-gray-300" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>{category}</span>
                        <span className="text-sm font-semibold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {formatCurrency(limit)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>No category caps set</p>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <SpendingChartStatic />
            </div>

            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-700">
                <h3 className="text-lg font-semibold text-white" style={{ fontFamily: 'Inter, sans-serif' }}>Recent Transactions</h3>
              </div>

              {transactions.length === 0 ? (
                <div className="p-8 text-center text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                  No transactions found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-700 border-b border-gray-600">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>
                          Merchant
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                      {transactions.map((transaction) => (
                        <tr key={transaction.transaction_id} className="hover:bg-gray-700 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {transaction.date ? new Date(transaction.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            }) : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                            {transaction.category}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {transaction.merchant || 'Unknown'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {formatCurrency(transaction.amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {transaction.is_reckless ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                                Reckless
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                                Normal
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <EmergencyFundModal
        isOpen={isEmergencyFundOpen}
        onClose={() => setIsEmergencyFundOpen(false)}
        onUnlock={handleEmergencyUnlock}
      />
    </div>
  );
}

export default App;
