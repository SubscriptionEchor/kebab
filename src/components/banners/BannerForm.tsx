import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import ColorPicker from './ColorPicker';
import BannerPreview from './BannerPreview';
import ImageUpload from './ImageUpload';
import { useQuery } from '@apollo/client';
import { GET_BANNER_TEMPLATES } from '../../lib/graphql/queries/banners';
import { BannerTemplate, BannerElement, FormErrors, RequiredTypes, BannerTemplateElement, BannerFormData } from '../../types/banners';
import { useTranslation } from 'react-i18next';
interface BannerFormInput {
  templateId: string;
  elements: BannerElement[];
}
interface BannerFormProps {
  isSubmitting: boolean;
  isEditing: boolean;
  onSubmit: (input: BannerFormInput) => void;
  initialData?: BannerFormData;
}
export default function BannerForm({
  isSubmitting,
  isEditing,
  onSubmit,
  initialData,
}: BannerFormProps) {
  const { data: templatesData, loading: templatesLoading } = useQuery(GET_BANNER_TEMPLATES);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    initialData?.selectedTemplateId || ''
  );
  const { t } = useTranslation();
  const [title, setTitle] = useState(initialData?.title || '');
  const [titleColor, setTitleColor] = useState(initialData?.titleColor || '#000000');
  const [highlight, setHighlight] = useState(initialData?.highlight || '');
  const [highlightColor, setHighlightColor] = useState(initialData?.highlightColor || '#000000');
  const [content, setContent] = useState(initialData?.content || '');
  const [contentColor, setContentColor] = useState(initialData?.contentColor || '#000000');
  const [image, setImage] = useState<string | null>(initialData?.image || null);
  const [gradientStartColor, setGradientStartColor] = useState(
    initialData?.gradientStartColor || '#FFFFFF'
  );
  const [gradientEndColor, setGradientEndColor] = useState(initialData?.gradientEndColor || '#000000');
  const [gradientDirection, setGradientDirection] = useState(initialData?.gradientDirection || 'to right');
  const [errors, setErrors] = useState<FormErrors>({});
  // Set the first template as default when templates are loaded
  useEffect(() => {
    if (templatesData?.bannerTemplates?.length > 0 && !selectedTemplateId) {
      setSelectedTemplateId(templatesData.bannerTemplates[0]._id);
    }
  }, [templatesData, selectedTemplateId]);
  // Update selectedTemplateId when initialData changes
  useEffect(() => {
    if (initialData?.selectedTemplateId) {
      setSelectedTemplateId(initialData.selectedTemplateId);
    }
  }, [initialData]);
  const validateForm = () => {
    const newErrors: FormErrors = {};
    // Template validation
    if (!selectedTemplateId) {
      newErrors.template = 'banners.templaterequired';
    }

    // Title validations
    if (title.length > 10) {
      newErrors.title = 'banners.titlelimit';
    } else if (title.trim().length === 0) {
      newErrors.titleRequired ='banners.titlerequired';
    }

    // Highlight validations
    if (highlight.length > 16) {
      newErrors.highlight1 = 'banners.highlightlimit';
    } else if (highlight.trim().length === 0) {
      newErrors.highlight1 = 'banners.highlightrequired';
    }

    // Content validations
    if (content.length > 44) {
      newErrors.content1 = 'banners.contentlimit';
    } else if (content.trim().length === 0) {
      newErrors.content1 = 'banners.contentrequired';
    }
    const selectedTemplate = templatesData?.bannerTemplates?.find(
      (t: BannerTemplate) => t._id === selectedTemplateId
    );
    if (!selectedTemplate) return false;
    selectedTemplate.elements.forEach((element: BannerTemplateElement) => {
      const { key, requiredTypes } = element;
      if (requiredTypes.text) {
        const text =
          key === 'title'
            ? title
            : key === 'highlight'
              ? highlight
              : key === 'content'
                ? content
                : '';
        if (!text.trim()) {
          newErrors[key] = t('banners.fieldrequired', { field: t(`banners.${key}`) });
        }
      }
      if (requiredTypes.image && key === 'image' && !image) {
        newErrors.image = 'banners.imagerequired';
      }
      if (requiredTypes.gradient && key === 'background') {
        if (!gradientStartColor || !gradientEndColor) {
          newErrors.background = 'banners.gradientrequired';
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = () => {
    if (!validateForm()) {
      const errorMessages = Object.values(errors);
      if (errorMessages.length > 0) {
        toast.error(t(errorMessages[0]));
      } else {
        toast.error(t('banners.fillrequired'));
      }
      return;
    }
    const selectedTemplate = templatesData?.bannerTemplates?.find(
      (t: BannerTemplate) => t._id === selectedTemplateId
    );
    if (!selectedTemplate) {
      toast.error(t('banners.invalidtemplate'));
      return;
    }
    // Prepare background element based on type
    const backgroundElement: BannerElement = {
      key: 'background',
      gradient: `linear-gradient(${gradientDirection}, ${gradientStartColor}, ${gradientEndColor})`
    };
    const input: BannerFormInput = {
      templateId: selectedTemplate.templateId,
      elements: [
        {
          key: 'title',
          text: title,
          color: titleColor,
        },
        {
          key: 'highlight',
          text: highlight,
          color: highlightColor,
        },
        {
          key: 'content',
          text: content,
          color: contentColor,
        },
        {
          key: 'image',
          image: image || '',
        },
        backgroundElement
      ].filter((el): el is BannerElement =>
        Boolean(el.text || el.color || el.image || el.gradient)
      )
    };
    onSubmit(input);
  };
  const selectedTemplate = templatesData?.bannerTemplates?.find(
    (t: BannerTemplate) => t._id === selectedTemplateId
  );
  const getRequiredTypes = (key: string): RequiredTypes | undefined => {
    return selectedTemplate?.elements.find((el: BannerTemplateElement) => el.key === key)?.requiredTypes;
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        {/* Template Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {t('banners.bannertemplate')}
          </label>
          <select
            value={selectedTemplateId}
            onChange={(e) => setSelectedTemplateId(e.target.value)}
            className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary transition-shadow bg-white ${templatesLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            disabled={templatesLoading}
          >
            {templatesData?.bannerTemplates?.map((template: BannerTemplate) => (
              <option key={template._id} value={template._id}>
                {template.name}
              </option>
            ))}
          </select>
          {errors.template && <p className="mt-1 text-sm text-red-600">{t(errors.template)}</p>}
        </div>
        {selectedTemplate && (
          <>
            {/* Title Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('banners.titlelabel')}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 10) {
                    setTitle(value);
                  }
                }}
                className="form-input mb-3"
                placeholder={t('banners.entertitleplaceholder')}
                maxLength={10}
              />
              <div className="flex justify-between text-xs">
                <span className="text-red-600">{t(errors.titleRequired)}</span>
                <span className="text-gray-500">{title.length}/10</span>
              </div>
              <ColorPicker color={titleColor} onChange={setTitleColor} label={t('banners.titlecolor')} />
            </div>
            {/* Highlight Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('banners.highlight')}
              </label>
              <input
                type="text"
                value={highlight}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 16) {
                    setHighlight(value);
                  }
                }}
                className="form-input mb-3"
                placeholder={t('banners.enterhighlightplaceholder')}
                maxLength={16}
              />
              <div className="flex justify-between text-xs">
                <span className="text-red-600">{t(errors.highlight1)}</span>
                <span className="text-gray-500">{highlight.length}/16</span>
              </div>
              <ColorPicker color={highlightColor} onChange={setHighlightColor} label={t('banners.highlightcolor')} />
            </div>
            {/* Content Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('banners.content')}
              </label>
              <textarea
                value={content}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 44) {
                    setContent(value);
                  }
                }}
                rows={4}
                className="form-input mb-3 resize-none"
                placeholder={t('banners.entercontentplaceholder')}
                maxLength={44}
              />
              <div className="flex justify-between text-xs">
                <span className="text-red-600">{t(errors.content1)}</span>
                <span className="text-gray-500">{content.length}/44</span>
              </div>
              <ColorPicker color={contentColor} onChange={setContentColor} label={t('banners.contentcolor')} />
            </div>
            {/* Image Section */}
            <ImageUpload image={image} onImageChange={setImage} error={t(errors.image)} />
            {/* Background Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('banners.backgroundstyle')}
              </label>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    {t('banners.gradientdirectionlabel')}
                  </label>
                  <select
                    value={gradientDirection}
                    onChange={(e) => setGradientDirection(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary transition-shadow bg-white"
                  >
                    <option value="45deg">45 {t('banners.degrees')}</option>
                    <option value="90deg">90 {t('banners.degrees')}</option>
                    <option value="135deg">135 {t('banners.degrees')}</option>
                    <option value="180deg">180 {t('banners.degrees')}</option>
                    <option value="225deg">225 {t('banners.degrees')}</option>
                    <option value="270deg">270 {t('banners.degrees')}</option>
                    <option value="315deg">315 {t('banners.degrees')}</option>
                    <option value="360deg">360 {t('banners.degrees')}</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <ColorPicker
                    color={gradientStartColor}
                    onChange={setGradientStartColor}
                    label={t('banners.gradientstartcolor')}
                  />
                  <ColorPicker
                    color={gradientEndColor}
                    onChange={setGradientEndColor}
                    label={t('banners.gradientendcolor')}
                  />
                </div>
              </div>
            </div>
          </>
        )}
        <div className="mt-6">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-black bg-brand-primary rounded-lg hover:bg-brand-primary/90 transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="h-5 w-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Plus className="h-5 w-5 mr-2" />
            )}
            {isEditing ? t('banners.updatebanner') : t('banners.createbanner')}
          </button>
        </div>
      </div>
      <BannerPreview
        title={title}
        titleColor={titleColor}
        highlight={highlight}
        highlightColor={highlightColor}
        content={content}
        contentColor={contentColor}
        image={image}
        gradientStartColor={gradientStartColor}
        gradientEndColor={gradientEndColor}
        gradientDirection={gradientDirection}
      />
    </div>
  );
}
