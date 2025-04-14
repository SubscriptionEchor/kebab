import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import Pagination from '../../components/Pagination';
import CopyableId from '../../components/CopyableId';
import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import { formatDate, getMostRecentStatusTimestamp } from '../../utils/date';
import { GET_RESTAURANT_APPLICATIONS } from '../../lib/graphql/queries/onboarding';
import { GET_DOCUMENT_URLS } from '../../lib/graphql/queries/documents';
import { UPDATE_RESTAURANT_APPLICATION_STATUS } from '../../lib/graphql/mutations/onboarding';
import { APPLICATION_STATUS } from '../../types/onboarding';
import { showLiveConfetti } from '../../utils/confetti';
import MoveToVendorReviewModal from '../../components/MoveToVendorReviewModal';
import MoveToLiveModal from '../../components/MoveToLiveModal';
import ApplicationDetailsModal from '../../components/onboarding/ApplicationDetailsModal';
import LoadingState from '../../components/LoadingState';
import { toast } from 'sonner';
import FeeUpdateModal from '../../components/FeeUpdateModal';
import { useTranslation } from 'react-i18next';

type SubTab = 'accepted' | 'offline-processing' | 'onboarded' | 'vendor-review' | 'live';

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
  openingTimes: OpeningTime[];
  businessDocuments: BusinessDocuments;
  potentialVendor: string;
  applicationStatus: string;
  createdAt: string;
  resubmissionCount: number;
  statusHistory: StatusHistory[];
  updatedAt: string
}

export default function ApprovedRestaurants() {
  const client = useApolloClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isMovingNext, setIsMovingNext] = useState<string | null>(null);
  const rowsPerPage = 10;
  const [processingApplications, setProcessingApplications] = useState<Set<string>>(new Set());
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('accepted');
  const { t } = useTranslation();

  // Reset to page 1 when changing tabs
  const handleTabChange = (tab: SubTab) => {
    setActiveSubTab(tab);
    setCurrentPage(1);
  };

  const [fees, setFees] = useState({
    serviceFeePercentage: 35,
    merchantCancellationFeePercentage: 10
  });
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [showVendorReviewModal, setShowVendorReviewModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [pendingFees, setPendingFees] = useState<{ serviceFeePercentage: number } | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<{
    id?: string;
    status?: 'reject' | 'resubmit';
    _id?: string;
    restaurantName?: string;
    [key: string]: any;
  } | null>(null);
  const [showLiveModal, setShowLiveModal] = useState(false);

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
        toast.error(t('approved.errorloadingapplications'), {
          description: t('approved.documentsnotavailable')
        });
      }

      setSelectedApplication({
        ...application,
        documentUrls: documentUrls || {}
      });

      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error fetching document URLs:', error);
      toast.error(t('approved.errorloadingapplications'), {
        description: t('approved.previewunavailable')
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

  const [updateStatus] = useMutation(UPDATE_RESTAURANT_APPLICATION_STATUS, {
    refetchQueries: [{ query: GET_RESTAURANT_APPLICATIONS }],
    onError: (error) => {
      const errorMessage = error.graphQLErrors?.[0]?.message || error.message;
      if (!errorMessage.includes('Potential vendor not found')) {
        console.error('Failed to update application status:', errorMessage);
      }
    }
  });

  const handleMoveToNextStep = async (applicationId: string) => {
    // If moving to ONBOARDED (from offline-processing), show fee modal first
    if (activeSubTab === 'offline-processing') {
      if (!applicationId) {
        toast.error(t('approved.applicationnotfound'));
        return;
      }
      setSelectedApplicationId(applicationId);
      setShowFeeModal(true);
      return;
    }

    // If moving to VENDOR_REVIEW (from onboarded), show vendor review modal
    if (activeSubTab === 'onboarded') {
      if (!applicationId) {
        toast.error(t('approved.applicationnotfound'));
        return;
      }
      setSelectedApplicationId(applicationId);
      setShowVendorReviewModal(true);
      return;
    }

    // If moving to LIVE (from vendor-review), call API directly
    if (activeSubTab === 'vendor-review') {
      if (!applicationId) {
        toast.error(t('approved.applicationnotfound'));
        return;
      }
      await updateApplicationStatus(applicationId);
      return;
    }

    await updateApplicationStatus(applicationId);
  };

  const handleFeeConfirm = async (newFees: { serviceFeePercentage: number }) => {
    if (!selectedApplicationId) return;

    const toastId = toast.loading(t('approved.servicefeeupdate'));

    const feesWithCancellation = {
      serviceFeePercentage: newFees.serviceFeePercentage,
      merchantCancellationFeePercentage: 10
    };

    try {
      await updateApplicationStatus(selectedApplicationId, feesWithCancellation);
      setShowFeeModal(false);
      setSelectedApplicationId(null);
    } catch (error) {
      console.error('Error updating fees:', error);
      const errorMessage = error instanceof Error ? error.message : t('approved.failedtoupdatefees');
      if (errorMessage.includes('Potential vendor not found')) {
        toast.error(t('approved.vendornotfound'), {
          id: toastId,
          description: t('approved.vendornotassociated')
        });
      } else {
        toast.error(errorMessage, { id: toastId });
      }
    }
  };

  const updateApplicationStatus = async (
    applicationId: string,
    newFees?: { serviceFeePercentage: number }
  ) => {
    if (isMovingNext === applicationId) return;

    setIsMovingNext(applicationId);

    let nextStatus = '';
    let reason = '';
    let fees = null;

    switch (activeSubTab) {
      case 'accepted':
        nextStatus = APPLICATION_STATUS.OFFLINE_PROCESSING;
        reason = t('approved.movingtoofflineprocessing');
        break;
      case 'offline-processing':
        nextStatus = APPLICATION_STATUS.ONBOARDED;
        reason = t('approved.alldocumentsverified');
        fees = newFees || {
          serviceFeePercentage: 35,
          merchantCancellationFeePercentage: 10
        };
        break;
      case 'onboarded':
        nextStatus = APPLICATION_STATUS.PENDING_VENDOR_REVIEW;
        reason = t('approved.movingtovendorreview');
        break;
      case 'vendor-review':
        nextStatus = APPLICATION_STATUS.LIVE;
        reason = t('approved.restaurantisnowlive');
        break;
      default:
        throw new Error(t('approved.applicationnotfound'));
    }

    try {
      const variables: any = {
        applicationId,
        status: nextStatus,
        reason,
        fees: fees
      };

      const { data } = await updateStatus({ variables });

      if (data?.updateRestaurantOnboardingApplicationStatus) {
        toast.dismiss();
        toast.success(
          nextStatus === APPLICATION_STATUS.LIVE
            ? t('approved.restaurantisnowlive')
            : t('approved.statusupdatedsuccessfully'),
          { duration: 4000 }
        );
        if (nextStatus === APPLICATION_STATUS.LIVE) {
          showLiveConfetti();
        }
      }
    } catch (error) {
      toast.dismiss();
      console.error('Error moving to next step:', error);
      const errorMessage = error instanceof Error ? error.message : t('approved.failedtoupdatestatus');
      if (errorMessage.includes('Potential vendor not found')) {
        toast.error(t('approved.vendornotfound'), {
          description: t('approved.vendornotassociated')
        });
      } else {
        toast.error(errorMessage, { duration: 4000 });
      }
    } finally {
      setIsMovingNext(null);
    }
  };

  const { data, loading, error, refetch } = useQuery(GET_RESTAURANT_APPLICATIONS, {
    fetchPolicy: 'cache-and-network',
    onError: (error) => {
      const errorMessage = error.graphQLErrors?.[0]?.message || error.message;
      console.error('Failed to fetch restaurant applications:', errorMessage);
      toast.error(errorMessage || t('approved.failedtofetchapplications'));
    },
  });

  const subTabs = [
    { value: 'accepted' as SubTab, label: t('approved.accepted'), status: APPLICATION_STATUS.ACCEPTED },
    { value: 'offline-processing' as SubTab, label: t('approved.offlineprocessing'), status: APPLICATION_STATUS.OFFLINE_PROCESSING },
    { value: 'onboarded' as SubTab, label: t('approved.onboarded'), status: APPLICATION_STATUS.ONBOARDED },
    { value: 'vendor-review' as SubTab, label: t('approved.vendorreviewed'), status: APPLICATION_STATUS.PENDING_VENDOR_REVIEW },
    { value: 'live' as SubTab, label: t('approved.live'), status: APPLICATION_STATUS.LIVE }
  ];

  const getStatusForTab = (tab: SubTab): string => {
    return subTabs.find((item) => item.value === tab)?.status || '';
  };

  const filteredRestaurants = useMemo(() => {
    if (!data?.getAllRestaurantOnboardingApplication) return [];

    const acceptedApplications = data.getAllRestaurantOnboardingApplication.filter(
      (application: RestaurantApplication) =>
        application.applicationStatus === getStatusForTab(activeSubTab)
    );

    const query = searchQuery.toLowerCase().trim();
    return acceptedApplications.filter((application: RestaurantApplication) => {
      const nameMatch = application.restaurantName.toLowerCase().includes(query);
      const vendorMatch = application.potentialVendor.toLowerCase().includes(query);
      const onboardingMatch = application._id.toLowerCase().includes(query);
      return nameMatch || vendorMatch || onboardingMatch;
    });
  }, [searchQuery, data, activeSubTab]);

  const paginatedRestaurants = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredRestaurants.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredRestaurants, currentPage]);

  const totalPages = Math.ceil(filteredRestaurants.length / rowsPerPage);

  const handleVendorReviewConfirm = async () => {
    if (!selectedApplicationId) return;

    const toastId = toast.loading(t('approved.movingtovendorreview'));

    try {
      await updateApplicationStatus(selectedApplicationId);
      setShowVendorReviewModal(false);
      setSelectedApplicationId(null);
      toast.success(t('approved.applicationmovedtovendorreview'), {
        id: toastId,
        duration: 4000
      });
    } catch (error) {
      console.error('Error moving to vendor review:', error);
      const errorMessage = error instanceof Error ? error.message : t('approved.failedtomovetovendorreview');
      if (errorMessage.includes('Potential vendor not found')) {
        toast.error(t('approved.vendornotfound'), {
          id: toastId,
          description: t('approved.vendornotassociated')
        });
      } else {
        toast.error(errorMessage, {
          id: toastId,
          duration: 4000
        });
      }
    }
  };

  const handleLiveConfirm = async () => {
    if (!selectedApplicationId) return;

    const toastId = toast.loading(t('approved.movingrestauranttolive'));

    try {
      await updateApplicationStatus(selectedApplicationId);
      setShowLiveModal(false);
      setSelectedApplicationId(null);
      toast.success(t('approved.applicationmovedtolive'), {
        id: toastId,
        duration: 4000
      });
    } catch (error) {
      console.error('Error moving to live:', error);
      const errorMessage = error instanceof Error ? error.message : t('approved.failedtomovetolive');
      if (errorMessage.includes('Potential vendor not found')) {
        toast.error(t('approved.vendornotfound'), {
          id: toastId,
          description: t('approved.vendornotassociated')
        });
      } else {
        toast.error(errorMessage, { id: toastId });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">{t('approved.aprovedrestaurants')}</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('approved.searchrestaurants')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {subTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleTabChange(tab.value)}
              className={`
                whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors
                ${activeSubTab === tab.value
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {error ? (
        <div className="text-center py-12">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="text-red-500 font-medium">{t('approved.failedtoloadapplications')}</div>
            <p className="text-gray-600 text-sm max-w-md text-center">
              {t('approved.errorloadingapplications')}
            </p>
            <button
              onClick={() => refetch()}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-black bg-brand-primary rounded-lg hover:bg-brand-primary/90 transition-all duration-200 hover:scale-[1.02]"
            >
              {t('approved.retry')}
            </button>
          </div>
        </div>
      ) : loading ? (
        <LoadingState rows={5} />
      ) : !data?.getAllRestaurantOnboardingApplication || filteredRestaurants.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">
            {searchQuery.trim()
              ? `${t('approved.noapplicationsmatching')} "${searchQuery}"`
              : t('approved.noapprovedapplicationsfound')}
          </p>
          {searchQuery.trim() && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-brand-primary hover:text-brand-primary/80 font-medium"
            >
              {t('approved.clearsearch')}
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
                    {t('approved.sno')}
                  </th>
                  <th className="table-header" style={{ width: '25%' }}>
                    {t('approved.restaurantname')}
                  </th>
                  <th className="table-header" style={{ width: '20%' }}>
                    {t('approved.vendorid')}
                  </th>
                  <th className="table-header" style={{ width: '20%' }}>
                    {t('approved.onboardingid')}
                  </th>
                  <th className="table-header" style={{ width: '15%' }}>
                    {t('approved.applicationdate')}
                  </th>
                  <th className="table-header text-right" style={{ width: '15%' }}>
                    {t('approved.actions')}
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
                      <div className="flex items-center space-x-2">
                        <CopyableId
                          label={t('approved.vendorid')}
                          value={application.potentialVendor}
                          truncateLength={8}
                        />
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        <CopyableId
                          label={t('approved.onboardingid')}
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
                          {t('approved.view')}
                        </button>
                        {activeSubTab !== 'live' && (
                          <button
                            onClick={() => handleMoveToNextStep(application._id)}
                            disabled={isMovingNext === application._id}
                            className="ml-4 inline-flex items-center justify-center px-4 py-1.5 text-xs font-medium text-green-700 hover:text-green-800 bg-green-100 hover:bg-green-200 rounded-lg transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed w-[120px] space-x-1"
                          >
                            {isMovingNext === application._id ? (
                              <>
                                <div className="h-3 w-3 border-2 border-green-700 border-t-transparent rounded-full animate-spin mr-1" />
                                <span>{t('approved.moving')}</span>
                              </>
                            ) : (
                              t('approved.movetonextstep')
                            )}
                          </button>
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
                onPageChange={(page) => setCurrentPage(page)}
              />
            )}
          </div>
        </div>
      )}

      <MoveToVendorReviewModal
        isOpen={showVendorReviewModal}
        onClose={() => setShowVendorReviewModal(false)}
        onConfirm={handleVendorReviewConfirm}
        isSubmitting={!!isMovingNext}
      />

      <FeeUpdateModal
        isOpen={showFeeModal}
        onClose={() => {
          setShowFeeModal(false);
          setSelectedApplicationId(null);
        }}
        onConfirm={handleFeeConfirm}
        isSubmitting={!!isMovingNext}
        initialServiceFee={35}
      />

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
            companyName: selectedApplication?.companyName || t('approved.notprovided'),
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
