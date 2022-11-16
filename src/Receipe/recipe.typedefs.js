const {gql} = require('apollo-server-express');

let recipeTypeDefs = gql`
    input recipeIngredientsParams{
        ingredient_id: ID
        stock_used: Int
    }
    input recipeParams{
        _id: ID
        recipe_name:String
        ingredients: [recipeIngredientsParams]
        status: statusRecipes
        limit: Int
        page: Int,
        link_recipe: String
        price:Int
        ingredient_id: ID
    }
    type recipeIngredientsField{
        ingredient_id: ingredientScheme
        stock_used: Int
    }
    enum statusRecipes{
        Active
        Deleted
    }
    type recipeScheme{
        _id: ID
        recipe_name: String
        ingredients: [recipeIngredientsField]
        status: String,
        link_recipe: String
        price: Int
    }
    type responseAtRecipeAll{
        message:String
        data: [recipeScheme]
    }
    type responseAtRecipe{
        message:String
        data: recipeScheme
    }
    type Query{
        GetAllrecipes(data: recipeParams): responseAtRecipeAll
        GetOneRecipe(data: recipeParams): responseAtRecipe
        MenuRecipe: responseAtRecipeAll
    }
    type Mutation{
        CreateRecipe(data: recipeParams): responseAtRecipe
        UpdateRecipe(data: recipeParams): responseAtRecipe
        DeleteRecipe(data: recipeParams): responseAtRecipe
    }
`

module.exports = recipeTypeDefs