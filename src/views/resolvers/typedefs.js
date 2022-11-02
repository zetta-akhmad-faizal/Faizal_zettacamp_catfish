const {gql} = require('apollo-server-express');

const typeDefs = gql`
    input User{
        email: String,
        password: String
    }

    input bodyBookPurchased{
        themeBook:String, 
        bookName: String, 
        stock: Int
    }

    type responseLogin{
        message: String
    }

    type responsePostBookPurchased{
        message: String,
        book_data: favBooksSchema
    }

    type addedField{
        date: String,
        time: String,
        stock: Int,
        price: String,
    }

    type bookFavSchema{
        book_id: ID,
        added: addedField
    }
    type dateInputField{
        dates: String,
        times: String
    }

    type favBooksSchema{
        _id: ID
        name: String,
        user_id: ID,
        bookFav: [bookFavSchema],
        priceConvert: Int,
        priceBenefit: Int,
        date_input: [dateInputField]
        book_collections: [titleFieldProjection]
    }

    type authorization{
        _id: ID,
        email: String,
        password: String
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
    input getBooksInput{
        page: Int,
        limit: Int,
    }

    type infoPage{
        _id:ID,
        count: Int
    }
    type bookPurchasedPagination{
        book_purchased: [favBooksSchema],
        info_page: [infoPage]
    }

    type responseGetBookPurchased{
        message: String,
        book_data: bookPurchasedPagination
    }

    type Query {
        hello: String,
        bookPurchasedDisplay(data: getBooksInput): responseGetBookPurchased
    }
    type Mutation{
        login(data: User): responseLogin,
        postBookPurchased(data: bodyBookPurchased): responsePostBookPurchased,
    }
`

module.exports = typeDefs;