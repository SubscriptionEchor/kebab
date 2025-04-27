import { gql } from '@apollo/client';

export const EDIT_STALL = gql`
  mutation EditStall($stallInput: StallInput!) {
    editStall(stallInput: $stallInput) {
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
    }
  }
`;

export const DELETE_STALL = gql`
  mutation DeleteStall($id: ID!) {
    deleteStall(id: $id)
  }
`;

export const UPDATE_STALL_STATUS = gql`
  mutation UpdateStallStatus($id: ID!, $isAvailable: Boolean!) {
    updateStallStatus(id: $id, isAvailable: $isAvailable) {
      _id
      isAvailable
    }
  }
`;

export const UPDATE_STALL_LOCATION = gql`
  mutation UpdateStallLocation($stallId: ID!, $location: LocationInput!) {
    updateStallLocation(stallId: $stallId, location: $location) {
      _id
      location {
        type
        coordinates
      }
    }
  }
`;

export const UPDATE_STALL_TIMINGS = gql`
  mutation UpdateStallTimings($stallId: ID!, $openingTimes: [OpeningTimeInput!]!) {
    updateStallTimings(stallId: $stallId, openingTimes: $openingTimes) {
      _id
      openingTimes {
        day
        open
        close
        isOpen
      }
    }
  }
`; 