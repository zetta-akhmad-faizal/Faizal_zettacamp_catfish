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
        _id: ID
        name: String
        stock: Int
        status: statusIngredient
        available: Boolean
        createdAt: String
        updatedAt: String
    }
    type responseIngredientAll{
        message: String,
        data: [ingredientScheme],
        permit: [usertypeField]
    }
    type responseIngredient{
        message: String,
        data: ingredientScheme, 
        permit: [usertypeField]
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