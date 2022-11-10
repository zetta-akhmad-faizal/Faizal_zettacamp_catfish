//module
const {ApolloServer, gql} = require('apollo-server-express');
const {applyMiddleware} = require('graphql-middleware');
const {makeExecutableSchema} = require('@graphql-tools/schema');
const {merge} = require('lodash');
const {mongoose} = require('mongoose');
const exp = require('express');
const dotenv = require('dotenv');
dotenv.config()

//auth
const Authorization = require('./middleware/auth');

let auth = {}
auth = merge(Authorization)

//user folder
const {userResolve, userTypeDefs, userLoader} = require('./src/User/user.index');

//ingredient folder
const {ingredientTypeDefs, ingredientResolve, ingredientLoader} = require('./src/Ingredients/ingredient.index');

//recipe folder
const {recipeTypeDefs, recipeResolver, recipeLoader} = require('./src/Receipe/recipe.index');

//transaction folder
const {transactionResolver, transactionTypeDefs} = require('./src/Transaction/transaction.index');

//express
const app = exp()
app.use((req, res, next) => {
    const allowedOrigins = ['http://localhost:8000', 'http://localhost:4000'];
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
         res.setHeader('Access-Control-Allow-Origin', origin);
         res.setHeader('Access-Control-Allow-Credentials', true);
         res.setHeader('Authorization');
    }
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

//mongodb setup
mongoose.connect(process.env.MONGO_URI).then(() => console.log("Database connect")).catch((err) => console.log("Database disconnected"))

//typedefs
const typeDef = gql`
    type Query
    type Mutation
`
const typeDefs = [
    typeDef,
    userTypeDefs,
    ingredientTypeDefs,
    recipeTypeDefs,
    transactionTypeDefs
]

//resolver
let resolvers = {};
resolvers = merge(
    resolvers,
    userResolve,
    ingredientResolve,
    recipeResolver,
    transactionResolver
)

//middleware
const executeTableScheme = makeExecutableSchema({typeDefs, resolvers});
const protectedSchema = applyMiddleware(executeTableScheme, auth)

//server graphql
const server = new ApolloServer({
    schema: protectedSchema,
    typeDefs,
    resolvers,
    context: function ({
        req
    }) {
        req
        return {
            req,
            ingredientLoader,
            userLoader,
            recipeLoader
        }
    }
})

//server start
let port = process.env.PORT
server.start().then(res => {
    server.applyMiddleware({app})
    app.listen(port, ()=> {
        console.log(`App running on ${port}`)
    })
})
