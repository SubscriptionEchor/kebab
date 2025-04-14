import { gql } from '@apollo/client';

export const PLATFORM_STATISTICS = gql`
  query PlatformStatistics {
    platformStatistics {
      activeUsersCount
      activeRestaurantsCount
      activeVendorsCount
    }
  }
`;