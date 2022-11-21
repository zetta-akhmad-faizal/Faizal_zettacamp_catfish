const { mongoose } = require('mongoose');
const {transactionModel} = require('./transaction.model');
const {validateStockIngredient} = require('./transaction.app');
const { GraphQLError } = require('graphql');

//employer side
const GetAllTransaction = async(parent,{data: {limit, page,last_name_user, recipe_name, order_status, order_date, typetr}}, ctx) => {
    let arr = [];
    let endDate; let startDate;

    let matchVal = {};
    let matchObj = {};
    let skip;

    let recipesLookup = {
        $lookup: {
            from: 'recipes',
            localField: 'menu.recipe_id',
            foreignField: '_id',
            as: 'recipes'
        }
    }

    let usersLookup = {
        $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'users'
        }
    }

    matchVal["status"] = "Active"

    if(last_name_user){
        last_name_user = new RegExp(last_name_user, 'i');
        matchVal["users.last_name"] = last_name_user;
        arr.push(
            usersLookup
        )
    }

    if(recipe_name){
        recipe_name = new RegExp(recipe_name, 'i');
        matchVal['recipes.recipe_name'] = recipe_name
        arr.push(
            recipesLookup
        )
    }

    if(order_date){
        //format MM/DD/YYYY
        let splitter = order_date.split("/")
        startDate = new Date(`${order_date}, 00:00:00.000Z`);
        endDate = new Date(`${splitter[0]}/${parseInt(splitter[1])+1}/${splitter[2]}, 00:00:00.000Z`);

        matchVal["order_date"] = {
            $gte: startDate,
            $lte: endDate,
        }
    }

    if(order_status){
        matchVal["order_status"] = order_status 
    }

    if(ctx.user.role === "Admin"){
        if(typetr === "Draft"){
            matchVal["user_id"] = ctx.user._id
        }
    }else if(ctx.user.role === "User"){
        if(typetr){
            matchVal["user_id"] = ctx.user._id
        }
    }

    matchObj["$match"] = matchVal
    arr.push(matchObj)
    
    if(limit && page){
        skip = page > 0 ? ((page-1)*limit):0;
        arr.push(
            {
                $skip: skip
            },
            {
                $limit: limit,
            }
        )
    }
    
    let queriesGetAll = await transactionModel.aggregate([
        {
            $facet: {
                transaction_data: arr,
                info_page: [
                    {
                        $match: {
                            status: "Active"
                        }
                    },
                    {
                        $group: {_id: null, count: {$sum: 1}}
                    }
                ]
            }
        }
    ]);
    console.log(queriesGetAll[0].transaction_data);
    if(!queriesGetAll){
        throw new GraphQLError("No transaction show")
    }

    return {message: "Transaction is displayed", data: queriesGetAll[0]}
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

    let type_transaction = "Draft";
    let validate = await validateStockIngredient(menu, type_transaction)
    let queriesInsert = new transactionModel({
        ...validate,
        menu,
        user_id: ctx.user._id,
        order_date: new Date()
    })
    await queriesInsert.save();
    console.log(queriesInsert)
    return {message: `Transaction insert ${validate['order_status']}`, data: queriesInsert}
    
}

const UpdateTransaction = async(parent, {data: {_id}}) => {
    let queriesGet = await transactionModel.findOne({_id: mongoose.Types.ObjectId(_id), order_status: "Draft"});
    let type_transaction = "Checkout"
    let validate = await validateStockIngredient(queriesGet.menu, type_transaction);
    if(validate['order_status'] === 'Success'){
        let queriesUpdate = await transactionModel.findOneAndUpdate(
            {_id: mongoose.Types.ObjectId(_id)},
            {
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