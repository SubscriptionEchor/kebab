import { gql } from '@apollo/client';

export const GET_RESTAURANT_BY_OWNER = gql`
  query RestaurantByOwner($id: String) {
    restaurantByOwner(id: $id) {
      _id
      email
      userType
      restaurants {
        _id
        orderId
        orderPrefix
        name
        slug
        image
        logo
        address
        isActive
        onboardingApplicationId
        username
        password
        location {
          coordinates
          __typename
        }
        reviewCount
    reviewAverage
        shopType
        __typename
      }
      __typename
    }
  }
`;

export const GET_VENDORS = gql`
query Vendors($input: VendorsInput) {
  vendors(input: $input) {
    vendorList {
      _id
      email
      userType
      restaurants {
        name
      }
      zoneIdentifierList
    }
    pagination
  }
}`;