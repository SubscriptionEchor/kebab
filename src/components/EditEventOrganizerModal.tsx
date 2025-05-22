import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface EditEventOrganizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizer: {
    id: string;
    displayId?: string;
    name: string;
    contactNumber: string;
    email: string;
    password: string;
  } | null;
  onSubmit: (data: { name: string; contactNumber: string; email: string; password: string }) => void;
}

interface FormErrors {
  name?: string;
  contactNumber?: string;
  email?: string;
  password?: string;
}

export default function EditEventOrganizerModal({
  isOpen,
  onClose,
  organizer,
  onSubmit
}: EditEventOrganizerModalProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    contactNumber: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState({
    name: false,
    contactNumber: false,
    email: false,
    password: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (organizer) {
      setFormData({
        name: organizer.name,
        contactNumber: organizer.contactNumber,
        email: organizer.email,
        password: organizer.password,
      });
    }
  }, [organizer]);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (touched[field]) {
      validateField(field, value);
    }
  };

  const handleBlur = (field: keyof typeof formData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  const validateField = (field: keyof typeof formData, value: string): string | undefined => {
    switch (field) {
      case 'name':
        return value.trim()
          ? undefined
          : t('eventOrganizers.validation1.nameRequired');
      case 'contactNumber':
        return value.trim()
          ? undefined
          : t('eventOrganizers.validation1.contactRequired');
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
          ? undefined
          : t('eventOrganizers.validation1.emailInvalid');
      case 'username':
        return value.trim()
          ? undefined
          : t('eventOrganizers.validation1.usernameRequired');
      case 'password':
        return value.length >= 6
          ? undefined
          : t('eventOrganizers.validation1.passwordMinLength');
      default:
        return undefined;
    }
  };

  const isFormValid = (): boolean => {
    return Object.values(formData).every(value => value.trim() !== '') &&
          Object.values(errors).every(error => !error);
  };

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
        onClose();
      } catch (error) {
        console.error('Error submitting form:', error);
      }
    }
    setIsSubmitting(false);
  };

  if (!isOpen || !organizer) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {t('eventOrganizers.editOrganizer')}
          </h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('eventOrganizers.fields.name')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={e => handleChange('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              disabled={isSubmitting}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none ${
                errors.name ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-brand-primary'
              }`}
            />
            {errors.name && touched.name && (
              <p className="mt-1 text-sm text-red-500 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Contact Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('eventOrganizers.fields.contactNumber')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.contactNumber}
              onChange={e => handleChange('contactNumber', e.target.value)}
              onBlur={() => handleBlur('contactNumber')}
              placeholder="+49 123 456 7890"
              disabled={isSubmitting}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none ${
                errors.contactNumber
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:border-brand-primary'
              }`}
            />
            {errors.contactNumber && touched.contactNumber && (
              <p className="mt-1 text-sm text-red-500 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.contactNumber}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('eventOrganizers.fields.email')} <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={e => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              placeholder="example@domain.com"
              disabled={isSubmitting}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none ${
                errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-brand-primary'
              }`}
            />
            {errors.email && touched.email && (
              <p className="mt-1 text-sm text-red-500 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.email}
              </p>
            )}
          </div>

          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => handleChange('username', e.target.value)}
              onBlur={() => handleBlur('username')}
              className={`w-full px-3 py-2 border rounded-md transition-colors ${
                errors.username ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-brand-primary'
              }`}
              placeholder="Enter username"
              disabled={isSubmitting}
            />
            {errors.username && touched.username && (
              <div className="flex items-center mt-1 text-red-500 text-sm">
                <AlertCircle className="h-4 w-4 mr-1" />
                {t('eventOrganizers.validation.usernameRequired')}
              </div>
            )}
          </div> */}

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('eventOrganizers.fields.password')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={e => handleChange('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                placeholder={t('eventOrganizers.placeholders.password')}
                disabled={isSubmitting}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none ${
                  errors.password
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:border-brand-primary'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                disabled={isSubmitting}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">ID</label>
              <div className="text-sm text-gray-900">{organizer.displayId || organizer.id}</div>
            </div>
            {errors.password && touched.password && (
              <p className="mt-1 text-sm text-red-500 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.password}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isFormValid()}
              className="px-4 py-2 bg-brand-primary text-black rounded-md hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? t('eventOrganizers.creating') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
