import { useTranslation } from 'react-i18next';
import { APPLICATION_STATUS } from '../types/onboarding';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const {t}=useTranslation()
  const getStatusColor = () => {
    switch (status) {
      case APPLICATION_STATUS.REQUESTED_ONBOARDING:
        return 'bg-brand-accent text-black ring-1 ring-brand-primary/10';
      case APPLICATION_STATUS.ACCEPTED:
        return 'bg-green-100 text-green-700 ring-1 ring-green-500/10';
      case APPLICATION_STATUS.OFFLINE_PROCESSING:
        return 'bg-blue-100 text-blue-700 ring-1 ring-blue-500/10';
      case APPLICATION_STATUS.ONBOARDED:
        return 'bg-purple-100 text-purple-700 ring-1 ring-purple-500/10';
      case APPLICATION_STATUS.PENDING_VENDOR_REVIEW:
        return 'bg-yellow-100 text-yellow-700 ring-1 ring-yellow-500/10';
      case APPLICATION_STATUS.LIVE:
        return 'bg-green-100 text-green-700 ring-1 ring-green-500/10';
      case APPLICATION_STATUS.REJECTED:
        return 'bg-red-100 text-red-700 ring-1 ring-red-500/10';
      case APPLICATION_STATUS.REQUESTED_CHANGES:
        return 'bg-orange-100 text-orange-700 ring-1 ring-orange-500/10';
      default:
        return 'bg-gray-100 text-gray-700 ring-1 ring-gray-500/10';
    }
  };

  const getDisplayStatus = () => {
    switch (status) {
      case APPLICATION_STATUS.REQUESTED_ONBOARDING:
        return t('applicationdetails.newapplication')
      case APPLICATION_STATUS.ACCEPTED:
        return t('applicationdetails.accepted')
      case APPLICATION_STATUS.OFFLINE_PROCESSING:
        return t('applicationdetails.processing');
      case APPLICATION_STATUS.ONBOARDED:
        return t('applicationdetails.onboarded');
      case APPLICATION_STATUS.PENDING_VENDOR_REVIEW:
        return t('applicationdetails.vendorreview');
      case APPLICATION_STATUS.LIVE:
        return t('applicationdetails.live');;
      case APPLICATION_STATUS.REJECTED:
        return t('applicationdetails.rejected');
      case APPLICATION_STATUS.REQUESTED_CHANGES:
        return t('applicationdetails.changesrequested');;
      default:
        return status;
    }
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shadow-sm ${getStatusColor()} ${className}`}
    >
      {getDisplayStatus()}
    </span>
  );
}