const {ingredientModel} = require('./ingredient.model');
const DataLoader = require('dataloader');

let ingredientCall = async(ingredientIds) => {
    // console.log(ingredientIds);
    let queri = await ingredientModel.find({
        _id: {
            $in: ingredientIds
        }
    })
    const obj = {};
    queri.forEach(val => {
        obj[val._id]=val
    })
    return ingredientIds.map(id=> obj[id]);
}

const ingredientLoader = new DataLoader(ingredientCall);

module.exports = ingredientLoader;