import React, { useState, useEffect } from 'react';
import { User as UserIcon, Calendar, MapPin, Phone, Mail, Save, Edit3 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import PageHeader from '../../components/ui/PageHeader';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import ProfileImageUpload from '../../components/ui/ProfileImageUpload';
import Toast from '../../components/ui/Toast';

const StaffAccountSettingsPage: React.FC = () => {
  const { currentUser, updateProfile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    birthday: '',
    address: '',
    contactNumber: '',
    email: '',
    profileImage: '',
  });

  // Update form data when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setFormData({
        firstName: currentUser.firstName || '',
        middleName: currentUser.middleName || '',
        lastName: currentUser.lastName || '',
        birthday: currentUser.birthday || '',
        address: currentUser.address || '',
        contactNumber: currentUser.contactNumber || '',
        email: currentUser.email || '',
        profileImage: currentUser.profileImage || '',
      });
    }
  }, [currentUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageSelect = (imageUrl: string) => {
    setFormData(prev => ({ ...prev, profileImage: imageUrl }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.firstName.trim()) {
      setError('First name is required');
      return;
    }
    
    if (!formData.lastName.trim()) {
      setError('Last name is required');
      return;
    }
    
    if (!formData.birthday) {
      setError('Birthday is required');
      return;
    }
    
    if (!formData.address.trim()) {
      setError('Address is required');
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
    
    if (!formData.email.trim()) {
      setError('Email address is required');
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await updateProfile({
        firstName: formData.firstName.trim(),
        middleName: formData.middleName.trim(),
        lastName: formData.lastName.trim(),
        birthday: formData.birthday,
        address: formData.address.trim(),
        contactNumber: formData.contactNumber.trim(),
        email: formData.email.trim(),
        profileImage: formData.profileImage,
      });
      
      setIsEditing(false);
      setShowSuccessToast(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const getDisplayName = () => {
    if (currentUser?.firstName && currentUser?.lastName) {
      return `${currentUser.firstName} ${currentUser.lastName}`;
    }
    return currentUser?.username || 'Staff Member';
  };

  const hasCompleteProfile = () => {
    return !!(currentUser?.firstName && currentUser?.lastName && currentUser?.birthday && 
              currentUser?.address && currentUser?.contactNumber && currentUser?.email);
  };

  const resetFormData = () => {
    setFormData({
      firstName: currentUser?.firstName || '',
      middleName: currentUser?.middleName || '',
      lastName: currentUser?.lastName || '',
      birthday: currentUser?.birthday || '',
      address: currentUser?.address || '',
      contactNumber: currentUser?.contactNumber || '',
      email: currentUser?.email || '',
      profileImage: currentUser?.profileImage || '',
    });
  };

  // Show loading screen while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream-50 via-white to-wine-50">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 border-4 border-wine-700 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <div className="space-y-2">
            <p className="text-wine-700 font-semibold text-lg">Loading account settings...</p>
            <p className="text-gray-500 text-sm">Please wait while we prepare your profile</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error if no user
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream-50 via-white to-wine-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserIcon size={32} className="text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">You need to be logged in to access account settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader 
        title="Account Settings" 
        subtitle="Update your personal information and account details"
        action={
          !isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              className="transition-all duration-300 hover:scale-105"
            >
              <Edit3 size={18} className="mr-2" />
              Edit Profile
            </Button>
          )
        }
      />

      <div className="max-w-2xl mx-auto">
        <Card className="transition-all duration-500 hover:shadow-xl">
          <CardHeader className="text-center bg-gradient-to-r from-wine-50 to-cream-50">
            <div className="flex flex-col items-center space-y-4">
              {/* Profile Image */}
              {isEditing ? (
                <ProfileImageUpload
                  onImageSelect={handleImageSelect}
                  currentImage={formData.profileImage}
                  size="xl"
                />
              ) : (
                <div className="relative group">
                  {currentUser?.profileImage ? (
                    <img
                      src={currentUser.profileImage}
                      alt="Profile"
                      className="w-32 h-32 object-cover rounded-full border-4 border-white shadow-lg transition-all duration-300 group-hover:scale-105"
                      onError={(e) => {
                        console.error('Profile image failed to load');
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-32 h-32 bg-gradient-to-br from-wine-100 to-wine-200 rounded-full border-4 border-white shadow-lg flex items-center justify-center transition-all duration-300 group-hover:scale-105">
                      <UserIcon size={48} className="text-wine-600" />
                    </div>
                  )}
                </div>
              )}
              
              <div className="space-y-2">
                <h2 className="text-xl font-serif font-medium text-gray-800 transition-all duration-300">
                  {getDisplayName()}
                </h2>
                <p className="text-sm text-gray-500">@{currentUser?.username}</p>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-gold-400 rounded-full animate-pulse"></div>
                  <p className="text-xs text-gold-600 uppercase tracking-wider font-medium">Staff Member</p>
                </div>
                
                {/* Profile Completion Status */}
                <div className="mt-3">
                  {hasCompleteProfile() ? (
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
            </div>
          </CardHeader>
          
          <CardContent className="transition-all duration-300">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm animate-fade-in border border-red-200">
                    {error}
                  </div>
                )}

                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="First Name *"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Enter first name"
                    fullWidth
                    className="transition-all duration-300 focus:scale-[1.02]"
                  />
                  
                  <Input
                    label="Middle Name"
                    name="middleName"
                    type="text"
                    value={formData.middleName}
                    onChange={handleInputChange}
                    placeholder="Enter middle name"
                    fullWidth
                    className="transition-all duration-300 focus:scale-[1.02]"
                  />
                  
                  <Input
                    label="Last Name *"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Enter last name"
                    fullWidth
                    className="transition-all duration-300 focus:scale-[1.02]"
                  />
                </div>

                {/* Birthday */}
                <div className="relative">
                  <Input
                    label="Birthday *"
                    name="birthday"
                    type="date"
                    value={formData.birthday}
                    onChange={handleInputChange}
                    fullWidth
                    className="pl-10 transition-all duration-300 focus:scale-[1.02]"
                  />
                  <Calendar className="absolute left-3 top-9 text-gray-400 transition-all duration-300" size={18} />
                </div>

                {/* Address */}
                <div className="relative">
                  <Input
                    label="Address *"
                    name="address"
                    type="text"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter complete address"
                    fullWidth
                    className="pl-10 transition-all duration-300 focus:scale-[1.02]"
                  />
                  <MapPin className="absolute left-3 top-9 text-gray-400 transition-all duration-300" size={18} />
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <Input
                      label="Contact Number *"
                      name="contactNumber"
                      type="text"
                      value={formData.contactNumber}
                      onChange={handleInputChange}
                      placeholder="11-digit contact number"
                      maxLength={11}
                      fullWidth
                      className="pl-10 transition-all duration-300 focus:scale-[1.02]"
                    />
                    <Phone className="absolute left-3 top-9 text-gray-400 transition-all duration-300" size={18} />
                    <p className="mt-1 text-xs text-gray-500">Must be 11 digits</p>
                  </div>
                  
                  <div className="relative">
                    <Input
                      label="Email Address *"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter email address"
                      fullWidth
                      className="pl-10 transition-all duration-300 focus:scale-[1.02]"
                    />
                    <Mail className="absolute left-3 top-9 text-gray-400 transition-all duration-300" size={18} />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setError('');
                      resetFormData();
                    }}
                    className="transition-all duration-300 hover:scale-105"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    loading={loading}
                    className="min-w-32 transition-all duration-300 hover:scale-105"
                  >
                    <Save size={18} className="mr-2" />
                    Save Changes
                  </Button>
                </div>
              </form>
            ) : (
              /* View Mode */
              <div className="space-y-6">
                {/* Personal Information */}
                <div className="transition-all duration-300">
                  <h4 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
                    <UserIcon size={20} className="text-wine-600" />
                    Personal Information
                  </h4>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg transition-all duration-300 hover:bg-gray-100">
                      <dt className="text-sm text-gray-500">First Name</dt>
                      <dd className="text-gray-800 font-medium">{currentUser?.firstName || 'Not provided'}</dd>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg transition-all duration-300 hover:bg-gray-100">
                      <dt className="text-sm text-gray-500">Middle Name</dt>
                      <dd className="text-gray-800 font-medium">{currentUser?.middleName || 'Not provided'}</dd>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg transition-all duration-300 hover:bg-gray-100">
                      <dt className="text-sm text-gray-500">Last Name</dt>
                      <dd className="text-gray-800 font-medium">{currentUser?.lastName || 'Not provided'}</dd>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg transition-all duration-300 hover:bg-gray-100 flex items-center gap-2">
                      <Calendar size={16} className="text-gray-400" />
                      <div>
                        <dt className="text-sm text-gray-500">Birthday</dt>
                        <dd className="text-gray-800 font-medium">
                          {currentUser?.birthday ? new Date(currentUser.birthday).toLocaleDateString() : 'Not provided'}
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
                      <div className="flex-1">
                        <dt className="text-sm text-gray-500">Address</dt>
                        <dd className="text-gray-800 font-medium">{currentUser?.address || 'Not provided'}</dd>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg transition-all duration-300 hover:bg-gray-100 flex items-center gap-2">
                      <Phone size={16} className="text-gray-400" />
                      <div className="flex-1">
                        <dt className="text-sm text-gray-500">Contact Number</dt>
                        <dd className="text-gray-800 font-medium">{currentUser?.contactNumber || 'Not provided'}</dd>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg transition-all duration-300 hover:bg-gray-100 flex items-center gap-2">
                      <Mail size={16} className="text-gray-400" />
                      <div className="flex-1">
                        <dt className="text-sm text-gray-500">Email Address</dt>
                        <dd className="text-gray-800 font-medium">{currentUser?.email || 'Not provided'}</dd>
                      </div>
                    </div>
                  </dl>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card className="mt-6 transition-all duration-500 hover:shadow-xl">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
            <h3 className="text-lg font-serif font-medium text-gray-800">Account Information</h3>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg transition-all duration-300 hover:bg-gray-100">
                <dt className="text-sm text-gray-500">Username</dt>
                <dd className="text-gray-800 font-medium">{currentUser?.username}</dd>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg transition-all duration-300 hover:bg-gray-100">
                <dt className="text-sm text-gray-500">Role</dt>
                <dd className="text-gray-800 font-medium">Staff Member</dd>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg transition-all duration-300 hover:bg-gray-100">
                <dt className="text-sm text-gray-500">Account Created</dt>
                <dd className="text-gray-800 font-medium">{currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : 'N/A'}</dd>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg transition-all duration-300 hover:bg-gray-100">
                <dt className="text-sm text-gray-500">Profile Last Updated</dt>
                <dd className="text-gray-800 font-medium">{currentUser?.profileUpdatedAt ? new Date(currentUser.profileUpdatedAt).toLocaleDateString() : 'Never'}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      {/* Success Toast Notification */}
      <Toast
        message="Your account has been successfully updated!"
        type="success"
        duration={4000}
        isVisible={showSuccessToast}
        onClose={() => setShowSuccessToast(false)}
      />
    </div>
  );
};

export default StaffAccountSettingsPage;