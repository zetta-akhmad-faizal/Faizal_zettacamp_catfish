const {transactionModel} = require('./transaction.model');
const {recipeModel }= require('../Receipe/recipe.index');
const {ingredientModel} = require('../Ingredients/ingredient.index')
const {mongoose} = require('mongoose')

let validateStockIngredient = async(_id,amount) => {
    let arr = [];
    let arrIngredientId = [];
    let obj = {};
    //get data by id in recipe model. _id = ids from mutation
    let recipeQueries = await recipeModel.findById(mongoose.Types.ObjectId(_id))
    //looping ingredients field from recipe collections
    for(let indexOfRecipeIngredients of recipeQueries.ingredients){
        let objIngredient = {};
        //in ingredient model find one data according on _id 
        let ingredientQueries = await ingredientModel.findOne({_id: indexOfRecipeIngredients.ingredient_id})
        //in recipe => ingredients there're some value about stock used and multiply with amount order, it will compare with ingredient
        let stock_used = indexOfRecipeIngredients.stock_used * amount
        //save ingredient
        objIngredient['ingredient_id'] = indexOfRecipeIngredients.ingredient_id;
        objIngredient['stock_used_total'] = stock_used;
        arrIngredientId.push(objIngredient);
        //logical
        console.log(`stock ingredient before updated: ${ingredientQueries.stock}`, `stock used ingredient ${stock_used}`, `ingredient name: ${ingredientQueries.name}`)
        ingredientQueries.stock <= stock_used ? arr.push('Failed') : arr.push('Success')
    } 
    obj['ingredientIds'] = arrIngredientId
    obj['recipeIngredient'] = arr.includes("Failed") 
    //validate ingredients < recipe. What are there failed value in arrays? if ya it will true and vice versa (false)
    return obj;
}

let reduceIngredientStock = async(ids, amount) => {
    let queriesUpdate = await ingredientModel.findOneAndUpdate(
        {
            _id:mongoose.Types.ObjectId(ids),
            status: 'Active'
        },
        {
            $inc: {
                stock: -amount
            }
        }
    )
    // console.log(queriesUpdate)
    return queriesUpdate
}

module.exports = {validateStockIngredient, reduceIngredientStock}