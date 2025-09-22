import React, { useState } from 'react';
import { Search, Users, Trash2, Eye, Calendar, MapPin, Phone, Mail, User } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import PageHeader from '../../components/ui/PageHeader';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/ui/Table';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import SuccessModal from '../../components/ui/SuccessModal';
import { User as UserType } from '../../types';

const StaffAccountsPage: React.FC = () => {
  const { getAllUsers, deleteUser } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Get all users and filter staff only
  const allUsers = getAllUsers();
  const staffUsers = allUsers.filter(user => user.role === 'staff');

  const filteredStaff = staffUsers.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${user.firstName || ''} ${user.middleName || ''} ${user.lastName || ''}`.trim().toLowerCase();
    
    return (
      user.username.toLowerCase().includes(searchLower) ||
      fullName.includes(searchLower) ||
      (user.email && user.email.toLowerCase().includes(searchLower)) ||
      (user.contactNumber && user.contactNumber.includes(searchTerm))
    );
  });

  const handleViewUser = (user: UserType) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    setLoading(true);
    setError('');

    try {
      await deleteUser(selectedUser.id);
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
      setSuccessMessage('Staff account deleted successfully');
      setIsSuccessModalOpen(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const getDisplayName = (user: UserType) => {
    if (user.firstName && user.lastName) {
      const middleName = user.middleName ? ` ${user.middleName} ` : ' ';
      return `${user.firstName}${middleName}${user.lastName}`;
    }
    return user.username;
  };

  const hasCompleteProfile = (user: UserType) => {
    return !!(user.firstName && user.lastName && user.birthday && user.address && user.contactNumber && user.email);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader 
        title="Staff Accounts" 
        subtitle="Manage staff accounts and view their information"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-blue-100 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Staff</p>
                <p className="text-2xl font-semibold text-blue-700 transition-all duration-300">{staffUsers.length}</p>
              </div>
              <Users className="text-blue-500 transition-all duration-300 hover:scale-110" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-100 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Complete Profiles</p>
                <p className="text-2xl font-semibold text-green-700 transition-all duration-300">
                  {staffUsers.filter(hasCompleteProfile).length}
                </p>
              </div>
              <Eye className="text-green-500 transition-all duration-300 hover:scale-110" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-amber-50 border-amber-100 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-600 font-medium">Incomplete Profiles</p>
                <p className="text-2xl font-semibold text-amber-700 transition-all duration-300">
                  {staffUsers.filter(user => !hasCompleteProfile(user)).length}
                </p>
              </div>
              <Users className="text-amber-500 transition-all duration-300 hover:scale-110" size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search bar */}
      <div className="relative max-w-md mb-4">
        <Input
          type="text"
          placeholder="Search staff by name, username, email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
          className="pl-10 transition-all duration-300 focus:scale-[1.02]"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-all duration-300" size={18} />
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Profile</TableHeaderCell>
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell>Username</TableHeaderCell>
              <TableHeaderCell>Email</TableHeaderCell>
              <TableHeaderCell>Contact</TableHeaderCell>
              <TableHeaderCell>Profile Status</TableHeaderCell>
              <TableHeaderCell>Joined</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStaff.length > 0 ? (
              filteredStaff.map((user) => (
                <TableRow key={user.id} className="transition-all duration-200 hover:bg-gradient-to-r hover:from-wine-50/50 hover:to-cream-50/50">
                  <TableCell>
                    <div className="flex items-center justify-center">
                      {user.profileImage ? (
                        <img
                          src={user.profileImage}
                          alt={getDisplayName(user)}
                          className="w-10 h-10 object-cover rounded-full border-2 border-white shadow-md transition-all duration-300 hover:scale-110"
                          onError={(e) => {
                            console.error('Profile image failed to load');
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-wine-100 to-wine-200 rounded-full border-2 border-white shadow-md flex items-center justify-center transition-all duration-300 hover:scale-110">
                          <User size={16} className="text-wine-600" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{getDisplayName(user)}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email || 'Not provided'}</TableCell>
                  <TableCell>{user.contactNumber || 'Not provided'}</TableCell>
                  <TableCell>
                    {hasCompleteProfile(user) ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 transition-all duration-300 hover:scale-105">
                        Complete
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 transition-all duration-300 hover:scale-105">
                        Incomplete
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewUser(user)}
                        className="transition-all duration-300 hover:scale-105"
                      >
                        <Eye size={14} className="mr-1" />
                        View
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setIsDeleteModalOpen(true);
                        }}
                        className="transition-all duration-300 hover:scale-105"
                      >
                        <Trash2 size={14} className="mr-1" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  {searchTerm ? 'No staff accounts match your search' : 'No staff accounts found.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* View User Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedUser(null);
        }}
        title="Staff Account Details"
        size="lg"
      >
        {selectedUser && (
          <div className="space-y-6 animate-fade-in">
            {/* Profile Header */}
            <div className="text-center pb-4 border-b transition-all duration-300">
              <div className="flex justify-center mb-4">
                {selectedUser.profileImage ? (
                  <img
                    src={selectedUser.profileImage}
                    alt={getDisplayName(selectedUser)}
                    className="w-24 h-24 object-cover rounded-full border-4 border-white shadow-lg transition-all duration-300 hover:scale-105"
                    onError={(e) => {
                      console.error('Profile image failed to load');
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-br from-wine-100 to-wine-200 rounded-full border-4 border-white shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-105">
                    <Users size={32} className="text-wine-700" />
                  </div>
                )}
              </div>
              <h3 className="text-xl font-serif font-medium text-gray-800 transition-all duration-300">{getDisplayName(selectedUser)}</h3>
              <p className="text-sm text-gray-500">@{selectedUser.username}</p>
              <p className="text-xs text-gold-500 uppercase tracking-wider mt-1">Staff Member</p>
              
              {/* Profile Status */}
              <div className="mt-3">
                {hasCompleteProfile(selectedUser) ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 transition-all duration-300 hover:scale-105">
                    ✓ Profile Complete
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 transition-all duration-300 hover:scale-105">
                    ⚠ Profile Incomplete
                  </span>
                )}
              </div>
            </div>

            {/* Personal Information */}
            <div className="transition-all duration-300">
              <h4 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
                <User size={20} className="text-wine-600" />
                Personal Information
              </h4>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg transition-all duration-300 hover:bg-gray-100">
                  <dt className="text-sm text-gray-500">First Name</dt>
                  <dd className="text-gray-800 font-medium">{selectedUser.firstName || 'Not provided'}</dd>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg transition-all duration-300 hover:bg-gray-100">
                  <dt className="text-sm text-gray-500">Middle Name</dt>
                  <dd className="text-gray-800 font-medium">{selectedUser.middleName || 'Not provided'}</dd>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg transition-all duration-300 hover:bg-gray-100">
                  <dt className="text-sm text-gray-500">Last Name</dt>
                  <dd className="text-gray-800 font-medium">{selectedUser.lastName || 'Not provided'}</dd>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg transition-all duration-300 hover:bg-gray-100 flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400" />
                  <div>
                    <dt className="text-sm text-gray-500">Birthday</dt>
                    <dd className="text-gray-800 font-medium">
                      {selectedUser.birthday ? new Date(selectedUser.birthday).toLocaleDateString() : 'Not provided'}
                    </dd>
                  </div>
                </div>
              </dl>
            </div>

            {/* Contact Information */}
            <div className="transition-all duration-300">
              <h4 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
                <Phone size={20} className="text-wine-600" />
                Contact Information
              </h4>
              <dl className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg transition-all duration-300 hover:bg-gray-100 flex items-center gap-2">
                  <MapPin size={16} className="text-gray-400" />
                  <div>
                    <dt className="text-sm text-gray-500">Address</dt>
                    <dd className="text-gray-800 font-medium">{selectedUser.address || 'Not provided'}</dd>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg transition-all duration-300 hover:bg-gray-100 flex items-center gap-2">
                  <Phone size={16} className="text-gray-400" />
                  <div>
                    <dt className="text-sm text-gray-500">Contact Number</dt>
                    <dd className="text-gray-800 font-medium">{selectedUser.contactNumber || 'Not provided'}</dd>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg transition-all duration-300 hover:bg-gray-100 flex items-center gap-2">
                  <Mail size={16} className="text-gray-400" />
                  <div>
                    <dt className="text-sm text-gray-500">Email Address</dt>
                    <dd className="text-gray-800 font-medium">{selectedUser.email || 'Not provided'}</dd>
                  </div>
                </div>
              </dl>
            </div>

            {/* Account Information */}
            <div className="transition-all duration-300">
              <h4 className="text-lg font-medium text-gray-800 mb-4">Account Information</h4>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg transition-all duration-300 hover:bg-gray-100">
                  <dt className="text-sm text-gray-500">Account Created</dt>
                  <dd className="text-gray-800 font-medium">{new Date(selectedUser.createdAt).toLocaleDateString()}</dd>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg transition-all duration-300 hover:bg-gray-100">
                  <dt className="text-sm text-gray-500">Profile Last Updated</dt>
                  <dd className="text-gray-800 font-medium">
                    {selectedUser.profileUpdatedAt ? new Date(selectedUser.profileUpdatedAt).toLocaleDateString() : 'Never'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedUser(null);
          setError('');
        }}
        title="Delete Staff Account"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              className="transition-all duration-300 hover:scale-105"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteUser}
              loading={loading}
              className="transition-all duration-300 hover:scale-105"
            >
              Delete Account
            </Button>
          </div>
        }
      >
        <div className="space-y-4 animate-fade-in">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-200">
              {error}
            </div>
          )}

          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300 hover:scale-110">
              <Trash2 size={24} className="text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Delete Staff Account</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete the account for <strong>{selectedUser ? getDisplayName(selectedUser) : ''}</strong>?
            </p>
            <p className="text-sm text-red-600">
              This action cannot be undone. All data associated with this account will be permanently removed.
            </p>
          </div>
        </div>
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

export default StaffAccountsPage;