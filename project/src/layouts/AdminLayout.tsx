import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Wine, Package, BarChart2, Users, FileText, LogOut, Menu, X, AlertTriangle, UserCheck, User, RotateCcw, Bell } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { currentUser, logout, loading } = useAuth();
  const { notifications, markNotificationAsRead } = useData();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Get unread notifications for current user
  const unreadNotifications = notifications.filter(
    n => n.userId === currentUser?.id && !n.read
  );

  // Get low stock notifications specifically
  const lowStockNotifications = unreadNotifications.filter(
    n => n.title === 'Low Stock Alert' || n.title === 'Out of Stock Alert'
  );

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    // Add smooth transition effect
    const logoutElement = document.createElement('div');
    logoutElement.className = 'fixed inset-0 bg-wine-900 bg-opacity-90 flex items-center justify-center z-50 transition-all duration-500';
    logoutElement.innerHTML = `
      <div class="text-center text-white animate-fade-in">
        <div class="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-lg font-medium">Logging out...</p>
        <p class="text-sm opacity-75">See you soon!</p>
      </div>
    `;
    document.body.appendChild(logoutElement);

    // Wait for animation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    logout();
    navigate('/login');
    
    // Clean up
    document.body.removeChild(logoutElement);
    setIsLoggingOut(false);
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
      isActive
        ? 'bg-wine-gradient text-white shadow-lg scale-105'
        : 'text-gray-700 hover:bg-gradient-to-r hover:from-wine-100 hover:to-wine-50 hover:text-wine-800 hover:scale-[1.02] hover:shadow-md'
    }`;

  const getDisplayName = () => {
    if (currentUser?.firstName && currentUser?.lastName) {
      return `${currentUser.firstName} ${currentUser.lastName}`;
    }
    return currentUser?.username || 'Administrator';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-wine-50 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 border-4 border-wine-700 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <div className="space-y-2">
            <p className="text-wine-700 font-semibold text-lg">Loading dashboard...</p>
            <p className="text-gray-500 text-sm">Please wait while we prepare your workspace</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-cream-50 via-white to-wine-50">
      {/* Mobile Header */}
      <header className="md:hidden bg-wine-gradient text-white p-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
          <Wine size={28} className="animate-bounce-gentle" />
          <h1 className="font-serif text-xl font-semibold">Winehouse</h1>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200 hover:scale-110"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Sidebar for desktop / Mobile menu */}
      <aside 
        className={`${
          isMobileMenuOpen ? 'block animate-slide-up' : 'hidden'
        } md:block w-full md:w-72 bg-white/90 backdrop-blur-md border-r border-gray-200/50 p-6 md:h-screen md:sticky md:top-0 overflow-y-auto shadow-xl`}
      >
        <div className="hidden md:flex items-center gap-3 mb-8 p-4 bg-gradient-to-r from-wine-50 to-cream-50 rounded-2xl transition-all duration-300 hover:shadow-md">
          <Wine size={32} className="text-wine-700 animate-bounce-gentle" />
          <div>
            <h1 className="font-serif text-2xl text-wine-700 font-bold">Winehouse</h1>
            <p className="text-xs text-wine-600 uppercase tracking-wider">Management System</p>
          </div>
        </div>

        <div className="mb-8 hidden md:block p-4 bg-gradient-to-r from-wine-50 to-cream-50 rounded-2xl transition-all duration-300 hover:shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
            {/* Profile Picture */}
            {currentUser?.profileImage ? (
              <img
                src={currentUser.profileImage}
                alt="Profile"
                className="w-12 h-12 object-cover rounded-full border-2 border-white shadow-md transition-all duration-300 hover:scale-110"
                onError={(e) => {
                  console.error('Profile image failed to load');
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-wine-100 to-wine-200 rounded-full border-2 border-white shadow-md flex items-center justify-center transition-all duration-300 hover:scale-110">
                <User size={20} className="text-wine-600" />
              </div>
            )}
            <div className="flex-1">
              <p className="text-sm text-gray-500 mb-1">Welcome back,</p>
              <p className="font-semibold text-gray-800 text-lg truncate">{getDisplayName()}</p>
            </div>
            </div>
            
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-wine-600 hover:text-wine-700 hover:bg-wine-100 rounded-lg transition-all duration-200"
              >
                <Bell size={20} />
                {unreadNotifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                    {unreadNotifications.length}
                  </span>
                )}
              </button>
              
              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="font-medium text-gray-800">Notifications</h3>
                    {unreadNotifications.length > 0 && (
                      <p className="text-sm text-gray-500">{unreadNotifications.length} unread</p>
                    )}
                  </div>
                  
                  <div className="max-h-64 overflow-y-auto">
                    {unreadNotifications.length > 0 ? (
                      unreadNotifications.slice(0, 10).map((notification) => (
                        <div
                          key={notification.id}
                          className="p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => {
                            markNotificationAsRead(notification.id);
                          }}
                        >
                          <div className="flex items-start gap-3">
                            {notification.title.includes('Low Stock') && (
                              <AlertTriangle size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
                            )}
                            {notification.title.includes('Out of Stock') && (
                              <AlertTriangle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                            )}
                            {notification.title.includes('Stock Replenished') && (
                              <Package size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">
                                {notification.title}
                              </p>
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(notification.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-gray-500">
                        <Bell size={32} className="mx-auto mb-2 opacity-50" />
                        <p>No new notifications</p>
                      </div>
                    )}
                  </div>
                  
                  {unreadNotifications.length > 10 && (
                    <div className="p-3 text-center border-t border-gray-100">
                      <button className="text-sm text-wine-600 hover:text-wine-700">
                        View all notifications
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
            <p className="text-xs text-wine-600 uppercase tracking-wider font-medium">Administrator</p>
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          <NavLink to="/admin/dashboard" className={navLinkClass} onClick={() => setIsMobileMenuOpen(false)}>
            <BarChart2 size={20} className="group-hover:scale-110 transition-transform" />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/admin/products" className={navLinkClass} onClick={() => setIsMobileMenuOpen(false)}>
            <Wine size={20} className="group-hover:scale-110 transition-transform" />
            <span>Products</span>
          </NavLink>
          <NavLink to="/admin/stocks" className={navLinkClass} onClick={() => setIsMobileMenuOpen(false)}>
            <Package size={20} className="group-hover:scale-110 transition-transform" />
            <span>Stocks</span>
          </NavLink>
          <NavLink to="/admin/suppliers" className={navLinkClass} onClick={() => setIsMobileMenuOpen(false)}>
            <Users size={20} className="group-hover:scale-110 transition-transform" />
            <span>Suppliers</span>
          </NavLink>
          <NavLink to="/admin/transactions" className={navLinkClass} onClick={() => setIsMobileMenuOpen(false)}>
            <FileText size={20} className="group-hover:scale-110 transition-transform" />
            <span>Transactions</span>
          </NavLink>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Product Status
            </p>
            <NavLink to="/admin/expired-products" className={navLinkClass} onClick={() => setIsMobileMenuOpen(false)}>
              <AlertTriangle size={20} className="group-hover:scale-110 transition-transform" />
              <span>Expired Products</span>
            </NavLink>
            <NavLink to="/admin/damaged-products" className={navLinkClass} onClick={() => setIsMobileMenuOpen(false)}>
              <AlertTriangle size={20} className="group-hover:scale-110 transition-transform" />
              <span>Damaged Products</span>
            </NavLink>
            <NavLink to="/admin/return-requests" className={navLinkClass} onClick={() => setIsMobileMenuOpen(false)}>
              <RotateCcw size={20} className="group-hover:scale-110 transition-transform" />
              <span>Return Requests</span>
            </NavLink>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              User Management
            </p>
            <NavLink to="/admin/staff-accounts" className={navLinkClass} onClick={() => setIsMobileMenuOpen(false)}>
              <UserCheck size={20} className="group-hover:scale-110 transition-transform" />
              <span>Staff Accounts</span>
            </NavLink>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-3 text-gray-700 hover:text-red-600 px-4 py-3 w-full transition-all duration-300 rounded-xl hover:bg-red-50 hover:scale-[1.02] group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogOut size={20} className="group-hover:scale-110 transition-transform" />
              <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 md:p-8 overflow-auto">
        <div className="animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;