import React, { useRef, useState } from 'react';
import imageCompression from 'browser-image-compression';
import { Upload, X, Camera, User } from 'lucide-react';
import Button from './Button';

interface ProfileImageUploadProps {
  onImageSelect: (imageUrl: string) => void;
  currentImage?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({
  onImageSelect,
  currentImage,
  className = '',
  size = 'lg'
}) => {
  const [preview, setPreview] = useState<string | undefined>(currentImage);
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-40 h-40'
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
    xl: 28
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }

      // Compress the image
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 400,
        useWebWorker: true
      });

      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreview(base64String);
        onImageSelect(base64String);
      };
      reader.onerror = () => {
        alert('Error processing image. Please try again.');
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Error processing image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreview(undefined);
    onImageSelect('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Update preview when currentImage changes
  React.useEffect(() => {
    setPreview(currentImage);
  }, [currentImage]);

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
      />

      <div 
        className={`${sizeClasses[size]} relative group cursor-pointer`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => fileInputRef.current?.click()}
      >
        {preview ? (
          <div className="relative w-full h-full">
            <img
              src={preview}
              alt="Profile"
              className="w-full h-full object-cover rounded-full border-4 border-white shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl"
              onError={(e) => {
                console.error('Profile image failed to load');
                setPreview(undefined);
                onImageSelect('');
              }}
            />
            
            {/* Overlay on hover */}
            <div className={`absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}>
              <Camera size={iconSizes[size]} className="text-white" />
            </div>

            {/* Remove button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveImage();
              }}
              className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all duration-200 shadow-lg hover:scale-110"
            >
              <X size={12} />
            </button>
          </div>
        ) : (
          <div className={`w-full h-full bg-gradient-to-br from-wine-100 to-wine-200 rounded-full border-4 border-white shadow-lg flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl group-hover:from-wine-200 group-hover:to-wine-300`}>
            {loading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-wine-600 border-t-transparent"></div>
            ) : (
              <div className="flex flex-col items-center">
                <User size={iconSizes[size]} className="text-wine-600 mb-1" />
                <Upload size={iconSizes[size] - 4} className="text-wine-500" />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="text-center">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="text-xs"
        >
          {loading ? 'Processing...' : preview ? 'Change Photo' : 'Upload Photo'}
        </Button>
        <p className="text-xs text-gray-500 mt-1">
          Click to upload profile picture
        </p>
      </div>
    </div>
  );
};

export default ProfileImageUpload;