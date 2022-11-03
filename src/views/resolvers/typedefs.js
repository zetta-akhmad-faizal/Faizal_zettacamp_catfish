const {gql} = require('apollo-server-express');

const typeDefs = gql`
    scalar Date

    input User{
        email: String,
        password: String
    }

    type authorization{
        _id: ID,
        email: String,
        password: String
    }

    type responseLogin{
        message: String
    }

    type UserSchema{
        _id: ID
        email: String
    }

    input bodyBookPurchased{
        termOfCredit: Int, 
        stock: Int, 
        purchase: Int, 
        title: [String], 
        discount: String, 
        tax: String, 
        additional: String,
        id: ID
    }

    type responseGetBookPurchased{
        message: String,
        data_book_purchased: [bookPurchasedAfterFacet]
    }
    type responsePostBookPurchased{
        message: String,
        data_book_purchased: [bookPurchasedDisplay]
    }

    type responseunArrayBookPurchased{
        message: String,
        data_book_purchased: bookPurchasedDisplay
    }

    type infoPage{
        count: Int
    }

    type bookPurchasedAfterFacet{
        book_purchased: [bookPurchasedDisplay],
        info_page: [infoPage]
    }

    type bookPurchasedDisplay{
        image: String,
        title: String,
        author: String,
        price: String,
        original_url: String,
        url: String,
        slug: String,
        discount: String,
        tax: String,
        afterDiscount: String,
        afterTax: String,
        adminPayment: String,
        total: String,
        stock: Int,
        purchase: Int,
        remain: Int,
        termOfCredit: String,
        monthly: [String],
        monthPaid: [String],
        users: [UserSchema],
        createdAt: Date,
        _id: ID,
        updatedAt: Date,
    }

    input bookPurchasedPagination{
        page: Int,
        limit: Int,
        title: String,
    }

    type Query {
        hello: String,
        GetbookPurchased(data: bookPurchasedPagination): responseGetBookPurchased
    }
    type Mutation{
        login(data: User): responseLogin,
        postBookPurchased(data: bodyBookPurchased): responsePostBookPurchased,
        putBookPurchased(data: bodyBookPurchased): responseunArrayBookPurchased,
        delBookPurchased(data: bodyBookPurchased): responseunArrayBookPurchased,
    }
`

module.exports = typeDefs;