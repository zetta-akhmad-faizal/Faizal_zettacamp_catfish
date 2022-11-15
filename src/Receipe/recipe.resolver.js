const {recipeModel} = require('./recipe.model');
const {ingredientModel} = require('../Ingredients/ingredient.model');
const {mongoose} = require('mongoose');
const { GraphQLError} = require('graphql');

// const MenuRecipe = async(parent, args, ctx) => {
//     let queriesGet = await recipeModel.aggregate([
//         {
//             $limit: 8
//         },
//         {
//             $sort: {
//                 createdAt: -1
//             }
//         }
//     ])

//     if(!queriesGet){
//         throw new GraphQLError("Recipe isn't show")
//     }else{
//         return {message: "Recipe is show", data: queriesGet}
//     }
// }

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

const CreateRecipe = async(parent, {data: {recipe_name, ingredients, link_recipe, price}}, ctx) => {
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
    let formInput = {recipe_name, ingredients, link_recipe, price};
    const queriesInsert = new recipeModel(formInput);
    await queriesInsert.save();

    return {message: "Recipe is saved", data: queriesInsert}
}

const GetOneRecipe = async(parent, {data:{_id}}, ctx) => {
    if(!_id){
        throw new GraphQLError("_id is null")
    }

    const queries = await recipeModel.findOne({_id: mongoose.Types.ObjectId(_id), status: "Active"});
    if(!queries){
        throw new GraphQLError("Recipe isn't found")
    }else{
        return {message: "Recipe is found", data: queries}
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

const ingredientSet = async (ingredients) => {
    let arr = [];
    for(let ingredient of ingredients){
        let queries = await recipeModel.findOne({"ingredients.ingredient_id":mongoose.Types.ObjectId(ingredient.ingredient_id)});
        if(queries){
            arr.push({
                ingredient_id: ingredient.ingredient_id,
                stock_used: ingredient.stock_used
            })
        }
    }
    return arr;
}

const UpdateRecipe = async(parent, {data: {_id, recipe_name, ingredients, price}}, ctx) => {
    if(!_id){
        throw new GraphQLError("_id is null");
    }

    let container;
    let containerParams3 = {new: true}
    let containerParams2Set = {}

    if(ingredients){
        container = await ingredientSet(ingredients);
        if(container.length !== 0){
            let id = container.map(val => val.ingredient_id)
            containerParams2Set["$set"] = {
                "ingredients.$[elem]": container
            }
            containerParams3["arrayFilters"] = [
                {"elem.ingredient_id": {$in: id}}
            ]
        }else{
            containerParams2Set["$push"] = {ingredients:[...ingredients]}
            containerParams2Set["$set"] = {
                recipe_name,
                price
            }
        }
    }

    let updateQueries = await recipeModel.findOneAndUpdate(
        {_id: mongoose.Types.ObjectId(_id)},
        containerParams2Set,
        containerParams3
    )
    // let container = await ingredientSet(ingredients);
    console.log(containerParams2Set, container)
    return {message: "Recipe is updated", data:updateQueries}
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

    return {message: "Recipe is found", data: queriesDelete}
}

const recipeLoaders = async(parent, args, ctx) => {
    if(parent){
        return await ctx.recipeLoader.load(parent.recipe_id)
    }
}

module.exports = {
    Query:{
        GetAllrecipes,
        GetOneRecipe,
        // MenuRecipe
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