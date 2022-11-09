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

    if(!page && !limit){
        return {message: "Page and Limit must be filled"}
    }

    if(stock < 0){
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
    }else if(stock && !name){
        arr.push(
            {
                $match: {
                    stock
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
    }else if(!name && !stock){
        arr.push(
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
        return {message: "Data is saved", data: queriesInsert}
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
    const queriesGetOne = await ingredientModel.findOne({_id: converterId});

    if(queriesGetOne){
        return {message: `Ingredients ${_id} is found`, data: queriesGetOne}
    }else{
        return {message: `Ingredients ${_id} isn't found`}
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
        {_id: mongoose.Types.ObjectId(_id)},
        {
            $set: {
                stock
            }
        },
        {new:true}
    )
    if(!queriesUpdate){
        return {message: "Ingredient isn't updated"}
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
        {_id: mongoose.Types.ObjectId(_id)},
        {
            $set: {
                status: "Deleted"
            }
        }
    )
    if(!queriesDelete){
        return {message: "Ingredient isn't deleted"}
    }

    return {message: "Ingredient is deleted", data: queriesDelete}
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
    }
}