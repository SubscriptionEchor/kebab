import { gql } from '@apollo/client';

export const ADMIN_DASHBOARD_BOOTSTRAP = gql`
  query AdminDashboardBootstrap {
  adminDashboardBootstrap {
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