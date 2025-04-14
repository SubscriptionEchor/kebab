import { useState, useMemo, useEffect } from 'react';
import { Search } from 'lucide-react';
import Pagination from '../../components/Pagination';
import CopyableId from '../../components/CopyableId';
import { useQuery, useApolloClient } from '@apollo/client';
import { formatDate, getMostRecentStatusTimestamp } from '../../utils/date';
import { GET_RESTAURANT_APPLICATIONS } from '../../lib/graphql/queries/onboarding';
import { GET_DOCUMENT_URLS } from '../../lib/graphql/queries/documents';
import { APPLICATION_STATUS } from '../../types/onboarding';
import LoadingState from '../../components/LoadingState';
import ApplicationDetailsModal from '../../components/onboarding/ApplicationDetailsModal';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface RestaurantApplication {
  _id: string;
  restaurantName: string;
  potentialVendor: string;
  applicationStatus: string;
  createdAt: string;
  statusHistory: {
    status: string;
    reason: string;
    timestamp: string;
    changedBy: {
      userId: string;
      userType: string;
    };
  }[];
  // Assuming beneficialOwners exists in some cases
  beneficialOwners?: any[];
  updatedAt: string
}

export default function RejectedRestaurants() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const { t } = useTranslation();

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<{
    id?: string;
    status?: 'reject' | 'resubmit';
    _id?: string;
    restaurantName?: string;
    [key: string]: any;
  } | null>(null);

  const client = useApolloClient();

  const handleViewDetails = async (application: any) => {
    try {
      const { data: documentData, error: documentError } = await client.query({
        query: GET_DOCUMENT_URLS,
        variables: { applicationId: application._id }
      });

      if (documentError) {
        throw new Error(documentError.message);
      }

      let documentUrls;
      try {
        let urlData = documentData?.getDocumentUrlsForRestaurantOnboardingApplication;
        if (urlData) {
          if (typeof urlData === 'string') {
            urlData = JSON.parse(urlData);
          }

          documentUrls = {
            idCardDocuments: application.beneficialOwners?.slice(0, 1)?.map((owner: any) =>
              owner.idCardDocuments?.map((key: string) => urlData[key])
            ).flat().filter(Boolean) || [],
            restaurantImages: application.restaurantImages?.map((key: string) => urlData[key]).filter(Boolean) || [],
            menuImages: application.menuImages?.map((key: string) => urlData[key]).filter(Boolean) || [],
            profileImage: urlData[application.profileImage] || null,
            businessDocuments: {
              hospitalityLicense: urlData[application.businessDocuments?.hospitalityLicense] || null,
              registrationCertificate: urlData[application.businessDocuments?.registrationCertificate] || null
            }
          };
        } else if (typeof urlData === 'object') {
          documentUrls = urlData;
        } else {
          throw new Error('Invalid document URL format');
        }
      } catch (parseError) {
        console.error('Error parsing document URLs:', parseError);
        documentUrls = {
          idCardDocuments: [],
          restaurantImages: [],
          menuImages: [],
          profileImage: null,
          businessDocuments: {
            hospitalityLicense: null,
            registrationCertificate: null
          }
        };
        toast.error(t('rejected.errorloadingdocumenturls'), {
          description: t('rejected.somedocumentsmaynotbeavailable')
        });
      }

      setSelectedApplication({
        ...application,
        documentUrls: documentUrls || {}
      });

      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error fetching document URLs:', error);
      toast.error(t('rejected.somedocumentsmaynotbeavailable'), {
        description: t('rejected.errorloadingdocumenturls')
      });
      setSelectedApplication({
        ...application,
        documentUrls: {
          idCardDocuments: [],
          restaurantImages: [],
          menuImages: [],
          profileImage: null,
          businessDocuments: {
            hospitalityLicense: null,
            registrationCertificate: null
          }
        }
      });
      setShowDetailsModal(true);
    }
  };

  const { data, loading, error, refetch } = useQuery(GET_RESTAURANT_APPLICATIONS, {
    fetchPolicy: 'cache-and-network',
    onError: (error) => {
      const errorMessage = error.graphQLErrors?.[0]?.message || error.message;
      console.error('Failed to fetch restaurant applications:', errorMessage);
      toast.error(errorMessage || t('rejected.failedtofetchapplications'));
    },
  });

  const filteredRestaurants = useMemo(() => {
    if (!data?.getAllRestaurantOnboardingApplication) return [];

    // Filter for REJECTED applications
    const rejectedApplications = data.getAllRestaurantOnboardingApplication.filter(
      (application: RestaurantApplication) =>
        application.applicationStatus === APPLICATION_STATUS.REJECTED
    );

    // Then apply search filter if exists
    const query = searchQuery.toLowerCase().trim();
    return rejectedApplications.filter((application: RestaurantApplication) => {
      if (!query) return true;
      const nameMatch = application.restaurantName.toLowerCase().includes(query);
      const vendorMatch = application.potentialVendor.toLowerCase().includes(query);
      const onboardingMatch = application._id.toLowerCase().includes(query);
      return nameMatch || vendorMatch || onboardingMatch;
    });
  }, [searchQuery, data]);

  const paginatedRestaurants = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredRestaurants.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredRestaurants, currentPage]);

  const totalPages = Math.ceil(filteredRestaurants.length / rowsPerPage);

  const getRejectionReason = (application: RestaurantApplication) => {
    const rejectionEntry = [...application.statusHistory]
      .reverse()
      .find(entry => entry.status === APPLICATION_STATUS.REJECTED);
    return rejectionEntry?.reason || t('rejected.noreasonprovided');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">{t('rejected.rejectedapplications')}</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder={t('rejected.searchrestaurants')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
          />
        </div>
      </div>

      {error ? (
        <div className="text-center py-12">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="text-red-500 font-medium">{t('rejected.failedtoloadapplications')}</div>
            <p className="text-gray-600 text-sm max-w-md text-center">
              {t('rejected.errorloadingapplications')}
            </p>
            <button
              onClick={() => refetch()}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-black bg-brand-primary rounded-lg hover:bg-brand-primary/90 transition-all duration-200 hover:scale-[1.02]"
            >
              {t('rejected.retry')}
            </button>
          </div>
        </div>
      ) : loading ? (
        <LoadingState rows={5} />
      ) : !data?.getAllRestaurantOnboardingApplication || filteredRestaurants.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">
            {searchQuery.trim()
              ? `${t('rejected.noapplicationsmatching')} "${searchQuery}"`
              : t('rejected.norejectedapplicationsfound')}
          </p>
          {searchQuery.trim() && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-brand-primary hover:text-brand-primary/80 font-medium"
            >
              {t('rejected.clearsearch')}
            </button>
          )}
        </div>
      ) : (
        <div className="table-container">
          <div className="table-scroll">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="table-header w-[5%]">{t('rejected.sno')}</th>
                  <th className="table-header w-[20%]">{t('rejected.restaurantname')}</th>
                  <th className="table-header w-[15%]">{t('rejected.vendorid')}</th>
                  <th className="table-header w-[15%]">{t('rejected.onboardingid')}</th>
                  <th className="table-header w-[25%]">{t('rejected.rejectionreason')}</th>
                  <th className="table-header w-[10%]">{t('rejected.applicationdate')}</th>
                  <th className="table-header w-[10%]">{t('rejected.actions')}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedRestaurants.map((application: RestaurantApplication, index: number) => (
                  <tr
                    key={application._id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="table-cell table-cell-text">{index + 1}</td>
                    <td className="table-cell table-cell-primary">{application.restaurantName}</td>
                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        <CopyableId
                          label={t('rejected.vendorid')}
                          value={application.potentialVendor}
                          truncateLength={8}
                        />
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        <CopyableId
                          label={t('rejected.onboardingid')}
                          value={application._id}
                          truncateLength={8}
                        />
                      </div>
                    </td>
                    <td className="reason-cell">{getRejectionReason(application)}</td>
                    <td className="table-cell">
                      <span className="text-sm text-gray-500">
                        {formatDate(application.updatedAt)}
                      </span>
                    </td>
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleViewDetails(application)}
                          className="inline-flex items-center justify-center px-4 py-1.5 text-xs font-medium text-brand-primary hover:text-brand-primary/80 bg-brand-accent/10 hover:bg-brand-accent/20 rounded-lg transition-colors whitespace-nowrap w-[90px]"
                        >
                          {t('rejected.view')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 px-4 py-3 bg-white border-t border-gray-200">
            {totalPages > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        </div>
      )}

      {selectedApplication && (
        <ApplicationDetailsModal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedApplication(null);
          }}
          application={{
            _id: selectedApplication?._id || '',
            restaurantName: selectedApplication?.restaurantName || '',
            companyName: selectedApplication?.companyName || t('rejected.notprovided'),
            location: {
              address: selectedApplication?.location?.address || '',
              coordinates: selectedApplication?.location?.coordinates || { coordinates: [] }
            },
            applicationStatus: selectedApplication?.applicationStatus || '',
            createdAt: selectedApplication?.createdAt || '',
            potentialVendor: selectedApplication?.potentialVendor || '',
            restaurantContactInfo: selectedApplication?.restaurantContactInfo || { email: '', phone: '' },
            cuisines: selectedApplication?.cuisines || [],
            beneficialOwners: selectedApplication?.beneficialOwners || [],
            documentUrls: selectedApplication?.documentUrls,
            restaurantImages: selectedApplication?.restaurantImages || [],
            menuImages: selectedApplication?.menuImages || [],
            profileImage: selectedApplication?.profileImage || '',
            businessDocuments: selectedApplication?.businessDocuments || {
              hospitalityLicense: '',
              registrationCertificate: ''
            },
            statusHistory: selectedApplication?.statusHistory || []
          }}
        />
      )}
    </div>
  );
}
