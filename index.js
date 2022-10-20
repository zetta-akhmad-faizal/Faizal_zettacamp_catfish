const app = require('./src/index');
const api = require('./src/views');

app.use(api)
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

app.listen(8000)