import { Upload, X, Store } from 'lucide-react';

import { toast } from 'sonner';
import { uploadImage } from '../../lib/api/upload';
import { useTranslation } from 'react-i18next';
interface FileWithPreview extends File {
  preview?: string;
}

interface ImageUploadProps {
  type: 'image' | 'logo';
  file: FileWithPreview | null;
  onFileChange: (file: FileWithPreview | null) => void;
  label: string;
  disabled?: boolean;
}

export default function ImageUpload({
  type,
  file,
  onFileChange,
  label,
  disabled = false
}: ImageUploadProps) {
  const { t } = useTranslation();
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) {
      toast.error('You do not have permission to modify images');
      return;
    }

    const selectedFile = e.target.files?.[0];

    if (selectedFile) {
      // const toastId = toast.loading('Uploading image...');

      try {
        // console.log(selectedFile)
        // return
        // Upload image first
        // const formData = new FormData();
        // formData.append('file', selectedFile);

        // const uploadResponse = await uploadImage(formData);

        // if (!uploadResponse.success) {
        //   throw new Error(uploadResponse.message || 'Failed to upload image');
        // }

        // Create preview and update state only after successful upload
        const fileWithPreview = selectedFile as FileWithPreview;
        fileWithPreview.preview = URL.createObjectURL(selectedFile);
        onFileChange(fileWithPreview);

        toast.success(t('common1.imageuploadedsucessfully'))
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error(
          error instanceof Error ? error.message : 'Failed to upload image',
        );
      }
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    if (disabled) {
      e.preventDefault();
      toast.error('You do not have permission to modify images');
      return;
    }

    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      // const toastId = toast.loading('Uploading image...');

      try {
        // Upload image first
        const formData = new FormData();
        formData.append('file', droppedFile);

        const uploadResponse = await uploadImage(formData);

        if (!uploadResponse.success) {
          throw new Error(uploadResponse.message || 'Failed to upload image');
        }

        // Create preview and update state only after successful upload
        const fileWithPreview = droppedFile as FileWithPreview;
        fileWithPreview.preview = URL.createObjectURL(droppedFile);
        onFileChange(fileWithPreview);

        toast.success(t('common1.imageuploadedsucessfully'))
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error(
          error instanceof Error ? error.message : 'Failed to upload image',
        );
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const removeFile = () => {
    if (file?.preview) URL.revokeObjectURL(file.preview);
    onFileChange(null);
  };
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => document.getElementById(`file-upload-${type}`)?.click()}
        className={`w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center transition-colors ${disabled
          ? 'bg-gray-50 cursor-not-allowed'
          : 'cursor-pointer hover:border-brand-primary hover:bg-brand-accent/5'
          }`}
      >
        {file ? (
          <div className="relative">
            <img
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
              src={file.preview}
              alt={`${type} preview`}
              className="h-48 w-full object-cover rounded-md transition-transform duration-200 group-hover:scale-105"
            />
            <div className="hidden h-48 w-full rounded-md bg-brand-accent flex items-center justify-center">
              <Store className="h-12 w-12 text-black" />
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeFile();
              }}
              className="absolute top-2 right-2 p-1 bg-red-100 rounded-full text-red-600 hover:bg-red-200 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="h-8 w-8 mx-auto text-gray-400" />
            <p className="text-sm font-medium text-gray-900">
              {t('imageupload.choose')} {type === 'image' ? t('imageupload.image') : t('imageupload.logo')}
            </p>
            <p className="text-xs text-gray-500">{t('imageupload.ordraganddrop')}</p>
            <input
              id={`file-upload-${type}`}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}