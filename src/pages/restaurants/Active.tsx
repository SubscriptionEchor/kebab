import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import { formatDate, getMostRecentStatusTimestamp } from '../../utils/date';
import { GET_RESTAURANT_APPLICATIONS } from '../../lib/graphql/queries/onboarding';
import { GET_DOCUMENT_URLS } from '../../lib/graphql/queries/documents';
import Pagination from '../../components/Pagination';
import { UPDATE_RESTAURANT_APPLICATION_STATUS } from '../../lib/graphql/mutations/onboarding';
import { APPLICATION_STATUS } from '../../types/onboarding';
import CopyableId from '../../components/CopyableId';
import { showLiveConfetti } from '../../utils/confetti';
import MoveToVendorReviewModal from '../../components/MoveToVendorReviewModal';
import MoveToLiveModal from '../../components/MoveToLiveModal';
import StatusUpdateModal from '../../components/StatusUpdateModal';
import LoadingState from '../../components/LoadingState';
import ApplicationDetailsModal from '../../components/onboarding/ApplicationDetailsModal';
import { toast } from 'sonner';
import FeeUpdateModal from '../../components/FeeUpdateModal';
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

interface OpeningTime {
  day: string;
  times: {
    startTime: string;
    endTime: string;
  }[];
  isOpen: boolean;
}

interface BusinessDocuments {
  hospitalityLicense: string;
  registrationCertificate: string;
  bankDetails: {
    accountNumber: string;
    bankName: string;
    branchName: string;
    bankIdentifierCode: string;
    accountHolderName: string;
    documentUrl: string;
  };
  taxId: {
    documentNumber: string;
    documentUrl: string;
  };
}

interface StatusHistory {
  status: string;
  reason: string;
  changedBy: {
    userId: string;
    userType: string;
  };
  timestamp: string;
}

interface RestaurantApplication {
  _id: string;
  beneficialOwners: BeneficialOwner[];
  restaurantName: string;
  restaurantContactInfo: RestaurantContactInfo;
  restaurantImages: string[];
  menuImages: string[];
  profileImage: string;
  cuisines: string[];
  applicationStatus: typeof APPLICATION_STATUS[keyof typeof APPLICATION_STATUS];
  createdAt: string;
  resubmissionCount: number;
  potentialVendor: string;
  statusHistory: StatusHistory[];
  updatedAt: string
}

// Helper to translate status values using our keys
const translateStatus = (status: string, t: any) => {
  switch (status) {
    case 'Fresh':
      return t('active.fresh');
    case 'Resubmit':
      return t('active.resubmit');
    case 'Requested for Changes':
      return t('active.requestedforchanges');
    case 'Pending':
      return t('active.pending');
    default:
      return status;
  }
};

export default function ActiveRestaurants() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [isApproving, setIsApproving] = useState<string | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const [activeSubTab, setActiveSubTab] = useState<'active' | 'resubmitted'>('active');
  const { t } = useTranslation();

  // Reset to page 1 when changing tabs
  const handleTabChange = (tab: 'active' | 'resubmitted') => {
    setActiveSubTab(tab);
    setCurrentPage(1);
  };

  const [showFeeModal, setShowFeeModal] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [showVendorReviewModal, setShowVendorReviewModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<{
    id?: string;
    status?: 'reject' | 'resubmit';
    _id?: string;
    restaurantName?: string;
    [key: string]: any;
  } | null>(null);
  const [showLiveModal, setShowLiveModal] = useState(false);
  const [loadingApplicationId, setLoadingApplicationId] = useState<string | null>(null);

  const client = useApolloClient();

  const handleViewDetails = async (application: any) => {
    setLoadingApplicationId(application._id);
    try {
      // Fetch document URLs
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

          // Map the keys to their corresponding values
          documentUrls = {
            idCardDocuments: application.beneficialOwners?.slice(0, 1).map((owner: any) =>
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
        toast.error(t('errorloadingapplications'), {
          description: t('errorloadingapplications')
        });
      }

      setSelectedApplication({
        ...application,
        documentUrls: documentUrls || {}
      });

      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error fetching document URLs:', error);

      toast.error(t('errorloadingapplications'), {
        description: t('errorloadingapplications')
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
    } finally {
      setLoadingApplicationId(null);
    }
  };

  function getOptimisticResponse(
    applicationId: string,
    status: typeof APPLICATION_STATUS[keyof typeof APPLICATION_STATUS]
  ) {
    return {
      __typename: 'Mutation',
      updateRestaurantOnboardingApplicationStatus: {
        __typename: 'RestaurantOnboardingApplication',
        _id: applicationId,
        applicationStatus: status,
      },
    };
  }

  const [updateApplicationStatus] = useMutation(UPDATE_RESTAURANT_APPLICATION_STATUS, {
    refetchQueries: [
      {
        query: GET_RESTAURANT_APPLICATIONS,
        fetchPolicy: 'network-only',
      },
    ],
    onError: (error) => {
      const errorMessage = error.graphQLErrors?.[0]?.message || error.message;
      if (!errorMessage.includes('Potential vendor not found')) {
        console.error('Failed to update application status:', errorMessage);
      }
    },
    onCompleted: (data) => {
      if (data?.updateRestaurantOnboardingApplicationStatus) {
        const status = data.updateRestaurantOnboardingApplicationStatus.applicationStatus;
        if (status === APPLICATION_STATUS.REJECTED) {
          toast.success(t('active.applicationrejected'), {
            description: t('active.applicationmovedtorejected'),
            duration: 4000
          });
        } else if (status === APPLICATION_STATUS.REQUESTED_CHANGES) {
          toast.success(t('active.resubmissionrequested'), {
            description: t('active.applicationmovedtochanges'),
            duration: 4000
          });
        }
      }
    }
  });

  const handleApprove = async (applicationId: string) => {
    if (isApproving === applicationId) return;

    const toastId = toast.loading(t('active.approving'));
    setIsApproving(applicationId);

    try {
      const { data } = await updateApplicationStatus({
        variables: {
          applicationId,
          status: APPLICATION_STATUS.ACCEPTED,
          reason: t('active.approve'),
          fees: null
        }
      });

      if (data?.updateRestaurantOnboardingApplicationStatus) {
        const status = data.updateRestaurantOnboardingApplicationStatus.applicationStatus;
        if (status === APPLICATION_STATUS.REJECTED) {
          toast.success(t('active.applicationrejected'), {
            description: t('active.applicationmovedtorejected'),
            id: toastId,
            duration: 4000
          });
        } else if (status === APPLICATION_STATUS.REQUESTED_CHANGES) {
          toast.success(t('active.resubmissionrequested'), {
            description: t('active.applicationmovedtochanges'),
            id: toastId,
            duration: 4000
          });
        } else if (status === APPLICATION_STATUS.ACCEPTED) {
          toast.success(t('active.applicationapproved'), {
            id: toastId,
            duration: 4000
          });
          showLiveConfetti();
        }
      }
    } catch (error) {
      console.error('Error approving application:', error);
      const errorMessage = error instanceof Error ? error.message : t('active.failedtoapprove');
      if (errorMessage.includes('Potential vendor not found')) {
        toast.error(t('active.vendornotfound'), {
          id: toastId,
          description: t('active.vendornotassociated')
        });
      }
    } finally {
      setIsApproving(null);
    }
  };

  const handleStatusUpdate = async (reason: string) => {
    if (!selectedApplication) return;

    const status =
      selectedApplication.status === 'reject'
        ? APPLICATION_STATUS.REJECTED
        : APPLICATION_STATUS.REQUESTED_CHANGES;

    setIsUpdating(selectedApplication?.id || null);

    try {
      await updateApplicationStatus({
        variables: {
          applicationId: selectedApplication.id,
          status,
          reason,
        },
      });

      setShowStatusModal(false);
      setSelectedApplication(null);
    } catch (error) {
      console.error('Error updating application status:', error);
      toast.error(
        error instanceof Error ? error.message : t('active.failedtofetchapplications')
      );
    } finally {
      setIsUpdating(null);
    }
  };

  const handleRejectClick = (applicationId: string) => {
    const application = data?.getAllRestaurantOnboardingApplication?.find(
      (app: RestaurantApplication) => app._id === applicationId
    );

    if (!application) {
      toast.error(t('active.applicationnotfound'));
      return;
    }

    setShowStatusModal(true);
    setSelectedApplication({
      id: applicationId,
      status: 'reject',
      potentialVendor: application.potentialVendor
    });
  };

  const handleResubmitClick = (applicationId: string) => {
    const application = data?.getAllRestaurantOnboardingApplication?.find(
      (app: RestaurantApplication) => app._id === applicationId
    );

    if (!application) {
      toast.error(t('active.applicationnotfound'));
      return;
    }

    setShowStatusModal(true);
    setSelectedApplication({
      id: applicationId,
      status: 'resubmit',
      potentialVendor: application.potentialVendor
    });
  };

  const getDisplayStatus = (application: RestaurantApplication) => {
    if (application.applicationStatus === APPLICATION_STATUS.REQUESTED_ONBOARDING) {
      return application.resubmissionCount === 0 ? 'Fresh' : 'Resubmit';
    }
    if (application.applicationStatus === APPLICATION_STATUS.REQUESTED_CHANGES) {
      return 'Requested for Changes';
    }
    return application.applicationStatus;
  };

  const { data, loading, error, refetch } = useQuery(GET_RESTAURANT_APPLICATIONS, {
    fetchPolicy: 'cache-and-network',
    onError: (err) => {
      toast.dismiss();
      const errorMessage = err.graphQLErrors?.[0]?.message || err.message;
      console.error('Failed to fetch restaurant applications:', errorMessage);
      toast.error(errorMessage || t('active.failedtofetchapplications'));
    },
  });

  const filteredByStatus = useMemo(() => {
    if (!data?.getAllRestaurantOnboardingApplication) return [];
    if (activeSubTab === 'active') {
      return data.getAllRestaurantOnboardingApplication.filter(
        (app: RestaurantApplication) =>
          app.applicationStatus === APPLICATION_STATUS.REQUESTED_ONBOARDING
      );
    }
    if (activeSubTab === 'resubmitted') {
      return data.getAllRestaurantOnboardingApplication.filter(
        (app: RestaurantApplication) =>
          app.applicationStatus === APPLICATION_STATUS.REQUESTED_CHANGES
      );
    }
    return [];
  }, [data, activeSubTab]);

  const filteredRestaurants = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return filteredByStatus;

    return filteredByStatus.filter((application: RestaurantApplication) => {
      return (
        application.restaurantName.toLowerCase().includes(query) ||
        application.potentialVendor.toLowerCase().includes(query) ||
        application._id.toLowerCase().includes(query)
      );
    });
  }, [filteredByStatus, searchQuery]);

  const paginatedRestaurants = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredRestaurants.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredRestaurants, currentPage]);

  const totalPages = Math.ceil(filteredRestaurants.length / rowsPerPage);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Fresh':
        return 'bg-brand-accent text-black ring-1 ring-brand-primary/10';
      case 'Resubmit':
        return 'bg-orange-100 text-orange-700 ring-1 ring-orange-500/10';
      case 'Requested for Changes':
        return 'bg-orange-100 text-orange-700 ring-1 ring-orange-500/10';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700 ring-1 ring-yellow-500/10';
      case 'Approved':
        return 'bg-green-100 text-green-700 ring-1 ring-green-500/10';
      case 'Rejected':
        return 'bg-red-100 text-red-700 ring-1 ring-red-500/10';
      default:
        return 'bg-gray-100 text-gray-700 ring-1 ring-gray-500/10';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{t('active.activeapplications')}</h1>
          <div className="mt-4 flex space-x-4 border-b border-gray-200">
            <button
              onClick={() => handleTabChange('active')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeSubTab === 'active'
                  ? 'border-b-2 border-brand-primary text-brand-primary'
                  : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t('active.activeapplications')}
            </button>
            <button
              onClick={() => handleTabChange('resubmitted')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeSubTab === 'resubmitted'
                  ? 'border-b-2 border-brand-primary text-brand-primary'
                  : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t('active.requestedforchanges')}
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('active.searchrestaurants')}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {error ? (
        <div className="text-center py-12">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="text-red-500 font-medium">{t('active.failedtoloadapplications')}</div>
            <p className="text-gray-600 text-sm max-w-md text-center">
              {t('active.errorloadingapplications')}
            </p>
            <button
              onClick={() => refetch()}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-black bg-brand-primary rounded-lg hover:bg-brand-primary/90 transition-all duration-200 hover:scale-[1.02]"
            >
              {t('active.retry')}
            </button>
          </div>
        </div>
      ) : loading ? (
        <LoadingState rows={5} />
      ) : !data?.getAllRestaurantOnboardingApplication || filteredRestaurants.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">
            {searchQuery.trim()
              ? `${t('active.noapplicationsmatching')} "${searchQuery}"`
              : t('active.noapplicationsfound')}
          </p>
          {searchQuery.trim() && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-brand-primary hover:text-brand-primary/80 font-medium"
            >
              {t('active.clearsearch')}
            </button>
          )}
        </div>
      ) : (
        <div className="table-container">
          <div className="table-scroll">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="table-header" style={{ width: '10%' }}>
                    {t('active.sno')}
                  </th>
                  <th className="table-header" style={{ width: '20%' }}>
                    {t('active.restaurantname')}
                  </th>
                  <th className="table-header" style={{ width: '12%' }}>
                    {t('active.status')}
                  </th>
                  <th className="table-header" style={{ width: '18%' }}>
                    {t('active.vendorid')}
                  </th>
                  <th className="table-header" style={{ width: '18%' }}>
                    {t('active.onboardingid')}
                  </th>
                  <th className="table-header" style={{ width: '12%' }}>
                    {t('active.applicationdate')}
                  </th>
                  <th className="table-header text-right" style={{ width: '12%' }}>
                    {t('active.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedRestaurants.map((application: RestaurantApplication, index: number) => (
                  <tr
                    key={application._id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="table-cell table-cell-text">{index + 1}</td>
                    <td className="table-cell table-cell-primary">
                      {application.restaurantName}
                    </td>
                    <td className="table-cell">
                      <span
                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shadow-sm ${getStatusBadgeColor(
                          getDisplayStatus(application)
                        )}`}
                      >
                        {translateStatus(getDisplayStatus(application), t)}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        <CopyableId
                          label={t('active.vendorid')}
                          value={application.potentialVendor}
                          truncateLength={8}
                        />
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        <CopyableId
                          label={t('active.onboardingid')}
                          value={application._id}
                          truncateLength={8}
                        />
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="text-sm text-gray-500">
                        {formatDate(application.updatedAt)}
                      </span>
                    </td>
                    <td className="table-cell text-right space-x-4">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleViewDetails(application)}
                          className="inline-flex items-center justify-center px-4 py-1.5 text-xs font-medium text-brand-primary hover:text-brand-primary/80 bg-brand-accent/10 hover:bg-brand-accent/20 rounded-lg transition-colors whitespace-nowrap w-[90px]"
                        >
                          {loadingApplicationId === application._id ? (
                            <div className="h-4 w-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                          ) : (
                            t('active.view')
                          )}
                        </button>

                        {activeSubTab === 'active' && (
                          <>
                            <button
                              onClick={() => handleApprove(application._id)}
                              disabled={isApproving === application._id}
                              className="inline-flex items-center justify-center px-4 py-1.5 text-xs font-medium text-green-700 hover:text-green-800 bg-green-100 hover:bg-green-200 rounded-lg transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed w-[80px] space-x-1"
                            >
                              {isApproving === application._id && (
                                <div className="h-3 w-3 border-2 border-green-700 border-t-transparent rounded-full animate-spin mr-1" />
                              )}
                              {isApproving === application._id ? (
                                <span>{t('active.approving')}</span>
                              ) : (
                                t('active.approve')
                              )}
                            </button>

                            {application.resubmissionCount === 1 ? (
                              <button
                                onClick={() => handleRejectClick(application._id)}
                                disabled={isUpdating === application._id}
                                className="inline-flex items-center justify-center px-4 py-1.5 text-xs font-medium text-red-700 hover:text-red-800 bg-red-100 hover:bg-red-200 rounded-lg transition-colors whitespace-nowrap w-[80px] disabled:opacity-50 disabled:cursor-not-allowed space-x-1"
                              >
                                {isUpdating === application._id ? (
                                  <>
                                    <div className="h-3 w-3 border-2 border-red-700 border-t-transparent rounded-full animate-spin mr-1" />
                                    <span>{t('active.rejecting')}</span>
                                  </>
                                ) : (
                                  t('active.reject')
                                )}
                              </button>
                            ) : (
                              <button
                                onClick={() => handleResubmitClick(application._id)}
                                disabled={isUpdating === application._id}
                                className="inline-flex items-center justify-center px-4 py-1.5 text-xs font-medium text-yellow-700 hover:text-yellow-800 bg-yellow-100 hover:bg-yellow-200 rounded-lg transition-colors whitespace-nowrap w-[80px] disabled:opacity-50 disabled:cursor-not-allowed space-x-1"
                              >
                                {isUpdating === application._id ? (
                                  <>
                                    <div className="h-3 w-3 border-2 border-yellow-700 border-t-transparent rounded-full animate-spin mr-1" />
                                    <span>{t('active.requesting')}</span>
                                  </>
                                ) : (
                                  t('active.resubmit')
                                )}
                              </button>
                            )}
                          </>
                        )}
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
            companyName: selectedApplication?.companyName || t('active.notprovided'),
            location: {
              address: selectedApplication?.location?.address || t('active.notprovided'),
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

      {/* Status Update Modal */}
      <StatusUpdateModal
        isOpen={showStatusModal}
        onClose={() => {
          setShowStatusModal(false);
          setSelectedApplication(null);
        }}
        onConfirm={handleStatusUpdate}
        title={
          selectedApplication?.status === 'reject'
            ? t('active.rejectapplication')
            : t('active.requestresubmission')
        }
        status={selectedApplication?.status || 'reject'}
        isSubmitting={!!isUpdating}
      />

      <MoveToVendorReviewModal
        isOpen={showVendorReviewModal}
        onClose={() => setShowVendorReviewModal(false)}
        onConfirm={() => { }}
        isSubmitting={false}
      />

      <MoveToLiveModal
        isOpen={showLiveModal}
        onClose={() => setShowLiveModal(false)}
        onConfirm={() => { }}
        isSubmitting={false}
      />

      <FeeUpdateModal
        isOpen={showFeeModal}
        onClose={() => setShowFeeModal(false)}
        onConfirm={() => { }}
        isSubmitting={false}
      />
    </div>
  );
}
