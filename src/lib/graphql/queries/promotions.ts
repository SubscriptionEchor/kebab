import { gql } from '@apollo/client';

export const GET_PROMOTIONS = gql`
  query Promotions {
    adminDashboardBootstrap {
      promotions {
        _id
        baseCode
        displayName
        createdAt
        description
        isActive
        maxFlatDiscount
        maxPercentageDiscount
        minFlatDiscount
        minPercentageDiscount
        minimumOrderValue
        promotionType
        updatedAt
        minimumMaxDiscount
        __typename
      }
      __typename
    }
  }
`;