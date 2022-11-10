const userResolve = require('./user.resolver');
const userTypeDefs = require('./user.typedefs');
const userLoader = require('./user.loader');
const {userModel} = require('./user.model')

module.exports = {userResolve, userTypeDefs, userLoader, userModel}