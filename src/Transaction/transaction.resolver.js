const { mongoose } = require('mongoose');
const {transactionModel} = require('./transaction.model');
const {validateStockIngredient} = require('./transaction.app');
const { GraphQLError } = require('graphql');

//employer side
const GetAllTransaction = async(parent,{data: {limit, page,last_name_user, recipe_name, order_status, order_date}}, ctx) => {
    let arr = [];
    let endDate; let startDate;
    if(last_name_user){
        last_name_user = new RegExp(last_name_user, 'i');
    }

    if(last_name_user && recipe_name){
        last_name_user = new RegExp(last_name_user, 'i');
        recipe_name = new RegExp(recipe_name, 'i');
    }

    if(recipe_name){
        recipe_name = new RegExp(recipe_name, 'i');
    }

    if(order_date){
        //format MM/DD/YYYY
        let splitter = order_date.split("/")
        startDate = new Date(`${order_date}, 00:00:00.000Z`);
        endDate = new Date(`${splitter[0]}/${parseInt(splitter[1])+1}/${splitter[2]}, 00:00:00.000Z`)
        console.log(splitter)
    }
    let usersLookup = {
        $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'users'
        }
    }

    let recipesLookup = {
        $lookup: {
            from: 'recipes',
            localField: 'menu.recipe_id',
            foreignField: '_id',
            as: 'recipes'
        }
    }
    let skip = page > 0 ? ((page-1)*limit):0;
    if(limit && page && !last_name_user && !recipe_name && !order_status && !order_date){
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
            }
        )
    }else if(limit && page && last_name_user && !recipe_name && !order_status && !order_date){
        arr.push(
            usersLookup,
            {
                $match: {
                    status: 'Active',
                    'users.last_name': last_name_user
                }
            },
            {
                $skip: skip
            },
            {
                $limit: limit
            }
        )
    }else if(limit && page && !last_name_user && recipe_name && !order_status && !order_date){
        arr.push(
            recipesLookup,
            {
                $match: {
                    status: 'Active',
                    'recipes.recipe_name': recipe_name
                }
            },
            {
                $skip: skip
            },
            {
                $limit: limit
            }
        )
    }else if(limit && page && !last_name_user && !recipe_name && order_status && !order_date){
        arr.push(
            {
                $match: {
                    status: "Active",
                    order_status
                }
            },
            {
                $skip: skip,
            },
            {
                $limit: limit
            }
        )
    }else if(limit && page && !last_name_user && !recipe_name && !order_status && order_date){
        arr.push(
            {
                $match: {
                    status: "Active",
                    order_date: {
                        $gte: startDate,
                        $lte: endDate,
                    }
                }
            },
            {
                $skip: skip,
            },
            {
                $limit: limit
            }
        )
    }else if(limit && page && last_name_user && recipe_name && !order_status && !order_date){
        arr.push(
            usersLookup,
            recipesLookup,
            {
                $match: {
                    status: 'Active',
                    'users.last_name': last_name_user,
                    'recipes.recipe_name': recipe_name
                }
            },
            {
                $skip: skip,
            },
            {
                $limit: limit
            }
        )
    }else if(limit && page && last_name_user && recipe_name && order_status && !order_date){
        arr.push(
            usersLookup,
            recipesLookup,
            {
                $match: {
                    status: 'Active',
                    'users.last_name': last_name_user,
                    'recipes.recipe_name': recipe_name,
                    order_status
                }
            },
            {
                $skip: skip,
            },
            {
                $limit: limit
            }
        )
    }else if(limit && page && last_name_user && recipe_name && order_status && order_date){
        arr.push(
            usersLookup,
            recipesLookup,
            {
                $match: {
                    status: 'Active',
                    'users.last_name': last_name_user,
                    'recipes.recipe_name': recipe_name,
                    order_status,
                    order_date: {
                        $gte: startDate,
                        $lte: endDate,
                    }
                }
            },
            {
                $skip: skip,
            },
            {
                $limit: limit
            }
        )
    }else if(!limit && !page && !last_name_user && !recipe_name && !order_status && !order_date){
        arr.push(
            {
                $match: {
                    status: "Active"
                }
            },
            {
                $sort: {
                    order_date: -1
                }
            }
        )
    }

    let queriesGetAll = await transactionModel.aggregate(arr);
    if(!queriesGetAll){
        throw new GraphQLError("No transaction show")
    }
    console.log(startDate, endDate)
    return {message: "Transaction is displayed", data: queriesGetAll}
}

//employer side
const GetOneTransaction = async(parent, {data: {_id}}, ctx) => {
    if(!_id){
        throw new GraphQLError("_id is null")
    }

    const querieGetOne = await transactionModel.findOne({_id: mongoose.Types.ObjectId(_id), status: "Active"});
    if(!querieGetOne){
        throw new GraphQLError("No transaction show")
    }

    return {message: "Transaction is available", data: querieGetOne}
}

const CreateTransaction = async(parent, {data:{menu}}, ctx) => {
    if(!menu){
        throw new GraphQLError("You must choice menu")
    }

    let validate = await validateStockIngredient(menu)
    let queriesInsert = new transactionModel({
        ...validate,
        menu,
        user_id: ctx.user._id,
        order_date: new Date()
    })
    await queriesInsert.save();
    return {message: `Transaction insert ${validate['order_status']}`, data: queriesInsert}
    
}

const UpdateTransaction = async(parent, {data: {menu, _id}}) => {
    if(!menu){
        throw new GraphQLError("You must choice menu");
    }

    let validate = await validateStockIngredient(menu);
    if(validate['order_status'] === 'Success'){
        let queriesUpdate = await transactionModel.findOneAndUpdate(
            {_id: mongoose.Types.ObjectId(_id), status: "Active"},
            {
                $push:{
                    menu
                },
                $set: {
                    order_status: validate['order_status']
                }
            }
        )
        return {message: `Transaction ${validate['order_status']} updated`, data: queriesUpdate}
    }else{
        throw new GraphQLError("Ingredient isn't enough, transaction isn't be able updated")
    }
}

const DeleteTransaction = async(parent, {data:{_id}}, ctx) => {
    if(!_id){
        throw new GraphQLError("_id is null")
    }

    let queriesDelete = await transactionModel.findOneAndUpdate(
        {_id: mongoose.Types.ObjectId(_id), status: "Active"},
        {
            $set: {
                status: "Deleted"
            }
        },
        {
            new: true
        }
    )
    if(!queriesDelete){
        throw new GraphQLError("Transaction isn't deleted")
    }

    return {message: "Transaction is deleted", data: queriesDelete}
}

module.exports = {
    Query:{
        GetAllTransaction,
        GetOneTransaction,
    },
    Mutation: {
        CreateTransaction,
        DeleteTransaction,
        UpdateTransaction
    }
}