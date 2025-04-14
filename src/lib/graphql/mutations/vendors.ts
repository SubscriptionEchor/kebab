import { gql } from '@apollo/client';

export const TOGGLE_VENDOR_STATUS = gql`
  mutation ToggleVendorStatus($id: String!) {
    toggleVendorStatus(id: $id) {
      _id
      isActive
    }
  }
`;