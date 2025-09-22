import React, { useState } from 'react';
import { PlusCircle, Search, Eye, Upload, Image } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import ImageUpload from '../../components/ui/ImageUpload';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import SuccessModal from '../../components/ui/SuccessModal';

const ProductsPage: React.FC = () => {
  const { products, addProduct } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [productName, setProductName] = useState('');
  const [productImage, setProductImage] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productName.trim()) {
      setError('Product name is required');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await addProduct(productName.trim(), productImage || undefined);
      setProductName('');
      setProductImage('');
      setIsModalOpen(false);
      setIsSuccessModalOpen(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (imageUrl: string) => {
    setProductImage(imageUrl);
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Products" 
        subtitle="Manage your wine and beverage products"
        action={
          <Button 
            onClick={() => setIsModalOpen(true)}
            variant="primary"
          >
            <PlusCircle size={18} className="mr-2" />
            Add Product
          </Button>
        }
      />

      {/* Search bar */}
      <div className="relative max-w-md mb-4">
        <Input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
          className="pl-10"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell>Created At</TableHeaderCell>
              <TableHeaderCell>Image</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{new Date(product.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {product.imageUrl ? (
                      <div className="flex items-center gap-2">
                        <img 
                          src={product.imageUrl} 
                          alt={product.name} 
                          className="w-16 h-16 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80"
                          onClick={() => {
                            setSelectedImage(product.imageUrl!);
                            setIsImageModalOpen(true);
                          }}
                          onError={(e) => {
                            console.error('Product image failed to load:', product.imageUrl);
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedImage(product.imageUrl!);
                            setIsImageModalOpen(true);
                          }}
                        >
                          <Eye size={14} />
                        </Button>
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-xs text-gray-400">No image</span>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                  {searchTerm ? 'No products match your search' : 'No products found. Add some products to get started.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setProductName('');
          setProductImage('');
          setError('');
        }}
        title="Add New Product"
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
              onClick={handleAddProduct}
              loading={loading}
              className="px-8"
            >
              Add Product
            </Button>
          </div>
        }
      >
        <form onSubmit={handleAddProduct} className="space-y-8">
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
          
          {/* Product Name Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-wine-100 rounded-lg flex items-center justify-center">
                <PlusCircle size={16} className="text-wine-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-800">Product Information</h3>
            </div>
            
            <Input
              label="Product Name *"
              id="productName"
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Enter product name (e.g., Red Wine Cabernet)"
              fullWidth
              autoFocus
              className="text-lg"
            />
          </div>

          {/* Product Image Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Image size={16} className="text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-800">Product Image</h3>
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Optional</span>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6">
              <ImageUpload
                onImageSelect={handleImageSelect}
                currentImage={productImage}
              />
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Upload a high-quality image of your product
                </p>
                <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Upload size={12} />
                    Max 10MB
                  </span>
                  <span>•</span>
                  <span>JPG, PNG, GIF</span>
                  <span>•</span>
                  <span>Recommended: 800x800px</span>
                </div>
              </div>
              
              {productImage && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">Image uploaded successfully!</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
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
        message="Product added successfully!"
      />
    </div>
  );
};

export default ProductsPage;