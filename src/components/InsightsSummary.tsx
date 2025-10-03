import React from 'react';
import { TrendingUp, TrendingDown, PoundSterling, Calendar, PieChart, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface InsightsSummaryProps {
  insights: {
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    transactionCount: number;
    categories: Array<{
      name: string;
      amount: number;
      percentage: number;
      color: string;
    }>;
    trends: {
      incomeChange: number;
      expenseChange: number;
    };
  };
}

export const InsightsSummary: React.FC<InsightsSummaryProps> = ({ insights }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Financial Insights</h2>
        <p className="text-blue-100">Your bank statement analysis is ready</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <span className="flex items-center text-sm text-green-600 font-medium">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              {insights.trends.incomeChange > 0 ? '+' : ''}{insights.trends.incomeChange}%
            </span>
          </div>
          <p className="text-gray-600 text-sm mb-1">Total Income</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(insights.totalIncome)}</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <span className="flex items-center text-sm text-red-600 font-medium">
              <ArrowDownRight className="w-4 h-4 mr-1" />
              {insights.trends.expenseChange > 0 ? '+' : ''}{insights.trends.expenseChange}%
            </span>
          </div>
          <p className="text-gray-600 text-sm mb-1">Total Expenses</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(insights.totalExpenses)}</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <PoundSterling className="w-6 h-6 text-blue-600" />
            </div>
            <span className="flex items-center text-sm text-gray-500">
              <Calendar className="w-4 h-4 mr-1" />
              {insights.transactionCount} transactions
            </span>
          </div>
          <p className="text-gray-600 text-sm mb-1">Net Balance</p>
          <p className={`text-2xl font-bold ${insights.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(insights.balance)}
          </p>
        </div>
      </div>

      {/* Spending Categories */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200">
        <div className="flex items-center mb-6">
          <PieChart className="w-6 h-6 text-blue-600 mr-2" />
          <h3 className="text-xl font-semibold text-gray-900">Spending by Category</h3>
        </div>
        
        <div className="space-y-4">
          {insights.categories.map((category, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div 
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: category.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {category.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatCurrency(category.amount)}
                  </p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ 
                      width: `${category.percentage}%`,
                      backgroundColor: category.color 
                    }}
                  />
                </div>
              </div>
              <span className="text-sm text-gray-500 font-medium">
                {category.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200">
          <h4 className="text-lg font-semibold text-emerald-900 mb-3">💡 Smart Insights</h4>
          <ul className="space-y-2 text-sm text-emerald-800">
            <li>• Your largest expense category is {insights.categories[0]?.name}</li>
            <li>• You spent {insights.categories[0]?.percentage}% of your total on {insights.categories[0]?.name}</li>
            <li>• Consider setting up automatic savings for better balance</li>
          </ul>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <h4 className="text-lg font-semibold text-blue-900 mb-3">📊 Summary Stats</h4>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Average transaction: {formatCurrency(insights.totalExpenses / insights.transactionCount)}</li>
            <li>• Savings rate: {((insights.balance / insights.totalIncome) * 100).toFixed(1)}%</li>
            <li>• Total transactions analyzed: {insights.transactionCount}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};