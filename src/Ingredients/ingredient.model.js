const {Schema, mongoose} = require('mongoose');

const ingredientSchema = new Schema({
    name: {type: String, unique: true},
    stock: {type: Number},
    image_ingredient: {type:String},
    status: {type: String, default: "Active"},
    available: {type: Boolean, default: true}
})

ingredientSchema.set("timestamps", true);

ingredientSchema.virtual('recipes', {
    ref: 'recipes',
    localField: '_id',
    foreignField: 'ingredients.ingredient_id'
})

const ingredientModel = mongoose.model("ingredients", ingredientSchema)

module.exports = {ingredientModel}