const jwt = require('jsonwebtoken');
const authorization = require('../auth');
const exp = require('express');
const purchasingBook = require('../otherFunction')
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

api.get('/bookList', authorization, async(req, res) => {
    let {termOfCredit, stock, purchase, title, discount, tax} = req.body;
    res.status(200).send({
        message: await purchasingBook(books, termOfCredit, stock, purchase, title, discount, tax)
    })
})

module.exports = api;