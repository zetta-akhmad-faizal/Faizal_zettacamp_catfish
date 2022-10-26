const {purchasingBook, PromiseUnAwait, PromiseAwait, capitalize,PromiseAwaitCall, purchasingBooks, purchases} = require('../app');
const jwt = require('jsonwebtoken');
const {users, mybooks, bookself, myfavbooks} = require('../model/index');
const authorization = require('../utils/auth');
const exp = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config();

const api = exp.Router();

//mongodb day 3 & 4
//create with utill map
api.post('/fav', authorization, async(req, res) => {
    let {themeBook, bookName} = req.body;
    let themeBookCapitalized = capitalize(themeBook);

    const dateObj = new Date();

    let inputMyFavBook = await bookself.findOne({title:bookName});

    if(inputMyFavBook===null){
        res.status(404).send({
            status:404,
            message: 'Data not found'
        })
    }else{
        const mapMyBooks = {
            name: themeBookCapitalized,
            user_id: mongoose.Types.ObjectId(req.user._id),
            bookFav: [
                {
                    book_id: inputMyFavBook._id,
                    added: {
                        date: dateObj.getDate().toString(),
                        time: `${dateObj.getHours()}:${dateObj.getMinutes()}:${dateObj.getSeconds()}`,
                        stock: inputMyFavBook.stock
                    }
                }
            ],
            date_input: [
                {date: dateObj.getDate().toString()},
                {time: `${dateObj.getHours()}:${dateObj.getMinutes()}:${dateObj.getSeconds()}`}
            ]
        }
        const obj = new myfavbooks(mapMyBooks)
        await obj.save()
        res.status(201).send({
            status:201,
            message: `Data is inserted`
        })
    }
})

api.put('/fav-update', authorization, async(req, res) => {
    let {themeBook, bookName} = req.body;
    let themeBookCapitalized = capitalize(themeBook);

    let dateUpdate = new Date();

    //checking in bookselves collection, what is there the book with title that i called
    let getMyBookList = await bookself.findOne({title:bookName});

    //check in fav_books collection, what is there the name of book's theme that i called
    let getMyFavBook = await myfavbooks.findOne({name: themeBookCapitalized});

    if(getMyFavBook===null || getMyBookList===null){
        res.status(404).send({
            status:404,
            message: 'Data not found'
        })
    }else{
        //for take ID in bookselves through fav_books collection
        let getMyIdFavBook = await bookself.findById(getMyFavBook.bookFav[0].book_id);
        let queryUpdate = await myfavbooks.updateOne(
            { name: themeBookCapitalized },
            { 
                $set: { 
                    "bookFav.$[element]": {
                        book_id: getMyBookList._id,
                        added: {
                            date: dateUpdate.getDate().toString(),
                            time: `${dateUpdate.getHours()}:${dateUpdate.getMinutes()}:${dateUpdate.getSeconds()}`,
                            stock: getMyFavBook.bookFav[0].added.stock
                        }
                    }
                } 
            },
            { arrayFilters: [ { "element.book_id": getMyIdFavBook._id } ], upsert: true }
        )
        res.status(201).send({
            status:201,
            message: 'Data is updated',
            desc: queryUpdate
        })
    }

})

//get based on id with iterator in
api.get('/fav/:id', authorization, async(req, res) => {
    const {params} = req;
    const book_id = mongoose.Types.ObjectId(params.id);
    const mapData = new Map();

    let MyBookList = await bookself.findOne({_id: book_id});

    if(MyBookList === null){
        res.status(404).send({
            status:404,
            message: 'Data not found'
        })
    }else{
        let myFavQuery = await myfavbooks.find({
            bookFav: {
                $in: [book_id]
            }
        }).populate('user_id')

        mapData.set('myFavCollection', myFavQuery);
        mapData.set('bookInCollection', MyBookList);

        res.status(200).send({
            status:200,
            message: Object.fromEntries(mapData)
        })
    }
})

//get data with iterator match
api.get('/favByUser/:user', authorization, async(req,res) => {
    const {params} = req;
    let data = await myfavbooks.aggregate([
        {$lookup: {
                from: 'users',
                localField: 'user_id',
                foreignField: '_id',
                as: 'myrelate'
            }
        },
        {$unwind: '$myrelate'},
        {$match: {
            'myrelate.email': params.user
            }
                
        }
    ])
    if(data.length === 0){
        res.status(404).send({
            status:404,
            message: 'Data not found'
        })
    }else{
        res.status(200).send({
            status: 200,
            message: data
        })
    }
})

//update
api.put('/fav/:id', authorization, async(req, res) => {
    const {params} = req;
    const book_id = mongoose.Types.ObjectId(params.id);
    const selectVar = await myfavbooks.find({
        bookFav: {
            $in: [book_id]
        }
    })
    if(selectVar.length === 0){
        res.status(404).send({
            status:404,
            message: 'Data not found'
        })
    }else{
        const updateVar = await myfavbooks.updateOne({
                bookFav: {
                    $in: [book_id]
                }
            }, {
                $set: {
                    'type.0.reason': 'The book only a little people that interested'
                }
            }
        )
        res.status(201).send({
            status:201,
            message: 'Data is updated',
            desc: updateVar
        })
    }
})

//delete
api.delete('/favByUser/:user', authorization, async(req,res) => {
    const {params} = req;
    const dataUser = await users.findOne({email: params.user});
    if(dataUser === null){
        res.status(404).send({
            status:404,
            message: 'Data not found'
        })
    }else{
        const deleteVar = await myfavbooks.deleteMany({user_id: dataUser._id});
        res.status(201).send({
            status:201,
            message: 'Data is deleted',
            desc: deleteVar
        })
    }
})

//filter with elemMatch
api.get('/favByUser', authorization, async(req, res) =>{
    const data = await myfavbooks.find({
        type: {
            $elemMatch: {levels: req.body.levels}
        }
    })
    if(data.length === 0){
        res.status(404).send({
            status:404,
            message: 'Data not found'
        })
    }else{
        res.status(200).send({
            status:200,
            message: data
        })
    }
})

//additional
api.get('/additional/:id', authorization, async(req, res) => {
    const {params} = req;
    const book_id = mongoose.Types.ObjectId(params.id);

    const data = await myfavbooks.findById(book_id);

    if(data === null){
        res.status(404).send({
            status:404,
            message: 'Data not found'
        })
    }else{
        res.status(200).send({
            status:200,
            message: data
        })
    }
})


//mongodb day 2
//use mongo db as data storage
api.post('/login', async(req, res) => {
    const {email,password} = req.body;

    let checkUser = await users.findOne({email, password});
    
    if (!checkUser) {
        res.status(404).send({
            status: 404,
            message: 'User not found'
        })
    }else{
        let auth = jwt.sign({
            _id: checkUser._id
        }, process.env.TOKEN_SECRET, {
            expiresIn: '2h'
        });
        res.status(201).send({
            status: 201,
            message: auth
        })
    }
})

api.post('/move', async(req, res) => {
    const data = await PromiseAwaitCall();
    data.map(val => {
        let obj = new bookself(val);
        obj.save();
        return obj;
    })
    res.status(201).send({
        status:201,
        message: "OK"
    })
})

api.get('/purchases', authorization, async(req, res) => {
    const data = await mybooks.find({}).populate('user_id')
    res.status(200).send({
        status: 200,
        message: data
    })
})

api.get('/purchases/:id', authorization, async(req, res) => {
    const {params} = req;
    const book_id = mongoose.Types.ObjectId(params);
    const data = await mybooks.findOne({_id: book_id}).populate('user_id');
    
    if(data === null){
        res.status(404).send({
            status: 404,
            message: `ObjectID ${book_id} unknown`
        })
    }else{
        res.status(200).send({
            status: 200,
            message: data
        })
    }
})

api.put('/purchases/:id', authorization, async(req, res) => {
    const {params} = req;
    let {discount, tax} = req.body;

    const book_id = mongoose.Types.ObjectId(params);
    const data = await mybooks.findOne({_id: book_id});

    let disc = parseFloat(discount.replace('Rp ', ''));
    let taxAmnesty = parseFloat(tax.replace('Rp ', ''));

    if(data === null){
        res.status(404).send({
            status: 404,
            message: `Object ${book_id} unknown, data can't be updated`
        })
    }else{
        const price = parseFloat(data.price.replace('Rp ', ''));
        const admin = parseFloat(data.adminPayment.replace('Rp ', ''));
        const afterDiscount = price - disc;
        const afterTax = afterDiscount + taxAmnesty;
        const total = admin + afterTax;

        const update = await mybooks.updateOne({_id: book_id},{"$set":{
            discount: `${discount}`, 
            tax: `${tax}`, 
            afterDiscount: `Rp ${afterDiscount.toFixed(3)}`,
            afterTax: `Rp ${afterTax.toFixed(3)}`,
            total: `Rp ${total.toFixed(3)}`
        }});

        res.status(201).send({
            status: 201,
            message: `Data ObjectID ${book_id} is updated`
        })
    }
})

api.delete('/purchases/:id', authorization, async(req, res) => {
    const {params} = req;
    const book_id = mongoose.Types.ObjectId(params);
    const data = await mybooks.findOne({_id: book_id}).populate('user_id');

    if(data === null){
        res.status(404).send({
            status:404,
            message: `Object ${book_id} isn't found`
        })
    }else{
        const deleteOne = await mybooks.deleteOne({_id: book_id});
        res.status(201).send({
            status: 201,
            message: `Object ${book_id} is deleted`
        })
    }
})

api.post('/purchases', authorization, async(req, res) => {
    let {termOfCredit, stock, purchase, title, discount, tax, additional} = req.body;
    const obj = await purchases(termOfCredit, stock, purchase, discount, tax, additional, title)
    try{
        const insert = obj.map(val => {
            let {...data} = val
            const insertVar = new mybooks({...data, user_id:req.user})
            insertVar.save()
            return insertVar
        })
        res.status(201).send({
            message: obj
        })
    }catch(e){
        res.status(400).send({
            status:400,
            message: "Please check your body request"
        })
    }
})

api.delete('/purchases', authorization, async(req, res) => {
    const deleteAll = await mybooks.deleteMany({});
    res.status(201).send({
        status:201,
        message: "OK all deleted"
    })
})
// api.post('/books', authorization, async(req, res) => {
//     let obj = await PromiseAwaitCall();
//     obj.map((val) => {
//         let {...data} = val
//         let transform = new mybooks({...data, user_id: req.user});
//         return transform.save()
//     })
//     res.status(200).send({
//         status: 200,
//         message: `${obj.length} data is saved on mongodb`
//     })
// })


//use file local
api.post('/bookList', authorization, async(req, res) => {
    let {termOfCredit, stock, purchase, title, discount, tax} = req.body;
    let data = await purchasingBooks(termOfCredit, stock, purchase, title, discount, tax);
    res.status(200).send({
        message: data
    })
})

api.get('/promiseUnAwait', authorization, (req, res) => {
    let promiseVar = new Promise(PromiseUnAwait);
    promiseVar.then(val => {
        res.status(200).send({
            status: 200,
            message: JSON.parse(val)
        })
    }).catch(err => {
        res.status(400).send({
            status: 400,
            message: err
        })
    })
})

api.get('/promiseAwait', authorization, async(req, res) => {
    let obj = await PromiseAwaitCall();
    if(obj.status === 400){
        res.status(400).send(obj)
    }
    res.status(200).send({
        status: 200,
        message: obj
    })
})

api.post('/MapSet', authorization, async(req, res) => {
    let {termOfCredit, stock, purchase, title:[...ordered], discount, tax, additional} = req.body;
    let data = await purchasingBook(termOfCredit, stock, purchase, discount, tax, additional, ordered);
    res.send({
        message: data
    })
})

module.exports = api;