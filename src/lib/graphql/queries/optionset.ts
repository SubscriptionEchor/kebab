import { gql } from "@apollo/client";

export const GET_OPTIONSET_MENU = gql`
query GetMenu($restaurantId: ID!) {
  getMenu(restaurantId: $restaurantId) {
    food {
      _id
      name
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
  }
}`


export const CREATE_OPTION_SET = gql`
mutation CreateOptionSetNew($input: OptionSetInput!, $restaurantId: ID!) {
  createOptionSetNew(input: $input, restaurantId: $restaurantId) {
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
}`

export const UPDATE_OPTION_SET = gql`
mutation UpdateOptionSetNew($updateOptionSetNewId: ID!, $input: OptionSetInput!, $restaurantId: ID!) {
  updateOptionSetNew(id: $updateOptionSetNewId, input: $input, restaurantId: $restaurantId) {
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
}`

export const DELETE_OPTIONSET = gql`
mutation DeleteOptionSetNew($deleteOptionSetNewId: ID!, $restaurantId: ID!) {
  deleteOptionSetNew(id: $deleteOptionSetNewId, restaurantId: $restaurantId)
}
`