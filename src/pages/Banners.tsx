import { useState, useMemo } from 'react';
import { Search, Plus } from 'lucide-react';
import { useQuery, useMutation } from '@apollo/client';
import DeleteConfirmation from '../components/DeleteConfirmation';
import BannerListSkeleton from '../components/banners/BannerListSkeleton';
import BannerFormSkeleton from '../components/banners/BannerFormSkeleton';
import { GET_BANNERS, GET_BANNER_TEMPLATES } from '../lib/graphql/queries/banners';
import { CREATE_BANNER, UPDATE_BANNER, DELETE_BANNER } from '../lib/graphql/mutations/banners';
import BannerForm from '../components/banners/BannerForm';
import { Banner, BannerFormData, BannerTemplate, BannerElement } from '../types/banners';
import BannerList from '../components/banners/BannerList';
import { toast } from 'sonner';
import { showSuccessConfetti } from '../utils/confetti';
import { useTranslation } from 'react-i18next';
export default function Banners() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<{ id: string; name: string } | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;
  const defaultFormData: BannerFormData = {
    title: '',
    titleColor: '#000000',
    highlight: '',
    highlightColor: '#000000',
    content: '',
    contentColor: '#000000',
    image: null as string | null,
    gradientStartColor: '#FFFFFF',
    gradientEndColor: '#000000',
    gradientDirection: 'to right',
  };
  const [bannerFormData, setBannerFormData] = useState(defaultFormData);
  const rowsPerPage = 10;

  // GraphQL Mutations
  const [createBanner] = useMutation(CREATE_BANNER, {
    refetchQueries: [{ query: GET_BANNERS }]
  });

  const [updateBanner] = useMutation(UPDATE_BANNER, {
    refetchQueries: [{ query: GET_BANNERS }]
  });

  const [deleteBanner] = useMutation(DELETE_BANNER, {
    refetchQueries: [{ query: GET_BANNERS }],
    onError: (error) => {
      console.error('Failed to delete banner:', error);
      toast.error(t('banners.deletionfailed'));
    }
  });
  const { data: bannersData, loading: bannersLoading, error: bannersError, refetch } = useQuery(GET_BANNERS, {
    onError: (error) => {
      console.error('Failed to fetch banners:', error);
      if (retryCount < MAX_RETRIES) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          refetch();
        }, Math.pow(2, retryCount) * 1000); // Exponential backoff
      }
    }
  });
  const { data: templatesData, loading: templatesLoading, error: templatesError } = useQuery(GET_BANNER_TEMPLATES);
  const filteredBanners = useMemo(() => {
    const banners = bannersData?.banners || [];
    return banners.filter((banner: Banner) =>
      banner.elements.some(element =>
        element.text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        banner.templateId.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [bannersData, searchQuery]);
  const paginatedBanners = filteredBanners.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );
  const totalPages = Math.ceil(filteredBanners.length / rowsPerPage);
  const handleCreateBanner = async (input: { templateId: string; elements: BannerElement[] }) => {
    setIsSubmitting(true);
    const toastId = toast.loading(t('banners.creatingbanner'));

    try {
      if (!input.templateId || !input.elements?.length) {
        throw new Error(t('banners.missinginfo'));
      }

      await createBanner({
        variables: { input }
      });

      toast.success(t('banners.bannercreated'), {
        description: t('banners.bannercreateddesc'),
        duration: 4000
      });
      showSuccessConfetti();
      setBannerFormData(defaultFormData);
      setActiveTab('active');
    } catch (error) {
      console.error('Failed to create banner:', error);
      toast.error(t('banners.creationfailed'), {
        description: error instanceof Error ? error.message : t('banners.creationfaileddesc'),
        duration: 5000
      });
    }
    setIsSubmitting(false);
    toast.dismiss(toastId);
  };
  const handleUpdateBanner = async (input: { templateId: string; elements: BannerElement[] }) => {
    if (!editingBannerId) return;

    const toastId = toast.loading(t('banners.updatingbanner'));

    if (!input.templateId || !input.elements?.length) {
      toast.error(t('banners.missinginfo'), {
        description: t('banners.missinginfodesc'),
        duration: 4000
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await updateBanner({
        variables: {
          id: editingBannerId,
          input
        }
      });

      toast.success(t('banners.bannerupdated'), {
        description: t('banners.bannerupdateddesc'),
        duration: 4000
      });
      showSuccessConfetti();
      setBannerFormData(defaultFormData);
      setActiveTab('active');
      setEditingBannerId(null);
    } catch (error) {
      console.error('Failed to update banner:', error);
      toast.error(t('banners.updatefailed'), {
        description: error instanceof Error ? error.message : t('banners.updatefaileddesc'),
        duration: 5000
      });
    }
    setIsSubmitting(false);
    toast.dismiss(toastId);
  };
  const handleEditBanner = (banner: Banner) => {
    const template = templatesData?.bannerTemplates?.find(
      (t: BannerTemplate) => t.templateId === banner.templateId
    );

    if (!template) {
      toast.error(t('banners.templatenotfound'));
      return;
    }
    const newFormData: BannerFormData = {
      ...defaultFormData,
      title: banner.elements.find(el => el.key === 'title')?.text || '',
      titleColor: banner.elements.find(el => el.key === 'title')?.color || '#000000',
      highlight: banner.elements.find(el => el.key === 'highlight')?.text || '',
      highlightColor: banner.elements.find(el => el.key === 'highlight')?.color || '#000000',
      content: banner.elements.find(el => el.key === 'content')?.text || '',
      contentColor: banner.elements.find(el => el.key === 'content')?.color || '#000000',
      image: banner.elements.find(el => el.key === 'image')?.image || null,
      gradientStartColor: getGradientStartColor(banner.elements),
      gradientEndColor: getGradientEndColor(banner.elements),
      gradientDirection: getGradientDirection(banner.elements),
      selectedTemplateId: template._id,
    };
    setBannerFormData(newFormData);
    setEditingBannerId(banner._id);
    setActiveTab('create');
  };
  const getGradientStartColor = (elements: BannerElement[]): string => {
    const bgElement = elements.find(el => el.key === 'background');
    if (!bgElement?.gradient) return '#FFFFFF';
    const match = bgElement.gradient.match(/linear-gradient\((.*?),\s*(.*?),\s*(.*?)\)/);
    return match?.[2]?.trim() || '#FFFFFF';
  };
  const getGradientEndColor = (elements: BannerElement[]): string => {
    const bgElement = elements.find(el => el.key === 'background');
    if (!bgElement?.gradient) return '#000000';
    const match = bgElement.gradient.match(/linear-gradient\((.*?),\s*(.*?),\s*(.*?)\)/);
    return match?.[3]?.trim() || '#000000';
  };
  const getGradientDirection = (elements: BannerElement[]): string => {
    const bgElement = elements.find(el => el.key === 'background');
    if (!bgElement?.gradient) return 'to right';
    const match = bgElement.gradient.match(/linear-gradient\((.*?),/);
    return match?.[1]?.trim() || 'to right';
  };
  const handleDeleteBanner = async (bannerId: string) => {
    setIsDeleting(bannerId);

    try {
      const { data } = await deleteBanner({
        variables: { id: bannerId }
      });

      if (data?.deleteBanner) {
        toast.success(t('banners.bannerdeleted'));
        setShowDeleteConfirmation(false);
        setBannerToDelete(null);
      } else {
        throw new Error(t('banners.deletionfailed'));
      }
    } catch (error) {
      console.error('Failed to delete banner:', error);
      toast.error(t('banners.deletionfailed'));
    }
    setIsDeleting(null);
  };
  const handleDeleteClick = (banner: Banner) => {
    setBannerToDelete({
      id: banner._id,
      name: banner.elements.find(el => el.key === 'title')?.text || banner.templateId || t('banners.defaultbannername')
    });
    setShowDeleteConfirmation(true);
  };
  return (
    <div className="space-y-6">
      <DeleteConfirmation
        key={showDeleteConfirmation ? 'open' : 'closed'}
        isOpen={showDeleteConfirmation}
        onClose={() => {
          setShowDeleteConfirmation(false);
          setBannerToDelete(null);
        }}
        onConfirm={() => bannerToDelete && handleDeleteBanner(bannerToDelete.id)}
        title={t('banners.deletebanner')}
        message={t('banners.deletebannermessage', { name: bannerToDelete?.name })}
        isDeleting={!!isDeleting}
      />
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('active')}
              className={`
                whitespace-nowrap border-b-2 py-4 px-6 text-sm font-medium transition-colors
                ${activeTab === 'active'
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}
              `}
            >
              {t('banners.activebanners')}
            </button>
            <button
              onClick={() => {
                setActiveTab('create');
                setEditingBannerId(null);
                setBannerFormData(defaultFormData);
              }}
              className={`
                whitespace-nowrap border-b-2 py-4 px-6 text-sm font-medium transition-colors
                ${activeTab === 'create'
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}
              `}
            >
              {editingBannerId ? t('banners.editbanner') : t('banners.createbanner')}
            </button>
          </nav>
        </div>
        <div className="p-6 overflow-hidden">
          {activeTab === 'active' && (
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">{t('banners.title')}</h1>
              <div className="flex items-center space-x-4">
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('banners.searchbanners')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  />
                </div>
                <button
                  onClick={() => {
                    setActiveTab('create');
                    setEditingBannerId(null);
                    setBannerFormData(defaultFormData);
                  }}
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-black bg-brand-primary rounded-lg hover:bg-brand-primary/90 transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  {t('banners.createbanner')}
                </button>
              </div>
            </div>
          )}
          {activeTab === 'active' ? (
            bannersError ? (
              <div className="text-center py-12">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="text-red-500 font-medium">{t('banners.failedtoload')}</div>
                  <p className="text-gray-600 text-sm max-w-md text-center">
                    {t('banners.failtoload')}
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-black bg-brand-primary rounded-lg hover:bg-brand-primary/90 transition-all duration-200 hover:scale-[1.02]"
                  >
                    {t('banners.retry')}
                  </button>
                </div>
              </div>
            ) : bannersLoading ? (
              <BannerListSkeleton />
            ) : !bannersData?.banners || bannersData.banners.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">{t('banners.nobannersfound')}</p>
                <button
                  onClick={() => {
                    setActiveTab('create');
                    setEditingBannerId(null);
                    setShowDeleteConfirmation(false);
                    setBannerFormData(defaultFormData);
                  }}
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-black bg-brand-primary rounded-lg hover:bg-brand-primary/90 transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t('banners.createyourfirstbanner')}
                </button>
              </div>
            ) : filteredBanners.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <p className="text-gray-500">
                    {t('banners.nobannersfoundmatching', { query: searchQuery })}
                  </p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-brand-primary hover:text-brand-primary/80 font-medium"
                  >
                    {t('banners.clearsearch')}
                  </button>
                </div>
              </div>
            ) : (
              <BannerList
                banners={paginatedBanners}
                isLoading={bannersLoading}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                onEdit={handleEditBanner}
                onDelete={(banner) => handleDeleteClick(banner)}
                isDeleting={isDeleting}
              />
            )
          ) : (
            templatesLoading ? (
              <BannerFormSkeleton />
            ) : (
              <BannerForm
                isSubmitting={isSubmitting}
                isEditing={!!editingBannerId}
                onSubmit={(input) =>
                  editingBannerId ? handleUpdateBanner(input) : handleCreateBanner(input)
                }
                initialData={bannerFormData}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}
