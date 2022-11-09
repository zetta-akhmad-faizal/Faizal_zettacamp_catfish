const {mongoose, Schema} = require('mongoose');

let recipeScheme = new Schema({
    recipe_name: {type:String},
    ingredients: [
        {
            ingredient_id: {type:mongoose.Schema.Types.ObjectId, ref: 'ingredients'},
            stock_used: {type:Number}
        }
    ],
    status: {type:String, default:"Active"}
})

recipeScheme.set("timestamps", true);

const recipeModel = mongoose.model('recipes', recipeScheme);

module.exports = {recipeModel}