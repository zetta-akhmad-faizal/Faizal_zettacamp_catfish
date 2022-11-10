const {transactionModel} = require('./transaction.model');
const {recipeModel }= require('../Receipe/recipe.index');
const {ingredientModel} = require('../Ingredients/ingredient.index')
const {mongoose} = require('mongoose')

let validateStockIngredient = async(_id,amount) => {
    let arr = []
    //get data by id in recipe model. _id = ids from mutation
    let recipeQueries = await recipeModel.findById(mongoose.Types.ObjectId(_id))
    //looping ingredients field from recipe collections
    for(let indexOfRecipeIngredients of recipeQueries.ingredients){
        //in ingredient model find one data according on _id 
        let ingredientQueries = await ingredientModel.findOne({_id: indexOfRecipeIngredients.ingredient_id})
        //in recipe => ingredients there're some value about stock used and multiply with amount order, it will compare with ingredient
        let stock_used = indexOfRecipeIngredients.stock_used * amount
        if(ingredientQueries.stock <= stock_used){
            arr.push('Failed');
        }else{
            arr.push('Success')
        }
    } 
    //validate ingredients < recipe. What are there failed value in arrays? if ya it will true and vice versa (false)
    return arr.includes('Failed');
}

// let reduceIngredientStock = async(_id, amount) => {
//     try{
//         let data = await transactionModel.findById(mongoose.Types.ObjectId(_id))
//         if(data){
//             for(let indexOfMenu of data.menu){
//                 return await validateStockIngredient(indexOfMenu.recipe_id, amount)
//             }
//         }
//     }catch(e){
//         return e.message
//     }
// }

module.exports = {validateStockIngredient, }