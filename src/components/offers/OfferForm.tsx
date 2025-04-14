import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Gift, Tag, Target } from 'lucide-react';
import { Step } from './Step';
import { OptionCard } from './OptionCard';
import { getCurrencySymbol } from '../../utils/currency';
import type { FormData, FormErrors } from '../../types/offers';

interface OfferFormProps {
  currentStep: number;
  selectedType: 'CAMPAIGN' | 'PROMOTION' | null;
  selectedPromotionType: string | null;
  selectedCampaignType: 'PERCENTAGE' | 'FLAT' | null;
  formData: FormData;
  errors: FormErrors;
  setFormData: (data: FormData) => void;
  setSelectedType: (type: 'CAMPAIGN' | 'PROMOTION') => void;
  setSelectedPromotionType: (type: string) => void;
  setSelectedCampaignType: (type: 'PERCENTAGE' | 'FLAT') => void;
  handleNext: () => void;
  handlePrevious: () => void;
  handleSubmit: () => void;
  isSubmitting: boolean;
}

const OFFERS_TYPE = {
  FLAT: "FLAT",
  PERCENTAGE: "PERCENTAGE",
};

const PROMOTIONS_TYPE = {
  HAPPYHOURS: "HAPPYHOUR",
  SPECIALDAY: "TODAY",
  CHEFSPECIAL: "CHEF",
};

export default function OfferForm({
  currentStep,
  selectedType,
  selectedPromotionType,
  selectedCampaignType,
  formData,
  errors,
  setFormData,
  setSelectedType,
  setSelectedPromotionType,
  setSelectedCampaignType,
  handleNext,
  handlePrevious,
  handleSubmit,
  isSubmitting
}: OfferFormProps) {
  const currencySymbol = getCurrencySymbol();

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step title="Select Type">
            <div className="grid grid-cols-2 gap-6">
              <OptionCard
                title="Campaign"
                description="Create a standard discount campaign"
                icon={<Target className="w-8 h-8 text-[#F04438]" />}
                isSelected={selectedType === 'CAMPAIGN'}
                onClick={() => setSelectedType('CAMPAIGN')}
              />
              <OptionCard
                title="Promotion"
                description="Create a special promotional offer"
                icon={<Gift className="w-8 h-8 text-[#F04438]" />}
                isSelected={selectedType === 'PROMOTION'}
                onClick={() => setSelectedType('PROMOTION')}
              />
            </div>
          </Step>
        );

      case 2:
        return selectedType === 'CAMPAIGN' ? (
          <Step title="Select Campaign Type">
            <div className="grid grid-cols-2 gap-6">
              <OptionCard
                title="% Off"
                description="Percentage based discount"
                icon={<Target className="w-8 h-8 text-[#F04438]" />}
                isSelected={selectedCampaignType === 'PERCENTAGE'}
                onClick={() => setSelectedCampaignType('PERCENTAGE')}
              />
              <OptionCard
                title="Flat Off"
                description="Fixed amount discount"
                icon={<Target className="w-8 h-8 text-[#F04438]" />}
                isSelected={selectedCampaignType === 'FLAT'}
                onClick={() => setSelectedCampaignType('FLAT')}
              />
            </div>
          </Step>
        ) : (
          <Step title="Select Promotion Type">
            <div className="grid grid-cols-3 gap-6">
              <OptionCard
                title="Happy Hour"
                description="Time-based discounts"
                icon={<Clock className="w-8 h-8 text-[#F04438]" />}
                isSelected={selectedPromotionType === 'HAPPY_HOUR'}
                onClick={() => setSelectedPromotionType('HAPPY_HOUR')}
              />
              <OptionCard
                title="Chef Special"
                description="Special menu items"
                icon={<Gift className="w-8 h-8 text-[#F04438]" />}
                isSelected={selectedPromotionType === 'CHEF_SPECIAL'}
                onClick={() => setSelectedPromotionType('CHEF_SPECIAL')}
              />
              <OptionCard
                title="Special Day"
                description="Event-based offers"
                icon={<Tag className="w-8 h-8 text-[#F04438]" />}
                isSelected={selectedPromotionType === 'SPECIAL_DAY'}
                onClick={() => setSelectedPromotionType('SPECIAL_DAY')}
              />
            </div>
          </Step>
        );

      case 3:
        return (
          <Step title="Enter Offer Details">
            <div className="space-y-6">
              {selectedType === 'CAMPAIGN' && (
                <div>
                  <input
                    type="text"
                    placeholder="Base Code"
                    value={formData.couponCode}
                    onChange={(e) => setFormData({ ...formData, couponCode: e.target.value.toUpperCase() })}
                    maxLength={6}
                    className="w-full p-4 text-[#1D1E20] border border-[#FFD541] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD541]"
                  />
                  {errors.couponCode && (
                    <p className="mt-1 text-sm text-red-600">{errors.couponCode}</p>
                  )}
                </div>
              )}

              <div>
                <input
                  type="number"
                  placeholder="Minimum Order Value"
                  value={formData.minimumOrderValue}
                  onChange={(e) => setFormData({ ...formData, minimumOrderValue: parseInt(e.target.value) })}
                  min={15}
                  className="w-full p-4 text-[#1D1E20] border border-[#FFD541] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD541]"
                />
                <p className="mt-1 text-sm text-[#667085]">Minimum order value should be above 15 {currencySymbol}</p>
                {errors.minimumOrderValue && (
                  <p className="mt-1 text-sm text-red-600">{errors.minimumOrderValue}</p>
                )}
              </div>

              {(selectedCampaignType === 'PERCENTAGE' || selectedPromotionType === 'HAPPY_HOUR') && (
                <div>
                  <input
                    type="number"
                    placeholder="Percentage Value"
                    value={formData.percentageDiscount || ''}
                    onChange={(e) => setFormData({ ...formData, percentageDiscount: parseInt(e.target.value) })}
                    min={30}
                    max={100}
                    className="w-full p-4 text-[#1D1E20] border border-[#FFD541] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD541]"
                  />
                  <p className="mt-1 text-sm text-[#667085]">(Min percentage discount is 30 %) & (Max percentage discount is 100 %)</p>
                  {errors.percentageDiscount && (
                    <p className="mt-1 text-sm text-red-600">{errors.percentageDiscount}</p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <input
                    type="date"
                    placeholder="Start Date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full p-4 text-[#1D1E20] border border-[#FFD541] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD541]"
                  />
                  {errors.startDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
                  )}
                </div>

                <div>
                  <input
                    type="time"
                    placeholder="Start Time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full p-4 text-[#1D1E20] border border-[#FFD541] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD541]"
                  />
                  {errors.startTime && (
                    <p className="mt-1 text-sm text-red-600">{errors.startTime}</p>
                  )}
                </div>

                <div>
                  <input
                    type="date"
                    placeholder="End Date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full p-4 text-[#1D1E20] border border-[#FFD541] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD541]"
                  />
                  {errors.endDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
                  )}
                </div>

                <div>
                  <input
                    type="time"
                    placeholder="End Time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full p-4 text-[#1D1E20] border border-[#FFD541] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD541]"
                  />
                  {errors.endTime && (
                    <p className="mt-1 text-sm text-red-600">{errors.endTime}</p>
                  )}
                </div>
              </div>
            </div>
          </Step>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      {renderStep()}
      
      <div className="mt-6 flex justify-end space-x-4">
        {currentStep > 1 && (
          <button
            onClick={handlePrevious}
            className="px-6 py-3 text-[#F04438] font-semibold hover:bg-gray-50 rounded-lg transition-colors"
          >
            PREVIOUS
          </button>
        )}
        
        {currentStep < 3 ? (
          <button
            onClick={handleNext}
            className="px-6 py-3 bg-[#FFD541] text-[#1D1E20] font-semibold rounded-lg hover:bg-[#FFE171] transition-colors"
          >
            NEXT
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-3 bg-[#FFD541] text-[#1D1E20] font-semibold rounded-lg hover:bg-[#FFE171] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isSubmitting ? 'CREATING...' : 'CREATE OFFER'}
          </button>
        )}
      </div>
    </div>
  );
}