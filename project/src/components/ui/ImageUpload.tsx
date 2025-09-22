import React, { useRef, useState } from 'react';
import imageCompression from 'browser-image-compression';
import { Upload, X } from 'lucide-react';
import Button from './Button';

interface ImageUploadProps {
  onImageSelect: (imageUrl: string) => void;
  currentImage?: string;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageSelect,
  currentImage,
  className = ''
}) => {
  const [preview, setPreview] = useState<string | undefined>(currentImage);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true
      });

      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        console.log('Image processed successfully, size:', base64String.length);
        setPreview(base64String);
        onImageSelect(base64String);
      };
      reader.onerror = () => {
        console.error('Error reading file');
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
    <div className={`space-y-4 ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
      />

      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg border border-gray-200"
            onError={(e) => {
              console.error('Preview image failed to load');
              setPreview(undefined);
              onImageSelect('');
            }}
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-48 flex flex-col items-center justify-center border-2 border-dashed hover:border-wine-300 hover:bg-wine-50"
          disabled={loading}
        >
          <Upload size={24} className="mb-2 text-gray-400" />
          <span className="text-sm text-gray-600">
            {loading ? 'Processing image...' : 'Click to upload image'}
          </span>
          <span className="text-xs text-gray-400 mt-1">
            Supports JPG, PNG, GIF (max 10MB)
          </span>
        </Button>
      )}
    </div>
  );
};

export default ImageUpload;