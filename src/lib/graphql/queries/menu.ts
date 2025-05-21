import { gql } from "@apollo/client";

export const CREATE_MENU = gql`
mutation CreateFoodNew($input: FoodInputNew!, $restaurantId: ID!) {
  createFoodNew(input: $input, restaurantId: $restaurantId) {
    _id
    name
    hasVariation
    variationList {
      _id
      createdAt
      discountedPrice
      optionSetList
      outOfStock
      price
      title
      type
      updatedAt
    }
    internalName
    description
    dietaryType
    imageData {
      createdAt
      images {
        _id
        createdAt
        url
        type
        updatedAt
      }
      updatedAt
    }
    active
    outOfStock
    hiddenFromMenu
    allergen
    tags
    createdAt
    updatedAt
  }
}
`

export const GET_MENU = gql`
query GetMenu($restaurantId: ID!) {
  getMenu(restaurantId: $restaurantId) {
    _id
    restaurantId
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
      hasVariation
      variationList {
        _id
        type
        title
        optionSetList
        price
        discountedPrice
        outOfStock
        createdAt
        updatedAt
      }
      internalName
      description
      dietaryType
      imageData {
        images {
          _id
          url
          type
          createdAt
          updatedAt
        }
        createdAt
        updatedAt
      }
      active
      outOfStock
      hiddenFromMenu
      allergen
      tags
      createdAt
      updatedAt
    }
    optionSetList {
      _id
      title
      optionData {
        _id
        foodId
        price
        active
        displayPrice
        createdAt
        updatedAt
      }
      internalName
      minQty
      maxQty
      createdAt
      updatedAt
    }
    createdAt
    updatedAt
  }
}`


export const UPDATE_MENU = gql`
mutation UpdateFoodNew($updateFoodNewId: ID!, $input: FoodInputNew!, $restaurantId: ID!) {
  updateFoodNew(id: $updateFoodNewId, input: $input, restaurantId: $restaurantId) {
    _id
    name
    hasVariation
    variationList {
      _id
      type
      title
      optionSetList
      price
      discountedPrice
      outOfStock
      createdAt
      updatedAt
    }
    internalName
    description
    dietaryType
    imageData {
      images {
        _id
        url
        type
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
    }
    active
    outOfStock
    hiddenFromMenu
    allergen
    tags
    createdAt
    updatedAt
  }
}
`

export const DELETE_MENU = gql`
mutation DeleteFoodNew($deleteFoodNewId: ID!, $restaurantId: ID!) {
    deleteFoodNew(id: $deleteFoodNewId, restaurantId: $restaurantId)
  }`

export const OUT_OF_STOCK = gql`
mutation ToggleFoodOutOfStock($foodId: ID!, $restaurantId: ID!) {
  toggleFoodOutOfStock(foodId: $foodId, restaurantId: $restaurantId)
}`