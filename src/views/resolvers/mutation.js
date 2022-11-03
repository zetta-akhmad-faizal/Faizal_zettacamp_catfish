const {users, mybooks} = require('../../model/index');
const { purchases } = require('../../app');
const {ApolloError} = require('apollo-server-express')
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
        if(ctx.user.length === 0){
            throw new ApolloError('UnAuthorized')
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
        if(ctx.user.length === 0){
            throw new ApolloError('UnAuthorized')
        }

        if(!discount || !tax || !id){
            return {
                message: "Field isn't complex"
            }
        }

        const book_id = mongoose.Types.ObjectId(id);

        const bookCollection = await mybooks.findById(book_id)

        let disc = parseFloat(discount.replace('Rp ', ''));
        let taxAmnesty = parseFloat(tax.replace('Rp ', ''));
        const price = parseFloat(bookCollection.price.replace('Rp ', ''));
        const admin = parseFloat(bookCollection.adminPayment.replace('Rp ', ''));
        const afterDiscount = price - disc;
        const afterTax = afterDiscount + taxAmnesty;
        const total = admin + afterTax;

        const queries = await mybooks.findOneAndUpdate(
            {_id: book_id},
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
        if(ctx.user.length === 0){
            throw new ApolloError('UnAuthorized')
        }

        if(!id){
            return {
                message: "Field isn't complex"
            }
        }

        const book_id = mongoose.Types.ObjectId(id);
        const queries = await mybooks.findOneAndDelete(book_id);

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
    }   
}

module.exports = Mutation;