const {gql} = require('apollo-server-express');

const ingredientTypeDefs = gql`
    enum statusIngredient{
        Active
        Deleted
    }
    input ingredientParams{
        _id: ID
        page: Int
        limit: Int
        name: String
        stock: Int
        status: statusIngredient
    }
    type ingredientScheme{
        name: String
        stock: Int
        status: statusIngredient
        createdAt: String
        updatedAt: String
    }
    type responseIngredientAll{
        message: String,
        data: [ingredientScheme]
    }
    type responseIngredient{
        message: String,
        data: ingredientScheme
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