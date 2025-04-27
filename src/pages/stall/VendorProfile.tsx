import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import LoadingState from '../../components/LoadingState';

interface VendorProfileData {
  stallId: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    idNumber: string;
  };
  businessInfo: {
    stallName: string;
    registrationNumber: string;
    taxId: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    businessType: string;
    description: string;
    shopCategory: string;
    cuisines: string[];
  };
  orderSettings: {
    orderPrefix: string;
    minimumOrder: number;
    deliveryTime: number;
    username: string;
    password: string;
  };
  bankAccountInfo: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    branchName: string;
    swiftCode: string;
  };
  documents: {
    stallImage: string | null;
    stallLogo: string | null;
    businessLicense: string | null;
    registrationCertificate: string | null;
    bankStatement: string | null;
    taxDocument: string | null;
    idCard: string | null;
  };
}

export default function StallVendorProfile() {
  const { t } = useTranslation();
  const { stallId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<keyof VendorProfileData['documents'] | null>(null);
  const [formData, setFormData] = useState<VendorProfileData>({
    stallId: '',
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      idNumber: ''
    },
    businessInfo: {
      stallName: '',
      registrationNumber: '',
      taxId: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      businessType: '',
      description: '',
      shopCategory: 'restaurant',
      cuisines: []
    },
    orderSettings: {
      orderPrefix: '',
      minimumOrder: 15,
      deliveryTime: 30,
      username: '',
      password: ''
    },
    bankAccountInfo: {
      accountName: '',
      accountNumber: '',
      bankName: '',
      branchName: '',
      swiftCode: ''
    },
    documents: {
      stallImage: null,
      stallLogo: null,
      businessLicense: null,
      registrationCertificate: null,
      bankStatement: null,
      taxDocument: null,
      idCard: null
    }
  });

  useEffect(() => {
    fetchVendorProfile();
  }, [stallId]);

  const fetchVendorProfile = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockData: VendorProfileData = {
        stallId: 'STL123456',
        personalInfo: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          idNumber: 'ID123456'
        },
        businessInfo: {
          stallName: 'Food Ventures LLC',
          registrationNumber: 'REG123456',
          taxId: 'TAX123456',
          address: '123 Market Street',
          city: '',
          state: '',
          zipCode: '',
          businessType: 'Food Stall',
          description: 'Authentic street food with a modern twist',
          shopCategory: 'restaurant',
          cuisines: ['Mexican', 'Italian']
        },
        orderSettings: {
          orderPrefix: 'FV',
          minimumOrder: 15,
          deliveryTime: 30,
          username: 'foodventures',
          password: '********'
        },
        bankAccountInfo: {
          accountName: 'John Doe',
          accountNumber: '1234567890',
          bankName: 'Bank of America',
          branchName: 'Main Branch',
          swiftCode: 'BOFAUS3M'
        },
        documents: {
          stallImage: null,
          stallLogo: null,
          businessLicense: 'business-license.pdf',
          registrationCertificate: 'registration.pdf',
          bankStatement: 'bank-statement.pdf',
          taxDocument: 'tax-document.pdf',
          idCard: 'id-card.pdf'
        }
      };
      setFormData(mockData);
    } catch (error) {
      toast.error(t('stallvendorprofile.fetchError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    section: keyof VendorProfileData,
    field: string,
    value: string | number | string[]
  ) => {
    setFormData((prev) => {
      const sectionData = prev[section] as Record<string, any>;
      return {
        ...prev,
        [section]: {
          ...sectionData,
          [field]: value
        }
      };
    });
  };

  const handleDocumentUpload = async (file: File) => {
    if (!selectedDocument) return;
    
    try {
      // Simulate file upload
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setFormData(prev => ({
        ...prev,
        documents: {
          ...prev.documents,
          [selectedDocument]: file.name
        }
      }));
      
      toast.success(t('stallvendorprofile.documentUploaded'));
      setShowUploadModal(false);
      setSelectedDocument(null);
    } catch (error) {
      toast.error(t('stallvendorprofile.documentUploadError'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(t('stallvendorprofile.saved'));
    } catch (error) {
      toast.error(t('stallvendorprofile.saveFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success(t('stallvendorprofile.idCopied'));
  };

  const handleCopyUrl = () => {
    const stallUrl = `https://kebapp-chefs.com/stall/${formData.stallId}`;
    navigator.clipboard.writeText(stallUrl);
    toast.success(t('stallvendorprofile.urlCopied'));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">{t('stallvendorprofile.title')}</h1>
        <div className="max-w-4xl">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <LoadingState rows={8} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!stallId) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">{t('stallvendorprofile.title')}</h1>
        <div className="max-w-4xl">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 text-center">
              <p className="text-gray-500">{t('stallvendorprofile.novendorprofiledata')}</p>
              <p className="text-sm text-gray-400 mt-2">
                {t('stallvendorprofile.nostallid')}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">{t('stallvendorprofile.title')}</h1>
      <div className="max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-900">{t('stallvendorprofile.basicInfo')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('stallvendorprofile.stallName')}</label>
                  <input
                    type="text"
                    value={formData.businessInfo.stallName}
                    onChange={(e) => handleInputChange('businessInfo', 'stallName', e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('stallvendorprofile.email')}</label>
                  <input
                    type="email"
                    value={formData.personalInfo.email}
                    onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('stallvendorprofile.phone')}</label>
                  <input
                    type="tel"
                    value={formData.personalInfo.phone}
                    onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('stallvendorprofile.address')}</label>
                  <input
                    type="text"
                    value={formData.businessInfo.address}
                    onChange={(e) => handleInputChange('businessInfo', 'address', e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  />
                </div>
              </div>
            </div>

            {/* Business Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-900">{t('stallvendorprofile.businessInfo')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('stallvendorprofile.businessInfo.registrationNumber')}</label>
                  <input
                    type="text"
                    value={formData.businessInfo.registrationNumber}
                    onChange={(e) => handleInputChange('businessInfo', 'registrationNumber', e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('stallvendorprofile.businessInfo.taxId')}</label>
                  <input
                    type="text"
                    value={formData.businessInfo.taxId}
                    onChange={(e) => handleInputChange('businessInfo', 'taxId', e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('stallvendorprofile.businessInfo.businessType')}</label>
                  <input
                    type="text"
                    value={formData.businessInfo.businessType}
                    onChange={(e) => handleInputChange('businessInfo', 'businessType', e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('stallvendorprofile.businessInfo.cuisines')}</label>
                  <input
                    type="text"
                    value={formData.businessInfo.cuisines.join(', ')}
                    onChange={(e) => handleInputChange('businessInfo', 'cuisines', e.target.value.split(',').map(s => s.trim()))}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  />
                </div>
              </div>
            </div>

            {/* Order Settings */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-900">{t('stallvendorprofile.orderSettings')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('stallvendorprofile.minimumOrder')}</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">€</span>
                    </div>
                    <input
                      type="number"
                      value={formData.orderSettings.minimumOrder}
                      onChange={(e) => handleInputChange('orderSettings', 'minimumOrder', parseFloat(e.target.value))}
                      className="block w-full pl-7 rounded-md border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('stallvendorprofile.deliveryTime')}</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="number"
                      value={formData.orderSettings.deliveryTime}
                      onChange={(e) => handleInputChange('orderSettings', 'deliveryTime', parseInt(e.target.value))}
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">{t('stallvendorprofile.minutes')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bank Account Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-900">{t('stallvendorprofile.bankInfo')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('stallvendorprofile.bankInfo.accountName')}</label>
                  <input
                    type="text"
                    value={formData.bankAccountInfo.accountName}
                    onChange={(e) => handleInputChange('bankAccountInfo', 'accountName', e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('stallvendorprofile.bankInfo.accountNumber')}</label>
                  <input
                    type="text"
                    value={formData.bankAccountInfo.accountNumber}
                    onChange={(e) => handleInputChange('bankAccountInfo', 'accountNumber', e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('stallvendorprofile.bankInfo.bankName')}</label>
                  <input
                    type="text"
                    value={formData.bankAccountInfo.bankName}
                    onChange={(e) => handleInputChange('bankAccountInfo', 'bankName', e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('stallvendorprofile.bankInfo.swiftCode')}</label>
                  <input
                    type="text"
                    value={formData.bankAccountInfo.swiftCode}
                    onChange={(e) => handleInputChange('bankAccountInfo', 'swiftCode', e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  />
                </div>
              </div>
            </div>

            {/* Documents */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-900">{t('stallvendorprofile.documents')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(formData.documents).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700">
                      {t(`stallvendorprofile.documents.${key}`)}
                    </label>
                    <div className="mt-1 flex items-center">
                      <input
                        type="text"
                        value={value || ''}
                        readOnly
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDocument(key as keyof VendorProfileData['documents']);
                          setShowUploadModal(true);
                        }}
                        className="ml-2 px-3 py-2 bg-brand-primary text-black rounded-md hover:bg-brand-primary/90 transition-colors"
                      >
                        {t('stallvendorprofile.upload')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-4 py-2 bg-brand-primary text-black rounded-md hover:bg-brand-primary/90 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto" />
                ) : (
                  t('stallvendorprofile.save')
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {t('stallvendorprofile.uploadDocument')}
              </h2>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedDocument(null);
                }}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <input
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleDocumentUpload(file);
                  }
                }}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-brand-primary file:text-black hover:file:bg-brand-primary/90"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 