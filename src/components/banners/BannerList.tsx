import { Edit2, Trash2 } from 'lucide-react';
import { Banner } from '../../types/banners';
import Pagination from '../Pagination';
import { useMutation } from '@apollo/client';
import { TOGGLE_BANNER_STATUS } from '../../lib/graphql/mutations/banners';
import { toast } from 'sonner';
import BannerListSkeleton from './BannerListSkeleton';
import { useTranslation } from 'react-i18next';
interface BannerListProps {
  banners: Banner[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onEdit: (banner: Banner) => void;
  onDelete: (banner: Banner) => void;
  isLoading?: boolean;
  isDeleting: string | null;
}
export default function BannerList({
  banners,
  currentPage,
  totalPages,
  onPageChange,
  onEdit,
  isLoading,
  onDelete,
  isDeleting,
}: BannerListProps) {
  const [toggleStatus, { loading: isToggling }] = useMutation(TOGGLE_BANNER_STATUS);
  const { t } = useTranslation();

  const handleToggleStatus = async (id: string) => {
    if (isToggling) return; // Prevent multiple clicks
    try {
      await toggleStatus({ variables: { id } });
      toast.success('Banner status updated successfully');
    } catch (error) {
      console.error('Failed to toggle banner status:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update banner status');
    }
  };
  if (isLoading) return <BannerListSkeleton />;
  return (
    <div className="overflow-x-auto max-w-[calc(100vw-2rem)]">
      <table className="w-full border-separate border-spacing-0">
        <thead>
          <tr className="text-xs text-gray-500 uppercase tracking-wider text-left">
            <th className="sticky top-0 z-10 bg-white px-4 py-3 font-medium border-b border-gray-200 w-[25%]">{t('banners.template')}</th>
            <th className="sticky top-0 z-10 bg-white px-4 py-3 font-medium border-b border-gray-200 w-[20%]">{t('banners.preview')}</th>
            <th className="sticky top-0 z-10 bg-white px-4 py-3 font-medium border-b border-gray-200 w-[40%]">{t('banners.content')}</th>
            <th className="sticky top-0 z-10 bg-white px-4 py-3 font-medium border-b border-gray-200 w-[15%] text-center">{t('banners.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {banners.map((banner) => (
            <tr
              key={banner._id}
              className="group hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 whitespace-nowrap"
            >
              <td className="px-4 py-3">
                <div className="space-y-1">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                  {banner.templateId}
                  </span>
                  <div className="text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <span className="font-mono truncate max-w-[150px]" title={banner._id}>{banner._id}</span>
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-center">
                  <div className="w-32 h-20">
                    {banner.elements.find(el => el.key === 'image')?.image ? (
                      <img
                        src={banner.elements.find(el => el.key === 'image')?.image!}
                        alt="Banner preview"
                        className="w-full h-full object-cover rounded-lg shadow-sm group-hover:shadow-md transition-all duration-200"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No image</span>
                      </div>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="space-y-2 max-w-[260px]">
                  {banner.elements.map((element) => (
                    element.text ? (
                      <div key={element.key} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-20">
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t(`bannerslist.${element.key?.toLowerCase()}`)} 
                          </span>
                        </div>
                        <div className="flex-1 min-w-0 flex items-center space-x-2">
                          <p className="text-sm text-gray-900 truncate" title={element.text}>
                            {element.text}
                          </p>
                          {element.color && (
                            <div
                              className="w-3 h-3 rounded-full border border-gray-200 flex-shrink-0"
                              style={{ backgroundColor: element.color }}
                            />
                          )}
                        </div>
                      </div>
                    ) : null
                  ))}
                </div>
              </td>
              <td className="px-4 py-3 text-center">
                <div className="flex items-center justify-center space-x-3">
                  <div className="flex items-center bg-gray-100 rounded-md divide-x divide-gray-200">
                    <button
                      onClick={() => onEdit(banner)}
                      className="p-1.5 text-gray-700 hover:text-brand-primary hover:bg-gray-200 rounded-l-md transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      disabled={isDeleting === banner._id}
                      onClick={() => onDelete(banner)}
                      className={`p-1.5 text-gray-700 hover:text-red-600 hover:bg-gray-200 rounded-r-md transition-colors ${isDeleting === banner._id ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                      {isDeleting === banner._id ? (
                        <div className="h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}
