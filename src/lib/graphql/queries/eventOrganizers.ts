import { gql } from '@apollo/client';

export const CREATE_EVENT = gql`
  mutation CreateEvent($eventInput: EventInput!) {
    createEvent(eventInput: $eventInput) {
      _id
      name
      address
      location {
        coordinates
      }
      isActive
      isAvailable
      startDate
      endDate
      startTime
      endTime
      createdAt
      updatedAt
    }
  }
`;

export const GET_EVENT_MANAGERS = gql`
  query GetEventManagers($input: EventOrganizerInput) {
    getEventManagers(input: $input) {
      pagination 
      eventManagerList {
        _id
        email
        userType
        events
        vendorDisplayNumber
        name
      }
    }
  }
`;

export const CREATE_EVENT_MANAGER = gql`
  mutation CreateEventManager($eventManagerInput: EventManagerInput) {
    createEventManager(eventManagerInput: $eventManagerInput) {
      _id
      email
      userType
      events
      vendorDisplayNumber
    }
  }
`;

export const UPDATE_EVENT_MANAGER = gql`
  mutation EditEventManager($eventManagerId: String!, $eventManagerInput: EventManagerUpdateInput!) {
    editEventManager(eventManagerId: $eventManagerId, eventManagerInput: $eventManagerInput) {
      _id
      email
      userType
      events
      vendorDisplayNumber
      name
    }
  }
`;

export const DELETE_EVENT_MANAGER = gql`
  mutation DeleteEventManager($id: ID!) {
    deleteEventManager(id: $id)
  }
`;

export const GET_EVENTS_BY_MANAGER = gql`
  query GetEventsByManager($managerId: String!) {
    getEventsByManager(managerId: $managerId) {
      _id
      name
      address
      location {
        coordinates
      }
      isActive
      isAvailable
      startDate
      endDate
      startTime
      endTime
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_EVENT = gql`
  mutation UpdateEvent($eventId: String!, $eventUpdateInput: EventUpdateInput!) {
    updateEvent(eventId: $eventId, eventUpdateInput: $eventUpdateInput) {
      _id
      name
      address
      location {
        coordinates
      }
      isActive
      isAvailable
      startDate
      endDate
      startTime
      endTime
      createdAt
      updatedAt
      restaurants
    }
  }
`;

export const GET_STALLS_BY_EVENT_ID = gql`
  query GetStallsByEventId($eventId: String!) {
    getStallsByEventId(eventId: $eventId) {
      _id
      name
      image
      logo
      address
      minimumOrder
      rating
      isActive
      isAvailable
      openingTimes {
        day
        times {
          startTime
          endTime
        }
        isOpen
      }
      slug
      cuisines
      reviewCount
      reviewAverage
      restaurantDisplayNumber
      phone
    }
  }
`;