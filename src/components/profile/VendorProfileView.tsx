import LoadingState from '../LoadingState';
import { Store, ExternalLink } from 'lucide-react';
import { useQuery } from '@apollo/client';
import { GET_DOCUMENT_URLS } from '../../lib/graphql/queries/documents';
import { toast } from 'sonner';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface VendorProfileViewProps {
  loading: boolean;
  data: any;
}

export default function VendorProfileView({ loading, data }: VendorProfileViewProps) {
  // Query for document URLs
  const { t } = useTranslation();
  const { data: documentData, loading: documentLoading } = useQuery(GET_DOCUMENT_URLS, {
    variables: {
      applicationId: data?.getRestaurantOnboardingApplicationById?._id
    },
    skip: !data?.getRestaurantOnboardingApplicationById?._id,
    onError: (error) => {
      console.error('Failed to fetch document URLs:', error);
      toast.error(t('vendorprofile.failedtoloaddocumentpreviews'));
    }
  });

  // Parse document URLs from response
  const documentUrls = useMemo(() => {
    if (!documentData?.getDocumentUrlsForRestaurantOnboardingApplication) return null;

    try {
      const response = documentData.getDocumentUrlsForRestaurantOnboardingApplication;
      let urlMap;

      if (typeof response === 'string') {
        urlMap = JSON.parse(response);
      } else {
        urlMap = response;
      }

      const vendorData = data.getRestaurantOnboardingApplicationById;

      // Map each document key to its corresponding URL from the response
      return {
        restaurantImages: vendorData.restaurantImages?.map((key: string) => urlMap[key]) || [],
        menuImages: vendorData.menuImages?.map((key: string) => urlMap[key]) || [],
        idCardDocuments: vendorData.beneficialOwners?.slice(0, 1)?.map((owner: any) =>
          owner.idCardDocuments?.map((key: string) => urlMap[key])
        ).flat().filter(Boolean) || [],
        businessDocuments: {
          hospitalityLicense: urlMap[vendorData.businessDocuments?.hospitalityLicense] || null,
          registrationCertificate: urlMap[vendorData.businessDocuments?.registrationCertificate] || null,
          bankDetails: vendorData.businessDocuments?.bankDetails?.documentUrl
            ? urlMap[vendorData.businessDocuments.bankDetails.documentUrl]
            : null,
          taxId: vendorData.businessDocuments?.taxId?.documentUrl
            ? urlMap[vendorData.businessDocuments.taxId.documentUrl]
            : null
        }
      };
    } catch (error) {
      console.error('Error parsing document URLs:', {
        error,
        response: documentData.getDocumentUrlsForRestaurantOnboardingApplication,
        vendorData: data.getRestaurantOnboardingApplicationById
      });
      return null;
    }
  }, [documentData, data]);

  if (loading) {
    return <LoadingState rows={4} />;
  }

  if (!data?.getRestaurantOnboardingApplicationById) {
    return (
      <div className="text-center py-12">
        <div className="flex flex-col items-center justify-center space-y-4">
          <p className="text-gray-500">{t('vendorprofile.novendorprofiledata')}</p>
          <p className="text-sm text-gray-400">{t('vendorprofile.noonboardingapplication')}</p>
        </div>
      </div>
    );
  }

  const vendorData = data.getRestaurantOnboardingApplicationById;

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('vendorprofile.basicinformation')}</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-500">{t('vendorprofile.restaurantname')}</label>
            <p className="mt-1 text-sm text-gray-900">{vendorData.restaurantName}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">{t('vendorprofile.companyname')}</label>
            <p className="mt-1 text-sm text-gray-900">{vendorData.companyName || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">{t('vendorprofile.vendorid')}</label>
            <p className="mt-1 text-sm text-gray-900">{vendorData.potentialVendor}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">{t('vendorprofile.applicationstatus')}</label>
            <p className="mt-1 text-sm text-gray-900">{vendorData.applicationStatus}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">{t('vendorprofile.companyname')}</label>
            <p className="mt-1 text-sm text-gray-900">{vendorData.companyName}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">{t('vendorprofile.address')}</label>
            <p className="mt-1 text-sm text-gray-900">{vendorData.location.address}</p>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('vendorprofile.contactinformation')}</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-500">{t('vendorprofile.email')}</label>
            <p className="mt-1 text-sm text-gray-900">{vendorData.restaurantContactInfo.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">{t('vendorprofile.phone')}</label>
            <p className="mt-1 text-sm text-gray-900">{vendorData.restaurantContactInfo.phone}</p>
          </div>
        </div>
      </div>

      {/* Beneficial Owners */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('vendorprofile.beneficialowners')}</h3>
        <div className="space-y-4">
          {vendorData.beneficialOwners.map((owner: any, index: number) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">{t('vendorprofile.ownername')}</label>
                  <p className="mt-1 text-sm text-gray-900">{owner.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">{t('vendorprofile.owneremail')}</label>
                  <p className="mt-1 text-sm text-gray-900">{owner.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">{t('vendorprofile.ownerphone')}</label>
                  <p className="mt-1 text-sm text-gray-900">{owner.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">{t('vendorprofile.passportid')}</label>
                  <p className="mt-1 text-sm text-gray-900">{owner.passportId}</p>
                </div>
                <div className="col-span-2">
                  <div className="flex items-center space-x-2">
                    {owner.isPrimary && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-accent text-black">
                        {t('vendorprofile.primaryowner')}
                      </span>
                    )}
                    {owner.emailVerified && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {t('vendorprofile.emailverified')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Documents Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('vendorprofile.documents')}</h3>
        <div className="space-y-6">
          {/* Restaurant Images */}
          {vendorData.restaurantImages?.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">{t('vendorprofile.restaurantimages')}</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {vendorData.restaurantImages.map((_: string, index: number) => {
                  return (
                    <div key={`restaurant-${index}`} className="relative group">
                      <a
                        href={documentUrls?.restaurantImages[index] || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          if (!documentUrls?.restaurantImages[index]) {
                            e.preventDefault();
                            toast.error(t('vendorprofile.imageurlnotavailable'));
                          }
                        }}
                        className="relative rounded-lg overflow-hidden border border-gray-200 block aspect-w-4 aspect-h-3"
                      >
                        {documentUrls?.restaurantImages[index] ? (
                          <img
                            src={documentUrls.restaurantImages[index]}
                            alt={t('vendorprofile.restaurantimageoverlay', { number: index + 1 })}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            onError={(e) => {
                              e.currentTarget.parentElement?.classList.add('bg-brand-accent/20');
                              e.currentTarget.style.display = 'none';
                              const icon = document.createElement('div');
                              icon.className = 'absolute inset-0 flex items-center justify-center';
                              icon.innerHTML = '<svg class="h-8 w-8 text-black" ...Store icon SVG...</svg>';
                              e.currentTarget.parentElement?.appendChild(icon);
                            }}
                          />
                        ) : (
                          <div className="absolute inset-0 bg-brand-accent/20 flex items-center justify-center">
                            <Store className="h-8 w-8 text-black" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-white text-sm font-medium">{t('vendorprofile.restaurantimageoverlay', { number: index + 1 })}</span>
                          <ExternalLink className="h-4 w-4 ml-2 text-white" />
                        </div>
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {/* Menu Images */}
          {vendorData.menuImages?.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">{t('vendorprofile.menuimages')}</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {vendorData.menuImages.map((_: string, index: number) => (
                  <div key={`menu-${index}`} className="relative group">
                    <a
                      href={documentUrls?.menuImages[index] || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        if (!documentUrls?.menuImages[index]) {
                          e.preventDefault();
                          toast.error(t('vendorprofile.imageurlnotavailable'));
                        }
                      }}
                      className="relative rounded-lg overflow-hidden border border-gray-200 block aspect-w-4 aspect-h-3"
                    >
                      {documentUrls?.menuImages[index] ? (
                        <img
                          src={documentUrls.menuImages[index]}
                          alt={t('vendorprofile.menuimageoverlay', { number: index + 1 })}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          onError={(e) => {
                            e.currentTarget.parentElement?.classList.add('bg-brand-accent/20');
                            e.currentTarget.style.display = 'none';
                            const icon = document.createElement('div');
                            icon.className = 'absolute inset-0 flex items-center justify-center';
                            icon.innerHTML = '<svg class="h-8 w-8 text-black" ...Store icon SVG...</svg>';
                            e.currentTarget.parentElement?.appendChild(icon);
                          }}
                        />
                      ) : (
                        <div className="absolute inset-0 bg-brand-accent/20 flex items-center justify-center">
                          <Store className="h-8 w-8 text-black" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-sm font-medium">{t('vendorprofile.menuimageoverlay', { number: index + 1 })}</span>
                        <ExternalLink className="h-4 w-4 ml-2 text-white" />
                      </div>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ID Card Documents */}
          {vendorData.beneficialOwners?.some((owner: { idCardDocuments?: string[] }) => owner.idCardDocuments && owner.idCardDocuments.length > 0) && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">{t('vendorprofile.idcarddocuments')}</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {vendorData.beneficialOwners?.slice(0, 1).map((owner: any) =>
                  owner.idCardDocuments?.map((_: string, docIndex: number) => (
                    <div key={`id-${owner.name}-${docIndex}`} className="relative group">
                      <a
                        href={documentUrls?.idCardDocuments[docIndex] || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          if (!documentUrls?.idCardDocuments[docIndex]) {
                            e.preventDefault();
                            toast.error(t('vendorprofile.documenturlnotavailable'));
                          }
                        }}
                        className="relative rounded-lg overflow-hidden border border-gray-200 block aspect-w-4 aspect-h-3"
                      >
                        <img
                          src={documentUrls?.idCardDocuments[docIndex] || '#'}
                          alt={t('vendorprofile.idcardoverlay', { name: owner.name })}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        <div className="hidden absolute inset-0 bg-brand-accent/20 flex items-center justify-center">
                          <Store className="h-8 w-8 text-black" />
                        </div>
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-center p-2">
                          <span className="text-white text-sm font-medium">{t('vendorprofile.idcardoverlay', { name: owner.name })}</span>
                          <ExternalLink className="h-4 w-4 ml-2 text-white" />
                        </div>
                      </a>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Business Documents */}
          {(vendorData.businessDocuments?.hospitalityLicense || vendorData.businessDocuments?.registrationCertificate) && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">{t('vendorprofile.businessdocuments')}</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {vendorData.businessDocuments.hospitalityLicense && (
                  <div className="relative group">
                    <a
                      href={documentUrls?.businessDocuments.hospitalityLicense || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        if (!documentUrls?.businessDocuments.hospitalityLicense) {
                          e.preventDefault();
                          toast.error(t('vendorprofile.documenturlnotavailable'));
                        }
                      }}
                      className="relative rounded-lg overflow-hidden border border-gray-200 block aspect-w-4 aspect-h-3"
                    >
                      <img
                        src={documentUrls?.businessDocuments.hospitalityLicense || '#'}
                        alt={t('vendorprofile.hospitalitylicense')}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className="hidden absolute inset-0 bg-brand-accent/20 flex items-center justify-center">
                        <Store className="h-8 w-8 text-black" />
                      </div>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-sm font-medium">{t('vendorprofile.hospitalitylicense')}</span>
                        <ExternalLink className="h-4 w-4 ml-2 text-white" />
                      </div>
                    </a>
                  </div>
                )}

                {vendorData.businessDocuments.registrationCertificate && (
                  <div className="relative group">
                    <a
                      href={documentUrls?.businessDocuments.registrationCertificate || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        if (!documentUrls?.businessDocuments.registrationCertificate) {
                          e.preventDefault();
                          toast.error(t('vendorprofile.documenturlnotavailable'));
                        }
                      }}
                      className="relative rounded-lg overflow-hidden border border-gray-200 block aspect-w-4 aspect-h-3"
                    >
                      <img
                        src={documentUrls?.businessDocuments.registrationCertificate || '#'}
                        alt={t('vendorprofile.registrationcertificate')}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className="hidden absolute inset-0 bg-brand-accent/20 flex items-center justify-center">
                        <Store className="h-8 w-8 text-black" />
                      </div>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-sm font-medium">{t('vendorprofile.registrationcertificate')}</span>
                        <ExternalLink className="h-4 w-4 ml-2 text-white" />
                      </div>
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cuisines */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('vendorprofile.cuisines')}</h3>
        <div className="flex flex-wrap gap-2">
          {vendorData.cuisines.map((cuisine: string, index: number) => (
            <span
              key={index}
              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-brand-accent text-black"
            >
              {cuisine}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
