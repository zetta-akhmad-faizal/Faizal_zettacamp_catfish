// const app = require('./config');
// const api = require('./src/views/app');

// app.use(api)
// app.use((req, res, next) => {
//     const allowedOrigins = ['http://localhost:3000', 'http://localhost:4000'];
//     const origin = req.headers.origin;
//     if (allowedOrigins.includes(origin)) {
//          res.setHeader('Access-Control-Allow-Origin', origin);
//          res.setHeader('Access-Control-Allow-Credentials', true)
//          res.setHeader('Authorization')
//     }
//     res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
//     next();
// });

// app.listen(8000)

let fs = require('fs').promises;

let app = async() => {
    // console.log('hila')
    // let rf = fs.readFileSync('./assets/data.txt', 'utf-8', async(err, data) => {
    //     if(err) return err;
    //     // let x = JSON.parse(data)
    //     // console.log(data)
    //     let x = await simple(data)
    //     // console.log(x.toString())
    //     console.log(x)
    //     return await data
    // })
    // console.log(rf)
    // return rf

    //fs.readFile
    let x = fs.readFile('./assets/data.txt').then(val => console.log(val.toString())).catch(err => err).finally(val => val)
    let simples = await simple(x)
    console.log(simples)
    return x
}
let simple = async(files) => {
    console.log(files.toString())
}
app()
// console.log(app())