import { gql } from '@apollo/client';

export const UPDATE_RATING_DATA = gql`
  mutation UpdateRatingDataAndGoogleLinkData($input: UpdateRatingDataAndGoogleLinkDataInput!) {
    updateRatingDataAndGoogleLinkData(input: $input) {
      _id
      reviewAverage
      reviewCount
      googleMapLink
    }
  }
`;