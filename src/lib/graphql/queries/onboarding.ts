import { gql } from '@apollo/client';

export const GET_RESTAURANT_ONBOARDING_APPLICATION = gql`
  query GetRestaurantOnboardingApplicationById($applicationId: String!) {
  getRestaurantOnboardingApplicationById(applicationId: $applicationId) {
    _id
    potentialVendor
    restaurantId
    beneficialOwners {
      name
      passportId
      email
      phone
      isPrimary
      emailVerified
      idCardDocuments
      __typename
    }
    companyName
    restaurantName
    restaurantContactInfo {
      email
      phone
      emailVerified
      __typename
    }
    location {
      address
      coordinates {
        coordinates
        __typename
      }
      __typename
    }
    restaurantImages
    menuImages
    profileImage
    cuisines
    openingTimes {
      day
      isOpen
      times {
        endTime
        startTime
        __typename
      }
      __typename
    }
    businessDocuments {
      hospitalityLicense
      registrationCertificate
      bankDetails {
        accountNumber
        bankName
        branchName
        bankIdentifierCode
        accountHolderName
        documentUrl
        __typename
      }
      taxId {
        documentNumber
        documentUrl
        __typename
      }
      __typename
    }
    resubmissionCount
    applicationStatus
    isActive
    resubmissionDetails {
      originalSubmission {
        submittedAt
        rejectedAt
        rejectionReason
        rejectedBy {
          userId
          userType
          __typename
        }
        __typename
      }
      resubmission {
        submittedAt
        changes {
          field
          oldValue
          newValue
          timestamp
          __typename
        }
        __typename
      }
      __typename
    }
    statusHistory {
      status
      changedBy {
        userId
        userType
        __typename
      }
      reason
      timestamp
      __typename
    }
    deleted
    createdAt
    updatedAt
    createdBy
    modifiedBy
    serviceFeePercentage
    merchantCancellationFeePercentage
    __typename
  }
}

`;
export const GET_RESTAURANT_APPLICATIONS = gql`
  query AdminViewApplications {
    getAllRestaurantOnboardingApplication {
      beneficialOwners {
        name
        passportId
        email
        phone
        isPrimary
        emailVerified
        idCardDocuments
        __typename
      }
         companyName
      restaurantName
      restaurantContactInfo {
        email
        phone
        __typename
      }
      restaurantImages
      menuImages
      profileImage
      cuisines
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
      businessDocuments {
        hospitalityLicense
        registrationCertificate
        bankDetails {
          accountNumber
          bankName
          branchName
          bankIdentifierCode
          accountHolderName
          documentUrl
          __typename
        }
        taxId {
          documentNumber
          documentUrl
          __typename
        }
        __typename
      }
      _id
      applicationStatus
      createdAt
      updatedAt
      resubmissionCount
      potentialVendor
      statusHistory {
        status
        reason
        changedBy {
          userId
          userType
          __typename
        }
        timestamp
        __typename
      }
      location {
      address
      coordinates {
        coordinates
        __typename
      }
      __typename
    }
      __typename
    }
  }
`;