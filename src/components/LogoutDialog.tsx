// src/components/SignOutDialog.tsx
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface SignOutDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SignOutDialog({ isOpen, onClose }: SignOutDialogProps) {
  const { t } = useTranslation();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    // Show logout notification
    toast.success(t('common.signedOutSuccessfully'), {
      duration: 3000,
      closeButton: false
    });

    // Sign out and clear localStorage
    signOut();

    // Close dialog and navigate to login
    navigate('/login');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {t('common.confirmSignOut')}
        </h2>
        <p className="text-gray-600 mb-6">
          {t('common.signOutMessage')}
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 text-sm font-medium text-white bg-brand-primary hover:bg-brand-primary/90 rounded-lg transition-colors"
          >
            {t('common.signOut')}
          </button>
        </div>
      </div>
    </div>
  );
}
