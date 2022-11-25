const {gql} = require('apollo-server-express');

let transactionTypeDefs = gql`
    input menuFieldsParams{
        recipe_id: String
        amount: Int
        note: String
    }
    input transactionParams{
        amount: Int
        note:String
        _id: ID
        user_id: ID
        recipe_id: ID
        menu: [menuFieldsParams]
        order_status: statusOrder
        order_date: String
        status: statusTransaction
        last_name_user: String
        recipe_name: String
        limit: Int 
        page: Int
        typetr: String
    }
    type menuFields{
        recipe_id: recipeScheme
        amount: Int
        note: String
    }
    enum statusOrder{
        Draft
        Success
        Failed
    }
    enum statusTransaction{
        Active 
        Deleted
    }
    type transactionScheme{
        _id:ID
        user_id: userScheme
        menu: [menuFields]
        order_status: String
        order_date: String
        status: String
        total_price: Int
    }
    type newTransactionPaginate{
        transaction_data: [transactionScheme],
        info_page: [newSchemeCount]
    }
    type responseAtTransactionAll{
        message: String,
        data: newTransactionPaginate,
    }
    type responseAtTransaction{
        message: String,
        data: transactionScheme,
    }
    type responseMenuOffer{
        message: String
        menuHighlight: [recipeScheme]
        specialOffer: [recipeScheme]
    }
    type Query{
        GetAllTransaction(data: transactionParams): responseAtTransactionAll 
        GetOneTransaction(data: transactionParams): responseAtTransaction
        TransactionHistory: [transactionScheme]
        MenuOffers: responseMenuOffer
    }
    type Mutation{
        CreateTransaction(data: transactionParams): responseAtTransaction,
        DeleteTransaction(data: transactionParams): responseAtTransaction,
        UpdateTransaction(data: transactionParams): responseAtTransaction,
    }
`

module.exports = transactionTypeDefs