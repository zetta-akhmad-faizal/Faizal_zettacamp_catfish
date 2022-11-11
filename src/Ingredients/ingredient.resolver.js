const {ingredientModel} = require('./ingredient.model');
const {GraphQLError} = require('graphql')
const {mongoose} = require('mongoose');

const GetAllIngredients = async(parent, {data: {name, stock, limit, page}}, ctx) => {
    let queriesGetAll; let arr = [];
    let nameRegex;
    let skip = page > 0 ? ((page - 1) * limit) : 0

    if(ctx.user.role === 'customer'){
        return {message: "You dont have access to getOneUser function"}
    }

    if(stock < 0){
        return {message: "Stock must be grather than 0"}
    }

    if(limit && page && !name && !stock){
        arr.push(
            {
                $match: {
                    status: "Active"
                }
            },
            {
                $skip: skip
            },
            {
                $limit: limit
            },
            {
                $sort: {
                    createdAt: -1
                }
            }
        )
    }else if(limit && page && name && !stock){
        nameRegex = new RegExp(name, 'i');
        arr.push(
            {
                $match: {
                    name: nameRegex,
                    status: "Active"
                }
            },
            {
                $skip: skip
            },
            {
                $limit: limit
            },
            {
                $sort: {
                    createdAt: -1
                }
            }
        )
    }else if(limit && page && stock && !name){
        arr.push(
            {
                $match: {
                    stock,
                    status: "Active"
                }
            },
            {
                $skip: skip
            },
            {
                $limit: limit
            },
            {
                $sort: {
                    createdAt: -1
                }
            }
        )
    }else if(limit && page && name && stock){
        nameRegex = new RegExp(name, 'i');
        arr.push(
            {
                $match: {
                    name: nameRegex,
                    stock,
                    status: "Active"
                }
            },
            {
                $skip: skip
            },
            {
                $limit: limit
            },
            {
                $sort: {
                    createdAt: -1
                }
            }
        )
    }else{
        arr.push(
            {
                $match: {
                    status: "Active"
                }
            },
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

const CreateIngredient = async(parent, {data: {name, stock}}, ctx) => {
    try{
        if(ctx.user.role === 'customer'){
            return {message: "You dont have access to CreateIngredient function"}
        }
    
        if(stock < 0){
            return {message: "Stock must be grater than 0"}
        }else if(!name && !stock){
            return {message: "Name and stock must be filled"}
        }
    
        const queriesInsert = new ingredientModel({name, stock});

        await queriesInsert.save()
        return {message: "Ingredient is saved", data: queriesInsert}
    }catch(e){
        throw new GraphQLError("Ingredient is available")
    }
}

const GetOneIngredient = async(parent, {data:{_id}}, ctx) => {
    if(ctx.user.role === 'customer'){
        return {message: "You dont have access to GetOneIngredient function"}
    }
    if(!_id){
        return {message: "_id is null"}
    }
    const converterId = mongoose.Types.ObjectId(_id)
    const queriesGetOne = await ingredientModel.findOne({_id: converterId, status:Active});

    if(queriesGetOne){
        return {message: `Ingredients ${_id} is found`, data: queriesGetOne}
    }else{
        return {message: `Ingredients ${_id} isn't found`, data: queriesGetOne}
    }
}

const UpdateIngredient = async(parent, {data:{_id, stock}}, ctx) => {
    if(ctx.user.role === 'customer'){
        return {message: "You dont have access to UpdateIngredient function"}
    }

    if(!_id){
        return {message: "_id is null"}
    }

    const queriesUpdate = await ingredientModel.findOneAndUpdate(
        {_id: mongoose.Types.ObjectId(_id), status: "Active"},
        {
            $set: {
                stock
            }
        },
        {new:true}
    )
    if(!queriesUpdate){
        return {message: "Ingredient isn't updated", data:queriesUpdate}
    }
    return {message: "Ingredient is updated", data: queriesUpdate}
}

const DeleteIngredient = async(parent, {data: {_id}}, ctx) => {
    if(ctx.user.role === 'customer'){
        return {message: "You dont have access to DeleteIngredient function"}
    }

    if(!_id){
        return {message: "_id is null"}
    }

    const queriesDelete = await ingredientModel.findOneAndUpdate(
        {_id: mongoose.Types.ObjectId(_id), status: "Active"},
        {
            $set: {
                status: "Deleted"
            }
        }
    )
    if(!queriesDelete){
        return {message: "Ingredient isn't deleted", data: queriesDelete}
    }

    return {message: "Ingredient is deleted", data: queriesDelete}
}

const loaderOfingredient = async(parent, args, ctx) => {
    if(parent){
        return await ctx.ingredientLoader.load(parent.ingredient_id);
    }
}

module.exports = {
    Mutation: {
        CreateIngredient,
        UpdateIngredient,
        DeleteIngredient
    },
    Query: {
        GetAllIngredients,
        GetOneIngredient
    },
    recipeIngredientsField: {
        ingredient_id: loaderOfingredient
    }
}