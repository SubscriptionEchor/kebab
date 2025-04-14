import { X } from 'lucide-react';

interface MoveToLiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
}

export default function MoveToLiveModal({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting
}: MoveToLiveModalProps) {
  if (!isOpen) return null;

  const guidelines = [
    {
      title: 'Vendor Details',
      items: [
        'Vendor profile is complete and verified',
        'Contact information is up to date',
        'Bank account details are verified'
      ]
    },
    {
      title: 'Restaurant Setup',
      items: [
        'Restaurant profile is complete with accurate information',
        'Menu items are properly configured with prices',
        'Operating hours are set correctly',
        'Delivery zones are properly defined'
      ]
    },
    {
      title: 'Content & Media',
      items: [
        'Restaurant images are high quality and appropriate',
        'Menu item images are uploaded and verified',
        'Restaurant description is complete and accurate',
        'Cuisine types are correctly assigned'
      ]
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Move Restaurant to Live</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <p className="text-gray-600 mb-6">
            Before making this restaurant live, please verify that all the following items are properly set up and configured:
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

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
            <p className="text-sm text-green-800">
              <strong>Final Step:</strong> Once you confirm, the restaurant will be live and visible to customers. Make sure everything is ready for orders!
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-brand-primary rounded-md hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Making Restaurant Live...
              </>
            ) : (
              'Confirm & Make Live'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}