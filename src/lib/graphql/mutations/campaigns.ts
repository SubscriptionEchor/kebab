import { gql } from '@apollo/client';

export const CREATE_CAMPAIGN = gql`
  mutation CreateCampaign($campaign: CampaignInput!) {
    createCampaign(campaign: $campaign) {
      _id
      name
      couponCode
      campaignType
      percentageDiscount
      flatDiscount
      maxDiscount
      minimumOrderValue
      startDate
      endDate
      startTime
      endTime
      isActive
      createdBy
      modifiedBy
      createdAt
      __typename
    }
  }
`;