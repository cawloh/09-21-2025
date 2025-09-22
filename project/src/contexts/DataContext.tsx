import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { useAuth } from './AuthContext';
import {
  Product,
  Supplier,
  Stock,
  Transaction,
  ProductStatus,
  ActivityLog,
  Notification,
  ReturnRequest,
  DataContextType,
  DashboardStats,
  User,
  AttendanceRecord,
} from '../types';

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [productStatuses, setProductStatuses] = useState<ProductStatus[]>([]);
  const [returnRequests, setReturnRequests] = useState<ReturnRequest[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  // Load data from localStorage on component mount
  useEffect(() => {
    const loadData = () => {
      const productsJSON = localStorage.getItem('products');
      const suppliersJSON = localStorage.getItem('suppliers');
      const stocksJSON = localStorage.getItem('stocks');
      const transactionsJSON = localStorage.getItem('transactions');
      const productStatusesJSON = localStorage.getItem('productStatuses');
      const activityLogsJSON = localStorage.getItem('activityLogs');
      const notificationsJSON = localStorage.getItem('notifications');
      const returnRequestsJSON = localStorage.getItem('returnRequests');
      const attendanceJSON = localStorage.getItem('attendanceRecords');

      if (productsJSON) setProducts(JSON.parse(productsJSON));
      if (suppliersJSON) setSuppliers(JSON.parse(suppliersJSON));
      if (stocksJSON) setStocks(JSON.parse(stocksJSON));
      if (transactionsJSON) setTransactions(JSON.parse(transactionsJSON));
      if (productStatusesJSON) setProductStatuses(JSON.parse(productStatusesJSON));
      if (activityLogsJSON) setActivityLogs(JSON.parse(activityLogsJSON));
      if (notificationsJSON) setNotifications(JSON.parse(notificationsJSON));
      if (returnRequestsJSON) setReturnRequests(JSON.parse(returnRequestsJSON));
      if (attendanceJSON) setAttendanceRecords(JSON.parse(attendanceJSON));
    };

    loadData();
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem('stocks', JSON.stringify(stocks));
  }, [stocks]);

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('productStatuses', JSON.stringify(productStatuses));
  }, [productStatuses]);

  useEffect(() => {
    localStorage.setItem('activityLogs', JSON.stringify(activityLogs));
  }, [activityLogs]);

  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('returnRequests', JSON.stringify(returnRequests));
  }, [returnRequests]);

  useEffect(() => {
    localStorage.setItem('attendanceRecords', JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  const addProduct = async (name: string, imageUrl?: string): Promise<Product> => {
    if (!currentUser) throw new Error('User not authenticated');

    const newProduct: Product = {
      id: uuidv4(),
      name,
      imageUrl,
      createdAt: new Date().toISOString(),
      createdBy: currentUser.id,
    };

    setProducts((prev) => [...prev, newProduct]);
    await addActivityLog('Added new product', `Added product: ${name}`);
    return newProduct;
  };

  const addSupplier = async (name: string, contactNumber: string): Promise<Supplier> => {
    if (!currentUser) throw new Error('User not authenticated');
    
    if (contactNumber.length !== 11 || !/^\d+$/.test(contactNumber)) {
      throw new Error('Contact number must be 11 digits');
    }

    const newSupplier: Supplier = {
      id: uuidv4(),
      name,
      contactNumber,
      createdAt: new Date().toISOString(),
      createdBy: currentUser.id,
    };

    setSuppliers((prev) => [...prev, newSupplier]);
    await addActivityLog('Added new supplier', `Added supplier: ${name}`);
    return newSupplier;
  };

  const addStock = async (
    productId: string,
    quantity: number,
    price: number,
    dateAdded: string,
    expiryDate: string,
    supplierId: string
  ): Promise<Stock> => {
    if (!currentUser) throw new Error('User not authenticated');

    const product = products.find((p) => p.id === productId);
    if (!product) throw new Error('Product not found');

    const supplier = suppliers.find((s) => s.id === supplierId);
    if (!supplier) throw new Error('Supplier not found');

    const numericPrice = Number(price);
    if (isNaN(numericPrice)) {
      throw new Error('Invalid price value');
    }

    // Check if this product was previously low stock or out of stock
    const existingStock = stocks.find(s => s.productId === productId);
    const wasLowStock = !existingStock || existingStock.quantity <= 10;
    const newStock: Stock = {
      id: uuidv4(),
      productId,
      productName: product.name,
      productImageUrl: product.imageUrl,
      quantity: Number(quantity),
      price: numericPrice,
      dateAdded,
      expiryDate,
      supplierId,
      supplierName: supplier.name,
      createdAt: new Date().toISOString(),
      createdBy: currentUser.id,
    };

    setStocks((prev) => {
      // Update existing stock or add new stock
      const existingIndex = prev.findIndex(s => s.productId === productId);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + Number(quantity),
          price: numericPrice, // Update to latest price
          dateAdded, // Update date
        };
        return updated;
      } else {
        return [...prev, newStock];
      }
    });

    // Clear low stock notifications if stock is now sufficient
    if (wasLowStock && Number(quantity) > 10) {
      // Get all users to clear notifications
      const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Clear low stock notifications for this product for all users
      setNotifications(prev => 
        prev.filter(notification => 
          !(notification.title === 'Low Stock Alert' && 
            notification.message.includes(product.name))
        )
      );
      
      // Add stock replenishment notification for admins
      const admins = allUsers.filter((user: any) => user.role === 'admin');
      for (const admin of admins) {
        await addNotification(
          admin.id,
          'Stock Replenished',
          `${product.name} has been restocked. New quantity: ${Number(quantity)} units.`
        );
      }
    }

    await addActivityLog(
      'Added new stock',
      `Added ${quantity} units of ${product.name}`
    );

    // Check for low stock after adding and notify if still low
    const finalQuantity = existingStock ? existingStock.quantity + Number(quantity) : Number(quantity);
    if (finalQuantity <= 10) {
      await checkAndNotifyLowStock(productId, product.name, finalQuantity);
    }

    return newStock;
  };

  const addTransaction = async (
    productId: string,
    quantity: number,
    price: number
  ): Promise<Transaction> => {
    if (!currentUser) throw new Error('User not authenticated');

    const product = products.find((p) => p.id === productId);
    if (!product) throw new Error('Product not found');

    const productStock = stocks.find((s) => s.productId === productId);
    if (!productStock || productStock.quantity < quantity) {
      throw new Error('Not enough stock available');
    }

    const numericPrice = Number(price);
    if (isNaN(numericPrice)) {
      throw new Error('Invalid price value');
    }

    const newQuantity = productStock.quantity - quantity;

    setStocks((prev) =>
      prev.map((stock) =>
        stock.productId === productId
          ? { ...stock, quantity: newQuantity }
          : stock
      )
    );

    const newTransaction: Transaction = {
      id: uuidv4(),
      productId,
      productName: product.name,
      quantity: Number(quantity),
      price: numericPrice,
      totalPrice: numericPrice * Number(quantity),
      date: new Date().toISOString(),
      createdBy: currentUser.id,
      createdByUsername: currentUser.username,
      type: 'sale', // Mark as sale transaction
    };

    setTransactions((prev) => [...prev, newTransaction]);
    await addActivityLog(
      'New transaction',
      `Sold ${quantity} units of ${product.name}`
    );

    // Check for low stock after transaction and notify if needed
    if (newQuantity <= 10 && newQuantity > 0) {
      await checkAndNotifyLowStock(productId, product.name, newQuantity);
    } else if (newQuantity === 0) {
      await checkAndNotifyOutOfStock(productId, product.name);
    }

    return newTransaction;
  };

  const addProductStatus = async (
    productId: string,
    type: 'expired' | 'damaged',
    quantity: number,
    notes: string,
    imageUrl?: string
  ): Promise<ProductStatus> => {
    if (!currentUser) throw new Error('User not authenticated');

    const product = products.find((p) => p.id === productId);
    if (!product) throw new Error('Product not found');

    const productStock = stocks.find((s) => s.productId === productId);
    if (!productStock || productStock.quantity < quantity) {
      throw new Error('Not enough stock available');
    }

    const newStatus: ProductStatus = {
      id: uuidv4(),
      productId,
      productName: product.name,
      type,
      quantity: Number(quantity),
      notes,
      imageUrl,
      status: 'pending',
      reportedBy: currentUser.id,
      reportedByUsername: currentUser.username,
      reportedAt: new Date().toISOString(),
    };

    setProductStatuses((prev) => [...prev, newStatus]);
    
    // Add activity log
    await addActivityLog(
      `Reported ${type} product`,
      `${product.name} - ${quantity} units`
    );

    // Notify admins
    const admins = JSON.parse(localStorage.getItem('users') || '[]')
      .filter((user: any) => user.role === 'admin');

    for (const admin of admins) {
      await addNotification(
        admin.id,
        `New ${type} Product Report`,
        `${currentUser.username} reported ${quantity} units of ${product.name} as ${type}`
      );
    }

    return newStatus;
  };

  const editProductStatus = async (
    statusId: string,
    notes: string,
    imageUrl?: string
  ): Promise<ProductStatus> => {
    if (!currentUser) throw new Error('User not authenticated');

    const status = productStatuses.find(ps => ps.id === statusId);
    if (!status) throw new Error('Status not found');

    if (status.reportedBy !== currentUser.id) {
      throw new Error('You can only edit your own reports');
    }

    // Store the previous version in history
    const previousVersion = {
      notes: status.notes,
      imageUrl: status.imageUrl,
      reviewNotes: status.reviewNotes,
      status: status.status as 'rejected',
      timestamp: new Date().toISOString(),
    };

    const updatedStatus: ProductStatus = {
      ...status,
      notes,
      imageUrl,
      status: 'pending',
      editedAt: new Date().toISOString(),
      previousReports: [
        ...(status.previousReports || []),
        previousVersion
      ],
    };

    setProductStatuses(prev =>
      prev.map(ps => ps.id === statusId ? updatedStatus : ps)
    );

    // Add activity log
    await addActivityLog(
      'Edited product status report',
      `${status.productName} - Updated report after rejection`
    );

    // Notify admins about the edit
    const admins = JSON.parse(localStorage.getItem('users') || '[]')
      .filter((user: any) => user.role === 'admin');

    for (const admin of admins) {
      await addNotification(
        admin.id,
        'Product Report Updated',
        `${currentUser.username} has updated their ${status.type} product report for ${status.productName}`
      );
    }

    return updatedStatus;
  };

  const addActivityLog = async (action: string, details: string): Promise<ActivityLog> => {
    if (!currentUser) throw new Error('User not authenticated');

    const newLog: ActivityLog = {
      id: uuidv4(),
      userId: currentUser.id,
      username: currentUser.username,
      userRole: currentUser.role,
      action,
      details,
      timestamp: new Date().toISOString(),
    };

    setActivityLogs((prev) => [...prev, newLog]);
    return newLog;
  };

  const addNotification = async (
    userId: string,
    title: string,
    message: string
  ): Promise<Notification> => {
    const newNotification: Notification = {
      id: uuidv4(),
      userId,
      title,
      message,
      read: false,
      createdAt: new Date().toISOString(),
    };

    setNotifications((prev) => [...prev, newNotification]);
    return newNotification;
  };

  const checkAndNotifyLowStock = async (productId: string, productName: string, quantity: number): Promise<void> => {
    // Get all users
    const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check if low stock notification already exists for this product
    const existingNotification = notifications.find(n => 
      n.title === 'Low Stock Alert' && n.message.includes(productName) && !n.read
    );
    
    if (!existingNotification) {
      // Notify all users (admin and staff) about low stock
      for (const user of allUsers) {
        await addNotification(
          user.id,
          'Low Stock Alert',
          `${productName} is running low with only ${quantity} units remaining. Consider restocking soon.`
        );
      }
    }
  };

  const checkAndNotifyOutOfStock = async (productId: string, productName: string): Promise<void> => {
    // Get all users
    const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Clear any existing low stock notifications for this product
    setNotifications(prev => 
      prev.filter(notification => 
        !(notification.title === 'Low Stock Alert' && 
          notification.message.includes(productName))
      )
    );
    
    // Notify all users about out of stock
    for (const user of allUsers) {
      await addNotification(
        user.id,
        'Out of Stock Alert',
        `${productName} is now out of stock. Immediate restocking required.`
      );
    }
  };

  const markNotificationAsRead = async (id: string): Promise<void> => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const updateProductStatus = async (
    statusId: string,
    status: 'approved' | 'rejected',
    reviewNotes: string
  ): Promise<ProductStatus> => {
    if (!currentUser) throw new Error('User not authenticated');
    if (currentUser.role !== 'admin') throw new Error('Unauthorized');

    const productStatus = productStatuses.find((ps) => ps.id === statusId);
    if (!productStatus) throw new Error('Status not found');

    if (status === 'approved') {
      // Update stock quantity
      setStocks((prev) =>
        prev.map((stock) =>
          stock.productId === productStatus.productId
            ? { ...stock, quantity: stock.quantity - productStatus.quantity }
            : stock
        )
      );

      // Add activity log
      await addActivityLog(
        `Approved ${productStatus.type} product`,
        `${productStatus.productName} - ${productStatus.quantity} units`
      );

      // Notify staff
      await addNotification(
        productStatus.reportedBy,
        'Report Approved',
        `Your ${productStatus.type} product report for ${productStatus.productName} has been approved.`
      );
    } else {
      // Add activity log for rejection
      await addActivityLog(
        `Rejected ${productStatus.type} product`,
        `${productStatus.productName} - ${productStatus.quantity} units`
      );

      // Notify staff
      await addNotification(
        productStatus.reportedBy,
        'Report Rejected',
        `Your ${productStatus.type} product report for ${productStatus.productName} has been rejected.`
      );
    }

    const updatedStatus: ProductStatus = {
      ...productStatus,
      status,
      reviewNotes,
      reviewedBy: currentUser.id,
      reviewedByUsername: currentUser.username,
      reviewedAt: new Date().toISOString(),
    };

    setProductStatuses((prev) =>
      prev.map((ps) => (ps.id === statusId ? updatedStatus : ps))
    );

    return updatedStatus;
  };

  const addReturnRequest = async (
    productId: string,
    quantity: number,
    reason: 'defective' | 'expired' | 'customer_return' | 'damaged' | 'other',
    notes: string,
    originalTransactionId?: string,
    refundAmount?: number
  ): Promise<ReturnRequest> => {
    if (!currentUser) throw new Error('User not authenticated');

    const product = products.find((p) => p.id === productId);
    if (!product) throw new Error('Product not found');

    // If linked to original transaction, validate return quantity
    if (originalTransactionId) {
      const originalTransaction = transactions.find(t => t.id === originalTransactionId);
      if (!originalTransaction) {
        throw new Error('Original transaction not found');
      }

      // Check if this is a valid sale transaction (not already a return)
      if (originalTransaction.type === 'return') {
        throw new Error('Cannot return items from a return transaction');
      }

      // Calculate total already returned for this transaction
      const existingReturns = returnRequests.filter(
        rr => rr.originalTransactionId === originalTransactionId && 
             rr.status === 'approved'
      );
      
      const totalReturned = existingReturns.reduce((sum, rr) => sum + rr.quantity, 0);
      const availableToReturn = originalTransaction.quantity - totalReturned;

      if (quantity > availableToReturn) {
        throw new Error(
          `Cannot return ${quantity} items. Only ${availableToReturn} items available for return from this transaction (${originalTransaction.quantity} originally purchased, ${totalReturned} already returned)`
        );
      }

      // Validate refund amount doesn't exceed proportional amount
      if (refundAmount) {
        const maxRefund = (originalTransaction.price * quantity);
        if (refundAmount > maxRefund) {
          throw new Error(
            `Refund amount $${refundAmount.toFixed(2)} exceeds maximum allowed $${maxRefund.toFixed(2)} for ${quantity} items`
          );
        }
      }
    }
    const newReturnRequest: ReturnRequest = {
      id: uuidv4(),
      productId,
      productName: product.name,
      quantity: Number(quantity),
      reason,
      notes,
      status: 'pending',
      requestedBy: currentUser.id,
      requestedByUsername: currentUser.username,
      requestedAt: new Date().toISOString(),
      originalTransactionId,
      refundAmount: refundAmount ? Number(refundAmount) : undefined,
    };

    setReturnRequests((prev) => [...prev, newReturnRequest]);
    
    // Add activity log
    await addActivityLog(
      'Submitted return request',
      `${product.name} - ${quantity} units (${reason})`
    );

    // Notify admins
    const admins = JSON.parse(localStorage.getItem('users') || '[]')
      .filter((user: any) => user.role === 'admin');

    for (const admin of admins) {
      await addNotification(
        admin.id,
        'New Return Request',
        `${currentUser.username} submitted a return request for ${quantity} units of ${product.name}`
      );
    }

    return newReturnRequest;
  };

  const updateReturnRequest = async (
    requestId: string,
    status: 'approved' | 'rejected',
    reviewNotes: string
  ): Promise<ReturnRequest> => {
    if (!currentUser) throw new Error('User not authenticated');
    if (currentUser.role !== 'admin') throw new Error('Unauthorized');

    const returnRequest = returnRequests.find((rr) => rr.id === requestId);
    if (!returnRequest) throw new Error('Return request not found');

    if (status === 'approved') {
      // Add items back to stock
      const existingStock = stocks.find(s => s.productId === returnRequest.productId);
      if (existingStock) {
        const newQuantity = existingStock.quantity + returnRequest.quantity;
        
        setStocks((prev) =>
          prev.map((stock) =>
            stock.productId === returnRequest.productId
              ? { ...stock, quantity: newQuantity }
              : stock
          )
        );
        
        // Clear low stock notifications if stock is now sufficient
        if (newQuantity > 10) {
          const product = products.find(p => p.id === returnRequest.productId);
          if (product) {
            setNotifications(prev => 
              prev.filter(notification => 
                !(notification.title === 'Low Stock Alert' && 
                  notification.message.includes(product.name))
              )
            );
          }
        }
      }

      // Create a reverse transaction to deduct from sales
      const returnTransaction: Transaction = {
        id: uuidv4(),
        productId: returnRequest.productId,
        productName: returnRequest.productName,
        quantity: -returnRequest.quantity, // Negative quantity for return
        price: returnRequest.refundAmount ? (returnRequest.refundAmount / returnRequest.quantity) : 0,
        totalPrice: -(returnRequest.refundAmount || 0), // Negative total for return
        date: new Date().toISOString(),
        createdBy: currentUser.id,
        createdByUsername: currentUser.username,
        type: 'return',
        originalTransactionId: returnRequest.originalTransactionId,
      };

      // Add the return transaction
      setTransactions((prev) => [...prev, returnTransaction]);
      // Add activity log
      await addActivityLog(
        'Approved return request',
        `${returnRequest.productName} - ${returnRequest.quantity} units returned, $${(returnRequest.refundAmount || 0).toFixed(2)} deducted from sales`
      );

      // Notify staff
      await addNotification(
        returnRequest.requestedBy,
        'Return Request Approved',
        `Your return request for ${returnRequest.productName} has been approved. Items added back to stock and sales adjusted.`
      );
    } else {
      // Add activity log for rejection
      await addActivityLog(
        'Rejected return request',
        `${returnRequest.productName} - ${returnRequest.quantity} units`
      );

      // Notify staff
      await addNotification(
        returnRequest.requestedBy,
        'Return Request Rejected',
        `Your return request for ${returnRequest.productName} has been rejected.`
      );
    }

    const updatedRequest: ReturnRequest = {
      ...returnRequest,
      status,
      reviewNotes,
      reviewedBy: currentUser.id,
      reviewedByUsername: currentUser.username,
      reviewedAt: new Date().toISOString(),
    };

    setReturnRequests((prev) =>
      prev.map((rr) => (rr.id === requestId ? updatedRequest : rr))
    );

    return updatedRequest;
  };

  const exportProductStatusReport = async (type: 'excel' | 'pdf'): Promise<void> => {
    if (type === 'excel') {
      const worksheet = XLSX.utils.json_to_sheet(productStatuses);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Product Status Report');
      XLSX.writeFile(workbook, 'product-status-report.xlsx');
    } else {
      const doc = new jsPDF();
      (doc as any).autoTable({
        head: [['Product', 'Type', 'Quantity', 'Status', 'Reported By', 'Date']],
        body: productStatuses.map((status) => [
          status.productName,
          status.type,
          status.quantity,
          status.status,
          status.reportedByUsername,
          new Date(status.reportedAt).toLocaleDateString(),
        ]),
      });
      doc.save('product-status-report.pdf');
    }
  };

  const clockIn = async (userId: string): Promise<void> => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    // Check if user already clocked in today
    const existingRecord = attendanceRecords.find(
      record => record.userId === userId && record.date === today && !record.timeOut
    );

    if (existingRecord) {
      throw new Error('User already clocked in today');
    }

    const newRecord: AttendanceRecord = {
      id: uuidv4(),
      userId,
      timeIn: now,
      date: today,
    };

    setAttendanceRecords(prev => [...prev, newRecord]);

    // Update user status
    const users = getAllUsers();
    const updatedUsers = users.map(user => 
      user.id === userId 
        ? { ...user, isActive: true, lastTimeIn: now }
        : user
    );
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  };

  const clockOut = async (userId: string): Promise<void> => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    // Find today's attendance record
    const recordIndex = attendanceRecords.findIndex(
      record => record.userId === userId && record.date === today && !record.timeOut
    );

    if (recordIndex === -1) {
      throw new Error('No active clock-in record found for today');
    }

    const record = attendanceRecords[recordIndex];
    const timeIn = new Date(record.timeIn);
    const timeOut = new Date(now);
    const duration = Math.floor((timeOut.getTime() - timeIn.getTime()) / (1000 * 60)); // in minutes

    const updatedRecord: AttendanceRecord = {
      ...record,
      timeOut: now,
      duration,
    };

    setAttendanceRecords(prev => 
      prev.map((r, index) => index === recordIndex ? updatedRecord : r)
    );

    // Update user status
    const users = getAllUsers();
    const updatedUsers = users.map(user => 
      user.id === userId 
        ? { ...user, isActive: false, lastTimeOut: now }
        : user
    );
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  };

  const getActiveStaff = (): User[] => {
    const users = getAllUsers();
    return users.filter(user => user.role === 'staff' && user.isActive);
  };

  const getTodayAttendance = (): AttendanceRecord[] => {
    const today = new Date().toISOString().split('T')[0];
    return attendanceRecords.filter(record => record.date === today);
  };

  const getDashboardStats = (): DashboardStats => {
    const today = new Date().toISOString().split('T')[0];
    
    // Include both sales and returns in today's transactions
    const todayTransactions = transactions.filter(
      (t) => t.date.split('T')[0] === today
    );
    
    // Count only sales transactions for total sales count
    const totalSalesToday = todayTransactions.filter(t => t.type !== 'return').length;
    
    // Calculate net sales amount (sales minus returns)
    const totalSalesAmount = todayTransactions.reduce(
      (sum, t) => sum + t.totalPrice,
      0
    );
    
    const lowStockThreshold = 10;
    const lowStockItems = stocks.filter((s) => s.quantity < lowStockThreshold).length;

    const allUsers = getAllUsers();
    const staffUsers = allUsers.filter(user => user.role === 'staff');
    const activeStaff = getActiveStaff();

    return {
      totalProducts: products.length,
      totalStock: stocks.reduce((sum, s) => sum + s.quantity, 0),
      lowStockItems,
      totalSalesToday,
      totalSalesAmount,
      activeStaff: activeStaff.length,
      totalStaff: staffUsers.length,
    };
  };

  const getTodayTransactions = (): Transaction[] => {
    const today = new Date().toISOString().split('T')[0];
    // Return all transactions (sales and returns) for today
    return transactions.filter((t) => t.date.split('T')[0] === today);
  };

  const getProductById = (id: string): Product | undefined => {
    return products.find((p) => p.id === id);
  };

  const getSupplierById = (id: string): Supplier | undefined => {
    return suppliers.find((s) => s.id === id);
  };

  const getStockByProductId = (productId: string): Stock | undefined => {
    return stocks.find((s) => s.productId === productId);
  };

  const getUnreadNotificationsCount = (): number => {
    if (!currentUser) return 0;
    return notifications.filter(
      (notification) => notification.userId === currentUser.id && !notification.read
    ).length;
  };

  const getAllUsers = (): User[] => {
    const usersJSON = localStorage.getItem('users');
    return usersJSON ? JSON.parse(usersJSON) : [];
  };

  const deleteUser = async (userId: string): Promise<void> => {
    if (!currentUser) throw new Error('User not authenticated');
    if (currentUser.role !== 'admin') throw new Error('Unauthorized');

    const users = getAllUsers();
    const userToDelete = users.find(u => u.id === userId);
    
    if (!userToDelete) throw new Error('User not found');
    if (userToDelete.role === 'admin') throw new Error('Cannot delete admin users');

    const updatedUsers = users.filter(u => u.id !== userId);
    localStorage.setItem('users', JSON.stringify(updatedUsers));

    // Add activity log
    await addActivityLog(
      'Deleted staff account',
      `Deleted account: ${userToDelete.username}`
    );
  };

  const value: DataContextType = {
    products,
    suppliers,
    stocks,
    transactions,
    productStatuses,
    returnRequests,
    activityLogs,
    notifications,
    addProduct,
    addSupplier,
    addStock,
    addTransaction,
    addProductStatus,
    updateProductStatus,
    editProductStatus,
    addReturnRequest,
    updateReturnRequest,
    addActivityLog,
    addNotification,
    markNotificationAsRead,
    exportProductStatusReport,
    getDashboardStats,
    getTodayTransactions,
    getProductById,
    getSupplierById,
    getStockByProductId,
    getUnreadNotificationsCount,
    getAllUsers,
    deleteUser,
    clockIn,
    clockOut,
    getActiveStaff,
    getTodayAttendance,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};