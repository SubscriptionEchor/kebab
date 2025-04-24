import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, AlertCircle } from 'lucide-react';

interface AddEventOrganizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; contactNumber: string; email: string }) => void;
}

interface FormErrors {
  name?: string;
  contactNumber?: string;
  email?: string;
}

interface FormTouched {
  name: boolean;
  contactNumber: boolean;
  email: boolean;
}

export default function AddEventOrganizerModal({ isOpen, onClose, onSubmit }: AddEventOrganizerModalProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    contactNumber: '',
    email: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<FormTouched>({
    name: false,
    contactNumber: false,
    email: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate individual field
  const validateField = (name: keyof typeof formData, value: string): string | undefined => {
    switch (name) {
      case 'name':
        if (!value.trim()) return t('eventOrganizers.errors.nameRequired');
        if (value.length < 2) return 'Name must be at least 2 characters long';
        return undefined;
      case 'contactNumber':
        if (!value.trim()) return t('eventOrganizers.errors.contactRequired');
        if (!/^\+?[\d\s-]{10,}$/.test(value)) return t('eventOrganizers.errors.invalidContact');
        return undefined;
      case 'email':
        if (!value.trim()) return t('eventOrganizers.errors.emailRequired');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return t('eventOrganizers.errors.invalidEmail');
        return undefined;
      default:
        return undefined;
    }
  };

  // Handle field blur
  const handleBlur = (field: keyof typeof formData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field]);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  // Handle input change
  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  // Validate entire form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    Object.keys(formData).forEach((field) => {
      const error = validateField(field as keyof typeof formData, formData[field as keyof typeof formData]);
      if (error) {
        newErrors[field as keyof FormErrors] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (validateForm()) {
      try {
        await onSubmit(formData);
        setFormData({ name: '', contactNumber: '', email: '' });
        setTouched({ name: false, contactNumber: false, email: false });
        setErrors({});
        onClose();
      } catch (error) {
        console.error('Error submitting form:', error);
      }
    }
    
    setIsSubmitting(false);
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({ name: '', contactNumber: '', email: '' });
      setTouched({ name: false, contactNumber: false, email: false });
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{t('eventOrganizers.addOrganizer')}</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 transition-colors"
            disabled={isSubmitting}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('eventOrganizers.name')}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              className={`w-full px-3 py-2 border rounded-md transition-colors ${
                errors.name ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-brand-primary'
              }`}
              disabled={isSubmitting}
            />
            {errors.name && touched.name && (
              <div className="flex items-center mt-1 text-red-500 text-sm">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.name}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('eventOrganizers.contactNumber')}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.contactNumber}
              onChange={(e) => handleChange('contactNumber', e.target.value)}
              onBlur={() => handleBlur('contactNumber')}
              className={`w-full px-3 py-2 border rounded-md transition-colors ${
                errors.contactNumber ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-brand-primary'
              }`}
              placeholder="+49 123 456 7890"
              disabled={isSubmitting}
            />
            {errors.contactNumber && touched.contactNumber && (
              <div className="flex items-center mt-1 text-red-500 text-sm">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.contactNumber}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('eventOrganizers.email')}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              className={`w-full px-3 py-2 border rounded-md transition-colors ${
                errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-brand-primary'
              }`}
              placeholder="example@domain.com"
              disabled={isSubmitting}
            />
            {errors.email && touched.email && (
              <div className="flex items-center mt-1 text-red-500 text-sm">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.email}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              disabled={isSubmitting}
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-primary text-black rounded-md hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting || Object.keys(errors).length > 0}
            >
              {isSubmitting ? 'Creating...' : t('eventOrganizers.createOrganizer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 