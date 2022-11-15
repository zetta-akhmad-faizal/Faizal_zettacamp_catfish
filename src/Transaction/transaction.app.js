const {recipeModel}= require('../Receipe/recipe.index');
const {ingredientModel} = require('../Ingredients/ingredient.index')
const {mongoose} = require('mongoose');

let validateStockIngredient = async(menu) => {
    let arr = [];
    let totalPrice = []
    let obj = {};
    let arrIngredient = [];

    for(let arraysRecipe of menu){
        let recipeQueries = await recipeModel.findOne({
            _id: mongoose.Types.ObjectId(arraysRecipe.recipe_id)
        })
        totalPrice.push(arraysRecipe.amount * recipeQueries.price)
        for(let arraysIngredient of recipeQueries.ingredients){
            let objIngredient = {}
            let stock_used = arraysIngredient.stock_used;
            let ingredientQueries = await ingredientModel.findOne({_id: arraysIngredient.ingredient_id, available:true});
            console.log(`stock ingredient before updated: ${ingredientQueries.stock}`, `stock used ingredient ${stock_used}`, `ingredient name: ${ingredientQueries.name}`)
            if(stock_used <= ingredientQueries.stock){
                objIngredient['ingredient_id'] = ingredientQueries._id;
                objIngredient['stock_remain'] = ingredientQueries.stock;
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
    obj['total_price'] = totalPrice.reduce((accumVariable, curValue) => accumVariable + curValue);
    return obj
}

let reduceIngredientStock = async(arrs) => {
    let data;
    for(let arrays of arrs){
        data = await ingredientModel.findOneAndUpdate(
            {
                _id:arrays.ingredient_id,
                status: 'Active',
                available: true
            },
            {
                $inc: {
                    stock: -arrays.stock_used
                },
                $set:{
                    available: arrays.stock_remain > 0 ? true: false
                }
            }
        )
    }
    // console.log('check', data)
    return data
}

module.exports = {validateStockIngredient}