const {userModel} = require('../../models/index');

const loginResolver = async(parent, args) => {}
const updateUser = async(parent, args, ctx) => {}
const insertUser = async(parent, args, ctx) => {}

module.exports = {
    Mutation: {
        loginResolver,
        updateUser,
        insertUser
    }
}