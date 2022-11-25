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

const GetAllrecipes = async(parent, {data:{recipe_name, page, limit, published}}, ctx) => {
    let arr = []
    let matchVal = {};
    // let matchCount = {}
    let matchObj = {};
    let skip;

    matchVal["status"] = "Active";
    // matchCount["status"] = "Active";

    if(published){
        published = published === "Publish" ? true: false
        matchVal["published"] = published
        // matchCount['published'] = published
    }
    

    if(recipe_name){
        matchVal["recipe_name"] = new RegExp(recipe_name, 'i')
        // matchCount['recipe_name'] = new RegExp(recipe_name, 'i')
    }

    matchObj["$match"] = matchVal;
    arr.push(matchObj, {$sort: {recipe_name:1}});

    if(limit && page || recipe_name === ""){
        skip = page > 0 ? ((page - 1)*limit):0;
        arr.push(
            {
                $skip: skip
            },
            {
                $limit: limit,
            }
        )
    }
    
    const queriesGetAll = await recipeModel.aggregate([
        {
            $facet: {
                recipe_data: arr,
                info_page: [
                    {
                        $match: matchVal
                    },
                    {
                        $group: {_id: null, count: {$sum: 1}}
                    }
                ]
            }
        }
    ])
    // console.log(queriesGetAll)
    if(queriesGetAll[0].recipe_data.length === 0){
        throw new GraphQLError("No Recipes show")
    }
    return {message: "Recipes is listed", data: queriesGetAll[0]}
}

const CreateRecipe = async(parent, {data: {recipe_name, ingredients, link_recipe, price}}, ctx) => {
    if(!recipe_name || !ingredients || ingredients.length === 0){
       throw new GraphQLError("Make a sure all fields are filled")
    }
    // console.log(recipe_name, ingredients);
    let checkMenu = await recipeModel.findOne({recipe_name: new RegExp(recipe_name, 'i'), status: "Active"})
    if(checkMenu){
        throw new GraphQLError("Recipes has been available")
    }

    if(!price){
        throw new GraphQLError("Stock must be integer and must be filled")
    }else if(Number.isInteger(price) !== true){
        throw new GraphQLError("Stock must be integer")
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

    let matcher = link_recipe.match( /d\/([A-Za-z0-9\-]+)/ ) ;
    link_recipe = matcher ? 'https://drive.google.com/uc?export=view&id=' + matcher[1] : link_recipe

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

const UpdateRecipe = async(parent, {data: {_id, recipe_name, ingredients, price,  published, ingredient_id, link_recipe}}, ctx) => {
    if(!_id){
        throw new GraphQLError("_id is null");
    }
    let containerParams3 = {new: true}
    let containerParams2Set = {}
    let arr;
    let message;
    
    //edit publish
    if(published){
        if(published === "Publish"){
            published = true
            message = "Recipe is published"
        }else if(published === "Unpublish"){
            published = false
            message = "Recipe is unpublished"
        }
        containerParams2Set["$set"] = {
            published
        }
    }
    if(ingredients){
        let queriesGet = await recipeModel.findOne({_id: mongoose.Types.ObjectId(_id), status: "Active"});
        for(let ingredient of queriesGet.ingredients){
            arr = ingredients.filter(val => val.ingredient_id === ingredient.ingredient_id.toString());
        }
        if(typeof arr === "undefined"){
            containerParams2Set["$push"] = {
                ingredients: [...ingredients]
            }
            message = 'Ingredient is added'
        }

        if(typeof arr === "object"){
            await recipeModel.findOneAndUpdate(
                {_id: mongoose.Types.ObjectId(_id)},
                {
                    $set: {
                        ingredients
                    }
                }
            )
        }
    }

    //edit new ingredients to ingredient who has exist
    if(recipe_name || price || link_recipe){
        let matcher = link_recipe.match( /d\/([A-Za-z0-9\-]+)/ ) ;
        link_recipe = matcher ? 'https://drive.google.com/uc?export=view&id=' + matcher[1] : link_recipe
        containerParams2Set["$set"] = {
            recipe_name, price, link_recipe
        }
        message="Recipe is updated"
    }

    //remove the ingredient who has exist
    if(ingredient_id){
        ingredient_id = ingredient_id.map(val => mongoose.Types.ObjectId(val))
        containerParams2Set["$pull"] = {
            ingredients: {
                ingredient_id: {
                    $in: ingredient_id
                }
            }
        }
        message="Ingredient is deleted"
    }
    console.log(ingredient_id)
    let updateQueries = await recipeModel.findOneAndUpdate(
        {_id: mongoose.Types.ObjectId(_id)},
        containerParams2Set,
        containerParams3
    )
    // console.log(containerParams2Set);
    // console.log(updateQueries)
    return {message, data: updateQueries}
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

    return {message: "Recipe is Deleted", data: queriesDelete}
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