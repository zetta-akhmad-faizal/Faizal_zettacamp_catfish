const {gql} = require('apollo-server-express');

const typeDefs = gql`
    scalar Date

    input User{
        _id: ID
        email: String,
        password: String
    }
    type UserType{
        _id: ID
        email: String,
        password: String
    }
    type testField{
        _id: String,
        name: String,
        user_id: UserType
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
        email: String,
        password: String
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

    input bodyBookFav{
        themeBook:String, 
        bookName: String, 
        stock: Int
    }

    type responsePostBookFav{
        message: String,
        book_data: favBooksSchema
    }
    type favBooksSchema{
        _id: ID
        name: String,
        user_id: ID,
        bookFav: [bookFavField],
        priceConvert: Int,
        priceBenefit: Int,
        date_input: [dateInputField]
        book_collections: [titleFieldProjection]
    }
    type infoPage{
        _id:ID,
        count: Int
    }

    type responseGetBooks{
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

    type bookPurchasedAfterFacet{
        book_purchased: [bookPurchasedRelation],
        info_page: [infoPage]
    }

    type bookCollectionScheme{
        _id: ID,
        image: String,
        title: String,
        author: String,
        price: String,
        original_url: String,
        url: String,
        slug: String,
    }

    type bookPurchasedDisplay{
        book_id: ID,
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

    type bookPurchasedRelation{
        book_collections: [bookCollectionScheme],
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
        name: String,
        _id: ID,
        updatedAt: Date,
    }

    type dateInputField{
        dates: String,
        times: String
    }

    input booksPagination{
        page: Int,
        limit: Int,
        title: String,
        name: String
    }

    # start
    type addedField{
        date: String,
        time: String,
        stock: Int,
        price: String,
    }

    type bookFavField{
        book_id: ID,
        added: addedField
    }

    type dateInputField{
        dates: String,
        times: String
    }

    type priceFieldProjection{
        price:String
    }
    type addedFieldprojection{
        added:priceFieldProjection
    }
    type titleFieldProjection{
        title: String
    }

    type favBooksGet{
        _id: ID
        name: String,
        user_id: ID,
        bookFav: [bookFavField],
        priceConvert: Int,
        priceBenefit: Int,
        date_input: [dateInputField]
        book_collections: [titleFieldProjection]
    }

    type bookfavPaginate{
        book_purchased: [favBooksGet],
        info_page: [infoPage]
    }
    
    type responseGetFav{
        message: String,
        book_data: bookfavPaginate
    }

    #end
    type Query {
        hello: String,
        GetbookPurchased(data: booksPagination): responseGetBooks,
        GetbookSelf(data: booksPagination): responseGetFav,
        # bookPurchasedRelation: bookCollectionScheme
        test(name:String): [testField]
    }
    type Mutation{
        login(data: User): responseLogin,
        postBookPurchased(data: bodyBookPurchased): responsePostBookPurchased,
        putBookPurchased(data: bodyBookPurchased): responseunArrayBookPurchased,
        delBookPurchased(data: bodyBookPurchased): responseunArrayBookPurchased,
        postBookFav(data:bodyBookFav):responsePostBookFav
    }
`

module.exports = typeDefs;