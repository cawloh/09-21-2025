import React, { useState } from 'react';
import { PlusCircle, Search, Phone, User, Building, Eye } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import SuccessModal from '../../components/ui/SuccessModal';

const SuppliersPage: React.FC = () => {
  const { suppliers, addSupplier } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    contactNumber: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      setError('Supplier name is required');
      return;
    }
    
    if (!formData.contactNumber.trim()) {
      setError('Contact number is required');
      return;
    }
    
    if (!/^\d{11}$/.test(formData.contactNumber)) {
      setError('Contact number must be 11 digits');
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      await addSupplier(formData.name.trim(), formData.contactNumber.trim());
      
      // Reset form
      setFormData({
        name: '',
        contactNumber: '',
      });
      
      setIsModalOpen(false);
      setIsSuccessModalOpen(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const filteredSuppliers = suppliers.filter(supplier => 
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contactNumber.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Suppliers" 
        subtitle="Manage your wine and beverage suppliers"
        action={
          <Button 
            onClick={() => setIsModalOpen(true)}
            variant="primary"
          >
            <PlusCircle size={18} className="mr-2" />
            Add Supplier
          </Button>
        }
      />

      {/* Search bar */}
      <div className="relative max-w-md mb-4">
        <Input
          type="text"
          placeholder="Search suppliers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
          className="pl-10"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
      </div>

      {/* Suppliers Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell>Contact Number</TableHeaderCell>
              <TableHeaderCell>Created At</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSuppliers.length > 0 ? (
              filteredSuppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell className="font-medium">{supplier.name}</TableCell>
                  <TableCell>{supplier.contactNumber}</TableCell>
                  <TableCell>{new Date(supplier.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                  {searchTerm ? 'No suppliers match your search' : 'No suppliers found. Add some suppliers to get started.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Supplier Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setFormData({ name: '', contactNumber: '' });
          setError('');
        }}
        title="Add New Supplier"
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
              onClick={handleAddSupplier}
              loading={loading}
              className="px-8"
            >
              Add Supplier
            </Button>
          </div>
        }
      >
        <form onSubmit={handleAddSupplier} className="space-y-8">
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
          
          {/* Supplier Information Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-wine-100 rounded-lg flex items-center justify-center">
                <Building size={16} className="text-wine-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-800">Supplier Information</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              {/* Supplier Name */}
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    label="Supplier Name *"
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter supplier company name"
                    fullWidth
                    autoFocus
                    className="pl-12 text-lg"
                  />
                  <User className="absolute left-4 top-9 text-gray-400" size={18} />
                </div>
                <p className="text-sm text-gray-500 ml-1">
                  Enter the full business name of the supplier
                </p>
              </div>
              
              {/* Contact Number */}
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    label="Contact Number *"
                    id="contactNumber"
                    name="contactNumber"
                    type="text"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                    placeholder="09123456789"
                    maxLength={11}
                    fullWidth
                    className="pl-12 text-lg"
                  />
                  <Phone className="absolute left-4 top-9 text-gray-400" size={18} />
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500 ml-1">
                  <span>• Must be exactly 11 digits</span>
                  <span>• Format: 09XXXXXXXXX</span>
                </div>
                
                {/* Real-time validation feedback */}
                {formData.contactNumber && (
                  <div className="ml-1">
                    {/^\d{11}$/.test(formData.contactNumber) ? (
                      <div className="flex items-center gap-2 text-green-600 text-sm">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Valid contact number
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-amber-600 text-sm">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Must be 11 digits ({formData.contactNumber.length}/11)
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Preview Section */}
          {(formData.name || formData.contactNumber) && (
            <div className="bg-gradient-to-r from-wine-50 to-cream-50 rounded-xl p-6 border border-wine-100">
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Eye size={16} />
                Preview
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-wine-100 rounded-lg flex items-center justify-center">
                    <Building size={18} className="text-wine-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      {formData.name || 'Supplier Name'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formData.contactNumber || 'Contact Number'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>
      </Modal>

      {/* Success Modal */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        message="Supplier added successfully!"
      />
    </div>
  );
};

export default SuppliersPage;