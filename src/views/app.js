const jwt = require('jsonwebtoken');
const authorization = require('../auth');
const exp = require('express');
const bookList = require('../otherFunction')
const {users} = require('../../assets/user.json');
const {books} = require('../../assets/data.json');
const dotenv = require('dotenv');
dotenv.config();

const api = exp.Router();

api.post('/login', (req, res) => {
    const {email,password} = req.body;
    let checkUser = users.find((e) => e.email === email && e.password === password);
    if (!checkUser) {
        res.status(404).send({
            status: 404,
            message: 'User not found'
        })
    }

    let auth = jwt.sign({
        _id: checkUser.id
    }, process.env.SECRET_TOKEN, {
        expiresIn: '2h'
    })
    res.status(201).send({
        status: 201,
        message: auth
    })
})

api.get('/purchase', authorization, (req, res) => {
    const {title, stock, bookPurchased, termOfCredit} = req.body;
    if (bookPurchased > stock) {
        res.status(400).send({
            status: 400,
            message: "You can't order if our stock's limit"
        })
    } else if (termOfCredit > 12) {
        res.status(400).send({
            status: 400,
            message: 'In my notes, only 12 month for term of credit'
        })
    }
    let obj = bookList(books, title, stock, bookPurchased, termOfCredit);
    res.status(200).send(obj);
})

api.get('/bookList', authorization, (req, res) => {
    return res.status(200).send(books)
})

module.exports = api;