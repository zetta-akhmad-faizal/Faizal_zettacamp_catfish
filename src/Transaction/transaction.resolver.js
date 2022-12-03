const { mongoose } = require('mongoose');
const {transactionModel} = require('./transaction.model');
const {validateStockIngredient} = require('./transaction.app');
const { GraphQLError} = require('graphql');
const { recipeModel } = require('../Receipe/recipe.model');
const cron = require('node-cron');
const { userModel } = require('../User/user.model');

const TriggerCronJob = async(userId) => {
    let getQueries = await transactionModel.findOne({status: "Active", user_id: userId, order_status: "Draft"})
    if(getQueries){
        let schedule = new Date(getQueries.order_date);
        let minute = schedule.getMinutes() + 20
        if(minute > 59){
            minute -= 59;
        }
        return cron.schedule(`${schedule.getSeconds()} ${minute} * * * *`, async() => {
            return await transactionModel.findOneAndUpdate(
                {status: "Active", user_id: userId, order_status: "Draft"},
                {
                    $set: {
                        order_status: "Failed"
                    }
                }
            )
        })  
    }
}

//employer side
const GetAllTransaction = async(parent,{data: {limit, page,last_name_user, recipe_name, order_status, order_date, typetr}}, ctx) => {
    await TriggerCronJob(ctx.user._id)
    
    let arr = [];
    let endDate; let startDate;

    let matchVal = {};
    let matchObj = {};
    let skip

    let date_now = new Date();

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

    if(!order_status){
        matchVal["order_status"] = {
            $ne: "Draft"
        }
    }

    if(ctx.user.role === "Admin"){
        skip = page > 0 ? (page-1)*limit:0;
        if(typetr === "Draft" ){
            matchVal["user_id"] = ctx.user._id
            matchVal["order_status"] = "Draft"
        }else{
            matchVal["order_status"] = {$ne: "Draft"}
        }
    }else if(ctx.user.role === "User"){
        skip = page > 0 ? (page-1)*limit:0;
        if(typetr === "Draft"){
            matchVal["user_id"] = ctx.user._id
            matchVal["order_status"] = "Draft"
        }else{
            matchVal["user_id"] = ctx.user._id
            matchVal["order_status"] = {$ne: "Draft"}
        }
    }

    matchObj["$match"] = matchVal
    arr.push(matchObj, {$sort: {order_date:-1}})

    if(limit && page || last_name_user === '' || recipe_name === '' || order_status === '' || order_date === ''){
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
                        $match: matchVal
                    },
                    {
                        $group: {_id: null, count: {$sum: 1}}
                    }
                ]
            }
        }
    ]);
    console.log(matchObj);
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

    const querieGetOne = await transactionModel.findOne({_id: mongoose.Types.ObjectId(_id), status: "Active", order_status: "Draft"});
    if(!querieGetOne){
        throw new GraphQLError("No transaction show")
    }

    return {message: "Transaction is available", data: querieGetOne}
}

const checkLimitOrder = async(recipe_id) => {
    let validateArr = [];
    let arrs = [];

    let queryRecipe = await recipeModel.find({status: "Active"}).populate("ingredients.ingredient_id");
    for(let arrayOfRecipe of queryRecipe){
        for(let indexOfArray of arrayOfRecipe.ingredients){
            let objRecipe = {}
            objRecipe.recipeId = arrayOfRecipe._id
            objRecipe.ingredientId = indexOfArray.ingredient_id._id 
            objRecipe.stock_used = indexOfArray.stock_used
            objRecipe.stock_ingredient = indexOfArray.ingredient_id.stock
            validateArr.push(objRecipe)
        }
    }
    
    for(let val of validateArr){
        if(val.recipeId.toString() === recipe_id){
            console.log(val);
            arrs.push(
                Math.ceil(val.stock_ingredient/val.stock_used)
            )
        }
    }

    let getValueMin = Math.min(...arrs);
    return getValueMin
}

const checkMenuTransactions = async(menu, ctx) => {
    let obj = {};
    let queryCheck = await transactionModel.findOne({user_id:ctx.user._id, order_status: "Draft", status: "Active"});
    
    if(queryCheck){
        for(let menuOfTransaction of queryCheck.menu){
            const index = menu.findIndex(el => el.recipe_id === menuOfTransaction.recipe_id.toString());
            if (index >= 0) {
                menu.splice(index, 1);
            }
        }
        obj['price_before'] = queryCheck.total_price
    }

    obj['menu'] = menu 
    return obj
}

const CreateTransaction = async(parent, {data:{menu}}, ctx) => {
    if(!menu){
        throw new GraphQLError("You must choice menu")
    }

    let type_transaction = "Draft";
    let checkMenu = await checkMenuTransactions(menu, ctx);

    if(checkMenu.menu.length === 0){
        console.log("error length")
        throw new GraphQLError("Please clearly your cart")
    }

    let getValueMin = await checkLimitOrder(checkMenu.menu[0].recipe_id)

    if(getValueMin < checkMenu.menu[0].amount){
        throw new GraphQLError(`Limit ingredients. Menu can only be ordered ${getValueMin}`)
    }

    let validate = await validateStockIngredient(checkMenu.menu, type_transaction, ctx);
    
    if(validate['order_status'] === "Failed"){
        throw new GraphQLError(validate['reason'])
    }

    let total_price = {}
    if(checkMenu.price_before){
        total_price['total_price'] = validate['total_price'] + checkMenu.price_before
    }

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

let loadingTransaction = async(menu, typetr, ctx) => {
    return await validateStockIngredient(menu, typetr, ctx);
}


const UpdateTransaction = async(parent, {data: {recipe_id, amount, typetr, note}}, ctx) => {
    let secParam = {}
    let price_var = 0
    let message;
    let thirdParam = {new:true}

    let getValueMin = await checkLimitOrder(recipe_id);

    if(getValueMin < amount){
        throw new GraphQLError(`Limit ingredients. Menu can only be ordered ${getValueMin}`)
    }

    let queryCheck = await transactionModel.findOne({user_id: ctx.user._id, order_status: "Draft", status: "Active"}).populate("menu.recipe_id");
    queryCheck.menu.map(val => {
        if(val.recipe_id._id.toString() === recipe_id){
            price_var += val.recipe_id.price
        }
    });

    if(recipe_id && amount && note === undefined){
        console.log('note undef')
        secParam["$set"] = {
            total_price: queryCheck.total_price - (price_var*amount)
        }
        secParam["$pull"] = {
            menu: {
                recipe_id: mongoose.Types.ObjectId(recipe_id)
            }
        }
        message = "Cart is updated"
    }

    if(recipe_id && amount && note || note === ""){
        console.log("note str")
        let arr = [];

        for(let indexOfMenu of queryCheck.menu){
            arr.push({
                recipe_id: indexOfMenu.recipe_id._id,
                amount: indexOfMenu.amount,
                discount: indexOfMenu.recipe_id.discount > 0 ? indexOfMenu.recipe_id.discount: 0,
                price: indexOfMenu.recipe_id.price
            })
        }

        console.log('old', arr);
        let totalPrice = arr.map(val => {
            if(val.recipe_id.toString() === recipe_id){
                val.amount = amount
            }
             val.total_price = val.amount*(val.price - (val.price * (val.discount/100)))
             return val.total_price
        })
        
       
        console.log('new',totalPrice.reduce((arr, num) => arr+num));

        secParam["$set"] = {
            total_price: totalPrice.reduce((arr, num) => arr+num),
            "menu.$[ele]": {
                recipe_id: mongoose.Types.ObjectId(recipe_id),
                amount,
                note
            }
        }
        thirdParam["arrayFilters"] = [{"ele.recipe_id": mongoose.Types.ObjectId(recipe_id)}]
        message = "Cart is updated"
    }
    if(typetr){
        let validate = await new Promise((resolve) => setTimeout(() => resolve(loadingTransaction(queryCheck.menu, typetr, ctx)), 5000));
        console.log(validate);
        if(validate['order_status'] === 'Failed'){
            throw new GraphQLError(validate['reason'])
        }else if(validate['order_status'] === 'Success'){
            let crediteRemain = ctx.user.credite - validate['total_price']
            await userModel.updateOne({_id: ctx.user._id}, {$set: {credite:crediteRemain}});
            message = "Transaction is success"
        }
        secParam["$set"] = {
            order_status: validate['order_status']
        }
    }

    let queryUpdate = await transactionModel.findOneAndUpdate(
        {user_id: ctx.user._id, order_status: "Draft", status: "Active"},
        secParam,
        thirdParam
    )

    return {message, data:queryUpdate}
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

let randomArray = (arrays) => {
    let arrSet = new Set(arrays);
    let [...arrPlaylist] = arrSet;
    let arr = [];
    while(arrPlaylist.length !== 0){
        let randomIndex = Math.floor(Math.random() * arrPlaylist.length);
        arr.push(arrPlaylist[randomIndex]);
        arrPlaylist.splice(randomIndex, 1);
    }
    arrPlaylist = arr;
    return arrPlaylist;
}

const MenuOffers = async(parent, args, ctx) => {
    let menuHighlightMessage;
    let specialOfferMessage;
    let arr = [];

    let menuHighlightQueries = await recipeModel.aggregate([
        {
            $match: {
                published:true,
                discount: {
                    $gt: 0
                },
                status: "Active",
            }
        },
        {
            $sort: {
                discount: -1
            }
        },
        {
            $limit: 3
        }
    ])
    let specialOfferQueries = await transactionModel.find({order_status:"Success"});
    
    if(!specialOfferQueries){
        specialOfferMessage = "Special Offer isn't availability"
    }else{
        specialOfferMessage = "Special Offer is availability"
    }

    if(!menuHighlightQueries){
        menuHighlightMessage= "Menu Highlight isn't availability"
    }else{
        menuHighlightMessage= "Menu Highlight is availability"
    }

    for(let specialOffer of specialOfferQueries){
        for(let menuOfSpecial of specialOffer.menu){
            arr.push(menuOfSpecial.recipe_id)
        }
    }

    let randomArrays = randomArray(arr)
    
    let recipeQueries = await recipeModel.aggregate([
        {
            $match: {_id: {$in: randomArrays}}
        },
        {
            $sort: {
                createdAt: -1
            }
        }
    ])
    
    return {message: `${menuHighlightMessage} and ${specialOfferMessage}`, menuHighlight: menuHighlightQueries, specialOffer: recipeQueries}
}

const FinanceManagement = async(parent, {limit, page}, ctx) => {
    if(ctx.user.role === "Admin"){
        const queryFinance = await transactionModel.aggregate([
            {
                $match: {
                    status: "Active",
                    order_status: "Success"
                }
            }
        ])
        if(!queryFinance){
            throw new GraphQLError("No Transaction history yet")
        }
    
        let balance = 0
    
        for(let transaction of queryFinance){
            balance += transaction.total_price
        }
    
        console.log(queryFinance);
    
        return {balance}
    }else{
        throw new GraphQLError("You dont have access to FinanceManagement")
    }
}

module.exports = {
    Query:{
        GetAllTransaction,
        GetOneTransaction,
        MenuOffers,
        FinanceManagement
    },
    Mutation: {
        CreateTransaction,
        DeleteTransaction,
        UpdateTransaction
    }
}
