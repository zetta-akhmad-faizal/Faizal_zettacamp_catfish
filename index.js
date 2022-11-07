const {ApolloServer, gql} = require('apollo-server-express');
const {applyMiddleware} = require('graphql-middleware');
const {makeExecutableSchema} = require('@graphql-tools/schema');
const {merge} = require('lodash');
const userAuth = require('./src/utils/auth');
const app = require('./src/views/index');

const userLoader = require('./src/views/User/user.loader');
const songLoader = require('./src/views/Song/song.loader');

const {songResolver, songTypeDefs}= require('./src/views/Song/song.index');
const {playlistResolver, playlistTypeDefs} = require('./src/views/Playlist/playlist.index');
const {userResolver, userTypedefs} = require('./src/views/User/user.index');

const typeDef = gql `
    type Query,
    type Mutation
`;
const typeDefs = [
    typeDef,
    userTypedefs,
    songTypeDefs,
    playlistTypeDefs
];

let resolvers = {}
resolvers = merge(
    resolvers,
    userResolver,
    songResolver,
    playlistResolver
);

let auth = {};
auth = merge(
    userAuth
)
const executableSchema = makeExecutableSchema({typeDefs,resolvers});
const protectedSchema = applyMiddleware(executableSchema, auth);

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
            userLoader,
            songLoader
        }
    }
})

server.start().then(res => {
    server.applyMiddleware({
        app
    });
    app.listen(8000, () => {
        console.log(`App running in port ${8000}`);
    });
});