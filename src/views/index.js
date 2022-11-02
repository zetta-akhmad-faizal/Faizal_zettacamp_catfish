const {Query, typeDefs, Mutation} = require('./resolvers/index')

const resolvers = {
    Query, Mutation
}

module.exports = {resolvers, typeDefs}