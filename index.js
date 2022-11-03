const {ApolloServer} = require('apollo-server-express');
const {resolvers, typeDefs} = require('./src/views/index');
const authorization = require('./src/utils/auth');
const api = require('./src/views/app');
const app = require('./config');

const server = new ApolloServer({typeDefs, resolvers, 
    context: ({req}) => {
        const auth = authorization(req);
        return auth
    }});

app.use(api);
app.use((req, res, next) => {
    const allowedOrigins = ['http://localhost:3000', 'http://localhost:4000'];
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
         res.setHeader('Access-Control-Allow-Origin', origin);
         res.setHeader('Access-Control-Allow-Credentials', true);
         res.setHeader('Authorization');
    }
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

server.start().then(res => {
    server.applyMiddleware({ app, path: '/' });
    app.listen({ port:8000 }, () => 
        console.log(`🚀 Server ready at http://localhost:8000${server.graphqlPath}`)
    );  
});