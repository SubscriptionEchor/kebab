import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface MoveToVendorReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
}

export default function MoveToVendorReviewModal({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting
}: MoveToVendorReviewModalProps) {
  if (!isOpen) return null;

  const { t } = useTranslation();  // Initialize the translation hook

  const guidelines = [
    {
      title: t('modals.movetovendorreview.guidelinesection1.title'),
      items: [
        t('modals.movetovendorreview.guidelinesection1.items.0'),
        t('modals.movetovendorreview.guidelinesection1.items.1')
      ]
    },
    {
      title: t('modals.movetovendorreview.guidelinesection2.title'),
      items: [
        t('modals.movetovendorreview.guidelinesection2.items.0'),
        t('modals.movetovendorreview.guidelinesection2.items.1'),
        t('modals.movetovendorreview.guidelinesection2.items.2')
      ]
    },
    {
      title: t('modals.movetovendorreview.guidelinesection3.title'),
      items: [
        t('modals.movetovendorreview.guidelinesection3.items.0'),
        t('modals.movetovendorreview.guidelinesection3.items.1'),
        t('modals.movetovendorreview.guidelinesection3.items.2')
      ]
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{t('modals.movetovendorreview.title')}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <p className="text-gray-600 mb-6">
            {t('modals.movetovendorreview.instruction')}
          </p>

          <div className="space-y-6">
            {guidelines.map((section, index) => (
              <div key={section.title} className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-accent flex items-center justify-center text-black font-medium mr-2">
                    {index + 1}
                  </span>
                  {section.title}
                </h3>
                <ul className="space-y-2 ml-8">
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start text-sm text-gray-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 mr-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
            <p className="text-sm text-yellow-800">
              <strong>{t('modals.movetovendorreview.importantnote.title')}:</strong> {t('modals.movetovendorreview.importantnote.content')}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            {t('modals.movetovendorreview.cancelbutton')}
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-brand-primary rounded-md hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                {t('modals.movetovendorreview.confirmbutton.submitting')}
              </>
            ) : (
              t('modals.movetovendorreview.confirmbutton.default')
            )}
          </button>
        </div>
      </div>
    </div>
  );
}