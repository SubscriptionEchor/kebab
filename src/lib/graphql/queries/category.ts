import { gql } from "@apollo/client";

export const GET_CATEGORY_MENU = gql`
query GetMenu($restaurantId: ID!) {
  getMenu(restaurantId: $restaurantId) {
   categoryData {
      _id
      name
      active
      foodList
      createdAt
      updatedAt
    }
    food {
      _id
      name
    }
  }
}`

export const CREATE_CATEGORY = gql`
mutation CreateCategoryNew($input: CategoryInputNew!, $restaurantId: ID!) {
  createCategoryNew(input: $input, restaurantId: $restaurantId) {
    _id
    active
    foodList
    name
  }
}`

export const UPDATE_CATEGORY = gql`
mutation UpdateCategoryNew($updateCategoryNewId: ID!, $input: CategoryInputNew!, $restaurantId: ID!) {
  updateCategoryNew(id: $updateCategoryNewId, input: $input, restaurantId: $restaurantId) {
    _id
    name
    active
    foodList
    createdAt
    updatedAt
  }
}`

export const DELETE_CATEGORY = gql`
mutation DeleteCategoryNew($deleteCategoryNewId: ID!, $restaurantId: ID!) {
  deleteCategoryNew(id: $deleteCategoryNewId, restaurantId: $restaurantId)
}`