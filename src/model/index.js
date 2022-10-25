const {mongoose, Schema} = require('./app');
const validator = require('validator')

mongoose.connect("mongodb://127.0.0.1:27017/zettacampDB").then(() => console.log('connect')).catch((err) => console.log(err))

const userSchema = new Schema({
    email: {type: String, required: true,},
    password: {type: String, required: true,trim:true, minlength: 8},
})

const bookSchema = new Schema({
    image: {type:String},
    title: {type:String},
    author: {type:String},
    price: {type:String},
    original_url: {type:String},
    url: {type:String},
    slug: {type:String},
    discount: {type:String},
    tax: {type: String},
    afterDiscount: {type:String},
    afterTax: {type:String},
    adminPayment: {type:String},
    additional: {type:String},
    total: {type:String},
    stock: {type:String},
    purchase: {type:Number},
    remain: {type:Number},
    termOfCredit: {type:String},
    monthly: [{type:String}],
    monthPaid: [{type:String}],
    user_id: {type:mongoose.Schema.Types.ObjectId, required:true, trim:true, ref:'users'},
    createdAt: Date,
    updateAt: Date
});

const bookSelf = new Schema({
    image: {type:String},
    title: {type:String},
    author: {type:String},
    price: {type:String},
    original_url: {type:String},
    url: {type:String},
    slug: {type:String},
    createdAt: Date,
    updateAt: Date
});

const bookFav = new Schema({
    type: [{
        levels: {type: String},
        reason: {type: String}
    }],
    user_id: {type:mongoose.Schema.Types.ObjectId, required:true, trim:true, ref:'users'},
    bookFav: [{type: mongoose.Schema.Types.ObjectId}]
})

bookSchema.set("timestamps", true);
bookSelf.set('timestamps', true);
bookFav.set('timestamps', true);

userSchema.virtual('booklist', {
    ref: 'booklist',
    localField: '_id',
    foreignField: 'user_id'
})

userSchema.virtual('fav_books', {
    ref:'fav_books',
    localField: '_id',
    foreignField: 'user_id'
})

const users = mongoose.model('users', userSchema);
const mybooks = mongoose.model('booklist', bookSchema);
const bookself = mongoose.model('bookself', bookSelf);
const myfavbooks = mongoose.model('fav_books', bookFav);

module.exports = {users, mybooks, bookself, myfavbooks};