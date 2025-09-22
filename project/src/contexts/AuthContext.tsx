import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    // Add a small delay to make the loading state visible
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const login = async (username: string, password: string): Promise<User> => {
    setLoading(true);
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get users from localStorage
      const usersJSON = localStorage.getItem('users');
      const users: User[] = usersJSON ? JSON.parse(usersJSON) : [];

      // Find user with matching username and password
      const user = users.find(
        (u) => u.username === username && u.password === password
      );

      if (!user) {
        throw new Error('Invalid username or password');
      }

      // Set current user
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));

      return user;
    } finally {
      setLoading(false);
    }
  };

  const register = async (username: string, password: string): Promise<User> => {
    setLoading(true);
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get users from localStorage
      const usersJSON = localStorage.getItem('users');
      const users: User[] = usersJSON ? JSON.parse(usersJSON) : [];

      // Check if username already exists
      if (users.some((u) => u.username === username)) {
        throw new Error('Username already taken');
      }

      // Determine role - first user is admin, subsequent users are staff
      const role = users.length === 0 ? 'admin' : 'staff';

      // Create new user
      const newUser: User = {
        id: uuidv4(),
        username,
        password,
        role,
        createdAt: new Date().toISOString(),
      };

      // Add new user to users array
      const updatedUsers = [...users, newUser];
      localStorage.setItem('users', JSON.stringify(updatedUsers));

      // Set current user
      setCurrentUser(newUser);
      localStorage.setItem('currentUser', JSON.stringify(newUser));

      return newUser;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData: Partial<User>): Promise<User> => {
    if (!currentUser) throw new Error('User not authenticated');
    
    setLoading(true);
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get users from localStorage
      const usersJSON = localStorage.getItem('users');
      const users: User[] = usersJSON ? JSON.parse(usersJSON) : [];

      // Update user profile
      const updatedUser: User = {
        ...currentUser,
        ...profileData,
        profileUpdatedAt: new Date().toISOString(),
      };

      // Update users array
      const updatedUsers = users.map(user => 
        user.id === currentUser.id ? updatedUser : user
      );
      
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      setCurrentUser(updatedUser);
      return updatedUser;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setLoading(true);
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    // Add a small delay to make the loading state visible
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  const value: AuthContextType = {
    currentUser,
    loading,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};