interface BannerPreviewProps {
  title: string;
  titleColor: string;
  highlight: string;
  highlightColor: string;
  content: string;
  contentColor: string;
  image: string | null;
  gradientStartColor: string;
  gradientEndColor: string;
  gradientDirection: string;
  
}
import { useTranslation } from 'react-i18next';
export default function BannerPreview({ 
  
  title,
  titleColor,
  highlight,
  highlightColor,
  content,
  contentColor,
  image,
  gradientStartColor,
  gradientEndColor,
  gradientDirection,
}: BannerPreviewProps) {
  const { t } = useTranslation();
  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">{t('bannerpreview.bannerpreview')}</h3>
      <div
        className="w-full aspect-[16/9] rounded-lg overflow-hidden shadow-sm border border-gray-200"
        style={{
          background: `linear-gradient(${gradientDirection}, ${gradientStartColor}, ${gradientEndColor})`
        }}
      >
        <div className="h-full p-8 flex items-center justify-between relative">
          {/* Text Content - Left Side */}
          <div className="relative z-10 max-w-[50%] text-left space-y-4 overflow-hidden">
            {title && (
              <h3 
                className="text-4xl font-bold leading-tight" 
                style={{ color: titleColor }}
              >
                {title}
              </h3>
            )}
            {highlight && (
              <p 
                className="text-2xl font-semibold" 
                style={{ color: highlightColor }}
              >
                {highlight}
              </p>
            )}
            {content && (
              <p 
                className="text-lg whitespace-pre-wrap break-words" 
                style={{ color: contentColor }}
              >
                {content}
              </p>
            )}
          </div>

          {/* Image - Right Side */}
          {image && (
            <div className="relative z-10 w-[45%] h-full flex items-center justify-center">
              <img
                src={image}
                alt="Banner"
                className="max-w-full max-h-full object-contain"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}