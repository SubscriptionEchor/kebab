import { X, Copy, Check, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

interface ViewOrganizerDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizer: {
    id: string;
    name: string;
    contactNumber: string;
    email: string;
    username: string;
    password: string;
    eventPortfolio: number;
  } | null;
}

export default function ViewOrganizerDetailsModal({ isOpen, onClose, organizer }: ViewOrganizerDetailsModalProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen || !organizer) return null;

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(organizer.password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Organizer Details</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">ID</label>
              <div className="text-sm text-gray-900">{organizer.id}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Name</label>
              <div className="text-sm text-gray-900">{organizer.name}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Contact Number</label>
              <div className="text-sm text-gray-900">{organizer.contactNumber}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
              <div className="text-sm text-gray-900">{organizer.email}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Username</label>
              <div className="text-sm text-gray-900">{organizer.username}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Event Portfolio</label>
              <div className="text-sm text-gray-900">{organizer.eventPortfolio} Events</div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Password</label>
            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-900 flex-1">
                {showPassword ? organizer.password : '••••••••'}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={togglePasswordVisibility}
                  className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={handleCopyPassword}
                  className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  title="Copy password"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 