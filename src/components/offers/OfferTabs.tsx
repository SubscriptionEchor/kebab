import { motion } from 'framer-motion';

interface OfferTabsProps {
  activeTab: 'list' | 'create';
  setActiveTab: (tab: 'list' | 'create') => void;
}

export default function OfferTabs({ activeTab, setActiveTab }: OfferTabsProps) {
  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8">
        <button
          onClick={() => setActiveTab('list')}
          className={`
            whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors
            ${activeTab === 'list'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }
          `}
        >
          Active Offers
        </button>
        <button
          onClick={() => setActiveTab('create')}
          className={`
            whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors
            ${activeTab === 'create'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }
          `}
        >
          Create New Offer
        </button>
      </nav>
    </div>
  );
}