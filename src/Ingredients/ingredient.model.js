const {Schema, mongoose} = require('mongoose');

const ingredientSchema = new Schema({
    name: {type: String},
    stock: {type: Number},
    status: {type: String, default: "Active"}
})

ingredientSchema.set("timestamps", true);

const ingredientModel = mongoose.model("ingredients", ingredientSchema)

module.exports = {ingredientModel}