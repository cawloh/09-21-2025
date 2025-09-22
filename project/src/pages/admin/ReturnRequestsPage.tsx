import React, { useState } from 'react';
import { Search, RotateCcw, CheckCircle, XCircle, Clock, Eye, DollarSign } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import PageHeader from '../../components/ui/PageHeader';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/ui/Table';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import SuccessModal from '../../components/ui/SuccessModal';

const ReturnRequestsPage: React.FC = () => {
  const { returnRequests, updateReturnRequest, transactions } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const filteredRequests = returnRequests.filter(
    request => 
      request.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requestedByUsername.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleReview = async (action: 'approved' | 'rejected') => {
    if (!selectedRequest) return;
    
    if (action === 'rejected' && !reviewNotes.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      await updateReturnRequest(selectedRequest.id, action, reviewNotes.trim());
      setIsReviewModalOpen(false);
      setSuccessMessage(`Return request ${action} successfully`);
      setIsSuccessModalOpen(true);
      setReviewNotes('');
      setSelectedRequest(null);
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

  const getOriginalTransaction = (transactionId?: string) => {
    if (!transactionId) return null;
    return transactions.find(t => t.id === transactionId);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Return Requests" 
        subtitle="Review and manage product return requests from staff"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Requests</p>
                <p className="text-2xl font-semibold text-blue-700">{returnRequests.length}</p>
              </div>
              <RotateCcw className="text-blue-500" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 font-medium">Pending Review</p>
                <p className="text-2xl font-semibold text-yellow-700">
                  {returnRequests.filter(r => r.status === 'pending').length}
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
                  {returnRequests.filter(r => r.status === 'approved').length}
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
                  {returnRequests.filter(r => r.status === 'rejected').length}
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
              <TableHeaderCell>Requested By</TableHeaderCell>
              <TableHeaderCell>Requested On</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
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
                  <TableCell>{request.requestedByUsername}</TableCell>
                  <TableCell>{new Date(request.requestedAt).toLocaleDateString()}</TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell>
                    {request.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request);
                            setIsReviewModalOpen(true);
                          }}
                        >
                          <Eye size={14} className="mr-1" />
                          Review
                        </Button>
                      </div>
                    )}
                    {request.status !== 'pending' && request.reviewNotes && (
                      <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded max-w-xs">
                        <strong>Review:</strong> {request.reviewNotes}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  {searchTerm ? 'No return requests match your search' : 'No return requests submitted.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false);
          setSelectedRequest(null);
          setReviewNotes('');
          setError('');
        }}
        title="Review Return Request"
        size="lg"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsReviewModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => handleReview('rejected')}
              loading={loading}
              disabled={loading}
            >
              Reject
            </Button>
            <Button
              variant="primary"
              onClick={() => handleReview('approved')}
              loading={loading}
              disabled={loading}
            >
              Approve
            </Button>
          </div>
        }
      >
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-200">
              {error}
            </div>
          )}

          {/* Request Details */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
            <h3 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
              <RotateCcw size={18} className="text-blue-600" />
              Return Request Details
            </h3>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <dt className="text-sm text-gray-500">Product</dt>
                <dd className="text-gray-800 font-medium">{selectedRequest?.productName}</dd>
              </div>
              <div className="space-y-2">
                <dt className="text-sm text-gray-500">Quantity</dt>
                <dd className="text-gray-800 font-medium">{selectedRequest?.quantity}</dd>
              </div>
              <div className="space-y-2">
                <dt className="text-sm text-gray-500">Reason</dt>
                <dd className="text-gray-800 font-medium">
                  {selectedRequest ? getReasonLabel(selectedRequest.reason) : ''}
                </dd>
              </div>
              <div className="space-y-2">
                <dt className="text-sm text-gray-500">Refund Amount</dt>
                <dd className="text-gray-800 font-medium">
                  {selectedRequest?.refundAmount ? `$${selectedRequest.refundAmount.toFixed(2)}` : 'N/A'}
                </dd>
              </div>
              <div className="space-y-2">
                <dt className="text-sm text-gray-500">Requested By</dt>
                <dd className="text-gray-800 font-medium">{selectedRequest?.requestedByUsername}</dd>
              </div>
              <div className="space-y-2">
                <dt className="text-sm text-gray-500">Requested On</dt>
                <dd className="text-gray-800 font-medium">
                  {selectedRequest ? new Date(selectedRequest.requestedAt).toLocaleDateString() : ''}
                </dd>
              </div>
            </dl>
          </div>

          {/* Return Notes */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="font-medium text-gray-800 mb-3">Return Notes</h4>
            <p className="text-gray-700 bg-white p-4 rounded-lg border">{selectedRequest?.notes}</p>
          </div>

          {/* Original Transaction Details */}
          {selectedRequest?.originalTransactionId && (
            <div className="bg-green-50 rounded-xl p-6 border border-green-100">
              <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                <DollarSign size={18} className="text-green-600" />
                Original Transaction
              </h4>
              {(() => {
                const originalTransaction = getOriginalTransaction(selectedRequest.originalTransactionId);
                const existingReturns = returnRequests.filter(
                  rr => rr.originalTransactionId === selectedRequest.originalTransactionId && 
                       rr.status === 'approved' && rr.id !== selectedRequest.id
                );
                const totalReturned = existingReturns.reduce((sum, rr) => sum + rr.quantity, 0);
                
                return originalTransaction ? (
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm text-gray-500">Transaction Date</dt>
                      <dd className="text-gray-800 font-medium">
                        {new Date(originalTransaction.date).toLocaleDateString()}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Original Quantity</dt>
                      <dd className="text-gray-800 font-medium">{originalTransaction.quantity}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Previously Returned</dt>
                      <dd className="text-gray-800 font-medium">{totalReturned}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Available to Return</dt>
                      <dd className="text-gray-800 font-medium">{originalTransaction.quantity - totalReturned}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Unit Price</dt>
                      <dd className="text-gray-800 font-medium">${originalTransaction.price.toFixed(2)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Total Amount</dt>
                      <dd className="text-gray-800 font-medium">${originalTransaction.totalPrice.toFixed(2)}</dd>
                    </div>
                    {selectedRequest.quantity > (originalTransaction.quantity - totalReturned) && (
                      <div className="col-span-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2 text-red-700">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm font-medium">Warning: Return quantity exceeds available limit</span>
                        </div>
                      </div>
                    )}
                  </dl>
                ) : (
                  <p className="text-gray-600">Original transaction not found</p>
                );
              })()}
            </div>
          )}

          {/* Review Notes Input */}
          <div>
            <Input
              label="Review Notes"
              id="reviewNotes"
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Add your remarks about this return request (required for rejection)"
              fullWidth
            />
            <p className="text-sm text-gray-500 mt-1">
              Provide feedback to the staff member about your decision
            </p>
          </div>

          {/* Impact Summary */}
          <div className="bg-wine-50 rounded-xl p-6 border border-wine-100">
            <h4 className="font-medium text-gray-800 mb-3">Impact if Approved</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Items returned to stock:</span>
                <span className="font-medium text-gray-800">+{selectedRequest?.quantity}</span>
              </div>
              {selectedRequest?.refundAmount && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Refund amount:</span>
                  <span className="font-medium text-gray-800">${selectedRequest.refundAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2 mt-2">
                <span className="text-gray-600">Status change:</span>
                <span className="font-medium text-green-600">Stock will be updated</span>
              </div>
            </div>
          </div>
        </form>
      </Modal>

      {/* Success Modal */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        message={successMessage}
      />
    </div>
  );
};

export default ReturnRequestsPage;