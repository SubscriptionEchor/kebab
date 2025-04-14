import { gql } from '@apollo/client';

export const EDIT_RESTAURANT = gql`
  mutation EditRestaurant($restaurantInput: RestaurantProfileInput!) {
    editRestaurant(restaurant: $restaurantInput) {
      _id
      orderId
      orderId
      orderPrefix
      slug
      name
      image
      logo
      logo
      slug
      address
      isAvailable
      shopType
      username
      password
      phone
      location {
        coordinates
      }
      isAvailable
      minimumOrder
      tax
      openingTimes {
        day
        times {
          startTime
          endTime
        }
        __typename
      }
      shopType
    }
  }
`;
export const DELETE_RESTAURANT = gql`
  mutation DeltetRestaurant($id: String!) {
    deleteRestaurant(id: $id) {
      _id
      isActive
      __typename
    }
  }
`;

export const UPDATE_RESTAURANT_LOCATION = gql`
  mutation UPDATE_DELIVERY_BOUNDS_AND_LOCATION($id: ID!, $bounds: [[[Float!]]], $location: CoordinatesInput!) {
  result: updateDeliveryBoundsAndLocation(
    id: $id
    location: $location
    bounds: $bounds
  ) {
    success
    message
    data {
      _id
      deliveryBounds {
        coordinates
        __typename
      }
      location {
        coordinates
        __typename
      }
      __typename
    }
    __typename
  }
}
`;