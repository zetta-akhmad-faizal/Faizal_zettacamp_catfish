const {Query, typeDefs, Mutation} = require('./resolvers/index');
const {GraphQLScalarType, Kind} = require('graphql');

const getBookCollection = async(parent, args, ctx) => {
    // console.log(parent.book_collections)
    // const test = await ctx.bookCollectionLoader.load(parent.book_collections);
    const dataId = parent.book_collections.map((val) => val._id)
    // console.log(await ctx.bookCollectionLoader._batchLoadFn(parent.book_collections))
    if(parent.book_collections){
        return await ctx.bookCollectionLoader.load(dataId)
    }
}

const getUserID = async(parent, args, ctx) => {
    if(parent.user_id !== null){
        return await ctx.userCollectionLoader.load([parent.user_id])
    }
}

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
    Query, 
    Mutation,
    bookPurchasedRelation:{
        book_collections: getBookCollection
    },
    testField: {
        user_id: getUserID
    }
}

module.exports = {resolvers, typeDefs}