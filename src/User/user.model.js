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
    role: {type:String, required:true}
})

userSchema.set('timestamps', true);

const userModel = mongoose.model('users', userSchema);

module.exports = {userModel}