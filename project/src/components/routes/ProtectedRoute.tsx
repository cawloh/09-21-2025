import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AdminLayout from '../../layouts/AdminLayout';
import StaffLayout from '../../layouts/StaffLayout';

interface ProtectedRouteProps {
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-wine-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wine-700"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/" replace />;
  }

  // Determine which layout to use based on user role
  if (currentUser.role === 'admin') {
    return (
      <AdminLayout>
        <Outlet />
      </AdminLayout>
    );
  } else {
    return (
      <StaffLayout>
        <Outlet />
      </StaffLayout>
    );
  }
};

export default ProtectedRoute;