const { mongoose } = require('mongoose');
const {transactionModel} = require('./transaction.model');
const {validateStockIngredient} = require('./transaction.app');
const { GraphQLError } = require('graphql');
const { recipeModel } = require('../Receipe/recipe.model');

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
    let arr = [];
    let obj = {}
    let queryCheck = await transactionModel.findOne({user_id:ctx.user._id, order_status: "Draft", status: "Active"});
    if(queryCheck){
        for(let menuOfTransaction of queryCheck.menu){
            if(menu.recipe_id === menuOfTransaction.recipe_id.toString()){
                arr.push(false)
            }else{
                arr.push(true)
            }
        }
        obj['price_before'] = queryCheck.total_price
    }
    if(arr.includes(false)){
        return true
    }else{
        obj['menu'] = menu
        return obj
    }
}

const CreateTransaction = async(parent, {data:{menu}}, ctx) => {
    if(!menu){
        throw new GraphQLError("You must choice menu")
    }

    let type_transaction = "Draft";
    let checkMenu = await checkMenuTransactions(menu[0], ctx);
    let validate = await validateStockIngredient(menu, type_transaction);

    if(Number.isInteger(menu[0].amount) !== true){
        throw new GraphQLError("Amount must be integer")
    }

    if(checkMenu === true){
        throw new GraphQLError("Please clearly your cart")
    }
    let total_price = {}
    if(checkMenu.price_before){
        total_price['total_price'] = validate['total_price'] + checkMenu.price_before
    }
    console.log(total_price);
    let findAndUpdate = await transactionModel.findOneAndUpdate(
        {user_id: ctx.user._id, status: "Active", order_status: "Draft"},
        {
            $set: total_price,
            $push: {
                menu: checkMenu.menu
            }
        },
        {new: true}
    )
    console.log("update",findAndUpdate)

    if(findAndUpdate){
        return {message: "Your transaction is updated", data: findAndUpdate}
    }else{
        console.log(menu)
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

const UpdateTransaction = async(parent, {data: {recipe_id, amount, typetr, note}}, ctx) => {
    let secParam = {}
    let thirdParam = {new:true}

    let queryCheck = await transactionModel.findOne({user_id: ctx.user._id, order_status: "Draft", status: "Active"}).populate("menu.recipe_id");
    let recipe = await recipeModel.findOne({_id: mongoose.Types.ObjectId(recipe_id), status: "Active", available:true});
    
    if(!recipe){
        throw GraphQLError("Recipe isn't available and active");
    }

    if(!queryCheck){
        throw new GraphQLError("The Draft isn't exists");
    }


    if(recipe_id && amount && !note){
        secParam["$set"] = {
            total_price: queryCheck.total_price - (recipe.price*amount)
        }
        secParam["$pull"] = {
            menu: {
                recipe_id: mongoose.Types.ObjectId(recipe_id)
            }
        }
    }

    if(recipe_id && amount && note){
        let arr = [];

        for(let indexOfMenu of queryCheck.menu){
            arr.push({
                recipe_id: indexOfMenu.recipe_id._id,
                amount: indexOfMenu.amount,
                total_price: indexOfMenu.amount * indexOfMenu.recipe_id.price,
                price: indexOfMenu.recipe_id.price
            })
        }

        console.log('old', arr);
        arr.map(val => {
            if(val.recipe_id.toString() === recipe_id){
                val.amount = amount
                val.total_price = val.amount*val.price
            }
        })
        console.log('new', arr);
        let totalPrice = arr.map(val => val.total_price);
        console.log('new',totalPrice.reduce((arr, num) => arr+num));

        secParam["$set"] = {
            total_price: totalPrice.reduce((arr, num) => arr+num),
            "menu.$[ele]": {
                recipe_id: recipe_id,
                amount,
                note
            }
        }
        thirdParam["arrayFilters"] = [{"ele.recipe_id": mongoose.Types.ObjectId(recipe_id)}]
    }
    if(typetr){
        let validate = await validateStockIngredient(queryCheck.menu, typetr);
        secParam["$set"] = {
            order_status: validate['order_status']
        }
    }

    let queryUpdate = await transactionModel.findOneAndUpdate(
        {user_id: ctx.user._id, order_status: "Draft", status: "Active"},
        secParam,
        thirdParam
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

const test = async(parent, args, ctx) => {
    let x = await transactionModel.findOne().populate("menu.recipe_id")
    console.log(x.menu[0].recipe_id);
    return x
}

module.exports = {
    Query:{
        GetAllTransaction,
        GetOneTransaction,
        test
    },
    Mutation: {
        CreateTransaction,
        DeleteTransaction,
        UpdateTransaction
    }
}