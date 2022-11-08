const {ingredientModel} = require('./ingredient.model');

const GetAllIngredients = async(parent, {data: {name, stock}}, ctx) => {
    let queriesGetAll; let arr = [];
    let nameRegex;

    if(stock < 1){
        return {message: "Stock must be grather than 0"}
    }

    if(name && !stock){
        nameRegex = new RegExp(name, 'i');
        arr.push(
            {
                $match: {
                    name: nameRegex
                }
            },
            {
                $sort: {
                    createdAt: -1
                }
            }
        )
    }else if(stock && !name){
        arr.push(
            {
                $match: {
                    stock
                }
            },
            {
                $match: {
                    stock: {
                        $gt: 0
                    }
                }
            },
            {
                $sort: {
                    createdAt: -1
                }
            }
        )
    }else if(name && stock){
        nameRegex = new RegExp(name, 'i');
        arr.push(
            {
                $match: {
                    name: nameRegex
                }
            },
            {
                $match: {
                    stock
                }
            },
            {
                $match: {
                    stock: {
                        $gt: 0
                    }
                }
            },
            {
                $sort: {
                    createdAt: -1
                }
            }
        )
    }else if(!name && !stock){
        arr.push(
            {
                $sort: {
                    createdAt: -1
                }
            }
        )
    }
    queriesGetAll = await ingredientModel.aggregate(arr)
    if(queriesGetAll){
        return {message: "Ingredient is displayed", data: queriesGetAll}
    }else{
        return {message: "No data show"}
    }
}

const CreateIngredient = async(parent, args, ctx) => {}
module.exports = {
    Mutation: {
        CreateIngredient
    },
    Query: {
        GetAllIngredients
    }
}