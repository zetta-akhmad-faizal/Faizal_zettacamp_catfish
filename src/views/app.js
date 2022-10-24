const {purchasingBook, PromiseUnAwait, PromiseAwait, PromiseAwaitCall, purchasingBooks, purchases} = require('../app');
const jwt = require('jsonwebtoken');
const {users, mybooks} = require('../model/index');
const authorization = require('../utils/auth');
const exp = require('express');
const dotenv = require('dotenv');
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

api.post('/purchases', authorization, async(req, res) => {
    let {termOfCredit, stock, purchase, title, discount, tax, additional} = req.body;
    const obj = await purchases(termOfCredit, stock, purchase, discount, tax, additional, title)
    const insert = obj.map(val => {
        let {...data} = val
        const insertVar = new mybooks({...data, user_id:req.user})
        insertVar.save()
        return insertVar
    })
    res.status(200).send({
        message: insert
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