import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
interface ImageGuidelinesProps {
  isOpen: boolean;
  onClose: () => void;
}
export function ImageGuidelines({ isOpen, onClose }: ImageGuidelinesProps) {
  if (!isOpen) return null;
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{t('banners.bannerimageguidelines')}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* File Requirements */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('banners.filerequirement')}</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-accent flex items-center justify-center text-xs font-medium mr-2">•</span>
                {t('banners.fileformat')}
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-accent flex items-center justify-center text-xs font-medium mr-2">•</span>
                {t('banners.maxfilesize')}
              </li>
            </ul>
          </div>
          {/* Image Specifications */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('banners.imagespecification')}</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-accent flex items-center justify-center text-xs font-medium mr-2">•</span>
                {t('banners.mindimensions')}
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-accent flex items-center justify-center text-xs font-medium mr-2">•</span>
                {t('banners.aspectratio')}
                <ul className="ml-7 mt-1 space-y-1">
                  <li>• 16:9 (Landscape)</li>
                  <li>• 4:3 (Standard)</li>
                  <li>• 3:4 (Portrait)</li>
                  <li>• 1:1 (Square)</li>
                </ul>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-accent flex items-center justify-center text-xs font-medium mr-2">•</span>
                {t('banners.aspectratioresolution')}
              </li>
            </ul>
          </div>
          {/* Best Practices */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('banners.bestpractices')}</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-accent flex items-center justify-center text-xs font-medium mr-2">•</span>
                {t('banners.bannerimagebestpractices')}
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-accent flex items-center justify-center text-xs font-medium mr-2">•</span>
                {t('banners.bannerimagebestpractices2')}
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-accent flex items-center justify-center text-xs font-medium mr-2">•</span>
                {t('banners.bannerimagebestpractices3')}
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-accent flex items-center justify-center text-xs font-medium mr-2">•</span>
                {t('banners.bannerimagebestpractices4')}
              </li>
            </ul>
          </div>
          {/* Content Guidelines */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('banners.bannercontentguidelines')}</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-accent flex items-center justify-center text-xs font-medium mr-2">•</span>
               {t('banners.bannercontentguidelines')}
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-accent flex items-center justify-center text-xs font-medium mr-2">•</span>
                {t('banners.bannercontentguidelines2')}
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-accent flex items-center justify-center text-xs font-medium mr-2">•</span>
                {t('banners.bannercontentguidelines3')}
              </li>
            </ul>
          </div>
        </div>
        <div className="flex justify-end p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-black bg-brand-primary rounded-md hover:bg-brand-primary/90 transition-colors"
          >
           {t('banners.gotit')}
          </button>
        </div>
      </div>
    </div>
  );
}