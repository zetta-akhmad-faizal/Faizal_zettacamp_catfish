const {mongoose, Schema} = require('mongoose');

const transactionSchema = new Schema({
    user_id: {type:mongoose.Schema.Types.ObjectId, ref: 'users'},
    menu: [
        {
            recipe_id: {type:mongoose.Schema.Types.ObjectId, ref: 'recipes'},
            amount: {type: Number},
            note: {type: String}
        }
    ],
    order_status: {type: String},
    order_date: {type: Date},
    status: {type: String, default: "Active"}
})

const transactionModel = mongoose.model('transactions', transactionSchema);

module.exports = {transactionModel}