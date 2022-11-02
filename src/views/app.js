const {purchasingBook, PromiseUnAwait, PromiseAwait, capitalize,PromiseAwaitCall, purchasingBooks, purchases} = require('../app');
const jwt = require('jsonwebtoken');
const {users, mybooks, bookself, myfavbooks} = require('../model/index');
const authorization = require('../utils/auth');
const exp = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config();

const api = exp.Router();

//mongodb day 7
//skip & limit + challenge about length document
api.get('/skipAndLimit', authorization, async(req, res) => {
    let {limit, page} = req.query;
    let skip; let offset; let message;let data;

    limit = parseInt(limit);
    page = parseInt(page);

    let queryAggregation = [];

    if(limit || page || limit === 0){
        skip = page > 0 ? ((page - 1) * limit) : 0;

        offset = (page - 1) * limit + 1;

        queryAggregation.push(
            {
                $facet: {
                  book_collections: [
                    { $sort: { title: 1} },
                    { $skip: skip },
                    { $limit: limit },
                  ],
                  info_page: [
                    { $group: { _id: null, count: { $sum: 1 }} },
                  ],
                },
              }
        )

        data = await bookself.aggregate(queryAggregation);
        message = `${offset} - ${skip+data[0].book_collections.length} datas of ${data[0].info_page[0].count}`;

    }else{
        queryAggregation.push({$sort: { title: 1 }});

        data = await bookself.aggregate(queryAggregation)
        message = `Data book collections ${data.length}`;
    }

    if(data.length < 1){
        res.status(400).send({
            status:400,
            message: "No data show"
        })
    }else{
        res.status(200).send({
            status: 200,
            message,
            data,
        })
    }
})

api.get("/groupAggregation", authorization, async(req, res) => {
    const data = await bookself.aggregate([
        {
            $group: {
                _id: {author_name: "$author"},
                total_book: {
                    $sum: 1
                }
            }
        },
        {
            $sort: {
                total_book: -1,
                "_id.author_name": 1
            }
        }
    ])

    res.status(200).send({
        status: 200,
        message: data
    })
})

api.get('/facet', authorization, async(req, res) => {
    const data = await myfavbooks.aggregate([
        {
          $lookup: {
              from: "bookselves",
              localField: "bookFav.book_id",
              foreignField: "_id",
              as: "book_collections"
          }  
        },
        {
            $facet: {
                "categorizedByBookFav": [
                    {
                        $unwind: "$bookFav"
                    },
                    {
                        $sortByCount: "$bookFav.added.price"
                    }
                ]
            }
        }
    ])

    res.status(200).send({
        status: 200,
        message: data
    })
})

//mongodb day 6
api.get('/sortAndLookup', authorization, async(req, res) => {
    const dataMyFavBooks = await myfavbooks.aggregate([
        {
            $lookup: {
                from: "users",
                localField: "user_id",
                foreignField: "_id",
                as: "user_admin"
            }
        },
        {
            $lookup: {
                from: "bookselves",
                localField: "bookFav.book_id",
                foreignField: "_id",
                as: "book_collections"
            }
        },
        {
            $sort: {
                priceConvert: -1
            }
        }
    ])
    
    res.status(200).send({
        status: 200,
        message: dataMyFavBooks
    })
})

api.get('/matchAndConcat', authorization, async(req, res) => {
    const {bookName} = req.body;

    const data = await bookself.findOne({title:bookName});
    if(!data){
        res.status(404).send({
            status:404,
            message: 'Data not found'
        })
    }else{
        const matchAndConcatVar = await myfavbooks.aggregate([
            {
                $match: {"bookFav.book_id":data._id}
            },
            {
                $project: {
                    bookFav: 1,
                    priceConvert: 1,
                    priceTotal: {
                        $concat: ["Rp ", {$toString: "$priceConvert"}, ".", "000"]
                    }
                }
            }
        ])

        res.status(200).send({
            status:200,
            message: matchAndConcatVar
        })
    }
})

//mongodb day 3 & 4 & 5
//create with utill map, update with push, and inserted data
api.post('/fav', authorization, async(req, res) => {
    let {themeBook, bookName, stock} = req.body;
    let themeBookCapitalized = capitalize(themeBook);

    const dateObj = new Date();

    let inputMyFavBook = await bookself.findOne({title:bookName});
    let checkMyFavBook = await myfavbooks.findOne({name: themeBookCapitalized})
    // console.log(checkMyFavBook)
    if(inputMyFavBook === null){
        res.status(404).send({
            status:404,
            message: 'Data not found'
        })
    }
    if(checkMyFavBook !== null){
        let arr = []
        for(let indexOf = 0; indexOf<checkMyFavBook.bookFav.length;indexOf++){
            let parser = parseFloat(checkMyFavBook.bookFav[indexOf].added.price.replace("Rp ", ""));
            arr.push(parser)
        }

        const updateVar = await myfavbooks.updateOne(
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
            }
        )
        res.status(201).send({
            status: 201, 
            message: 'Data is updated',
            desc: updateVar
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

        res.status(201).send({
            status:201,
            message: `Data is inserted`
        })
    }
})

api.put('/addField', authorization, async(req, res) =>{
    const {themeBook, stock} = req.body;
    let themeBookCapitalized = capitalize(themeBook);
    console.log(stock)
    if(themeBook === undefined|| stock === undefined){
        res.status(400).send({
            status:400,
            message: "Body request still empty"
        })
    }else{
        let checkMyFavBook = await myfavbooks.findOne({name: themeBookCapitalized});

        if(checkMyFavBook !== null){
            let addFieldOperation = await myfavbooks.aggregate([
                {
                    $addFields: {
                        priceBenefit: {
                            $multiply: ["$priceConvert", stock]
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        name: 1,
                        "bookFav.book_id": 1,
                        "bookFav.added.price":1,
                        priceConvert: 1,
                        priceBenefit: 1
                    }
                }
            ])

            res.status(200).send({
                status: 200,
                message: [...addFieldOperation, {stock}]
            })
        }else{
            res.status(404).send({
                status:404,
                message: 'Data is not found'
            })
        }
    }
})

api.get('/unwind', authorization, async(req, res) => {
    const data = await myfavbooks.aggregate([
        {
            $unwind: "$bookFav"
        },
        // {
        //     $lookup: {
        //         from: "bookselves",
        //         localField: "bookFav.book_id",
        //         foreignField: "_id",
        //         as: "book_collection"
        //     }
        // },
        // {
        //     $lookup: {
        //         from: "users",
        //         localField: "user_id",
        //         foreignField: "_id",
        //         as: "users"
        //     }
        // },
        // {
        //     $project: {
        //         user_id: 0,
        //         "bookFav.book_id": 0
        //     }
        // }
    ])

    res.status(200).send({
        status:200,
        message: data
    })
})

//array filter in bookFav
api.put('/fav-update', authorization, async(req, res) => {
    let {themeBook, oldBookName, newBookName} = req.body;
    let themeBookCapitalized = capitalize(themeBook);

    let dateUpdate = new Date();

    //checking in bookselves collection, what is there the book with title that i called
    let getMyOldBookList = await bookself.findOne({title:oldBookName});
    let getMyNewBookList = await bookself.findOne({title: newBookName});

    //check in fav_books collection, what is there the name of book's theme that i called
    let getMyFavBook = await myfavbooks.findOne({name: themeBookCapitalized});

    if(getMyFavBook===null || getMyOldBookList===null){
        res.status(404).send({
            status:404,
            message: 'Data not found'
        })
    }else{
        //for take ID in bookselves through fav_books collection
        let findIdOldBook = getMyFavBook.bookFav.find(val => val.book_id === getMyOldBookList._id)
        if(findIdOldBook !== null){
            let queryUpdate = await myfavbooks.updateOne(
                { name: themeBookCapitalized },
                { 
                    $set: { 
                        "bookFav.$[element]": {
                            book_id: getMyNewBookList._id,
                            added: {
                                date: dateUpdate.getDate().toString(),
                                time: `${dateUpdate.getHours()}:${dateUpdate.getMinutes()}:${dateUpdate.getSeconds()}`,
                            }
                        }
                    } 
                },
                { arrayFilters: [ { "element.book_id": getMyOldBookList._id } ], upsert: true }
            )

            res.status(201).send({
                status:201,
                message: 'Data is updated',
                desc: queryUpdate
            })
        }else{
            res.status(201).send({
                status:201,
                message: "Update failed"
            })
        }
        
    }
})

//array filter in date_input
api.put('/fav-update/:id', authorization, async(req, res) => {
    const {params:id, body} = req;
    const getIdofMyFavBook = mongoose.Types.ObjectId(id);

    const dateObj = new Date();

    let data = await myfavbooks.findById(getIdofMyFavBook);
    if(!data){
        res.status(404).send({
            status:404,
            message: 'Data not found'
        })
    }else{
        let updateVar = await myfavbooks.updateOne(
            { name: data.name  },
            { 
                $set: { 
                    name: body.themeBook,
                    "date_input.$[element]":{
                          dates: dateObj.getDate().toString(),
                          times:`${dateObj.getHours()}:${dateObj.getMinutes()}:${dateObj.getSeconds()}`
                      }
                  } 
            },
            { arrayFilters: [ { "element.dates": {$eq: data.date_input[0].dates} } ], upsert: true }
        )
        res.status(201).send({
            status:201,
            message: 'Data is updated',
            desc: updateVar
        })
    }
})

//filter data using elemMatch
api.get('/fav', authorization, async(req, res) =>{
    const {bookName} = req.body;

    let getDataBookList = await bookself.findOne({title: bookName});

    if(!getDataBookList){
        res.status(404).send({
            status:404,
            message: 'Data not found'
        })
    }else{
        const queryGet = await myfavbooks.find(
            {
                bookFav: {
                    $elemMatch: {
                        "book_id": getDataBookList._id
                    }
                }
            }
        )

        res.status(200).send({
            status: 201,
            message: queryGet
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