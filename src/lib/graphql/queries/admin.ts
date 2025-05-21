import { gql } from '@apollo/client';

export const ADMIN_DASHBOARD_BOOTSTRAP = gql`
  query AdminDashboardBootstrap {
  adminDashboardBootstrap {
     allergens {
      description
      displayName
      enumVal
    }
    foodTags {
      displayName
      enumVal
      isActive
      restaurantDetailHandlingType
    }
    dietaryOptions {
      displayName
      enumVal
      isActive
    }
    currencyConfig {
      currency
      currencySymbol
      __typename
    }
    zonesDetails
    operationalZones
    __typename
  }
}
`;