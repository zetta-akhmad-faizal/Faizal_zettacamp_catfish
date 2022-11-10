const DataLoader = require('dataloader');
const {recipeModel} = require('./recipe.model')

const recipeCall = async(recipeIds) => {
    let recipe = await recipeModel.find({
        _id: {
            $in: recipeIds
        }
    })

    let obj = {}
    recipe.forEach(val => {
        obj[val._id] = val
    })
    return recipeIds.map(id => obj[id]);
}

const recipeLoader = new DataLoader(recipeCall);

module.exports = recipeLoader