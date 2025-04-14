import { useState } from 'react';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
interface StatusUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  title: string;
  status: 'reject' | 'resubmit';
  isSubmitting: boolean;
}

export default function StatusUpdateModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  status,
  isSubmitting
}: StatusUpdateModalProps) {
  const [reason, setReason] = useState('');
  const { t } = useTranslation();
  // Clear reason when modal closes
  const handleClose = () => {
    setReason('');
    onClose();
  };

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!reason.trim()) {
      toast.error(t('statusupdatemodal.info'));
      return;
    }
    onConfirm(reason);
    setReason(''); // Clear reason after successful submission
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-4">
          {/* Status Field */}
          <div className="mb-4">
            <label 
              htmlFor="status" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {t('statusupdatemodal.status')}
              
            </label>
            <input
              type="text"
              id="status"
              value={status === 'reject' ? t('statusupdatemodal.rejected') : t('statusupdatemodal.requestedchanges')}
              disabled
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
            />
          </div>

          {/* Reason Field */}
          <label 
            htmlFor="reason" 
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {status === 'reject' ? t('statusupdatemodal.rejectionreason') :t('statusupdatemodal.resubmissionreason') }
          </label>
          <textarea
            id="reason"
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary transition-shadow resize-none"
            placeholder={t(`statusupdatemodal.${status === 'reject' ? 'rejectionReason' : 'resubmissionReason'}`)}

          />
        </div>

        <div className="flex justify-end gap-3 p-4 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            {t('statusupdatemodal.cancel')}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center ${
              status === 'reject' 
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-yellow-600 hover:bg-yellow-700'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                {status === 'reject' ? 'Rejecting...' : 'Requesting...'}
              </>
            ) : (
              status === 'reject' ? t('statusupdatemodal.reject') : t('statusupdatemodal.requestedresubmission')
            )}
          </button>
        </div>
      </div>
    </div>
  );
}