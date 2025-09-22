import React, { useState } from 'react';
import { Search, RotateCcw, Clock, CheckCircle, XCircle, Package, FileText, DollarSign } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import PageHeader from '../../components/ui/PageHeader';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/ui/Table';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import SuccessModal from '../../components/ui/SuccessModal';

const StaffReturnsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { products, stocks, returnRequests, transactions, addReturnRequest } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    productId: '',
    quantity: 1,
    reason: '' as 'defective' | 'expired' | 'customer_return' | 'damaged' | 'other' | '',
    notes: '',
    originalTransactionId: '',
    refundAmount: 0,
  });

  // Filter return requests by current user
  const myReturnRequests = returnRequests.filter(
    request => request.requestedBy === currentUser?.id
  );

  const filteredRequests = myReturnRequests.filter(
    request => 
      request.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.productId) {
      setError('Please select a product');
      return;
    }
    
    if (formData.quantity <= 0) {
      setError('Quantity must be greater than 0');
      return;
    }
    
    if (!formData.reason) {
      setError('Please select a reason for return');
      return;
    }
    
    if (!formData.notes.trim()) {
      setError('Please provide notes about the return');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await addReturnRequest(
        formData.productId,
        formData.quantity,
        formData.reason,
        formData.notes.trim(),
        formData.originalTransactionId || undefined,
        formData.refundAmount || undefined
      );
      
      setFormData({
        productId: '',
        quantity: 1,
        reason: '' as any,
        notes: '',
        originalTransactionId: '',
        refundAmount: 0,
      });
      
      setIsModalOpen(false);
      setIsSuccessModalOpen(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock size={12} className="mr-1" />
            Pending Review
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle size={12} className="mr-1" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle size={12} className="mr-1" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const getReasonLabel = (reason: string) => {
    switch (reason) {
      case 'defective':
        return 'Defective Product';
      case 'expired':
        return 'Expired Product';
      case 'customer_return':
        return 'Customer Return';
      case 'damaged':
        return 'Damaged Product';
      case 'other':
        return 'Other';
      default:
        return reason;
    }
  };

  const reasonOptions = [
    { value: '', label: 'Select a reason' },
    { value: 'defective', label: 'Defective Product' },
    { value: 'expired', label: 'Expired Product' },
    { value: 'customer_return', label: 'Customer Return' },
    { value: 'damaged', label: 'Damaged Product' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Product Returns" 
        subtitle="Submit and track product return requests"
        action={
          <Button 
            onClick={() => setIsModalOpen(true)}
            variant="primary"
            disabled={products.length === 0}
          >
            <RotateCcw size={18} className="mr-2" />
            Submit Return Request
          </Button>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-yellow-50 border-yellow-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 font-medium">Pending</p>
                <p className="text-2xl font-semibold text-yellow-700">
                  {myReturnRequests.filter(r => r.status === 'pending').length}
                </p>
              </div>
              <Clock className="text-yellow-500" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Approved</p>
                <p className="text-2xl font-semibold text-green-700">
                  {myReturnRequests.filter(r => r.status === 'approved').length}
                </p>
              </div>
              <CheckCircle className="text-green-500" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">Rejected</p>
                <p className="text-2xl font-semibold text-red-700">
                  {myReturnRequests.filter(r => r.status === 'rejected').length}
                </p>
              </div>
              <XCircle className="text-red-500" size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search bar */}
      <div className="relative max-w-md mb-4">
        <Input
          type="text"
          placeholder="Search return requests..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
          className="pl-10"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
      </div>

      {/* Return Requests Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Product</TableHeaderCell>
              <TableHeaderCell>Quantity</TableHeaderCell>
              <TableHeaderCell>Reason</TableHeaderCell>
              <TableHeaderCell>Refund Amount</TableHeaderCell>
              <TableHeaderCell>Requested On</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Review Notes</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRequests.length > 0 ? (
              filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.productName}</TableCell>
                  <TableCell>{request.quantity}</TableCell>
                  <TableCell>{getReasonLabel(request.reason)}</TableCell>
                  <TableCell>
                    {request.refundAmount ? `$${request.refundAmount.toFixed(2)}` : 'N/A'}
                  </TableCell>
                  <TableCell>{new Date(request.requestedAt).toLocaleDateString()}</TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell className="max-w-xs">
                    {request.reviewNotes ? (
                      <div className="truncate" title={request.reviewNotes}>
                        {request.reviewNotes}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  {searchTerm ? 'No return requests match your search' : 'No return requests submitted yet.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Submit Return Request Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setFormData({
            productId: '',
            quantity: 1,
            reason: '' as any,
            notes: '',
            originalTransactionId: '',
            refundAmount: 0,
          });
          setError('');
        }}
        title="Submit Return Request"
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              loading={loading}
              className="px-8"
            >
              Submit Request
            </Button>
          </div>
        }
      >
        {products.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-800 mb-3">No Products Available</h3>
            <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
              There are no products available to return. Please contact an administrator.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm animate-fade-in">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              </div>
            )}
            
            {/* Product Selection Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Package size={20} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Product Information</h3>
                  <p className="text-sm text-gray-600">Select the product to return</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                  label="Product *"
                  id="productId"
                  options={[
                    { value: '', label: 'Select a product' },
                    ...products.map(product => ({
                      value: product.id,
                      label: product.name
                    }))
                  ]}
                  value={formData.productId}
                  onChange={(value) => setFormData({ ...formData, productId: value })}
                  fullWidth
                />
                
                <Input
                  label="Quantity *"
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                  placeholder="Enter quantity to return"
                  fullWidth
                />
              </div>
            </div>
            
            {/* Return Details Section */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <RotateCcw size={20} className="text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Return Details</h3>
                  <p className="text-sm text-gray-600">Specify the reason and details</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <Select
                  label="Reason for Return *"
                  id="reason"
                  options={reasonOptions}
                  value={formData.reason}
                  onChange={(value) => setFormData({ ...formData, reason: value as any })}
                  fullWidth
                />
                
                <Input
                  label="Return Notes *"
                  id="notes"
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Provide detailed information about the return"
                  fullWidth
                  className="text-base"
                />
              </div>
            </div>

            {/* Optional Transaction Details Section */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <DollarSign size={20} className="text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Transaction Details</h3>
                  <p className="text-sm text-gray-600">Optional: Link to original sale</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                  label="Original Transaction (Optional)"
                  id="originalTransactionId"
                  options={[
                    { value: '', label: 'Select original transaction' },
                    ...transactions
                      .filter(t => t.productId === formData.productId && t.type !== 'return')
                      .map(transaction => ({
                        value: transaction.id,
                        label: `${new Date(transaction.date).toLocaleDateString()} - ${transaction.quantity} units - $${transaction.totalPrice.toFixed(2)}`
                      }))
                  ]}
                  value={formData.originalTransactionId}
                  onChange={(value) => {
                    const transaction = transactions.find(t => t.id === value);
                    setFormData({ 
                      ...formData, 
                      originalTransactionId: value,
                      refundAmount: transaction ? transaction.totalPrice : 0
                    });
                  }}
                  fullWidth
                />
                
                <Input
                  label="Refund Amount (Optional)"
                  id="refundAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.refundAmount}
                  onChange={(e) => setFormData({ ...formData, refundAmount: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  fullWidth
                />
              </div>
              
              {/* Show transaction limits when original transaction is selected */}
              {formData.originalTransactionId && (() => {
                const originalTransaction = transactions.find(t => t.id === formData.originalTransactionId);
                if (!originalTransaction) return null;
                
                const existingReturns = returnRequests.filter(
                  rr => rr.originalTransactionId === formData.originalTransactionId && 
                       rr.status === 'approved'
                );
                
                const totalReturned = existingReturns.reduce((sum, rr) => sum + rr.quantity, 0);
                const availableToReturn = originalTransaction.quantity - totalReturned;
                
                return (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">Transaction Limits</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-blue-600">Originally Purchased:</span>
                        <p className="font-medium text-blue-800">{originalTransaction.quantity} items</p>
                      </div>
                      <div>
                        <span className="text-blue-600">Already Returned:</span>
                        <p className="font-medium text-blue-800">{totalReturned} items</p>
                      </div>
                      <div>
                        <span className="text-blue-600">Available to Return:</span>
                        <p className="font-medium text-blue-800">{availableToReturn} items</p>
                      </div>
                    </div>
                    {formData.quantity > availableToReturn && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                        ⚠️ Quantity exceeds available return limit
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Preview Section */}
            {(formData.productId || formData.notes) && (
              <div className="bg-gradient-to-r from-wine-50 to-cream-50 rounded-xl p-6 border border-wine-100">
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <FileText size={16} className="text-wine-600" />
                  Return Request Preview
                </h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Product:</span>
                      <p className="font-medium text-gray-800">
                        {formData.productId ? products.find(p => p.id === formData.productId)?.name : 'Not selected'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Quantity:</span>
                      <p className="font-medium text-gray-800">{formData.quantity}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Reason:</span>
                      <p className="font-medium text-gray-800">
                        {formData.reason ? getReasonLabel(formData.reason) : 'Not selected'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Refund Amount:</span>
                      <p className="font-medium text-gray-800">
                        {formData.refundAmount ? `$${formData.refundAmount.toFixed(2)}` : 'N/A'}
                      </p>
                    </div>
                  </div>
                  {formData.notes && (
                    <div>
                      <span className="text-gray-500 text-sm">Notes:</span>
                      <p className="text-gray-800 mt-1">{formData.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </form>
        )}
      </Modal>

      {/* Success Modal */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        message="Return request submitted successfully!"
      />
    </div>
  );
};

export default StaffReturnsPage;