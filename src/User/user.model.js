const {Schema, mongoose} = require('mongoose');

const userSchema = new Schema({
    first_name: {type: String, required:true},
    last_name: {type:String, required:true},
    email: {
        type:String, 
        required:true,
        validate:{
            validator: (v) => {
                return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(v)
            }
        },
        unique: [true, "Email must be unique"]
    },
    password: {type:String, required:true},
    status: {type:String, default:"Active"},
    usertype: [
        {
            name: {type:String},
            view: {type:Boolean}
        }
    ]
})

userSchema.set('timestamps', true);

userSchema.virtual('transactions', {
    ref: 'transactions',
    localField: '_id',
    foreignField: 'user_id'
})

const userModel = mongoose.model('users', userSchema);

module.exports = {userModel}