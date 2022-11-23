const {gql} = require('apollo-server-express');

const ingredientTypeDefs = gql`
    enum statusIngredient{
        Active
        Deleted
    }
    input ingredientParams{
        available: String
        _id: ID
        page: Int
        limit: Int
        name: String
        stock: Int
        status: statusIngredient
        image_ingredient: String
    }
    type ingredientScheme{
        _id: ID
        name: String
        stock: Int
        status: statusIngredient
        available: Boolean
        createdAt: String
        updatedAt: String
        image_ingredient: String
    }
    type newSchemeCount{
        count:Int
    }
    type newIngredientPaginate{
        ingredient_data: [ingredientScheme],
        info_page: [newSchemeCount]
    }
    type responseIngredientAll{
        message: String,
        data: newIngredientPaginate,
    }
    type responseIngredient{
        message: String,
        data: ingredientScheme, 
    }
    type Query{
        GetAllIngredients(data: ingredientParams): responseIngredientAll
        GetOneIngredient(data: ingredientParams): responseIngredient
    }
    type Mutation{
        CreateIngredient(data: ingredientParams): responseIngredient
        UpdateIngredient(data: ingredientParams): responseIngredient
        DeleteIngredient(data: ingredientParams): responseIngredient
    }
`

module.exports = ingredientTypeDefs;