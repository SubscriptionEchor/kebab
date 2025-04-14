import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Gift, Tag, Target, Search, Calendar, DollarSign, Power, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useMutation, useQuery, gql, useLazyQuery } from '@apollo/client';
import { useParams, useNavigate } from 'react-router-dom';
import Pagination from '../../components/Pagination';
import LoadingState from '../../components/LoadingState';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

// GraphQL queries and mutations
const GET_PROMOTIONS = gql`
  query Promotions {
    adminDashboardBootstrap {
      promotions {
        _id
        baseCode
        displayName
        createdAt
        description
        isActive
        maxFlatDiscount
        maxPercentageDiscount
        minFlatDiscount
        minPercentageDiscount
        minimumOrderValue
        promotionType
        updatedAt
        minimumMaxDiscount
      }
    }
  }
`;

const GET_RESTAURANT_CAMPAIGNS = gql`
  query RestaurantCampaignsForVendorDashboard($restaurantId: ID!) {
    restaurantCampaignsForVendorDashboard(restaurantId: $restaurantId) {
      _id
      name
      description
      couponCode
      campaignType
      minimumOrderValue
      percentageDiscount
      maxDiscount
      flatDiscount
      startDate
      endDate
      startTime
      endTime
      isActive
      createdBy
      modifiedBy
      createdAt
      updatedAt
      promotion
      restaurant
      __typename
    }
  }
`;

const TOGGLE_CAMPAIGN_STATUS = gql`
  mutation toggleCampaignActiveStatus($id: ID!, $restaurantId: ID!) {
    toggleCampaignActiveStatus(id: $id, restaurantId: $restaurantId) {
      _id
      isActive
      deleted
      __typename
    }
  }
`;

const CREATE_CAMPAIGN = gql`
  mutation CreateCampaign($campaign: CampaignInput!) {
    createCampaign(campaign: $campaign) {
      _id
      name
      couponCode
      campaignType
      percentageDiscount
      flatDiscount
      maxDiscount
      minimumOrderValue
      startDate
      endDate
      startTime
      endTime
      isActive
      createdBy
      modifiedBy
      createdAt
    }
  }
`;

const CREATE_CAMPAIGN_FOR_PROMOTIONS = gql`
  mutation CreateCampaignForPromotions($campaignInput: CampaignInputForPromotion!) {
    createCampaignForPromotions(campaignInput: $campaignInput) {
      _id
      name
      promotion
      percentageDiscount
      flatDiscount
      minimumOrderValue
      startDate
      endDate
      startTime
      endTime
    }
  }
`;

interface ValueValidation {
  minOrderValue?: number;
  minDiscount?: number;
  maxDiscount?: number;
}

interface FormErrors {
  baseCode?: string;
  mov?: string;
  value?: string;
  maxDiscount?: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
}

interface OfferFormData {
  baseCode: string;
  mov: string;
  maxDiscount: string;
  value: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
}

const PROMOTIONS_TYPE = {
  HAPPYHOURS: "HAPPYHOUR",
  SPECIALDAY: "TODAY",
  CHEFSPECIAL: "CHEF",
};

const OFFERS_TYPE = {
  FLAT: "FLAT",
  PERCENTAGE: "PERCENTAGE",
};

interface StepProps {
  title: string;
  children: React.ReactNode;
}

const Step: React.FC<StepProps> = ({ title, children }) => (
  <div className="bg-white rounded-[20px] p-8">
    <h2 className="text-[24px] font-semibold text-[#1D1E20] mb-6">{title}</h2>
    {children}
  </div>
);

interface OptionCardProps {
  title: string;
  description?: string;
  icon: React.ReactNode;
  isSelected: boolean;
  onClick: () => void;
}

const OptionCard: React.FC<OptionCardProps> = ({
  title,
  description,
  icon,
  isSelected,
  onClick,
}) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`p-6 rounded-[20px] cursor-pointer transition-all duration-200 ${isSelected
        ? 'bg-[#FFFBEB] border-2 border-[#FFD541]'
        : 'bg-white border border-gray-200 hover:border-[#FFD541]'
      }`}
  >
    <div
      className={`w-[72px] h-[72px] rounded-full flex items-center justify-center mb-4 ${isSelected ? 'bg-[#FFE171]' : 'bg-[#FFF8E7]'
        }`}
    >
      {icon}
    </div>
    <h3 className="text-[18px] font-semibold text-[#1D1E20] mb-2">{title}</h3>
    {description && <p className="text-[#667085] text-sm">{description}</p>}
  </motion.div>
);

export default function Offers() {
  const { t } = useTranslation();
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired'>('all');
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPromotionType, setSelectedPromotionType] = useState<string | null>(null);
  const [selectedCampaignType, setSelectedCampaignType] = useState<'PERCENTAGE' | 'FLAT' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [valueValidation, setValueValidation] = useState<ValueValidation>({});
  const [currencySymbol, setCurrencySymbol] = useState<string>('€');
  const [formData, setFormData] = useState<OfferFormData>({
    baseCode: '',
    mov: '',
    maxDiscount: '',
    value: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const rowsPerPage = 10;
  const [isToggling, setIsToggling] = useState<string | null>(null);

  // Helper functions for formatting, validation, etc.
  const convertTo12HourFormat = (time24: string) => {
    const [hours, minutes] = time24.split(':');
    const date = new Date();
    date.setHours(parseInt(hours));
    date.setMinutes(parseInt(minutes));
    return date.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  useEffect(() => {
    const sym = localStorage.getItem('kebab_currency_config');
    const parsedSym = sym ? JSON.parse(sym) : null;
    setCurrencySymbol(parsedSym?.currencySymbol || '€');
    fetchCampaigns();
  }, []);

  const { data: promotionsData, loading: promotionLoading, error: promotionError } = useQuery(
    GET_PROMOTIONS,
    {
      variables: { restaurantId },
      fetchPolicy: 'network-only',
      onError: (error) => {
        console.error('Failed to fetch promotions:', error);
        toast.error(t('offers.loadfailed'));
      },
    }
  );

  const [
    fetchCampaigns,
    { data: campaignsData, loading: campaignsLoading, error: campaignsError },
  ] = useLazyQuery(GET_RESTAURANT_CAMPAIGNS, {
    variables: { restaurantId },
    fetchPolicy: 'network-only',
    onError: (error) => {
      console.error('Failed to fetch campaigns:', error);
      toast.error(t('offers.loadfailed'));
    },
  });

  const filteredOffers = (campaignsData?.restaurantCampaignsForVendorDashboard || []).filter((offer: any) => {
    const matchesSearch = offer.couponCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'active'
          ? offer.isActive
          : !offer.isActive;
    return matchesSearch && matchesStatus;
  });

  const paginatedOffers = filteredOffers.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );
  const totalPages = Math.ceil(filteredOffers.length / rowsPerPage);

  const [createCampaign] = useMutation(CREATE_CAMPAIGN, {
    onCompleted: () => {
      toast.success(t('offers.createdsuccessfully'));
      resetForm();
    },
    onError: (error) => {
      console.error('Failed to create offer:', error);
      toast.error(error.message || t('offers.creationfailed'));
    },
  });

  const [createCampaignForPromotions] = useMutation(CREATE_CAMPAIGN_FOR_PROMOTIONS, {
    onCompleted: () => {
      toast.success(t('offers.createdsuccessfully'));
      resetForm();
    },
    onError: (error) => {
      console.error('Failed to create offer:', error);
      toast.error(error.message || t('offers.creationfailed'));
    },
  });

  const [toggleCampaignStatus] = useMutation(TOGGLE_CAMPAIGN_STATUS, {
    refetchQueries: [{ query: GET_RESTAURANT_CAMPAIGNS, variables: { restaurantId } }],
  });

  const handleToggleStatus = async (campaignId: string, currentStatus: boolean) => {
    if (isToggling === campaignId) return;
    setIsToggling(campaignId);
    try {
      await toggleCampaignStatus({
        variables: { id: campaignId, restaurantId },
        onCompleted: () => {
          if (!currentStatus) {
            toast.success(t('offers.activated'))
          } else {
            toast.success(t('offers.deactivated'))
          }
        }
      });
    } catch (error) {
      console.error('Error toggling campaign status:', error);
    } finally {
      setIsToggling(null);
    }
  };

  const handleCampaignSelect = (value: string) => {
    const pickedItem = promotionsData?.adminDashboardBootstrap?.promotions?.find(
      (promotion: any) => promotion.baseCode === value
    );
    if (pickedItem) {
      setValueValidation({
        minOrderValue: pickedItem.minimumOrderValue,
        minDiscount:
          pickedItem.promotionType === OFFERS_TYPE.PERCENTAGE
            ? pickedItem.minPercentageDiscount
            : pickedItem.minFlatDiscount,
        maxDiscount:
          pickedItem.promotionType === OFFERS_TYPE.PERCENTAGE
            ? pickedItem.maxPercentageDiscount
            : pickedItem.maxFlatDiscount,
      });
    }
    setSelectedCampaign(value);
  };

  const validateCampaignLimits = async (
    _existingCampaigns: any,
    selectedCampaign: string,
    formData: OfferFormData
  ): Promise<boolean> => {
    if (parseFloat(formData.mov) < (valueValidation?.minOrderValue || 0)) {
      setErrors({ ...errors, mov: t('offers.minordererror', { value: valueValidation?.minOrderValue }) });
      return true;
    }
    if (
      selectedCampaign === PROMOTIONS_TYPE.CHEFSPECIAL ||
      selectedCampaign === PROMOTIONS_TYPE.HAPPYHOURS
    ) {
       if (parseFloat(formData.value) < (valueValidation?.minDiscount ?? 0)){
        setErrors({ ...errors, value: t('offers.mindispercentage', { value: valueValidation?.minDiscount }) });
        return true;
      }
      if (parseFloat(formData.value) > (valueValidation?.maxDiscount ?? 0)) {
        setErrors({ ...errors, value: t('offers.maxdispercentage', { value: valueValidation?.maxDiscount }) });
        return true;
      }
    }
    if (selectedCampaign === PROMOTIONS_TYPE.SPECIALDAY) {
      if (parseFloat(formData.value) < (valueValidation?.minDiscount ?? 0)) {
        setErrors({ ...errors, value: t('offers.mindisflat', { value: valueValidation?.minDiscount, symbol: currencySymbol }) });
        return true;
      }
      if (parseFloat(formData.value) > (valueValidation?.maxDiscount ?? 0)) {
        setErrors({ ...errors, value: t('offers.maxdisflat', { value: valueValidation?.maxDiscount, symbol: currencySymbol }) });
        return true;
      }
    }
    return false;
  };

  const validateFormData = async () => {
    if (selectedType === "CAMPAIGN" && (!formData?.baseCode || formData?.baseCode?.length<3)) {
      setErrors({ ...errors, baseCode: t('offers.basecoderequired') });
      return true;
    }
    if (!formData?.mov || parseFloat(formData.mov) < 1) {
      setErrors({ ...errors, mov: t('offers.movrequired') });
      return true;
    }
    if (selectedCampaign === OFFERS_TYPE.PERCENTAGE) {
      if (parseFloat(formData.value) < 1) {
        toast.error(t('offers.valuegreaterthanzero'));
        return true;
      }
      if (parseFloat(formData.value) > 100) {
        toast.error(t('offers.valuebelowhundred'));
        return true;
      }
    } else if (selectedCampaign === OFFERS_TYPE.FLAT) {
      if (parseFloat(formData.value) < 1) {
        toast.error(t('offers.flatvalueerror', { symbol: currencySymbol }));
        return true;
      }
    }
    if (selectedCampaign === OFFERS_TYPE.PERCENTAGE) {
      if (!formData?.maxDiscount ||parseFloat(formData.maxDiscount) < 1) {
        toast.error(t('offers.maxdiscounterror', { symbol: currencySymbol }));
        return true;
      }
    }
    if (!formData.startDate) {
      setErrors({ ...errors, startDate: t('offers.startdaterequired') });
      return true;
    }
    if (!formData.endDate) {
      setErrors({ ...errors, endDate: t('offers.enddaterequired') });
      return true;
    }
    if (!formData.startTime) {
      setErrors({ ...errors, startTime: t('offers.starttimerequired') });
      return true;
    }
    if (!formData.endTime) {
      setErrors({ ...errors, endTime: t('offers.endtimerequired') });
      return true;
    }
    if (!formData.value) {
      setErrors({ ...errors, value: t('offers.valuerequired') });
      return true;
    }
    const startDate = new Date(formData.startDate).setHours(0, 0, 0, 0);
    const endDate = new Date(formData.endDate).setHours(0, 0, 0, 0);
    const currentDate = new Date().setHours(0, 0, 0, 0);
    if (startDate < currentDate) {
      toast.error(t('offers.startdatedateerror'));
      return true;
    }
    if (endDate < currentDate) {
      toast.error(t('offers.enddatedateerror'));
      return true;
    }
    if (endDate < startDate) {
      toast.error(t('offers.enddatelaterthanstart'));
      return true;
    }
    return false;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const isError = await validateFormData();
      if (isError) {
        return;
      }
      if (selectedType === 'CAMPAIGN') {
        if (parseFloat(formData.mov) < 10) {
          toast.error(t('offers.movmin', { symbol: currencySymbol, value: 10 }));
          return;
        }
        if (
          campaignsData?.restaurantCampaignsForVendorDashboard?.length > 0 &&
          formData?.baseCode
        ) {
          const existingCampaign = campaignsData?.restaurantCampaignsForVendorDashboard?.find(
            (campaign: any) =>
              campaign.couponCode === formData.baseCode.trim()
          );
          if (existingCampaign) {
            throw new Error(t('offers.duplicatecoupon', { code: formData.baseCode }));
          }
        }
        let campaignInput: any = {
          restaurant: restaurantId,
          couponCode: formData.baseCode,
          campaignType:
            selectedCampaign === OFFERS_TYPE.FLAT ? OFFERS_TYPE.FLAT : OFFERS_TYPE.PERCENTAGE,
          minimumOrderValue: parseFloat(formData.mov),
          startDate: formData.startDate,
          endDate: formData.endDate,
          startTime: formData.startTime,
          endTime: formData.endTime,
        };
        if (selectedCampaign === OFFERS_TYPE.FLAT) {
          campaignInput.flatDiscount = parseFloat(formData.value);
        } else {
          campaignInput.percentageDiscount = parseFloat(formData.value);
          campaignInput.maxDiscount = parseFloat(formData.maxDiscount);
        }
        await createCampaign({
          variables: { campaign: campaignInput },
          onCompleted: () => {
            fetchCampaigns();
            resetForm();
            toast.success(t('offers.createdsuccessfully'));
          },
          onError: (error) => {
            toast.error(error?.message || t('offers.creationfailed'));
            return;
          },
        });
      } else {
        const existingCampaigns = campaignsData?.restaurantCampaignsForVendorDashboard || [];
        const isError = await validateCampaignLimits(existingCampaigns, selectedCampaign, formData);
        if (isError) {
          return;
        }
        const selectedPromotion = promotionsData?.adminDashboardBootstrap?.promotions.find(
          (promotion: any) =>
            promotion.baseCode.toLowerCase() === selectedCampaign.toLowerCase()
        );
        if (!selectedPromotion) {
          toast.error(t('offers.promotionnotfound', { type: selectedCampaign }));
          return;
        }
        if (
          campaignsData?.restaurantCampaignsForVendorDashboard?.length > 0 &&
          formData?.value
        ) {
          const existingCampaign = campaignsData?.restaurantCampaignsForVendorDashboard?.find(
            (campaign: any) =>
              campaign?.couponCode ==
              `${selectedPromotion.baseCode.trim()}${String(formData.value).trim()}`
          );
          if (existingCampaign) {
            toast.error(
              t('offers.duplicatecoupon', { code: `${selectedPromotion.baseCode.trim()}${String(formData.value).trim()}` })
            );
            return;
          }
        }
        const formatDate = (date: string) => {
          const d = new Date(date);
          return d.toISOString().split('T')[0];
        };
        const formatTime = (time: string) => {
          if (!time) return '00:00';
          if (time.match(/^\d{2}:\d{2}$/)) return time;
          const [hours, minutes] = time.split(':');
          return `${hours.padStart(2, '0')}:${minutes ? minutes.padStart(2, '0') : '00'}`;
        };
        let campaignInput: any = {
          restaurant: restaurantId,
          promotion: selectedPromotion._id,
          startDate: formatDate(formData.startDate),
          endDate: formatDate(formData.endDate),
          startTime: formatTime(formData.startTime),
          endTime: formatTime(formData.endTime),
        };
        switch (selectedCampaign.toUpperCase()) {
          case PROMOTIONS_TYPE.HAPPYHOURS:
            if (parseFloat(formData.value) < (valueValidation?.minDiscount ?? 0)) {
              toast.error(t('offers.happyhoursmin', { value: valueValidation?.minDiscount }));
              return;
            }
            campaignInput.percentageDiscount = parseFloat(formData.value);
            campaignInput.minimumOrderValue = parseFloat(formData.mov) || 0;
            break;
          case PROMOTIONS_TYPE.SPECIALDAY:
            if (parseFloat(formData.value) < (valueValidation?.minDiscount ?? 0)) {
              toast.error(t('offers.specialdaymin', { symbol: currencySymbol, value: valueValidation?.minDiscount }));
              return;
            }
            campaignInput.flatDiscount = parseFloat(formData.value);
            campaignInput.minimumOrderValue = parseFloat(formData.mov) || 0;
            break;
          case PROMOTIONS_TYPE.CHEFSPECIAL:
            if (parseFloat(formData.value) < (valueValidation?.minDiscount ?? 0)) {
              toast.error(t('offers.chefmin', { value: valueValidation?.minDiscount }));
              return;
            }
            campaignInput.percentageDiscount = parseFloat(formData.value);
            campaignInput.minimumOrderValue = parseFloat(formData.mov) || 0;
            break;
          default:
            toast.error(t('offers.invalidpromotion', { type: selectedCampaign }));
            return;
        }
        await createCampaignForPromotions({
          variables: {
            campaignInput,
          },
          onCompleted: () => {
            fetchCampaigns();
            resetForm();
            toast.success(t('offers.createdsuccessfully'));
          },
          onError: (error) => {
            toast.error(error?.message || t('offers.creationfailed'));
          },
        });
      }
    } catch (error: any) {
      console.error('Error creating/updating offer:', error);
      toast.error(error?.message || t('offers.creationfailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedType('');
    setSelectedCampaign('');
    setCurrentStep(1);
    setSelectedPromotionType(null);
    setSelectedCampaignType(null);
    setValueValidation({});
    setFormData({
      baseCode: '',
      mov: '',
      maxDiscount: '',
      value: '',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
    });
    setErrors({});
  };

  const handleNext = () => {
    if (currentStep === 1 && !selectedType) {
      return toast.error(t('offers.selecttype'));
    }
    if (currentStep === 2 && !selectedCampaign) {
      return toast.error(t('offers.selectoption'));
    }
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrevious = () => {
    if (currentStep === 2) {
      setSelectedCampaign('');
    }
    setValueValidation({});
    setFormData({
      baseCode: '',
      mov: '',
      maxDiscount: '',
      value: '',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
    });
    setErrors({});
    setCurrentStep((prev) => prev - 1);
  };

  const handleLabelText = () => {
    if (selectedCampaign === OFFERS_TYPE.FLAT || selectedCampaign === OFFERS_TYPE.PERCENTAGE) {
      return selectedCampaign === OFFERS_TYPE.FLAT ? t('offers.flatvalue') : t('offers.percentvalue');
    } else {
      return t('offers.values');
    }
  };

  const handleMinValidation = () => {
    if (
      selectedCampaign === PROMOTIONS_TYPE.SPECIALDAY ||
      selectedCampaign === PROMOTIONS_TYPE.HAPPYHOURS ||
      selectedCampaign === PROMOTIONS_TYPE.CHEFSPECIAL
    ) {
      return valueValidation?.minDiscount;
    } else if (selectedCampaign === OFFERS_TYPE.PERCENTAGE || selectedCampaign === OFFERS_TYPE.FLAT) {
      return 1;
    }
  };

  const handleHelperText = () => {
    if (selectedCampaign === PROMOTIONS_TYPE.SPECIALDAY) {
      return t('offers.specialdayhelper', { symbol: currencySymbol, min: valueValidation?.minDiscount, max: valueValidation?.maxDiscount });
    } else if (
      selectedCampaign === PROMOTIONS_TYPE.HAPPYHOURS ||
      selectedCampaign === PROMOTIONS_TYPE.CHEFSPECIAL
    ) {
      return t('offers.happyhourhelper', { min: valueValidation?.minDiscount, max: valueValidation?.maxDiscount });
    } else if (selectedCampaign === OFFERS_TYPE.PERCENTAGE) {
      return t('offers.percenthelper');
    } else if (selectedCampaign === OFFERS_TYPE.FLAT) {
      return t('offers.flathelper', { symbol: currencySymbol });
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step title={t('offers.selecttype')}>
            <div className="grid grid-cols-2 gap-6">
              <OptionCard
                title={t('offers.campaign')}
                description={t('offers.campaigndesc')}
                icon={<Target className="w-8 h-8 text-[#F04438]" />}
                isSelected={selectedType === 'CAMPAIGN'}
                onClick={() => setSelectedType('CAMPAIGN')}
              />
              <OptionCard
                title={t('offers.promotion')}
                description={t('offers.promotiondesc')}
                icon={<Gift className="w-8 h-8 text-[#F04438]" />}
                isSelected={selectedType === 'PROMOTION'}
                onClick={() => setSelectedType('PROMOTION')}
              />
            </div>
          </Step>
        );
      case 2:
        return selectedType === 'CAMPAIGN' ? (
          <Step title={t('offers.selectcampaigntype')}>
            <div className="grid grid-cols-2 gap-6">
              <OptionCard
                title={t('offers.%off')}
                description={t('offers.percentdesc')}
                icon={<Target className="w-8 h-8 text-[#F04438]" />}
                isSelected={selectedCampaign === OFFERS_TYPE.PERCENTAGE}
                onClick={() => handleCampaignSelect(OFFERS_TYPE.PERCENTAGE)}
              />
              <OptionCard
                title={t('offers.flat')}
                description={t('offers.flatdesc')}
                icon={<Target className="w-8 h-8 text-[#F04438]" />}
                isSelected={selectedCampaign === OFFERS_TYPE.FLAT}
                onClick={() => handleCampaignSelect(OFFERS_TYPE.FLAT)}
              />
            </div>
          </Step>
        ) : (
          <Step title={t('offers.selectpromotiontype')}>
            <div className="grid grid-cols-3 gap-6">
              {promotionsData?.adminDashboardBootstrap?.promotions?.map((promotion: any) => (
                <OptionCard
                  key={promotion._id}
                  title={promotion.displayName}
                  description={promotion.promotionType}
                  icon={<Gift className="w-8 h-8 text-[#F04438]" />}
                  isSelected={selectedCampaign === promotion.baseCode}
                  onClick={() => handleCampaignSelect(promotion.baseCode)}
                />
              ))}
            </div>
          </Step>
        );
      case 3:
        return (
          <Step title={t('offers.enterofferdetails')}>
            <div className="space-y-6">
              {selectedType === 'CAMPAIGN' && (
                <div>
                  <input
                    type="text"
                    placeholder={t('offers.basecodeplaceholder')}
                    value={formData.baseCode}
                    onChange={(e) =>
                      setFormData({ ...formData, baseCode: e.target.value.toUpperCase() })
                    }
                    minLength={6}
                    maxLength={12}
                    className="w-full p-4 text-[#1D1E20] border border-[#FFD541] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD541]"
                  />
                  {errors.baseCode && (
                    <p className="mt-1 text-sm text-red-600">{errors.baseCode}</p>
                  )}
                </div>
              )}

              <div>
                <input
                  type="number"
                  placeholder={t('offers.movplaceholder')}
                  value={formData.mov}
                  onChange={(e) =>
                    setFormData({ ...formData, mov: e.target.value })
                  }
                  min={valueValidation?.minOrderValue || 10}
                  className="w-full p-4 text-[#1D1E20] border border-[#FFD541] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD541]"
                />
                <p className="mt-1 text-sm text-[#667085]">
                  {selectedCampaign === OFFERS_TYPE.FLAT || selectedCampaign === OFFERS_TYPE.PERCENTAGE
                    ? ""
                    : t('offers.movhelper', { symbol: currencySymbol, min: valueValidation?.minOrderValue })}
                </p>
                {errors.mov && (
                  <p className="mt-1 text-sm text-red-600">{errors.mov}</p>
                )}
              </div>

              <div>
                <input
                  type="number"
                  placeholder={handleLabelText()}
                  value={formData.value}
                  onChange={(e) =>
                    setFormData({ ...formData, value: e.target.value })
                  }
                  min={handleMinValidation()}
                  className="w-full p-4 text-[#1D1E20] border border-[#FFD541] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD541]"
                />
                <p className="mt-1 text-sm text-[#667085]">{handleHelperText()}</p>
                {errors.value && (
                  <p className="mt-1 text-sm text-red-600">{errors.value}</p>
                )}
              </div>

              {selectedCampaign !== OFFERS_TYPE.FLAT &&
                ![PROMOTIONS_TYPE.HAPPYHOURS, PROMOTIONS_TYPE.CHEFSPECIAL, PROMOTIONS_TYPE.SPECIALDAY].includes(selectedCampaign) && (
                  <div>
                    <input
                      type="number"
                      placeholder={t('offers.maxdiscountplaceholder')}
                      value={formData.maxDiscount}
                      onChange={(e) =>
                        setFormData({ ...formData, maxDiscount: e.target.value })
                      }
                      min={10}
                      className="w-full p-4 text-[#1D1E20] border border-[#FFD541] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD541]"
                    />
                    <p className="mt-1 text-sm text-[#667085]">
                      {parseFloat(formData.maxDiscount) < 1 ? t('offers.maxdiscounthelpergbh') : ""}
                    </p>
                    {errors.maxDiscount && (
                      <p className="mt-1 text-sm text-red-600">{errors.maxDiscount}</p>
                    )}
                  </div>
                )}

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <input
                    type="date"
                    placeholder={t('offers.startdate')}
                    value={formData.startDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="w-full p-4 text-[#1D1E20] border border-[#FFD541] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD541]"
                  />
                  {errors.startDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
                  )}
                </div>

                <div>
                  <input
                    type="time"
                    placeholder={t('offers.starttime')}
                    value={formData.startTime}
                    onChange={(e) =>
                      setFormData({ ...formData, startTime: e.target.value })
                    }
                    className="w-full p-4 text-[#1D1E20] border border-[#FFD541] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD541]"
                  />
                  {errors.startTime && (
                    <p className="mt-1 text-sm text-red-600">{errors.startTime}</p>
                  )}
                </div>

                <div>
                  <input
                    type="date"
                    placeholder={t('offers.enddate')}
                    value={formData.endDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    className="w-full p-4 text-[#1D1E20] border border-[#FFD541] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD541]"
                  />
                  {errors.endDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
                  )}
                </div>

                <div>
                  <input
                    type="time"
                    placeholder={t('offers.endtime')}
                    value={formData.endTime}
                    onChange={(e) =>
                      setFormData({ ...formData, endTime: e.target.value })
                    }
                    className="w-full p-4 text-[#1D1E20] border border-[#FFD541] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD541]"
                  />
                  {errors.endTime && (
                    <p className="mt-1 text-sm text-red-600">{errors.endTime}</p>
                  )}
                </div>
              </div>
            </div>
          </Step>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-8">
      <div className="max-w-6xl mx-auto">
        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => {
                  resetForm();
                  setActiveTab('list');
                }}
                className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors ${activeTab === 'list'
                    ? 'border-[#FFD541] text-[#1D1E20]'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
              >
                {t('offers.activeoffers')}
              </button>
              <button
                onClick={() => {
                  resetForm();
                  setActiveTab('create');
                }}
                className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors ${activeTab === 'create'
                    ? 'border-[#FFD541] text-[#1D1E20]'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
              >
                {t('offers.createnewoffer')}
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'list' ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-semibold text-gray-900">{t('offers.activeoffers')}</h1>
              <div className="flex items-center space-x-4">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as 'all' | 'active' | 'expired');
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-white cursor-pointer min-w-[140px]"
                >
                  <option value="all">{t('offers.allstatus')}</option>
                  <option value="active">{t('offers.activeonly')}</option>
                  <option value="expired">{t('offers.expiredonly')}</option>
                </select>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('offers.searchoffers')}
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

            <div className="table-container">
              <div className="table-wrapper">
                {campaignsLoading ? (
                  <LoadingState rows={5} />
                ) : campaignsError ? (
                  <div className="text-center py-12">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="text-red-500 font-medium">{t('offers.loadfailed')}</div>
                      <p className="text-gray-600 text-sm max-w-md text-center">
                        {t('offers.loadfaileddesc')}
                      </p>
                      <button
                        onClick={() => window.location.reload()}
                        className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-black bg-brand-primary rounded-lg hover:bg-brand-primary/90 transition-all duration-200 hover:scale-[1.02]"
                      >
                        {t('offers.retry')}
                      </button>
                    </div>
                  </div>
                ) : filteredOffers.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">
                      {searchQuery.trim()
                        ? t('offers.nooffersmatching', { query: searchQuery })
                        : t('offers.nooffersfound')}
                    </p>
                    {searchQuery.trim() && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="text-brand-primary hover:text-brand-primary/80 font-medium"
                      >
                        {t('offers.clearsearch')}
                      </button>
                    )}
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="table-header" style={{ width: '15%' }}>{t('offers.code')}</th>
                        <th className="table-header" style={{ width: '15%' }}>{t('offers.type')}</th>
                        <th className="table-header" style={{ width: '15%' }}>{t('offers.values')}</th>
                        <th className="table-header" style={{ width: '15%' }}>{t('offers.minorder')}</th>
                        <th className="table-header" style={{ width: '25%' }}>{t('offers.duration')}</th>
                        <th className="table-header" style={{ width: '15%' }}>{t('offers.status')}</th>
                        <th className="table-header text-right">{t('offers.actions')}</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedOffers.map((offer: any) => (
                        <tr key={offer._id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="table-cell">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-brand-accent text-black">
                              {offer.couponCode}
                            </span>
                          </td>
                          <td className="table-cell">
                            <div className="flex items-center">
                              {!offer.promotion ? (
                                <Target className="h-4 w-4 mr-2 text-[#F04438]" />
                              ) : (
                                <Gift className="h-4 w-4 mr-2 text-[#F04438]" />
                              )}
                              <span>{offer.promotion ? t('offers.promotion') : t('offers.campaign')}</span>
                            </div>
                          </td>
                          <td className="table-cell">
                            <div className="flex items-center space-x-1">
                              {offer.campaignType === 'PERCENTAGE' ? (
                                <span>{offer.percentageDiscount} % {t('offers.off')}</span>
                              ) : (
                                <span>{offer.flatDiscount}{t('offers.offcurrency')}</span>
                              )}
                            </div>
                          </td>
                          <td className="table-cell font-medium">{offer.minimumOrderValue}{t('offers.currency')}</td>
                          <td className="table-cell">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                              <span>
                                {moment.unix(offer.startDate / 1000).format("DD MMM YYYY")} {convertTo12HourFormat(offer.startTime)} - {moment.unix(offer.endDate / 1000).format("DD MMM YYYY")} {convertTo12HourFormat(offer.endTime)}
                              </span>
                            </div>
                          </td>
                          <td className="table-cell">
                            <span className={`status-badge ${offer.isActive
                              ? 'bg-green-100 text-green-800 ring-1 ring-green-600/20'
                              : 'bg-gray-100 text-gray-800 ring-1 ring-gray-600/20'
                              }`}>
                              {offer.isActive ? t('offers.active') : t('offers.inactive')}
                            </span>
                          </td>
                          <td className="table-cell text-right">
                            <div className="flex items-center justify-end pr-6">
                              <button
                                onClick={() => handleToggleStatus(offer._id, offer.isActive)}
                                disabled={isToggling === offer._id}
                                className={`inline-flex items-center justify-center w-10 h-10 rounded-full transition-colors ${offer.isActive
                                  ? 'bg-green-500 hover:bg-green-600'
                                  : 'bg-gray-300 hover:bg-gray-400'
                                  } ${isToggling === offer._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                title={offer.isActive ? t('offers.deactivateoffer') : t('offers.activateoffer')}
                              >
                                {isToggling === offer._id ? (
                                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Power className="h-4 w-4 text-white" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              {totalPages > 1 && (
                <div className="mt-4 px-4 py-3 bg-white border-t border-gray-200">
                  <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            {renderStep()}
            <div className="mt-6 flex justify-end space-x-4">
              {currentStep > 1 && (
                <button
                  onClick={handlePrevious}
                  className="px-6 py-3 text-[var(--offers-prev-color)] font-semibold hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {t('offers.previous')}
                </button>
              )}
              {currentStep < 3 ? (
                <button
                  onClick={handleNext}
                  className="px-6 py-3 bg-[var(--offers-next-bg)] text-[var(--offers-next-text)] font-semibold rounded-lg hover:bg-[var(--offers-next-hover)] transition-colors"
                >
                  {t('offers.next')}
                </button>
              ) :
                (
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-[var(--offers-create-bg)] text-[var(--offers-create-text)] font-semibold rounded-lg hover:bg-[var(--offers-create-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? t('offers.creating') : t('offers.createoffer')}
                  </button>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
