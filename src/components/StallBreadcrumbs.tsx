import { ChevronRight, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function StallBreadcrumbs() {
  const { t } = useTranslation();
  const location = useLocation();
  const paths = location.pathname.split('/').filter(Boolean);
  
  // Get the stall name from the state if available
  const stallName = location.state?.stallName || t('breadcrumbs.stallDetails');

  const breadcrumbs = [
    { name: t('breadcrumbs.dashboard'), path: '/dashboard', icon: Home },
    { name: t('breadcrumbs.vendors'),   path: '/dashboard/vendors' },
    { name: t('breadcrumbs.stalls'),    path: `/dashboard/vendors/${paths[2]}/stalls` },
    { name: stallName,                  path: location.pathname },
  ];

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {breadcrumbs.map((breadcrumb, index) => (
          <li key={breadcrumb.path} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-gray-400 mx-2 flex-shrink-0" />
            )}
            <Link
              to={breadcrumb.path}
              className={`flex items-center text-sm ${
                index === breadcrumbs.length - 1
                  ? 'text-gray-700 font-medium'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {breadcrumb.icon && <breadcrumb.icon className="h-4 w-4 mr-1" />}
              {breadcrumb.name}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
} 