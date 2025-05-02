import { gql } from "@apollo/client";

export const REST_ORDERS = gql`
query OrdersByRestId($restaurant: String!, $page: Int, $rows: Int, $search: String) {
  ordersByRestId(restaurant: $restaurant, page: $page, rows: $rows, search: $search) {
    orderId
    orderStatus
    paymentMethod
    items {
      food
      quantity
      specialInstructions
    }
    user {
      name
      addresses {
        deliveryAddress
        details
        label
      }
    }
    orderAmount
    taxationAmount
  }
}`