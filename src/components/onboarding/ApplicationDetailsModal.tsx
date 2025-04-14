import { X, MapPin, Mail, Phone, FileText, Calendar, User, Store as StoreIcon } from 'lucide-react';
import { formatDate } from '../../utils/date';
import StatusBadge from '../StatusBadge';
import CopyableId from '../CopyableId';
import { toast } from 'sonner';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface BeneficialOwner {
  name: string;
  passportId: string;
  email: string;
  phone: string;
  isPrimary: boolean;
  emailVerified: boolean;
  idCardDocuments: string[];
}

interface RestaurantContactInfo {
  email: string;
  phone: string;
}

interface StatusHistoryItem {
  status: string;
  reason: string;
  changedBy: {
    userId: string;
    userType: string;
  };
  timestamp: string;
}

interface ApplicationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: {
    _id: string;
    restaurantName: string;
    companyName?: string;
    location: {
      address: string;
      coordinates: {
        coordinates: number[];
      };
    };
    applicationStatus: string;
    createdAt: string;
    potentialVendor: string;
    restaurantContactInfo: RestaurantContactInfo;
    cuisines: string[];
    beneficialOwners: BeneficialOwner[];
    documentUrls?: {
      idCardDocuments?: string[];
      restaurantImages?: string[];
      menuImages?: string[];
      profileImage?: string;
      businessDocuments?: {
        hospitalityLicense?: string;
        registrationCertificate?: string;
      };
    };
    restaurantImages: string[];
    menuImages: string[];
    profileImage: string;
    businessDocuments: {
      hospitalityLicense: string;
      registrationCertificate: string;
    };
    statusHistory: StatusHistoryItem[];
  };
}

/**
 * ImageWithFallback
 * -----------------
 * A helper component that attempts to load an image and, if an error occurs,
 * displays fallback content (using the same styling as the original UI).
 *
 * The optional `fallbackContent` prop lets you override the default fallback
 * (which shows an icon and a message).
 */
function ImageWithFallback({
  src,
  alt,
  className = '',
  onClick,
  fallbackContent,
}: {
  src: string;
  alt: string;
  className?: string;
  onClick?: () => void;
  fallbackContent?: React.ReactNode;
}) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className={`w-full h-full mb-0 flex flex-col items-center justify-center bg-gray-100 rounded-lg ${className}`}>
        {fallbackContent ? (
          fallbackContent
        ) : (
          <>
            <StoreIcon className="h-8 w-8 text-gray-400" />
          </>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onClick={onClick}
      onError={() => setHasError(true)}
    />
  );
}

function ApplicationDetailsModal({
  isOpen,
  onClose,
  application = {} as ApplicationDetailsModalProps['application']
}: ApplicationDetailsModalProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const handleDocumentClick = (url: string) => {
    if (!url) {
      toast.error('Document not available', {
        description: 'The document URL is not available',
        duration: 3000,
        closeButton: false
      });
      return;
    }
    window.open(url, '_blank');
  };

  const renderDocument = (url: string | null | undefined, title: string) => {
    if (!url) return <p className="text-sm text-gray-500">Document not available</p>;

    const isPdf = url.toLowerCase().includes('.pdf');

    return (
      <div className="flex items-center space-x-4">
        <div
          onClick={() => handleDocumentClick(url)}
          className={`w-16 h-16 rounded-lg border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors ${isPdf ? 'bg-red-50' : 'bg-gray-50'
            }`}
        >
          {isPdf ? (
            <FileText className="h-8 w-8 text-red-500" />
          ) : (
            <ImageWithFallback
              src={url}
              alt={title}
              className="w-full h-full object-cover rounded-lg"
            />
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900 mb-1">{title}</p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-primary hover:text-brand-primary/80 text-sm font-medium inline-flex items-center"
          >
            {isPdf ? t('applicationdetails.document') : t('applicationdetails.image')}
            <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    );
  };

  const renderImageGrid = (images: string[], title: string) => (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-900">{title}</h3>
      {Array.isArray(images) && images.filter(Boolean).length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-4">
          {images.filter(Boolean).map((image, index) => {
            return (
              <div onClick={() => {
                if (!image.toLowerCase().includes('.pdf')) {
                  handleDocumentClick(image)
                }
              }} key={index} className="cursor-pointer  p-5 relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                {!image.toLowerCase().includes('.pdf') ? <ImageWithFallback
                  src={image}
                  alt={`${title} ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                /> :
                  <div className='flex items-center '>
                    <FileText className="h-10 w-10 text-red-500" />
                    <div className="p-2 inset-0 opacity-100 group-hover:opacity-100 transition-opacity  items-center justify-center">
                      <span className="text-sm font-medium text-gray-900 mb-1"> {title} {index + 1}</span>
                      <a
                        href={image}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-primary hover:text-brand-primary/80 text-sm font-medium inline-flex items-center"
                      >
                        {t('applicationdetails.viewdocument')}
                        <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  </div>}
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-sm text-gray-500">No {title.toLowerCase()} available</p>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{t('applicationdetails.title')}</h2>
            <p className="mt-1 text-sm text-gray-500">
              {t('applicationdetails.viewmsg')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Basic Information */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <User className="h-5 w-5 mr-2 text-gray-400" />
              {t('applicationdetails.info')}
            </h3>
            <div className="grid grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">{t('applicationdetails.restaurantname')}</label>
                  <p className="mt-1 text-sm text-gray-900">{application.restaurantName || 'Not provided'}</p>
                </div>
                {/* Company Name - Temporarily Hidden */}

                <div>
                  <label className="block text-sm font-medium text-gray-500">{t('applicationdetails.companyname')}</label>
                  <p className="mt-1 text-sm text-gray-900">{application.companyName || 'Not provided'}</p>
                </div>

                {/* Address - Temporarily Hidden */}

                <div>
                  <label className="block text-sm font-medium text-gray-500">{t('applicationdetails.address')}</label>
                  <div className="mt-1 flex items-start">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5 mr-1 flex-shrink-0" />
                    <p className="text-sm text-gray-900">{application.location?.address || 'Not provided'}</p>
                  </div>
                </div>

              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">{t('applicationdetails.appstatus')}</label>
                  <div className="mt-1">
                    <StatusBadge status={application.applicationStatus} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">{t('applicationdetails.createddate')}</label>
                  <div className="mt-1 flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                    <p className="text-sm text-gray-900">{formatDate(application.createdAt)}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">{t('applicationdetails.vendorid')}</label>
                  <div className="mt-1">
                    <CopyableId label="Vendor ID" value={application.potentialVendor} />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Information */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Mail className="h-5 w-5 mr-2 text-gray-400" />
              {t('applicationdetails.restaurantcontactinfo')}
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-900">
                    {application.restaurantContactInfo?.email || 'Not provided'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-900">
                    {application.restaurantContactInfo?.phone || 'Not provided'}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Cuisines */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">{t('applicationdetails.cuisines')}</h3>
            <div className="flex flex-wrap gap-2">
              {application.cuisines?.map((cuisine, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-brand-accent text-black"
                >
                  {cuisine}
                </span>
              ))}
            </div>
          </section>

          {/* Beneficial Owners */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">{t('applicationdetails.beneficialowners')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {application.beneficialOwners?.map((owner, index) => (
                <div
                  key={index}
                  className="bg-gray-50 p-4 rounded-lg space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">{owner.name}</h4>
                    {owner.isPrimary && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {t('applicationdetails.primary')}
                      </span>
                    )}
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center text-gray-600">
                      <FileText className="h-4 w-4 mr-2" />
                      {t('applicationdetails.passportid')}: {owner.passportId}
                    </p>
                    <p className="flex items-center text-gray-600">
                      <Mail className="h-4 w-4 mr-2" />
                      {owner.email}
                      {owner.emailVerified && (
                        <span className="ml-2 text-xs text-green-600">(Verified)</span>
                      )}
                    </p>
                    <p className="flex items-center text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      {owner.phone}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Images Section */}
          <div className="space-y-6">
            {/* ID Card Documents */}
            {application.documentUrls?.idCardDocuments && application.documentUrls.idCardDocuments.length > 0 && (
              renderImageGrid(application.documentUrls.idCardDocuments, t('applicationdetails.idcard'))
            )}

            {/* Restaurant Images */}
            {application.documentUrls?.restaurantImages && application.documentUrls.restaurantImages.length > 0 && (
              renderImageGrid(application.documentUrls.restaurantImages, t('applicationdetails.restaurantimage'))
            )}

            {/* Menu Images */}
            {application.documentUrls?.menuImages && application.documentUrls.menuImages.length > 0 && (
              renderImageGrid(application.documentUrls.menuImages, t('applicationdetails.menuimage'))
            )}

            {/* Profile Image */}
            {application.documentUrls?.profileImage && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-900">{t('applicationdetails.profileimage')}</h3>
                <div className="w-32 h-32 rounded-lg overflow-hidden border border-gray-200 relative">
                  <ImageWithFallback
                    src={application.documentUrls.profileImage}
                    alt="Restaurant profile"
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-200 cursor-pointer"
                    onClick={() => window.open(application.documentUrls?.profileImage, '_blank')}
                    fallbackContent={<StoreIcon className="h-8 w-8 text-gray-400" />}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Business Documents */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">{t('applicationdetails.businessdocuments')}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-gray-50 rounded-lg">
                {renderDocument(
                  application.documentUrls?.businessDocuments?.hospitalityLicense,
                  t('applicationdetails.hospitalitylicense')
                )}
              </div>
              <div className="p-6 bg-gray-50 rounded-lg">
                {renderDocument(
                  application.documentUrls?.businessDocuments?.registrationCertificate,
                  t('applicationdetails.registrationcertificate')
                )}
              </div>
            </div>
          </section>

          {/* Status History */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">{t('applicationdetails.statushistory')}</h3>
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('applicationdetails.status')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('applicationdetails.changedby')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('applicationdetails.timestamp')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {application.statusHistory?.map((history, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={history.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm text-gray-900">{history.changedBy.userType}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(history.timestamp, false)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            {t('applicationdetails.close')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ApplicationDetailsModal;