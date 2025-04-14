import { gql } from '@apollo/client';

export const GET_RESTAURANT_CAMPAIGNS = gql`
  query RestaurantCampaignsForVendorDashboard($restaurantId: ID!) {
    restaurantCampaignsForVendorDashboard(restaurantId: $restaurantId) {
      _id
      name
      description
      couponCode
      campaignType
      minimumOrderValue
      percentageDiscount
      maxDiscount
      flatDiscount
      startDate
      endDate
      startTime
      endTime
      isActive
      createdBy
      modifiedBy
      createdAt
      updatedAt
      promotion
      restaurant
      __typename
    }
  }
`;

export const TOGGLE_CAMPAIGN_STATUS = gql`
  mutation toggleCampaignActiveStatus($id: ID!, $restaurantId: ID!) {
    toggleCampaignActiveStatus(id: $id, restaurantId: $restaurantId) {
      _id
      isActive
      deleted
      __typename
    }
  }
`;