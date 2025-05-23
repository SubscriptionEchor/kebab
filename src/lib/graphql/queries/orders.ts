import { gql } from "@apollo/client";

export const REST_ORDERS = gql`
query OrdersByRestId($restaurant: String!, $page: Int, $rows: Int, $search: String) {
  ordersByRestId(restaurant: $restaurant, page: $page, rows: $rows, search: $search) {
    orderId
    orderStatus
    paymentMethod
    updatedAt
    items {
      title
      food
      quantity
      specialInstructions
      variation {
        price
        title
      }
      addons {
        options {
          price
 
        }
      }
    }
    user {
      name
      phone
    }
    deliveryAddress {
      deliveryAddress
      details
      label
    }
    orderAmount
    taxationAmount
  }
}`