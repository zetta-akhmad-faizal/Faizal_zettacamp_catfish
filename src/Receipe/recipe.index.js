const recipeTypeDefs = require('./recipe.typedefs');
const recipeResolver = require('./recipe.resolver');
const recipeLoader = require('./recipe.loader')

module.exports = {recipeResolver, recipeTypeDefs, recipeLoader}