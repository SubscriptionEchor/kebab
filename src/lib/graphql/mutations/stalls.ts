import { gql } from '@apollo/client';

export const CREATE_STALL = gql`
  mutation CreateStall($restaurant: RestaurantInput!, $eventId: String!) {
    createStall(restaurant: $restaurant, eventId: $eventId) {
      _id
      orderId
      orderPrefix
      name
      image
      logo
      address
      username
      password
      deliveryTime
      minimumOrder
      sections
      rating
      isActive
      isAvailable
      slug
      stripeDetailsSubmitted
      commissionRate
      tax
      notificationToken
      enableNotification
      shopType
      cuisines
      keywords
      tags
      reviewCount
      reviewAverage
      restaurantUrl
      phone
      quickSearchKeywords
      favoriteCount
      distanceInMeters
      onboardingApplicationId
      restaurantDisplayNumber
      openingTimes {
        day
        times {
          startTime
          endTime
        }
        isOpen
      }
    }
  }
`;

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

export const LINK_STALL_TO_EVENT = gql`
  mutation LinkStallToEvent($eventId: String!, $restaurantId: String!) {
    linkStallToEvent(eventId: $eventId, restaurantId: $restaurantId) {
      _id
      name
      image
      logo
      address
      rating
      isActive
      isAvailable
      slug
      shopType
      cuisines
      restaurantUrl
      phone
      quickSearchKeywords
      favoriteCount
      restaurantDisplayNumber
      openingTimes {
        day
        times {
          startTime
          endTime
        }
        isOpen
      }
    }
  }
`;