import { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { uploadImage } from '../../lib/api/upload';
import { ImageGuidelines } from './ImageGuidelines';
import { useTranslation } from 'react-i18next';
interface ImageUploadProps {
  image: string | null;
  onImageChange: (url: string | null) => void;
  error?: string;
}
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png'];
const MIN_WIDTH = 800;
const MIN_HEIGHT = 600;
const ALLOWED_ASPECT_RATIOS = [
  { ratio: 16 / 9, name: '16:9' },
  { ratio: 4 / 3, name: '4:3' },
  { ratio: 3 / 4, name: '3:4' },
  { ratio: 1, name: '1:1' },
];
const ASPECT_RATIO_TOLERANCE = 0.05; // 5% tolerance
export default function ImageUpload({ image, onImageChange, error }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const { t } = useTranslation();
  const validateFile = (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      // Basic file type validation
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        resolve('Please upload only PNG or JPG images');
        return;
      }

      // File size validation
      if (file.size > MAX_FILE_SIZE) {
        resolve('Image size must be less than 10MB');
        return;
      }
      // Create an image object to check dimensions
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        // Check minimum dimensions
        if (img.width < MIN_WIDTH || img.height < MIN_HEIGHT) {
          resolve(`${t('common1.imagedimensions')} ${MIN_WIDTH}x${MIN_HEIGHT} ${t('common1.pixels')} `);
          return;
        }
        // Check aspect ratio
        const currentRatio = img.width / img.height;
        const isValidRatio = ALLOWED_ASPECT_RATIOS.some(({ ratio }) => {
          const lowerBound = ratio - ASPECT_RATIO_TOLERANCE;
          const upperBound = ratio + ASPECT_RATIO_TOLERANCE;
          return currentRatio >= lowerBound && currentRatio <= upperBound;
        });
        if (!isValidRatio) {
          resolve(`${t('common1.imageratio')}: ${ALLOWED_ASPECT_RATIOS.map(r => r.name).join(', ')}`);
          return;
        }
        resolve(null);
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve('Invalid image file');
      };
      img.src = objectUrl;
    });
  };
  const handleFileChange = async (file: File) => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return 'Only PNG and JPG images are allowed';
    }

    if (file.size > MAX_FILE_SIZE) {
      return 'Image size must be less than 10MB';
    }

    return null;
  };
  const handleImageUpload = async (file: File) => {
    // Reset any previous errors
    setUploadError(null);
    setIsUploading(true);

    try {
      const error = await validateFile(file);
      if (error) {
        setUploadError(error);
        toast.error(error);
        return;
      }
      // Create FormData and append file with specific key
      const formData = new FormData();
      formData.append('file', file);
      // Upload image and get response
      const result = await uploadImage(formData);
      if (!result.success) {
        setUploadError(result.message || 'Failed to upload image');
        throw new Error(result.message || 'Failed to upload image');
      }
      // Validate returned URL
      if (!result.url) {
        setUploadError('No image URL received');
        throw new Error('No image URL received');
      }
      // Update image state with returned URL
      onImageChange(result.url);
      toast.success(t('common1.imageuploadedsucessfully'));
    } catch (error) {
      console.error('Image upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to upload image');
      toast.error(error instanceof Error ? error.message : 'Failed to upload image');
      onImageChange(null);
    } finally {
      setIsUploading(false);
    }
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleImageUpload(file);
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-brand-primary', 'bg-brand-accent/10');
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-brand-primary', 'bg-brand-accent/10');
  };
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Prevent click if clicking on the remove button
    if ((e.target as HTMLElement).closest('button')) {
      e.stopPropagation();
      return;
    }
    document.getElementById('file-upload')?.click();
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">
          {t('banners.bannerimage')}
        </label>
        <button
          type="button"
          onClick={() => setShowGuidelines(true)}
          className="text-sm text-brand-primary hover:text-brand-primary/80 font-medium"
        >
          {t('banners.viewguidelines')}
        </button>
      </div>
      <div
        className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg transition-all duration-200"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        style={{ cursor: 'pointer' }}
      >
        <div className="space-y-1 text-center">
          {isUploading ? (
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="h-8 w-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-500">{t('banners.uploading')}</p>
            </div>
          ) : image ? (
            <div className="relative">
              <img
                src={image}
                alt="Preview"
                className="mx-auto h-32 w-auto rounded-lg object-cover"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onImageChange(null);
                }}
                className="absolute -top-2 -right-2 bg-red-100 rounded-full p-1 text-red-600 hover:bg-red-200 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <>
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <span className="relative bg-white rounded-md font-medium text-brand-primary hover:text-brand-primary/80">
                  {t('banners.upload')}
                </span>
                <p className="pl-1">{t('banners.dragdrop')}</p>
              </div>
              <input
                id="file-upload"
                type="file"
                // className="sr-only"
                style={{ display: "none" }}
                accept=".jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                }}
              />
            </>
          )}
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        PNG, JPG • Max 10MB • Min {MIN_WIDTH}x{MIN_HEIGHT}px • Ratios: {ALLOWED_ASPECT_RATIOS.map(r => r.name).join(', ')}
      </p>
      {(error || uploadError) && (
        <p className="mt-2 text-sm text-red-600 flex items-center">
          {/* <span className="mr-1">•</span> */}
          {error || uploadError}
        </p>
      )}
      {/* Guidelines Modal */}
      <ImageGuidelines
        isOpen={showGuidelines}
        onClose={() => setShowGuidelines(false)}
      />
    </div>
  );
}