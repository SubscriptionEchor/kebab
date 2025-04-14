import { gql } from '@apollo/client';

export const GET_SECTIONS = gql`
  query Sections {
    sections {
      _id
      name
      enabled
      restaurants {
        _id
        name
        __typename
      }
      __typename
    }
  }
`;