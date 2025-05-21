import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface AddEventOrganizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; contactNumber: string; email: string; password: string }) => void;
}

interface FormErrors {
  name?: string;
  contactNumber?: string;
  email?: string;
  password?: string;
}

interface FormTouched {
  name: boolean;
  contactNumber: boolean;
  email: boolean;
  password: boolean;
}

export default function AddEventOrganizerModal({ isOpen, onClose, onSubmit }: AddEventOrganizerModalProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    contactNumber: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<FormTouched>({
    name: false,
    contactNumber: false,
    email: false,
    password: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      case 'password':
        if (!value.trim()) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters long';
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
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
    const error = validateField(field, value);
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
    } else {
      // Remove the error if the field is now valid
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
    if (!touched[field]) {
      setTouched(prev => ({ ...prev, [field]: true }));
    }
  };

  // Check if form is valid
  const isFormValid = () => {
    // Check if all required fields are filled and valid
    const requiredFields = ['name', 'contactNumber', 'email', 'password'] as const;
    const isAllFieldsValid = requiredFields.every(field => {
      const value = formData[field];
      return value.trim() !== '' && !validateField(field, value);
    });
    
    return isAllFieldsValid;
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
        await onSubmit({
          name: formData.name,
          contactNumber: formData.contactNumber,
          email: formData.email,
          password: formData.password
        });
        setFormData({ name: '', contactNumber: '', email: '', password: '' });
        setTouched({ name: false, contactNumber: false, email: false, password: false });
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
      setFormData({
        name: '',
        contactNumber: '',
        email: '',
        password: '',
      });
      setTouched({ name: false, contactNumber: false, email: false, password: false });
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                className={`w-full px-3 py-2 border rounded-md transition-colors ${
                  errors.password ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-brand-primary'
                }`}
                placeholder="Enter password"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                disabled={isSubmitting}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && touched.password && (
              <div className="flex items-center mt-1 text-red-500 text-sm">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.password}
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
              disabled={isSubmitting || !isFormValid()}
            >
              {isSubmitting ? 'Creating...' : t('eventOrganizers.createOrganizer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}