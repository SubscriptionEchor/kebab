import { gql } from '@apollo/client';

export const GET_STALL = gql`
  query GetStall($id: ID!) {
    stall(id: $id) {
      _id
      name
      phone
      address
      stallType
      image
      logo
      tax
      isAvailable
      orderPrefix
      orderId
      slug
      location {
        type
        coordinates
      }
      openingTimes {
        day
        open
        close
        isOpen
      }
      owner {
        _id
        email
      }
    }
  }
`;

export const GET_STALLS = gql`
  query GetStalls {
    stalls {
      _id
      name
      phone
      address
      stallType
      image
      logo
      isAvailable
      slug
    }
  }
`; 