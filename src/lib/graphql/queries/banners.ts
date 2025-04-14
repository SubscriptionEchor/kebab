import { gql } from '@apollo/client';

export const GET_BANNER_TEMPLATES = gql`
  query GetBannerTemplates {
    bannerTemplates {
      _id
      templateId
      name
      elements {
        key
        requiredTypes {
          text
          color
          image
          gradient
        }
      }
    }
  }
`;

export const GET_BANNERS = gql`
  query GetBanners {
    banners {
      _id
      templateId
      elements {
        key
        text
        color
        image
        gradient
      }
      isActive
      createdAt
      updatedAt
    }
  }
`;