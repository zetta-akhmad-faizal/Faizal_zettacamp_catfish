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

    matchVal["status"] = "Active";

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

const checkMenuTransactions = async(menu, ctx) => {
    let arr = []
    let queryCheck = await transactionModel.findOne({user_id:ctx.user._id, order_status: "Draft", status: "Active"});
    if(queryCheck){
        for(let menuOfTransaction of queryCheck.menu){
            if(menu.recipe_id === menuOfTransaction.recipe_id.toString()){
                arr.push(false)
            }else{
                arr.push(true)
            }
        }
    }
    if(arr.includes(false)){
        return true
    }else{
        return menu
    }
}

const CreateTransaction = async(parent, {data:{menu}}, ctx) => {
    if(!menu){
        throw new GraphQLError("You must choice menu")
    }

    let type_transaction = "Draft";
    let checkMenu = await checkMenuTransactions(menu[0], ctx);

    if(Number.isInteger(menu[0].amount) !== true){
        throw new GraphQLError("Amount must be integer")
    }

    if(checkMenu === true){
        throw new GraphQLError("Please clearly your cart")
    }
    
    let findAndUpdate = await transactionModel.findOneAndUpdate(
        {user_id: ctx.user._id, status: "Active", order_status: "Draft"},
        {
            $push: {
                menu: checkMenu
            }
        },
        {new: true}
    )
    console.log("update",findAndUpdate)

    if(findAndUpdate){
        return {message: "Your transaction is updated", data: findAndUpdate}
    }else{
        console.log(menu)
        let validate = await validateStockIngredient(menu, type_transaction);
        let insertQueries = new transactionModel({
            ...validate,
            menu,
            user_id: ctx.user._id,
            order_date: new Date()
        })
        console.log("insert",insertQueries)
        await insertQueries.save();
        return {message: `Transaction insert ${validate['order_status']}`, data: insertQueries}
    }
}

const UpdateTransaction = async(parent, {data: {_id, recipe_id, typetr}}, ctx) => {
    let secParam = {}

    if(!_id){
        throw new GraphQLError("_id is null")
    }

    if(recipe_id){
        secParam["$pull"] = {
            menu: {
                recipe_id: mongoose.Types.ObjectId(recipe_id)
            }
        }
    }

    if(typetr){
        let queryCheck = await transactionModel.findOne({user_id: ctx.user._id, order_status: "Draft", status: "Active"})
        if(!queryCheck){
            throw new GraphQLError("The Draft isn't exists");
        }
        let validate = await validateStockIngredient(queryCheck.menu, typetr);
        secParam["$set"] = {
            order_status: validate['order_status']
        }
    }

    let queryUpdate = await transactionModel.findOneAndUpdate(
        {_id: mongoose.Types.ObjectId(_id)},
        secParam,
        {new:true}
    )

    return {message: "Transaction is updated", data:queryUpdate}
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