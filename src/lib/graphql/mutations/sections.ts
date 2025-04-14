import { gql } from '@apollo/client';

export const CREATE_SECTION = gql`
  mutation CreateSection($section: SectionInput!) {
    createSection(section: $section) {
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

export const DELETE_SECTION = gql`
  mutation DeleteSection($id: String!) {
    deleteSection(id: $id)
  }
`;

export const EDIT_SECTION = gql`
  mutation editSection($section: SectionInput!) {
    editSection(section: $section) {
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