import { gql } from '@apollo/client';

export const CREATE_RESTAURANT = gql`mutation CreateRestaurant($restaurant: RestaurantInput!) {
  createRestaurant(restaurant: $restaurant) {
    _id
    name
    image
    address
    isActive
  }
}`

export const GET_RESTAURANT = gql`
  query Restaurant($id: String) {
    restaurant(id: $id) {
      _id
      name
      image
      phone
      logo
      address
      reviewCount
      reviewAverage
      shopType
      cuisines
      googleMapLink
      __typename
      onboardingApplicationId
      owner {
        email
        _id
      }
      __typename
    }
  }
`;

export const GET_RESTAURANT_LOCATION = gql`
query Restaurant($id: String) {
    restaurant(id: $id) {
      location {
      coordinates 
      }
    }
  }
`;


export const GET_RESTAURANT_TIMINGS = gql`
  query Restaurant($id: String) {
    restaurant(id: $id) {
        openingTimes {
      day
      times {
        startTime
        endTime
        __typename
      }
      isOpen
      __typename
    }
    }
  }
`;


export const GET_RESTAURANTS = gql`
  query RestaurantList {
    restaurantList {
      _id
      name
      image
      orderPrefix
      address
      deliveryTime
      minimumOrder
      isActive
      commissionRate
      tax
      shopType
      __typename
    }
  }
`;

export const GET_RESTAURANTS_V2 = gql`query RestaurantListV2($input: RestaurantListInput) {
  restaurantListV2(input: $input) {
    restaurantList {
      _id
      name
      image
      isActive
      address
    }
    pagination
  }
}`