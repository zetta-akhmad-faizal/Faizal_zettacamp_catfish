const {gql} = require('apollo-server-express');

let transactionTypeDefs = gql`
    input menuFieldsParams{
        recipe_id: String
        amount: Int
        note: String
    }
    input transactionParams{
        amount: Int
        _id: ID
        user_id: ID
        menu: [menuFieldsParams]
        order_status: statusOrder
        order_date: String
        status: statusTransaction
        last_name_user: String
        recipe_name: String
        limit: Int 
        page: Int
    }
    type menuFields{
        recipe_id: recipeScheme
        amount: Int
        note: String
    }
    enum statusOrder{
        Success
        Failed
    }
    enum statusTransaction{
        Active 
        Deleted
    }
    type transactionScheme{
        user_id: userScheme
        menu: [menuFields]
        order_status: String
        order_date: String
        status: String
    }
    type responseAtTransactionAll{
        message: String,
        data: [transactionScheme],
        permit: [usertypeField]
    }
    type responseAtTransaction{
        message: String,
        data: transactionScheme,
        permit: [usertypeField]
    }
    type Query{
        GetAllTransaction(data: transactionParams): responseAtTransactionAll 
        GetOneTransaction(data: transactionParams): responseAtTransaction
    }
    type Mutation{
        CreateTransaction(data: transactionParams): responseAtTransaction,
        DeleteTransaction(data: transactionParams): responseAtTransaction,
        UpdateTransaction(data: transactionParams): responseAtTransaction
    }
`

module.exports = transactionTypeDefs