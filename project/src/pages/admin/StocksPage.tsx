import React, { useState } from 'react';
import { PlusCircle, Search, Eye, Package, Calendar, Truck, DollarSign } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import SuccessModal from '../../components/ui/SuccessModal';

const StocksPage: React.FC = () => {
  const { products, suppliers, stocks, addStock } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    productId: '',
    quantity: 1,
    price: '',
    dateAdded: new Date().toISOString().split('T')[0],
    expiryDate: '',
    supplierId: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.productId) {
      setError('Please select a product');
      return;
    }
    
    if (!formData.supplierId) {
      setError('Please select a supplier');
      return;
    }
    
    if (formData.quantity <= 0) {
      setError('Quantity must be greater than 0');
      return;
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError('Price must be greater than 0');
      return;
    }
    
    if (!formData.expiryDate) {
      setError('Expiry date is required');
      return;
    }
    
    // Check if expiry date is in the future
    const today = new Date();
    const expiryDate = new Date(formData.expiryDate);
    if (expiryDate <= today) {
      setError('Expiry date must be in the future');
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      await addStock(
        formData.productId,
        formData.quantity,
        parseFloat(formData.price),
        formData.dateAdded,
        formData.expiryDate,
        formData.supplierId
      );
      
      // Reset form
      setFormData({
        productId: '',
        quantity: 1,
        price: '',
        dateAdded: new Date().toISOString().split('T')[0],
        expiryDate: '',
        supplierId: '',
      });
      
      setIsModalOpen(false);
      setIsSuccessModalOpen(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const filteredStocks = stocks.filter(stock => 
    stock.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.supplierName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort stocks: new stock first, then by quantity (out of stock last)
  const sortedStocks = filteredStocks.sort((a, b) => {
    // First, sort by date (newest first)
    const dateA = new Date(a.dateAdded).getTime();
    const dateB = new Date(b.dateAdded).getTime();
    
    // If added today, prioritize
    const today = new Date().toISOString().split('T')[0];
    const isNewA = a.dateAdded === today;
    const isNewB = b.dateAdded === today;
    
    if (isNewA && !isNewB) return -1;
    if (!isNewA && isNewB) return 1;
    
    // Then sort by quantity (available stock first)
    if (a.quantity === 0 && b.quantity > 0) return 1;
    if (a.quantity > 0 && b.quantity === 0) return -1;
    
    // Finally by date (newest first)
    return dateB - dateA;
  });

  const getStockStatus = (quantity: number, dateAdded: string) => {
    const today = new Date().toISOString().split('T')[0];
    const isNewStock = dateAdded === today;
    
    if (quantity === 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Out of Stock
        </span>
      );
    } else if (quantity <= 10) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
          Low Stock
        </span>
      );
    } else if (isNewStock) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 animate-pulse">
          ✨ New Stock
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Available
        </span>
      );
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Stock Management" 
        subtitle="Manage inventory levels and stock information"
        action={
          <Button 
            onClick={() => setIsModalOpen(true)}
            variant="primary"
            disabled={products.length === 0 || suppliers.length === 0}
          >
            <PlusCircle size={18} className="mr-2" />
            Add Stock
          </Button>
        }
      />

      {/* Search bar */}
      <div className="relative max-w-md mb-4">
        <Input
          type="text"
          placeholder="Search stocks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
          className="pl-10"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
      </div>

      {/* Stocks Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Product</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Quantity</TableHeaderCell>
              <TableHeaderCell>Price</TableHeaderCell>
              <TableHeaderCell>Added On</TableHeaderCell>
              <TableHeaderCell>Expiry Date</TableHeaderCell>
              <TableHeaderCell>Supplier</TableHeaderCell>
              <TableHeaderCell>Image</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedStocks.length > 0 ? (
              sortedStocks.map((stock) => (
                <TableRow key={stock.id}>
                  <TableCell className="font-medium">{stock.productName}</TableCell>
                  <TableCell>{getStockStatus(stock.quantity, stock.dateAdded)}</TableCell>
                  <TableCell className={stock.quantity === 0 ? 'text-red-600 font-medium' : stock.quantity <= 10 ? 'text-amber-600 font-medium' : ''}>
                    {stock.quantity}
                  </TableCell>
                  <TableCell>${stock.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {new Date(stock.dateAdded).toLocaleDateString()}
                      {stock.dateAdded === new Date().toISOString().split('T')[0] && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Today
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{new Date(stock.expiryDate).toLocaleDateString()}</TableCell>
                  <TableCell>{stock.supplierName}</TableCell>
                  <TableCell>
                    {stock.productImageUrl ? (
                      <div className="flex items-center gap-2">
                        <img 
                          src={stock.productImageUrl} 
                          alt={stock.productName} 
                          className="w-12 h-12 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80"
                          onClick={() => {
                            setSelectedImage(stock.productImageUrl!);
                            setIsImageModalOpen(true);
                          }}
                          onError={(e) => {
                            console.error('Product image failed to load:', stock.productImageUrl);
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedImage(stock.productImageUrl!);
                            setIsImageModalOpen(true);
                          }}
                        >
                          <Eye size={14} />
                        </Button>
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-xs text-gray-400">No image</span>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  {searchTerm ? 'No stocks match your search' : 'No stocks found. Add some stock to get started.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Stock Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setFormData({
            productId: '',
            quantity: 1,
            price: '',
            dateAdded: new Date().toISOString().split('T')[0],
            expiryDate: '',
            supplierId: '',
          });
          setError('');
        }}
        title="Add New Stock"
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
              onClick={handleAddStock}
              loading={loading}
              className="px-8"
            >
              Add Stock
            </Button>
          </div>
        }
      >
        {(products.length === 0 || suppliers.length === 0) ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-800 mb-3">Cannot Add Stock</h3>
            <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
              {products.length === 0 ? 'You need to add products first.' : 'You need to add suppliers first.'}
            </p>
            <Button 
              variant="primary"
              onClick={() => {
                setIsModalOpen(false);
                if (products.length === 0) {
                  window.location.href = '/admin/products';
                } else {
                  window.location.href = '/admin/suppliers';
                }
              }}
            >
              {products.length === 0 ? 'Go to Products' : 'Go to Suppliers'}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleAddStock} className="space-y-8">
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
            
            {/* Product and Supplier Selection */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Package size={20} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Product & Supplier</h3>
                  <p className="text-sm text-gray-600">Select the product and supplier</p>
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
                  onChange={(value) => handleSelectChange('productId', value)}
                  fullWidth
                />
                
                <Select
                  label="Supplier *"
                  id="supplierId"
                  options={[
                    { value: '', label: 'Select a supplier' },
                    ...suppliers.map(supplier => ({
                      value: supplier.id,
                      label: supplier.name
                    }))
                  ]}
                  value={formData.supplierId}
                  onChange={(value) => handleSelectChange('supplierId', value)}
                  fullWidth
                />
              </div>
            </div>

            {/* Stock Details */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <DollarSign size={20} className="text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Stock Details</h3>
                  <p className="text-sm text-gray-600">Enter quantity and pricing information</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Quantity *"
                  name="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  placeholder="Enter quantity"
                  fullWidth
                />
                
                <Input
                  label="Price per Unit *"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  fullWidth
                />
              </div>
            </div>

            {/* Dates */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Calendar size={20} className="text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Important Dates</h3>
                  <p className="text-sm text-gray-600">Set stock and expiry dates</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Date Added *"
                  name="dateAdded"
                  type="date"
                  value={formData.dateAdded}
                  onChange={handleInputChange}
                  fullWidth
                />
                
                <Input
                  label="Expiry Date *"
                  name="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  fullWidth
                />
              </div>
            </div>

            {/* Preview */}
            {(formData.productId && formData.quantity && formData.price) && (
              <div className="bg-gradient-to-r from-wine-50 to-cream-50 rounded-xl p-6 border border-wine-100">
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Eye size={16} className="text-wine-600" />
                  Stock Preview
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Product:</span>
                    <p className="font-medium text-gray-800">
                      {products.find(p => p.id === formData.productId)?.name}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Supplier:</span>
                    <p className="font-medium text-gray-800">
                      {suppliers.find(s => s.id === formData.supplierId)?.name || 'Not selected'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Quantity:</span>
                    <p className="font-medium text-gray-800">{formData.quantity} units</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Total Value:</span>
                    <p className="font-medium text-wine-700">
                      ${(parseFloat(formData.price || '0') * formData.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </form>
        )}
      </Modal>

      {/* Image Modal */}
      <Modal
        isOpen={isImageModalOpen}
        onClose={() => {
          setIsImageModalOpen(false);
          setSelectedImage('');
        }}
        title="Product Image"
        size="lg"
      >
        <div className="flex justify-center">
          <img 
            src={selectedImage} 
            alt="Product - full size" 
            className="max-w-full max-h-96 object-contain rounded-lg"
            onError={(e) => {
              console.error('Image failed to load:', selectedImage);
            }}
          />
        </div>
      </Modal>

      {/* Success Modal */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        message="Stock added successfully!"
      />
    </div>
  );
};

export default StocksPage;