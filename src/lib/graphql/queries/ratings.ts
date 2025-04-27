import { gql } from '@apollo/client';

export const GET_STALL_RATINGS = gql`
  query GetStallRatings($stallId: ID!) {
    stallRatings(stallId: $stallId) {
      _id
      rating
      comment
      createdAt
      user {
        name
      }
      order {
        orderNumber
      }
    }
  }
`; 