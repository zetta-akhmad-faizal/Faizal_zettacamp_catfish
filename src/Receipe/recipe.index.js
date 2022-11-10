const recipeTypeDefs = require('./recipe.typedefs');
const recipeResolver = require('./recipe.resolver');
const recipeLoader = require('./recipe.loader');
const {recipeModel} = require('./recipe.model')

module.exports = {recipeResolver, recipeTypeDefs, recipeLoader, recipeModel}