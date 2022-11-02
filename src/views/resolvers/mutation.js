const {users, bookself, myfavbooks} = require('../../model/index');
const { capitalize } = require('../../app');
const {GraphQLError} = require('graphql');
const {mongoose} = require('mongoose');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
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
    postBookPurchased: async(parent, {data:{themeBook, bookName, stock}}, ctx) => {
        console.log(themeBook)
        if (ctx.user.length === 0){
            return {
                message: "User unAuthorized"
            }
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
    },
}

module.exports = Mutation;