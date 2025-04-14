import { gql } from '@apollo/client';

export const LOGIN_MUTATION = gql`
  mutation ownerLogin($email: String!, $password: String!) {
    ownerLogin(email: $email, password: $password) {
      userId
      token
      email
      userType
      restaurants {
        _id
        orderId
        name
        image
        address
        __typename
      }
      __typename
    }
  }
`;

export const VENDOR_RESET_PASSWORD = gql`
  mutation VendorResetPassword($oldPassword: String!, $newPassword: String!) {
    vendorResetPassword(oldPassword: $oldPassword, newPassword: $newPassword)
  }
`;