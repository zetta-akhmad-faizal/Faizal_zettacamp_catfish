// const {ApolloServer} = require('apollo-server-express');
// const {bookCollectionLoader, userCollectionLoader} = require('./src/utils/dataLoaders');
// const {resolvers, typeDefs} = require('./src/views/index');
// const authorization = require('./src/utils/auth');
// const api = require('./src/views/app');
// const app = require('./config');

// const server = new ApolloServer({typeDefs, resolvers, 
//     context: ({req}) => {
//         const auth = authorization(req);
//         return {
//             auth, bookCollectionLoader, userCollectionLoader
//         }
//     }});

// app.use(api);
// app.use((req, res, next) => {
//     const allowedOrigins = ['http://localhost:3000', 'http://localhost:4000'];
//     const origin = req.headers.origin;
//     if (allowedOrigins.includes(origin)) {
//          res.setHeader('Access-Control-Allow-Origin', origin);
//          res.setHeader('Access-Control-Allow-Credentials', true);
//          res.setHeader('Authorization');
//     }
//     res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
//     next();
// });

// server.start().then(res => {
//     server.applyMiddleware({ app, path: '/' });
//     app.listen({ port:8000 }, () => 
//         console.log(`🚀 Server ready at http://localhost:8000${server.graphqlPath}`)
//     );  
// });

const data = [
    {
        playlist: [
            {
                song_id: "63609da9f6f95e5d0d683d9d",
                duration: '0:04:23',
            },
            {
                song_id: "63609bd8ccdf64cc22f02bcb",
                duration: '0:04:23',
            }
        ],
        total_duration: {
            hours: 2,
            minutes: 3,
            seconds: 10
        }
    },
    {
        playlist: [
            {
                song_id: "63609bd8ccdf64cc22f02bcc",
                duration: '0:03:43',
            }
        ],
        total_duration: {
            hours: 1,
            minutes: 32,
            seconds: 18
        }
    },
]
const arr = []
data.map(({playlist}) => {
    const dataId = playlist.map(({song_id}) => {
        arr.push(song_id)
    })
    return dataId
})

console.log(arr)