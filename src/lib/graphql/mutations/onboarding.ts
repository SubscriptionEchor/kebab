import { gql } from '@apollo/client';

export const UPDATE_RESTAURANT_APPLICATION_STATUS = gql`
  mutation UpdateRestaurantOnboardingApplicationStatus(
    $applicationId: ID!,
    $status: RestaurantOnboardingStatus!,
    $reason: String,
    $fees: RestaurantFeesInput
  ) {
    updateRestaurantOnboardingApplicationStatus(
      applicationId: $applicationId,
      status: $status,
      reason: $reason,
      fees: $fees
    ) {
      _id
      applicationStatus
      statusHistory {
        status
        reason
        changedBy {
          userId
          userType
        }
        timestamp
      }
    }
  }
`;

export const getOptimisticResponse = (
  applicationId: string,
  status: string,
  reason: string
) => ({
  __typename: 'Mutation',
  updateRestaurantOnboardingApplicationStatus: {
    __typename: 'RestaurantOnboardingApplication',
    _id: applicationId,
    applicationStatus: status,
    statusHistory: [
      {
        __typename: 'StatusHistory',
        status,
        reason,
        timestamp: new Date().getTime().toString(),
        changedBy: {
          __typename: 'User',
          userId: 'optimistic',
          userType: 'ADMIN'
        }
      }
    ]
  }
});

// Alias for approve action to maintain backward compatibility
export const APPROVE_RESTAURANT_APPLICATION = UPDATE_RESTAURANT_APPLICATION_STATUS;