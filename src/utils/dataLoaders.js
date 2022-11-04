const DataLoader = require('dataloader');
const {bookself, users} = require('../model/index')

let bookCollection = async(bookId) => {
    const books = await bookself.find({
        _id: {
            $in: bookId
        }
    })
    const obj = {};
    books.forEach((val) => {
        obj[val._id] = val;
    })

    // console.log(bookId)
    return bookId.map((val) => obj[val._id]);
}

let userCollection = async(userId) => {
    const user = await users.find({
        _id: {
            $in: userId
        }
    })
    const obj = {};
    user.forEach((val) => {
        obj[val._id] = val;
    })
    return userId.map((_id) => obj[_id]);
}

const bookCollectionLoader = new DataLoader(bookCollection);
const userCollectionLoader = new DataLoader(userCollection);
module.exports = {bookCollectionLoader, userCollectionLoader};