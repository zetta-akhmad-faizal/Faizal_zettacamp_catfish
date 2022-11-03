const {Query, typeDefs, Mutation} = require('./resolvers/index');
const {GraphQLScalarType, Kind} = require('graphql')

const resolvers = {
    Date: new GraphQLScalarType({
        name: 'Date',
        description: 'Date custom scalar type',
        parseValue(value) {
            return new Date(value); // value from the client
        },
        serialize(value) {
            return value.getTime(); // value sent to the client
        },
        parseLiteral(ast) {
            if (ast.kind === Kind.INT) {
                return parseInt(ast.value, 10); // ast value is always in string format
            }
        return null;
        },
    }),
    Query, Mutation
}

module.exports = {resolvers, typeDefs}