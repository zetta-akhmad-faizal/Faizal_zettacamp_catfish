const {ingredientModel} = require('./ingredient.model');
const DataLoader = require('dataloader');

let ingredientCall = async(ingredientIds) => {
    let queri = await ingredientModel.find({
        _id: {
            $in: ingredientIds
        }
    })
    console.log(queri)
    const obj = {};
    queri.forEach(val => {
        obj[val._id]=val
    })
    return ingredientIds.map(id=> obj[id]);
}

const ingredientLoader = new DataLoader(ingredientCall);

module.exports = ingredientLoader;