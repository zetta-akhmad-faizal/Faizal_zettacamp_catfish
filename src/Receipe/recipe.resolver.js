const {recipeModel} = require('./recipe.model');
const {ingredientModel} = require('../Ingredients/ingredient.model');
const {mongoose} = require('mongoose');
const { GraphQLError} = require('graphql');

const GetAllrecipes = async(parent, {data:{recipe_name, page, limit}}, ctx) => {
    let arr = []
    let skip = page > 0 ? ((page - 1) * limit) : 0

    let general = {
        $lookup: {
            from: 'ingredients',
            localField: 'ingredients.ingredient_id',
            foreignField: '_id',
            as: 'ingredient_list'
        }
    }

    if(limit && page && !recipe_name){
        arr.push(
            general,
            {
                status: "Active"
            },
            {
                $skip: skip
            },
            {
                $limit: limit
            },
            {$sort: {createdAt:-1}}
        )
    }else if(limit && page && recipe_name){
        arr.push(
            general,
            {
                $match: {
                    recipe_name: new RegExp(recipe_name, 'i'),
                    // 'ingredient_list.available': true,
                    status: "Active"
                }
            },
            {
                $skip: skip
            },
            {
                $limit: limit
            },
            {$sort: {createdAt:-1}}
        )
    }else{
        arr.push(
            general,
            {$match: {status: "Active"}},
            {$sort: {createdAt:-1}}
        )
    }
    const queriesGetAll = await recipeModel.aggregate(arr)
    return {message: "Recipes is listed", data: queriesGetAll}
}

const CreateRecipe = async(parent, {data: {recipe_name, ingredients}}, ctx) => {
    if(!recipe_name || !ingredients || ingredients.length === 0){
       throw new GraphQLError("Make a sure all fields are filled")
    }

    let container; let obj = {};

    //get id in form input
    let ingredientId = ingredients.map(val => mongoose.Types.ObjectId(val.ingredient_id));
    //filter based on id form input which it has active status
    let ingredientCheckStatus = await ingredientModel.find({_id: {$in:ingredientId}, status:"Active", available: true});
    
    //looping
    container = ingredientCheckStatus.map(val => val._id.toString());
    ingredients.forEach(val => {
        obj[val.ingredient_id] = val
    })
    ingredients = container.map(id => obj[id])
    //save to db
    let formInput = {recipe_name, ingredients};
    const queriesInsert = new recipeModel(formInput);
    await queriesInsert.save();

    return {message: "Recipe is saved", data: queriesInsert, permit: ctx.user.usertype}
}

const GetOneRecipe = async(parent, {data:{_id}}, ctx) => {
    if(!_id){
        throw new GraphQLError("_id is null")
    }

    const queries = await recipeModel.findOne({_id: mongoose.Types.ObjectId(_id), status: "Active"});
    if(!queries){
        throw new GraphQLError("Recipe isn't found")
    }else{
        return {message: "Recipe is found", data: queries, permit: ctx.user.usertype}
    }
}

const ingredientsLooping = async( ingredients, _id ) => {
    let container; let obj = {};
    
    //get id in form input
    let ingredientId = ingredients.map(val => mongoose.Types.ObjectId(val.ingredient_id));
    //filter based on id form input which it has active status
    let ingredientCheckStatus = await ingredientModel.find({_id: {$in:ingredientId}, status:"Active"});
    
    //looping
    container = ingredientCheckStatus.map(val => val._id.toString());
    ingredients.forEach(val => {
        obj[val.ingredient_id] = val
    })
    ingredients = container.map(id => obj[id]);
    let arr = [];
    for(let indexOfIngredient of ingredients){
        let queriesUpdate = await recipeModel.findOneAndUpdate(
            {_id: mongoose.Types.ObjectId(_id), status: "Active"},
            {
                $push: {
                    ingredients: indexOfIngredient
                }
            },
            {
                new:true
            }
        )
        arr.push(queriesUpdate);      
    }
    return arr
}

const recipeNameFunction = async (_id, recipe_name) => {
    let arr = []
    let queries = await recipeModel.findOneAndUpdate(
        {_id: mongoose.Types.ObjectId(_id), status: "Active"}, 
        {
            $set: {
                recipe_name
            }
        },
        {new: true}
    )
    arr.push(queries)
    return arr
}

const UpdateRecipe = async(parent, {data: {_id, recipe_name, ingredients}}, ctx) => {
    let res;
    
    if(ingredients && !recipe_name){
        res = await ingredientsLooping(ingredients, _id);
    }else if(recipe_name && !ingredients){
        res = await recipeNameFunction(_id, recipe_name);
    }else{
        throw new GraphQLError("Only can update once recipe_name or ingredients");
    }
    
    return {message: "Recipe is updated", data: res, permit: ctx.user.usertype}
}

const DeleteRecipe = async(parent, {data: {_id}}, ctx) => {
    if(!_id){
        throw new GraphQLError("_id is null")
    }

    let queriesDelete = await recipeModel.findOneAndUpdate(
        {_id: mongoose.Types.ObjectId(_id), status: "Active"},
        {
            $set: {
                status: "Deleted"
            }
        },
        {new: true}
    )
    if(!queriesDelete){
        throw new GraphQLError("Recipe isn't found")
    }

    return {message: "Recipe is found", data: queriesDelete, permit: ctx.user.usertype}
}

const recipeLoaders = async(parent, args, ctx) => {
    if(parent){
        return await ctx.recipeLoader.load(parent.recipe_id)
    }
}

module.exports = {
    Query:{
        GetAllrecipes,
        GetOneRecipe
    },
    Mutation:{
        CreateRecipe,
        DeleteRecipe,
        UpdateRecipe
    },
    menuFields: {
        recipe_id: recipeLoaders
    }
}