import { X } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface FeeUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (fees: { serviceFeePercentage: number }) => void;
  isSubmitting: boolean;
  initialServiceFee?: number;
}

export default function FeeUpdateModal({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting
}: FeeUpdateModalProps) {
  const { t } = useTranslation();
  const [serviceFeePercentage, setServiceFeePercentage] = useState<string>('35');

  useEffect(() => {
    if (isOpen) {
      setServiceFeePercentage('35');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    const feeValue = parseFloat(serviceFeePercentage);

    if (!serviceFeePercentage.trim()) {
      toast.error(t('feeupdatemodel.validation.feeRequired'));
      return;
    }

    if (isNaN(feeValue) || feeValue < 0 || feeValue > 100) {
      toast.error(
        t('feeupdatemodel.validation.invalidFee'),
        { description: t('feeupdatemodel.validation.feeRange') }
      );
      return;
    }

    onConfirm({ serviceFeePercentage: feeValue });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {t('feeupdatemodel.servicefee')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
          <div className="space-y-4">
            <label
              htmlFor="serviceFee"
              className="block text-sm font-medium text-gray-700"
            >
              {t('feeupdatemodel.servicefeepercentage')}
            </label>
            <div className="relative">
              <input
                id="serviceFee"
                type="number"
                min="0"
                max="100"
                value={serviceFeePercentage}
                onChange={(e) => setServiceFeePercentage(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary transition-shadow pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                %
              </span>
            </div>
            <p className="text-sm text-gray-500">
              {t('feeupdatemodel.serviceinfo')}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            {t('feeupdatemodel.cancel')}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-brand-primary rounded-md hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                {t('feeupdatemodel.updating')}
              </>
            ) : (
              t('feeupdatemodel.update')
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
