export interface FormData {
  type: 'CAMPAIGN' | 'PROMOTION';
  promotionType?: 'HAPPY_HOUR' | 'CHEF_SPECIAL' | 'SPECIAL_DAY';
  campaignType: 'PERCENTAGE' | 'FLAT' | undefined;
  couponCode: string;
  minimumOrderValue: number;
  percentageDiscount?: number;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  maxDiscount?: string;
}

export interface FormErrors {
  couponCode?: string;
  minimumOrderValue?: string;
  percentageDiscount?: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  maxDiscount?: string;
}

export interface Campaign {
  _id: string;
  name: string;
  description: string;
  couponCode: string;
  campaignType: string;
  minimumOrderValue: number;
  percentageDiscount: number;
  maxDiscount: number;
  flatDiscount: number;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  createdBy: string;
  modifiedBy: string;
  createdAt: string;
  updatedAt: string;
  promotion: boolean;
  restaurant: string;
}