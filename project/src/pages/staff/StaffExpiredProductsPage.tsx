import React, { useState } from 'react';
import { Search, AlertTriangle, Clock, Package, FileText, Calendar } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import PageHeader from '../../components/ui/PageHeader';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import SuccessModal from '../../components/ui/SuccessModal';

const StaffExpiredProductsPage: React.FC = () => {
  const { products, stocks, productStatuses, addProductStatus } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    productId: '',
    quantity: 1,
    notes: '',
  });

  // Filter expired products reported by current user
  const myExpiredProducts = productStatuses.filter(
    status => status.type === 'expired'
  );

  const filteredProducts = myExpiredProducts.filter(
    status => 
      status.productName.toLowerCase().includes(searchTerm.toLowerCase())
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
    
    if (!formData.notes.trim()) {
      setError('Please provide notes about the expired product');
      return;
    }

    const stock = stocks.find(s => s.productId === formData.productId);
    if (!stock || stock.quantity < formData.quantity) {
      setError(`Not enough stock. Only ${stock?.quantity || 0} available.`);
      return;
    }

    setError('');
    setLoading(true);

    try {
      await addProductStatus(
        formData.productId,
        'expired',
        formData.quantity,
        formData.notes.trim()
      );
      
      setFormData({
        productId: '',
        quantity: 1,
        notes: '',
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
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Report Expired Products" 
        subtitle="Report products that have expired"
        action={
          <Button 
            onClick={() => setIsModalOpen(true)}
            variant="primary"
            disabled={products.length === 0 || stocks.length === 0}
          >
            <AlertTriangle size={18} className="mr-2" />
            Report Expired Product
          </Button>
        }
      />

      {/* Search bar */}
      <div className="relative max-w-md mb-4">
        <Input
          type="text"
          placeholder="Search reports..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
          className="pl-10"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Product</TableHeaderCell>
              <TableHeaderCell>Quantity</TableHeaderCell>
              <TableHeaderCell>Reported On</TableHeaderCell>
              <TableHeaderCell>Notes</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.productName}</TableCell>
                  <TableCell>{product.quantity}</TableCell>
                  <TableCell>{new Date(product.reportedAt).toLocaleDateString()}</TableCell>
                  <TableCell>{product.notes}</TableCell>
                  <TableCell>{getStatusBadge(product.status)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  {searchTerm ? 'No reports match your search' : 'No expired products reported yet.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Report Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setFormData({
            productId: '',
            quantity: 1,
            notes: '',
          });
          setError('');
        }}
        title="Report Expired Product"
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
              Submit Report
            </Button>
          </div>
        }
      >
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
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <Package size={16} className="text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-800">Product Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Select Product *"
                id="productId"
                options={[
                  { value: '', label: 'Choose a product' },
                  ...products.map(product => {
                    const stock = stocks.find(s => s.productId === product.id);
                    return {
                      value: product.id,
                      label: `${product.name} (${stock?.quantity || 0} in stock)`
                    };
                  })
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
                fullWidth
                placeholder="Enter quantity"
              />
            </div>
          </div>

          {/* Expiration Details Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <Calendar size={16} className="text-amber-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-800">Expiration Details</h3>
            </div>
            
            <div className="space-y-4">
              <Input
                label="Expiration Notes *"
                id="notes"
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Describe why the product is expired (e.g., past expiry date, spoiled, etc.)"
                fullWidth
                className="text-base"
              />
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <FileText size={16} className="text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-800 mb-1">Reporting Guidelines</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Check the expiry date on the product packaging</li>
                      <li>• Note any visible signs of spoilage or deterioration</li>
                      <li>• Include the actual expiry date if available</li>
                      <li>• Mention storage conditions if relevant</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          {(formData.productId || formData.notes) && (
            <div className="bg-gradient-to-r from-red-50 to-amber-50 rounded-xl p-6 border border-red-100">
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-600" />
                Report Preview
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
      </Modal>

      {/* Success Modal */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        message="Expired product report submitted successfully!"
      />
    </div>
  );
};

export default StaffExpiredProductsPage;