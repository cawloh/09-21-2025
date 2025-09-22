import React from 'react';
import { BarChart, LineChart, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart } from 'recharts';
import { Wine, ShoppingBag, DollarSign, Package, AlertTriangle, Users, Clock, UserCheck } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import PageHeader from '../../components/ui/PageHeader';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import StatsCard from '../../components/ui/StatsCard';

const AdminDashboard: React.FC = () => {
  const { getDashboardStats, transactions, stocks, getActiveStaff, getTodayAttendance, getAllUsers } = useData();
  const stats = getDashboardStats();
  const activeStaff = getActiveStaff();
  const todayAttendance = getTodayAttendance();
  const allUsers = getAllUsers();

  // Sample chart data for sales over time
  const salesData = [
    { name: 'Mon', sales: 400 },
    { name: 'Tue', sales: 300 },
    { name: 'Wed', sales: 500 },
    { name: 'Thu', sales: 280 },
    { name: 'Fri', sales: 590 },
    { name: 'Sat', sales: 800 },
    { name: 'Sun', sales: 700 },
  ];

  // Process transactions for today's revenue by hour
  const today = new Date().toISOString().split('T')[0];
  const todayTransactions = transactions.filter(t => t.date.split('T')[0] === today);
  
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

  // Get top selling products
  const productSales = transactions
    .filter(trans => trans.type !== 'return') // Only count sales, not returns
    .reduce((acc: {[key: string]: number}, trans) => {
    if (!acc[trans.productName]) acc[trans.productName] = 0;
    acc[trans.productName] += trans.quantity;
    return acc;
  }, {});
  
  const topProducts = Object.entries(productSales)
    .map(([name, quantity]) => ({ name, quantity }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getDisplayName = (user: any) => {
    if (user.firstName && user.lastName) {
      const middleName = user.middleName ? ` ${user.middleName} ` : ' ';
      return `${user.firstName}${middleName}${user.lastName}`;
    }
    return user.username;
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Dashboard" 
        subtitle="Welcome to your Winehouse management dashboard"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Products"
          value={stats.totalProducts}
          icon={<Wine size={24} />}
        />
        <StatsCard
          title="Total Stock Items"
          value={stats.totalStock}
          icon={<Package size={24} />}
        />
        <StatsCard
          title="Today's Sales"
          value={stats.totalSalesToday}
          icon={<ShoppingBag size={24} />}
        />
        <StatsCard
          title="Today's Revenue"
          value={`$${stats.totalSalesAmount.toFixed(2)}`}
          icon={<DollarSign size={24} />}
        />
      </div>

      {/* Staff Activity Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatsCard
          title="Active Staff"
          value={`${stats.activeStaff}/${stats.totalStaff}`}
          icon={<UserCheck size={24} />}
          className="bg-green-50 border-green-100"
        />
        <StatsCard
          title="Total Staff Attendance Today"
          value={todayAttendance.length}
          icon={<Clock size={24} />}
          className="bg-blue-50 border-blue-100"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Revenue */}
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

        {/* Top Selling Products */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-serif font-medium text-gray-800">Top Selling Products</h2>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topProducts.length ? topProducts : [{ name: 'No data', quantity: 0 }]}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="quantity" fill="#BE9063" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Staff Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Currently Active Staff */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserCheck size={18} className="text-green-500" />
              <h2 className="text-lg font-serif font-medium text-gray-800">Currently Active Staff</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeStaff.length > 0 ? (
                activeStaff.map(staff => (
                  <div key={staff.id} className="flex items-center justify-between p-3 bg-green-50 border border-green-100 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Users size={16} className="text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{getDisplayName(staff)}</p>
                        <p className="text-sm text-gray-500">@{staff.username}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-green-600 font-medium">Active</p>
                      {staff.lastTimeIn && (
                        <p className="text-xs text-gray-500">
                          Since {new Date(staff.lastTimeIn).toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">No staff currently active</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Today's Attendance */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-blue-500" />
              <h2 className="text-lg font-serif font-medium text-gray-800">Today's Attendance</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todayAttendance.length > 0 ? (
                todayAttendance.map(record => {
                  const user = allUsers.find(u => u.id === record.userId);
                  return (
                    <div key={record.id} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users size={16} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{user ? getDisplayName(user) : 'Unknown User'}</p>
                          <p className="text-sm text-gray-500">@{user?.username}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-600">In:</span>
                          <span className="font-medium">{new Date(record.timeIn).toLocaleTimeString()}</span>
                        </div>
                        {record.timeOut ? (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-600">Out:</span>
                            <span className="font-medium">{new Date(record.timeOut).toLocaleTimeString()}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-green-600">Currently active</span>
                        )}
                        {record.duration && (
                          <p className="text-xs text-gray-500">Duration: {formatDuration(record.duration)}</p>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-gray-500 py-4">No attendance records for today</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-500" />
            <h2 className="text-lg font-serif font-medium text-gray-800">Low Stock Items</h2>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stocks.filter(stock => stock.quantity < 10).map(stock => (
              <div key={stock.id} className="flex items-center p-3 bg-amber-50 border border-amber-100 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{stock.productName}</p>
                  <p className="text-sm text-gray-500">Only {stock.quantity} left in stock</p>
                </div>
              </div>
            ))}
            {stocks.filter(stock => stock.quantity < 10).length === 0 && (
              <p className="text-gray-500 col-span-3 py-4 text-center">No low stock items at the moment</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;