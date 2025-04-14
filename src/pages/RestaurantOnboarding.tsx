import { Link, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
export default function RestaurantOnboarding()
 {
  const location = useLocation();
  const { t } = useTranslation();
  const tabs = [
  
    { label: t('restaurantonboarding.active'), path: '/dashboard/onboarding/active' },
    { label: t('restaurantonboarding.approved'), path: '/dashboard/onboarding/approved' },
    { label: t('restaurantonboarding.rejected'), path: '/dashboard/onboarding/rejected' }
  ];
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path;
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className={`
                  whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors
                  ${
                    isActive
                      ? 'border-brand-primary text-brand-primary'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }
                `}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <Outlet />
    </div>
  );
}