const ingredientResolve = require('./ingredient.resolver');
const ingredientTypeDefs = require('./ingredient.typedefs');
const {ingredientModel} = require('./ingredient.model');
const ingredientLoader = require('./ingredient.loader')

module.exports = {ingredientResolve, ingredientTypeDefs, ingredientModel, ingredientLoader}