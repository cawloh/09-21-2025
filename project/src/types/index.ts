export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'staff';
  createdAt: string;
  // Profile fields
  firstName?: string;
  middleName?: string;
  lastName?: string;
  birthday?: string;
  address?: string;
  contactNumber?: string;
  email?: string;
  profileImage?: string; // Added profile image field
  profileUpdatedAt?: string;
  // Attendance tracking
  isActive?: boolean;
  lastTimeIn?: string;
  lastTimeOut?: string;
  attendanceRecords?: AttendanceRecord[];
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  timeIn: string;
  timeOut?: string;
  date: string;
  duration?: number; // in minutes
}

export interface Product {
  id: string;
  name: string;
  imageUrl?: string; // Added image field for products
  createdAt: string;
  createdBy: string;
}

export interface ProductStatus {
  id: string;
  productId: string;
  productName: string;
  type: 'expired' | 'damaged';
  quantity: number;
  notes: string;
  status: 'pending' | 'approved' | 'rejected';
  reportedBy: string;
  reportedByUsername: string;
  reportedAt: string;
  reviewedBy?: string;
  reviewedByUsername?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  imageUrl?: string; // New field for damaged product images
  editedAt?: string; // New field to track when a report was edited
  previousReports?: { // History of previous report versions
    notes: string;
    imageUrl?: string;
    reviewNotes?: string;
    status: 'rejected';
    timestamp: string;
  }[];
}

export interface ReturnRequest {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  reason: 'defective' | 'expired' | 'customer_return' | 'damaged' | 'other';
  notes: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedBy: string;
  requestedByUsername: string;
  requestedAt: string;
  reviewedBy?: string;
  reviewedByUsername?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  originalTransactionId?: string; // Link to original sale if applicable
  refundAmount?: number; // Amount to refund if applicable
}

export interface ActivityLog {
  id: string;
  userId: string;
  username: string;
  userRole: 'admin' | 'staff';
  action: string;
  details: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactNumber: string;
  createdAt: string;
  createdBy: string;
}

export interface Stock {
  id: string;
  productId: string;
  productName: string;
  productImageUrl?: string; // Added to include product image in stock
  quantity: number;
  price: number;
  dateAdded: string;
  expiryDate: string;
  supplierId: string;
  supplierName: string;
  createdAt: string;
  createdBy: string;
}

export interface Transaction {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  totalPrice: number;
  date: string;
  createdBy: string;
  createdByUsername: string;
  type?: 'sale' | 'return'; // Track transaction type
  originalTransactionId?: string; // Link to original sale for returns
}

export interface DashboardStats {
  totalProducts: number;
  totalStock: number;
  lowStockItems: number;
  totalSalesToday: number;
  totalSalesAmount: number;
  activeStaff: number;
  totalStaff: number;
}

export interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<User>;
  register: (username: string, password: string) => Promise<User>;
  logout: () => void;
  updateProfile: (profileData: Partial<User>) => Promise<User>;
}

export interface DataContextType {
  products: Product[];
  suppliers: Supplier[];
  stocks: Stock[];
  transactions: Transaction[];
  productStatuses: ProductStatus[];
  returnRequests: ReturnRequest[];
  activityLogs: ActivityLog[];
  notifications: Notification[];
  addProduct: (name: string, imageUrl?: string) => Promise<Product>;
  addSupplier: (name: string, contactNumber: string) => Promise<Supplier>;
  addStock: (
    productId: string,
    quantity: number,
    price: number,
    dateAdded: string,
    expiryDate: string,
    supplierId: string
  ) => Promise<Stock>;
  addTransaction: (
    productId: string,
    quantity: number,
    price: number
  ) => Promise<Transaction>;
  addProductStatus: (
    productId: string,
    type: 'expired' | 'damaged',
    quantity: number,
    notes: string,
    imageUrl?: string
  ) => Promise<ProductStatus>;
  updateProductStatus: (
    statusId: string,
    status: 'approved' | 'rejected',
    reviewNotes: string
  ) => Promise<ProductStatus>;
  editProductStatus: (
    statusId: string,
    notes: string,
    imageUrl?: string
  ) => Promise<ProductStatus>;
  addReturnRequest: (
    productId: string,
    quantity: number,
    reason: 'defective' | 'expired' | 'customer_return' | 'damaged' | 'other',
    notes: string,
    originalTransactionId?: string,
    refundAmount?: number
  ) => Promise<ReturnRequest>;
  updateReturnRequest: (
    requestId: string,
    status: 'approved' | 'rejected',
    reviewNotes: string
  ) => Promise<ReturnRequest>;
  addActivityLog: (
    action: string,
    details: string
  ) => Promise<ActivityLog>;
  addNotification: (
    userId: string,
    title: string,
    message: string
  ) => Promise<Notification>;
  markNotificationAsRead: (id: string) => Promise<void>;
  exportProductStatusReport: (type: 'excel' | 'pdf') => Promise<void>;
  getDashboardStats: () => DashboardStats;
  getTodayTransactions: () => Transaction[];
  getProductById: (id: string) => Product | undefined;
  getSupplierById: (id: string) => Supplier | undefined;
  getStockByProductId: (productId: string) => Stock | undefined;
  getUnreadNotificationsCount: () => number;
  getAllUsers: () => User[];
  deleteUser: (userId: string) => Promise<void>;
  // Attendance functions
  clockIn: (userId: string) => Promise<void>;
  clockOut: (userId: string) => Promise<void>;
  getActiveStaff: () => User[];
  getTodayAttendance: () => AttendanceRecord[];
}