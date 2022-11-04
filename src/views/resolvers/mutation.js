const {users, mybooks, myfavbooks, bookself} = require('../../model/index');
const { purchases, capitalize } = require('../../app');
const {GraphQLError} = require('graphql')
const {mongoose} = require('mongoose');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const e = require('express');
dotenv.config();

const Mutation = {
    login: async(parent, {data:{email, password}}) => {
        let checkUser = await users.findOne({email, password});
    
        if (!checkUser) {
            return {
                message: 'User not found'
            }
        }else{
            let auth = jwt.sign({
                _id: checkUser._id
            }, process.env.TOKEN_SECRET, {
                expiresIn: '2h'
            });
            return {
                message: auth
            }
        }
    },
    postBookPurchased: async(parent, {data:{termOfCredit, stock, purchase, title, discount, tax, additional}}, ctx) => {
        const {user} = await ctx.auth
        if(user._id === null || user.length === 0){
            // throw new ApolloError('UnAuthorized')
            throw new GraphQLError("UnAuthorized", {
                extensions: { code: 401 },
            });
        }
        
        try{
            const obj = await purchases(termOfCredit, stock, purchase, discount, tax, additional, title)
            const queries = obj.map(val => {
                let {...data} = val
                const insertVar = new mybooks({...data, user_id:ctx.user._id})
                insertVar.save()
                return insertVar
            })
        if(queries.length === 0){
            return {message: "Data isn't inserted", data_book_purchased: queries}
        }else{
            return {message: "Data is inserted", data_book_purchased: queries}
        }
        }catch(err){
            throw new ApolloError(`Field isn't complex`)
        }
    },
    putBookPurchased: async(parent, {data: {id, discount, tax}}, ctx) => {
        const {user} = await ctx.auth
        if(user._id === null || user.length === 0){
            // throw new ApolloError('UnAuthorized')
            throw new GraphQLError("UnAuthorized", {
                extensions: { code: 401 },
            });
        }

        if(!discount || !tax || !id){
            return {
                message: "Field isn't complex"
            }
        }

        const book_id = mongoose.Types.ObjectId(id);

        const bookCollection = await mybooks.aggregate([
            {
                $match: {
                    book_id
                }
            },
            {
                $lookup: {
                    from: 'bookselves',
                    localField: 'book_id',
                    foreignField: '_id',
                    as: 'book_collections'
                }
            }
        ])
        // console.log(bookCollection)
        let disc = parseFloat(discount.replace('Rp ', ''));
        let taxAmnesty = parseFloat(tax.replace('Rp ', ''));
        const price = parseFloat(bookCollection[0].book_collections[0].price.replace('Rp ', ''));
        const admin = parseFloat(bookCollection[0].adminPayment.replace('Rp ', ''));
        const afterDiscount = price - disc;
        const afterTax = afterDiscount + taxAmnesty;
        const total = admin + afterTax;

        const queries = await mybooks.findOneAndUpdate(
            {book_id: book_id},
            {
                $set :{
                    discount: `${discount}`, 
                    tax: `${tax}`, 
                    afterDiscount: `Rp ${afterDiscount.toFixed(3)}`,
                    afterTax: `Rp ${afterTax.toFixed(3)}`,
                    total: `Rp ${total.toFixed(3)}`
                }
            },
            {
                new: true
            }
        );
        console.log(queries)
        if(!queries){
            return {
                message: "Data isn't updated because the data's not found",
                data_book_purchased: queries
            }
        }else{
            return {
                data_book_purchased: queries,
                message: "Data is updated"
            }
        }
    },
    delBookPurchased: async(parent, {data: {id}}, ctx) => {
        const {user} = await ctx.auth
        if(user._id === null || user.length === 0){
            // throw new ApolloError('UnAuthorized')
            throw new GraphQLError("UnAuthorized", {
                extensions: { code: 401 },
            });
        }

        if(!id){
            return {
                message: "Field isn't complex"
            }
        }

        const book_id = mongoose.Types.ObjectId(id);
        const queries = await mybooks.findOneAndDelete({book_id});
        console.log(queries)
        if(!queries){
            return {
                message: "Data isn't deleted because the data's not found",
                data_book_purchased: queries
            }
        }else{
            return {
                message: "Data is deleted",
                data_book_purchased: queries
            }
        }
    },
    postBookFav: async(parent, {data:{themeBook, bookName, stock}}, ctx) => {
        const {user} = await ctx.auth
        if(user._id === null || user.length === 0){
            // throw new ApolloError('UnAuthorized')
            throw new GraphQLError("UnAuthorized", {
                extensions: { code: 401 },
            });
        }

        let themeBookCapitalized = capitalize(themeBook);
    
        const dateObj = new Date();
    
        let inputMyFavBook = await bookself.findOne({title:bookName});
        let checkMyFavBook = await myfavbooks.findOne({name: themeBookCapitalized})
        // console.log(checkMyFavBook)
        if(inputMyFavBook === null){
            return{
                message: 'Data not found'
            }
        }
        if(checkMyFavBook !== null){
            let arr = []
            for(let indexOf = 0; indexOf<checkMyFavBook.bookFav.length;indexOf++){
                let parser = parseFloat(checkMyFavBook.bookFav[indexOf].added.price.replace("Rp ", ""));
                arr.push(parser)
            }
            
            const updateVar = await myfavbooks.findOneAndUpdate(
                {name: themeBookCapitalized},{
                    $push: {
                        bookFav: {
                            book_id: inputMyFavBook._id,
                            added: {
                                date: dateObj.getDate().toString(),
                                time: `${dateObj.getHours()}:${dateObj.getMinutes()}:${dateObj.getSeconds()}`,
                                stock,
                                price: inputMyFavBook.price
                            }
                        }
                    },
                    $set: {
                        priceConvert: arr.reduce((accumVariable, curValue) => accumVariable+curValue)
                    }
                },
                {new: true}
            )
            return {
                message: 'Data is updated',
                book_data: updateVar
            }
        }else{
            const mapMyBooks = {
                name: themeBookCapitalized,
                user_id: mongoose.Types.ObjectId(ctx._id),
                bookFav: [
                    {
                        book_id: inputMyFavBook._id,
                        added: {
                            date: dateObj.getDate().toString(),
                            time: `${dateObj.getHours()}:${dateObj.getMinutes()}:${dateObj.getSeconds()}`,
                            stock,
                            price: inputMyFavBook.price
                        }
                    }
                ],
                priceConvert: parseInt(inputMyFavBook.price.replace("Rp ", "")),
                date_input: [
                    {
                        dates: dateObj.getDate().toString(),
                        times: `${dateObj.getHours()}:${dateObj.getMinutes()}:${dateObj.getSeconds()}`
                    }
                ]
            }
    
            const obj = new myfavbooks(mapMyBooks)
            await obj.save()
    
            return{
                message: `Data is inserted`,
                book_data: obj
            }
        }
    }   
}

module.exports = Mutation;