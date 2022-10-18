// let fs = require('fs'); //for readfilesync
let fs = require('fs').promises

let app = async() => {
    // console.log('hila')
    // let rf = fs.readFileSync('./assets/data.txt', 'utf-8', async(err, data) => {
    //     if(err) return err;
    //     let x = await simple(data)
    //     return x
    // })
    // console.log(rf)
    // return rf

    //fs.readFile
    let x = fs.readFile('./assets/data.txt').then(val => console.log(val.toString())).catch(err => err).finally(val => val)
    let simples = await simple(x)
    console.log(simples)
}
let simple = async(files) => {
    console.log(files.toString())
}
app()