let fs = require('fs');

let month = {
    'january': 1, 'febuary': 2, 'march':3, 'april':4, 'may':5, 'june':6, 
    'july':7, 'august':8, 'september':9, 'october':10, 'november':11, 'desember':12
};

let purchasingBook = async(bookList, termOfCredit, stockBook, purchase, title, discount, taxAmnesty) => {
    try{
        let getPrice; let AfterDiscount;let AfterTax;
        let disc = parseFloat(discount.replace('Rp ', ''));
        let tax = parseFloat(taxAmnesty.replace('Rp ', ''));
        let [monthOfCredit, stock, remain] = await calculateCredit(termOfCredit, stockBook, purchase);
        let books = bookList.map(e => {
            e.tax = taxAmnesty;
            e.discount = discount;
            getPrice = parseFloat(e.price.replace('Rp ', ''));
            AfterDiscount = getPrice - disc;
            AfterTax = AfterDiscount + tax;
            e.afterDiscount = `Rp ${AfterDiscount.toFixed(3)}`;
            e.AfterTax = `Rp ${AfterTax.toFixed(3)}`;
            e.stock = stockBook;
            if(e.title === title){
                e.monthly = monthOfCredit;   
                e.purchase = purchase;
                e.remain = remain;
                e.stock = stock;
                e.termOfCredit = `${termOfCredit} months`
                e.monthPaid = `Rp ${(AfterTax/termOfCredit).toFixed(3)}/monthly`;
            }
            return e
        })
        return books
    }catch(e){
        return "The required field is empty"
    }
}

let calculateCredit = async(termOfCredit, stock, purchase) => {
    let monthOfCredit = Object.keys(month).filter(m => month[m] <= termOfCredit);
    let textOver = `Stock only ${stock}, so it isn't enough`;
    let monthOver = "The term of credit only less than 12 month";
    let remain = 0;
    remain = stock - purchase;
    if(termOfCredit > 12){
        return [monthOver, stock, remain];
    }
    if(stock > purchase){
        return [monthOfCredit, stock, remain];
    }else if(stock < purchase){
        return [monthOfCredit, textOver, stock];
    }else{
        return [monthOfCredit, stock, remain]
    }
}

let PromiseUnAwait = (resolve, reject) => {
    setTimeout(() => {
        fs.readFile('./assets/data.txt', 'utf-8', (err, data) =>{
            if(err){
                reject(`${err.path} is not found`)
            }
            resolve(data)
        });
    }, 5000)
}

let PromiseAwait = (f) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            fs.readFile(f, 'utf-8', (err, data) => {
                if(err) reject({
                    status: 400,
                    message: `${err.path} isn't found`
                });
                resolve(data);
            })
        }, 5000)
    })
}

let PromiseAwaitCall = async() => {
    try{
        const data = await PromiseAwait('./assets/user.txt');
        return JSON.parse(data);
    }catch(err){
        return err
    }
}
module.exports = {purchasingBook, PromiseUnAwait, PromiseAwaitCall};