import React, { useState } from 'react';
import { Search, AlertTriangle, Clock, Edit2, Package, Camera, FileText } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import PageHeader from '../../components/ui/PageHeader';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import ImageUpload from '../../components/ui/ImageUpload';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import SuccessModal from '../../components/ui/SuccessModal';

const StaffDamagedProductsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { products, stocks, productStatuses, addProductStatus, editProductStatus } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    productId: '',
    quantity: 1,
    notes: '',
    imageUrl: '',
  });

  // Filter damaged products reported by current user
  const myDamagedProducts = productStatuses.filter(
    status => status.type === 'damaged' && status.reportedBy === currentUser?.id
  );

  const filteredProducts = myDamagedProducts.filter(
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
      setError('Please provide notes about the damaged product');
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
        'damaged',
        formData.quantity,
        formData.notes.trim(),
        formData.imageUrl || undefined
      );
      
      setFormData({
        productId: '',
        quantity: 1,
        notes: '',
        imageUrl: '',
      });
      
      setIsModalOpen(false);
      setIsSuccessModalOpen(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStatus) return;

    if (!formData.notes.trim()) {
      setError('Please provide notes about the damaged product');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await editProductStatus(
        selectedStatus.id,
        formData.notes.trim(),
        formData.imageUrl || undefined
      );
      
      setFormData({
        productId: '',
        quantity: 1,
        notes: '',
        imageUrl: '',
      });
      
      setIsEditModalOpen(false);
      setIsSuccessModalOpen(true);
      setSelectedStatus(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (imageUrl: string) => {
    setFormData(prev => ({ ...prev, imageUrl }));
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
        title="Report Damaged Products" 
        subtitle="Report products that have been damaged"
        action={
          <Button 
            onClick={() => setIsModalOpen(true)}
            variant="primary"
            disabled={products.length === 0 || stocks.length === 0}
          >
            <AlertTriangle size={18} className="mr-2" />
            Report Damaged Product
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
              <TableHeaderCell>Image</TableHeaderCell>
              <TableHeaderCell>Quantity</TableHeaderCell>
              <TableHeaderCell>Reported On</TableHeaderCell>
              <TableHeaderCell>Notes</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.productName}</TableCell>
                  <TableCell>
                    {product.imageUrl ? (
                      <img 
                        src={product.imageUrl} 
                        alt="Damaged product" 
                        className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                        onError={(e) => {
                          console.error('Image failed to load:', product.imageUrl);
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-xs text-gray-400">No image</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{product.quantity}</TableCell>
                  <TableCell>{new Date(product.reportedAt).toLocaleDateString()}</TableCell>
                  <TableCell className="max-w-xs truncate">{product.notes}</TableCell>
                  <TableCell>{getStatusBadge(product.status)}</TableCell>
                  <TableCell>
                    {product.status === 'rejected' && (
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedStatus(product);
                            setFormData({
                              productId: product.productId,
                              quantity: product.quantity,
                              notes: product.notes,
                              imageUrl: product.imageUrl || '',
                            });
                            setIsEditModalOpen(true);
                          }}
                        >
                          <Edit2 size={16} className="mr-1" />
                          Edit Report
                        </Button>
                        {product.reviewNotes && (
                          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                            <strong>Reason:</strong> {product.reviewNotes}
                          </div>
                        )}
                      </div>
                    )}
                    {product.status === 'pending' && (
                      <span className="text-sm text-gray-500">Awaiting review</span>
                    )}
                    {product.status === 'approved' && (
                      <span className="text-sm text-green-600">Report approved</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  {searchTerm ? 'No reports match your search' : 'No damaged products reported yet.'}
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
            imageUrl: '',
          });
          setError('');
        }}
        title="Report Damaged Product"
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

          {/* Damage Details Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <FileText size={16} className="text-amber-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-800">Damage Details</h3>
            </div>
            
            <div className="space-y-4">
              <Input
                label="Damage Description *"
                id="notes"
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Describe the damage (e.g., broken bottle, water damage, expired)"
                fullWidth
                className="text-base"
              />
              <p className="text-sm text-gray-500 ml-1">
                Please provide detailed information about how the product was damaged
              </p>
            </div>
          </div>

          {/* Evidence Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Camera size={16} className="text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-800">Evidence</h3>
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Optional</span>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6">
              <ImageUpload
                onImageSelect={handleImageSelect}
                currentImage={formData.imageUrl}
              />
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Upload a photo showing the damage for verification
                </p>
                <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                  <span>Max 10MB</span>
                  <span>•</span>
                  <span>JPG, PNG, GIF</span>
                  <span>•</span>
                  <span>Clear photos help with approval</span>
                </div>
              </div>
              
              {formData.imageUrl && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">Evidence photo uploaded!</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedStatus(null);
          setFormData({
            productId: '',
            quantity: 1,
            notes: '',
            imageUrl: '',
          });
          setError('');
        }}
        title="Edit Damaged Product Report"
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleEdit}
              loading={loading}
              className="px-8"
            >
              Update Report
            </Button>
          </div>
        }
      >
        <form onSubmit={handleEdit} className="space-y-8">
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

          {selectedStatus?.reviewNotes && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
              <h3 className="font-medium text-amber-800 mb-2 flex items-center gap-2">
                <AlertTriangle size={16} />
                Rejection Reason
              </h3>
              <p className="text-amber-700">{selectedStatus.reviewNotes}</p>
            </div>
          )}

          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
              <Package size={16} />
              Current Report Details
            </h3>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-gray-500">Product</dt>
                <dd className="text-gray-800 font-medium">{selectedStatus?.productName}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Quantity</dt>
                <dd className="text-gray-800 font-medium">{selectedStatus?.quantity}</dd>
              </div>
            </dl>
          </div>
          
          <div className="space-y-4">
            <Input
              label="Updated Damage Description *"
              id="editNotes"
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Update the damage description"
              fullWidth
              className="text-base"
            />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Updated Evidence Photo
            </label>
            <div className="bg-gray-50 rounded-xl p-6">
              <ImageUpload
                onImageSelect={handleImageSelect}
                currentImage={formData.imageUrl}
              />
              {formData.imageUrl && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">Evidence photo updated!</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
      </Modal>

      {/* Success Modal */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        message="Report submitted successfully!"
      />
    </div>
  );
};

export default StaffDamagedProductsPage;