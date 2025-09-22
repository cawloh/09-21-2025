import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ShoppingBag, DollarSign } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import PageHeader from '../../components/ui/PageHeader';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import StatsCard from '../../components/ui/StatsCard';

const StaffDashboard: React.FC = () => {
  const { getTodayTransactions } = useData();
  const todayTransactions = getTodayTransactions();
  
  // Calculate total sales
  const totalSales = todayTransactions.reduce((sum, transaction) => sum + transaction.totalPrice, 0);
  
  // Process transactions for today's revenue by hour
  const today = new Date().toISOString().split('T')[0];
  
  // Group by hour and sum
  const hourlyData = todayTransactions.reduce((acc: {[key: string]: number}, trans) => {
    const hour = new Date(trans.date).getHours();
    const hourKey = `${hour}:00`;
    if (!acc[hourKey]) acc[hourKey] = 0;
    acc[hourKey] += trans.totalPrice;
    return acc;
  }, {});
  
  // Convert to array for chart
  const todayRevenueData = Object.entries(hourlyData).map(([hour, revenue]) => ({
    hour,
    revenue
  })).sort((a, b) => a.hour.localeCompare(b.hour));

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Staff Dashboard" 
        subtitle="Monitor daily sales and transactions"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatsCard
          title="Today's Sales"
          value={todayTransactions.filter(t => t.type !== 'return').length}
          icon={<ShoppingBag size={24} />}
        />
        <StatsCard
          title="Today's Revenue"
          value={`$${totalSales.toFixed(2)}`}
          icon={<DollarSign size={24} />}
        />
      </div>

      {/* Today's Revenue Chart */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-serif font-medium text-gray-800">Today's Revenue</h2>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={todayRevenueData.length ? todayRevenueData : [{ hour: 'No data', revenue: 0 }]}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#722F37" fill="#722F37" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-serif font-medium text-gray-800">Recent Transactions</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {todayTransactions.slice(0, 5).map((transaction) => (
              <div key={transaction.id} className="flex justify-between items-center p-3 bg-cream-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{transaction.productName}</p>
                  <p className="text-sm text-gray-500">
                    {transaction.quantity} × ${transaction.price.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-wine-700">${transaction.totalPrice.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(transaction.date).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {todayTransactions.length === 0 && (
              <p className="text-center text-gray-500 py-4">No transactions today</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffDashboard;