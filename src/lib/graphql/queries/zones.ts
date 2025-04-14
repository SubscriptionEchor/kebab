import { gql } from '@apollo/client';

export const CHECK_ZONE_RESTRICTIONS = gql`
  query CheckZoneRestrictions($inputValues: LocationPoint!) {
    checkZoneRestrictions(inputValues: $inputValues) {
      selectedZone
      fallbackZone
      __typename
    }
  }
`;