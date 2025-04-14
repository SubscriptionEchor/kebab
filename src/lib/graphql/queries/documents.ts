import { gql } from '@apollo/client';

export const GET_DOCUMENT_URLS = gql`
  query GetDocumentUrlsForRestaurantOnboardingApplication($applicationId: ID!) {
    getDocumentUrlsForRestaurantOnboardingApplication(applicationId: $applicationId)
  }
`;