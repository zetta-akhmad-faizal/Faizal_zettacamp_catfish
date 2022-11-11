const {recipeModel}= require('../Receipe/recipe.index');
const {ingredientModel} = require('../Ingredients/ingredient.index')
const {mongoose} = require('mongoose');

let validateStockIngredient = async(menu) => {
    let arr = [];
    let obj = {};
    let arrIngredient = [];

    for(let arraysRecipe of menu){
        let recipeQueries = await recipeModel.findOne({
            _id: mongoose.Types.ObjectId(arraysRecipe.recipe_id)
        })
        for(let arraysIngredient of recipeQueries.ingredients){
            let objIngredient = {}
            let stock_used = arraysIngredient.stock_used;
            let ingredientQueries = await ingredientModel.findOne({_id: arraysIngredient.ingredient_id});
            console.log(`stock ingredient before updated: ${ingredientQueries.stock}`, `stock used ingredient ${stock_used}`, `ingredient name: ${ingredientQueries.name}`)
            if(stock_used <= ingredientQueries.stock){
                objIngredient['ingredient_id'] = ingredientQueries._id;
                objIngredient['stock_used'] = stock_used;

                arrIngredient.push(objIngredient);
                arr.push(true);
            }else{
                arr.push(false)
            }
        }
    }

    if(arr.includes(false) === false){
        obj['order_status'] = 'Success';
        await reduceIngredientStock(arrIngredient)
    }else{
        obj['order_status'] = 'Failed'
    }
    return obj
}

let reduceIngredientStock = async(arrs) => {
    let data;
    for(let arrays of arrs){
        data = await ingredientModel.findOneAndUpdate(
            {
                _id:arrays.ingredient_id,
                status: 'Active'
            },
            {
                $inc: {
                    stock: -arrays.stock_used
                }
            }
        )
    }
    console.log('check', data)
    return data
}

module.exports = {validateStockIngredient}