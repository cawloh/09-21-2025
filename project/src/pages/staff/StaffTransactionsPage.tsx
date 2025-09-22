import React, { useState } from 'react';
import { PlusCircle, Search, Calendar } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import SuccessModal from '../../components/ui/SuccessModal';
import { Card, CardContent } from '../../components/ui/Card';

const StaffTransactionsPage: React.FC = () => {
  const { products, stocks, addTransaction, getTodayTransactions } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    productId: '',
    quantity: 1,
  });

  const [selectedProductPrice, setSelectedProductPrice] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  const handleProductChange = (productId: string) => {
    const selectedStock = stocks.find(stock => stock.productId === productId);
    const price = selectedStock ? Number(selectedStock.price) : 0;
    
    setFormData({ ...formData, productId });
    setSelectedProductPrice(price);
    setTotalPrice(price * formData.quantity);
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const quantity = parseInt(e.target.value);
    setFormData({ ...formData, quantity });
    setTotalPrice(selectedProductPrice * quantity);
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.productId) {
      setError('Please select a product');
      return;
    }
    
    if (formData.quantity <= 0) {
      setError('Quantity must be greater than 0');
      return;
    }
    
    const selectedStock = stocks.find(stock => stock.productId === formData.productId);
    if (!selectedStock) {
      setError('Product not in stock');
      return;
    }
    
    if (selectedStock.quantity < formData.quantity) {
      setError(`Not enough stock. Only ${selectedStock.quantity} available.`);
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      await addTransaction(
        formData.productId,
        formData.quantity,
        selectedProductPrice
      );
      
      // Reset form
      setFormData({
        productId: '',
        quantity: 1,
      });
      setSelectedProductPrice(0);
      setTotalPrice(0);
      
      setIsModalOpen(false);
      setIsSuccessModalOpen(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Get today's transactions
  const todayTransactions = getTodayTransactions();
  
  // Filter transactions based on search term
  const filteredTransactions = todayTransactions.filter(transaction => 
    transaction.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.createdByUsername.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate total sales
  const totalSales = todayTransactions.reduce((sum, transaction) => sum + Number(transaction.totalPrice), 0);

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Transactions" 
        subtitle="Process sales and view daily transactions"
        action={
          <Button 
            onClick={() => setIsModalOpen(true)}
            variant="primary"
            disabled={products.length === 0 || stocks.length === 0}
          >
            <PlusCircle size={18} className="mr-2" />
            New Transaction
          </Button>
        }
      />

      {/* Today's summary card */}
      <Card className="bg-gradient-to-r from-wine-50 to-cream-50 border-wine-100">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Calendar size={24} className="text-wine-700 mr-3" />
              <div>
                <h3 className="text-gray-700 font-medium">Today's Sales</h3>
                <p className="text-sm text-gray-500">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex gap-8">
              <div className="text-center">
                <p className="text-sm text-gray-500">Transactions</p>
                <p className="text-2xl font-semibold text-wine-700">{todayTransactions.length}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-semibold text-wine-700">${totalSales.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search bar */}
      <div className="relative max-w-md mb-4">
        <Input
          type="text"
          placeholder="Search transactions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
          className="pl-10"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Time</TableHeaderCell>
              <TableHeaderCell>Type</TableHeaderCell>
              <TableHeaderCell>Product</TableHeaderCell>
              <TableHeaderCell>Quantity</TableHeaderCell>
              <TableHeaderCell>Unit Price</TableHeaderCell>
              <TableHeaderCell>Total</TableHeaderCell>
              <TableHeaderCell>Processed By</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{new Date(transaction.date).toLocaleTimeString()}</TableCell>
                  <TableCell>
                    {transaction.type === 'return' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Return
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Sale
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{transaction.productName}</TableCell>
                  <TableCell className={transaction.type === 'return' ? 'text-red-600' : ''}>
                    {Math.abs(transaction.quantity)}
                  </TableCell>
                  <TableCell className={transaction.type === 'return' ? 'text-red-600' : ''}>
                    ${Math.abs(Number(transaction.price)).toFixed(2)}
                  </TableCell>
                  <TableCell className={`font-medium ${transaction.type === 'return' ? 'text-red-600' : ''}`}>
                    {transaction.type === 'return' ? '-' : ''}${Math.abs(Number(transaction.totalPrice)).toFixed(2)}
                  </TableCell>
                  <TableCell>{transaction.createdByUsername}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  {searchTerm ? 'No transactions match your search' : 'No transactions today. Create a new transaction to get started.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Transaction Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="New Transaction"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAddTransaction}
              loading={loading}
            >
              Complete Transaction
            </Button>
          </div>
        }
      >
        {(products.length === 0 || stocks.length === 0) ? (
          <div className="text-center py-4">
            <h3 className="text-lg font-medium text-gray-800 mb-2">Cannot Create Transaction</h3>
            <p className="text-gray-600 mb-4">
              {products.length === 0 ? 'No products available.' : 'No stock available.'}
            </p>
            <p className="text-gray-600">
              Please contact an administrator to add products and stock.
            </p>
          </div>
        ) : (
          <form onSubmit={handleAddTransaction} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}
            
            <Select
              label="Select Product"
              id="productId"
              options={[
                { value: '', label: 'Choose a product' },
                ...products
                  .filter(product => {
                    const stock = stocks.find(s => s.productId === product.id);
                    return stock && stock.quantity > 0;
                  })
                  .map(product => {
                    const stock = stocks.find(s => s.productId === product.id);
                    return {
                      value: product.id,
                      label: `${product.name} (${stock?.quantity} in stock)`
                    };
                  })
              ]}
              value={formData.productId}
              onChange={handleProductChange}
              fullWidth
            />
            
            <Input
              label="Quantity"
              id="quantity"
              type="number"
              min="1"
              value={formData.quantity}
              onChange={handleQuantityChange}
              fullWidth
            />
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit Price
                </label>
                <div className="bg-gray-50 p-2 rounded-lg border border-gray-200 text-gray-800">
                  ${selectedProductPrice.toFixed(2)}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Price
                </label>
                <div className="bg-wine-50 p-2 rounded-lg border border-wine-100 text-wine-700 font-medium">
                  ${totalPrice.toFixed(2)}
                </div>
              </div>
            </div>
          </form>
        )}
      </Modal>

      {/* Success Modal */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        message="Transaction completed successfully!"
      />
    </div>
  );
};

export default StaffTransactionsPage;