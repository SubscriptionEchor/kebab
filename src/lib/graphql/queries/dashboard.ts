import { gql } from "@apollo/client";

export const DASHBOARD = gql`
query GetDashboardTotal($restaurant: String!, $startingDate: String, $endingDate: String) {
  getDashboardTotal(restaurant: $restaurant, starting_date: $startingDate, ending_date: $endingDate) {
    totalOrders
    totalSales
  }
}`