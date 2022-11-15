const {mongoose, Schema} = require('mongoose');

let recipeScheme = new Schema({
    recipe_name: {type:String},
    link_recipe: {type:String},
    price:{type:Number},
    ingredients: [
        {
            ingredient_id: {type:mongoose.Schema.Types.ObjectId, ref: 'ingredients'},
            stock_used: {type:Number}
        }
    ],
    status: {type:String, default:"Active"}
})

recipeScheme.set("timestamps", true);

recipeScheme.virtual('transactions', {
    ref: 'transactions',
    localField: '_id',
    foreignField: 'menu.recipe_id'
})

const recipeModel = mongoose.model('recipes', recipeScheme);

module.exports = {recipeModel}