import { useState, useEffect } from 'react';
import { Activity, ShieldCheck, AlertTriangle, TrendingDown, Loader2, CheckCircle, Plus, X } from 'lucide-react';
import { SavingsChatbot } from './components/SavingsChatbot';
import { toast } from 'react-hot-toast';
import { Header } from './components/Header';
import { TransactionCard } from './components/TransactionCard';
import { EmergencyFundModal } from './components/EmergencyFundModal';
import { ChatBot } from './components/ChatBot';
import { StatsCard } from './components/StatsCard';
import { CategoryCaps } from './components/CategoryCaps';
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
  
  const [isSavingsChatbotOpen, setIsSavingsChatbotOpen] = useState(false);
  const [categoryCaps, setCategoryCaps] = useState<{ category_caps?: Record<string, number> } | null>(null);
  
  // Calculate months since account creation
  const monthsActive = 3; // This would come from user data

  // Toggle chatbot visibility
  const toggleChatbot = () => setShowChatbot(!showChatbot);

  // Fetch category caps when component mounts
 useEffect(() => {
  const fetchCategoryCaps = async () => {
    if (!userId) return;
    
    try {
      console.log('Fetching user caps...');
      const response = await api.get(`/api/v1/users/caps/${userId}`);
      console.log('Raw caps response:', response);

      const capsData = response.data?.data;  // << FIXED
      console.log('Caps data:', capsData);
      
      if (capsData?.category_caps) {
        console.log('Raw category_caps:', capsData.category_caps);
        setCategoryCaps(capsData);
      } else {
        console.log('No valid category_caps found in response');
        setCategoryCaps({ category_caps: {} });
      }
    } catch (error) {
      console.error('Error fetching category caps:', error);
    }
  };

  fetchCategoryCaps();
}, [userId]);


  // Calculate monthly and weekly spending
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

  // Calculate emergency funds as 2x monthly income
  const emergencyFunds = userCaps?.monthly_income ? userCaps.monthly_income * 2 : 0;
  // Update userCaps with calculated emergency funds if not set
  if (userCaps && !userCaps.emergency_fund && userCaps.monthly_income) {
    userCaps.emergency_fund = emergencyFunds;
  }
  
  // Check if caps are exceeded
  const isMonthlyCapExceeded = userCaps?.monthly_income && monthlySpent > userCaps.monthly_income;
  const isWeeklyCapExceeded = userCaps?.weekly_cap && weeklySpent > userCaps.weekly_cap;
  
  // Format currency to Indian Rupees
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // State for modals
  const [showChatbot, setShowChatbot] = useState(false);
  const [emergencyUnlocked, setEmergencyUnlocked] = useState(false);
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
      
      // Prepare transaction data with all required fields
      const transactionPayload = {
        user_id: 'U001', // Hardcoded user ID
        amount: Number(transactionData.amount),
        timestamp: timestamp,
        category: transactionData.category,
        is_reckless: false,
        transaction_id: `tx_${Date.now()}`,
        type: 'expense'
      };
      
      console.log('Sending transaction:', transactionPayload);
      
      // Send the transaction data
      const response = await api.put('/api/v1/others/classify', transactionPayload);
      
      console.log('Transaction response:', response.data);
      
      // If we get here, the transaction was successful
      toast.dismiss(loadingToast);
      toast.success('Transaction added successfully!');
      
      // Update the UI state
      setShowTransactionForm(false);
      
      // Reset form
      setTransactionData({
        timestamp: '',
        category: '',
        amount: 0,
        is_reckless: false
      });
      
      // Refresh transactions if needed
      if (fetchTransactions) {
        await fetchTransactions(userId || 'U001');
      }
      
      return; // Important: Exit the function after successful transaction
      
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
  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);

  const handleEmergencyUnlock = () => {
    setEmergencyUnlocked(true);
    setTimeout(() => {
      setIsEmergencyFundOpen(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header 
        onOpenChatbot={toggleChatbot}
        onOpenEmergencyFund={() => setIsEmergencyFundOpen(true)}
        monthsActive={monthsActive}
      />
      
      {/* Chatbot Modal */}
      <ChatBot isOpen={showChatbot} onClose={toggleChatbot} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Transaction Monitor</h2>
          <p className="text-gray-600">AI-powered financial safety for smarter spending</p>
        </div>

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
            {/* Spending Caps Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className={`p-4 rounded-lg border-2 ${isMonthlyCapExceeded ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Monthly Spending</h3>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(monthlySpent)}
                      {userCaps?.monthly_income && (
                        <span className="text-sm font-normal text-gray-500"> / {formatCurrency(userCaps.monthly_income)}</span>
                      )}
                    </p>
                    {isMonthlyCapExceeded && (
                      <p className="text-sm text-red-600 mt-1">
                        <span className="font-medium">Exceeded by:</span> {formatCurrency(monthlySpent - (userCaps?.monthly_income || 0))}
                      </p>
                    )}
                  </div>
                  {isMonthlyCapExceeded ? (
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                </div>
              </div>

              <div className={`p-4 rounded-lg border-2 ${isWeeklyCapExceeded ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Weekly Spending</h3>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(weeklySpent)}
                      {userCaps?.weekly_cap && (
                        <span className="text-sm font-normal text-gray-500"> / {formatCurrency(userCaps.weekly_cap)}</span>
                      )}
                    </p>
                    {isWeeklyCapExceeded && (
                      <p className="text-sm text-red-600 mt-1">
                        <span className="font-medium">Exceeded by:</span> {formatCurrency(weeklySpent - (userCaps?.weekly_cap || 0))}
                      </p>
                    )}
                  </div>
                  {isWeeklyCapExceeded ? (
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                </div>
              </div>
            </div>

            {/* Account Balance */}
            <div className="bg-white border-2 border-gray-100 rounded-xl p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Account Balance</h2>
              <p className="text-3xl font-bold text-gray-900">
                {userCaps?.balance !== undefined ? formatCurrency(userCaps.balance) : 'Loading...'}
              </p>
            </div>

            {/* Add Transaction Button */}
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setShowTransactionForm(!showTransactionForm)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {showTransactionForm ? <X size={18} /> : <Plus size={18} />}
                {showTransactionForm ? 'Cancel' : 'Add Transaction'}
              </button>
            </div>

            {/* Transaction Form */}
            {showTransactionForm && (
              <form onSubmit={handleTransactionSubmit} className="bg-white p-6 rounded-xl border-2 border-gray-100 mb-6">
                <h3 className="text-lg font-semibold mb-4">Add New Transaction</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                    <input
                      type="number"
                      name="amount"
                      value={transactionData.amount}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      name="category"
                      value={transactionData.category}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Transaction
                </button>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-6">
                <StatsCard
                  title="Reckless Detected"
                  value={recklessCount}
                  icon={AlertTriangle}
                  color="orange"
                />
                <StatsCard
                  title="Total Spent"
                  value={`₹${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  icon={TrendingDown}
                  color="red"
                  onViewTips={toggleChatbot}
                />
              </div>
              <div className="space-y-6">
                <StatsCard
                  title="Protected"
                  value={transactions.length - recklessCount}
                  icon={ShieldCheck}
                  color="green"
                />
                <StatsCard
                  title="Remaining"
                  value={`₹${((userCaps?.monthly_income || 0) - totalSpent).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  icon={Activity}
                  color="blue"
                />
              </div>
              <div className="lg:col-span-2">
                <CategoryCaps categoryCaps={categoryCaps} />
              </div>
            </div>

            {recklessCount > 0 && (
              <div className="bg-yellow-100 border-2 border-yellow-300 rounded-xl p-6 mb-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-yellow-700 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-bold text-yellow-900 mb-2">Critical Financial Health</h3>
                    <p className="text-yellow-800 mb-3">
                      We've noticed some concerning spending patterns. Consider reducing spending on non-essential items and reviewing your budget.
                    </p>
                    <button
                      onClick={toggleChatbot}
                      className="px-4 py-2 bg-white border border-yellow-600 text-yellow-700 rounded-lg font-medium hover:bg-yellow-50 transition-colors"
                    >
                      View Budget Tips
                    </button>
                  </div>
                </div>
              </div>
            )}

            {emergencyUnlocked && (
              <div className="bg-green-100 border-2 border-green-300 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-green-700" />
                  <div>
                    <h3 className="text-lg font-bold text-green-900">Emergency Fund Unlocked</h3>
                    <p className="text-green-800">
                      Your emergency fund of {userCaps?.emergency_fund ? formatCurrency(userCaps.emergency_fund) : '₹0'} is now accessible.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Transactions</h3>
              {transactions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No transactions found</p>
              ) : (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <TransactionCard key={transaction.transaction_id} transaction={transaction} />
                  ))}
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

      <SavingsChatbot
        isOpen={isSavingsChatbotOpen}
        onClose={() => setIsSavingsChatbotOpen(false)}
        savingsData={{
          monthsActive: 6,
          totalSaved: 3500,
          blockedTransactions: 12,
          warningsPrevented: 24
        }}
      />
    </div>
  );
}

export default App;
