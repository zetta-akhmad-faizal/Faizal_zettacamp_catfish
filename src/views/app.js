const {purchasingBook, PromiseUnAwait, PromiseAwait, PromiseAwaitCall, purchasingBooks, purchases} = require('../app');
const jwt = require('jsonwebtoken');
const {users, mybooks} = require('../model/index');
const authorization = require('../utils/auth');
const exp = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config();

const api = exp.Router();

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

        const update = await mybooks.updateOne({_id: book_id},{
            discount: `${discount}`, 
            tax: `${tax}`, 
            afterDiscount: `Rp ${afterDiscount.toFixed(3)}`,
            afterTax: `Rp ${afterTax.toFixed(3)}`,
            total: `Rp ${total.toFixed(3)}`
        });
        res.status(201).send({
            status: 201,
            message: update
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
            message: deleteOne
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