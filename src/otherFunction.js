let fs = require('fs');
const book = require('../assets/data.json');

let month = {
    'january': 1, 'febuary': 2, 'march':3, 'april':4, 'may':5, 'june':6, 
    'july':7, 'august':8, 'september':9, 'october':10, 'november':11, 'desember':12
};

let splitterString = (str) => {
    let txt = parseFloat(str.replace('Rp ', ''));
    return txt
}

let array_move = (arr, old_index, new_index) => {
    if (new_index >= arr.length) {
        var k = new_index - arr.length + 1;
        while (k--) {
            arr.push(undefined);
        }
    }
    arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
    return arr; // for testing
};

let callDataJson = () => {
    let {books} = book;
    return books;
}

let purchasingBooks = async(termOfCredit, stockBook, purchase, title, discount, taxAmnesty) => {
    try{
        let getPrice; let AfterDiscount;let AfterTax;
        let disc = parseFloat(discount.replace('Rp ', ''));
        let tax = parseFloat(taxAmnesty.replace('Rp ', ''));
        let [monthOfCredit, stock, remain] = await calculateCredit(termOfCredit, stockBook, purchase);

        const bookList = callDataJson();

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

let purchasingBook = async(termOfCredit, stockBook, purchase, discount, taxAmnesty, additionalPrice, title) => {
    try{
        //map in line 58-59, 79-85
        //set in line 57 and 78
        let sets = new Set(title);
        let maps = new Map();
        let text = {};

        let getPrice; let AfterDiscount;let AfterTax;let adminPayment; let objLength; let move;
        let disc = splitterString(discount);
        let tax = splitterString(taxAmnesty);
        let additional = splitterString(additionalPrice);
        let [monthOfCredit, stock, remain] = await calculateCredit(termOfCredit, stockBook, purchase);

        let bookList = callDataJson() 

        let books = bookList.map(e => {
            e.tax = taxAmnesty;
            e.discount = discount;
            getPrice = splitterString(e.price)
            AfterDiscount = getPrice - disc;
            AfterTax = AfterDiscount + tax;
            adminPayment = AfterTax + additional;
            e.afterDiscount = `Rp ${AfterDiscount.toFixed(3)}`;
            e.AfterTax = `Rp ${AfterTax.toFixed(3)}`;
            e.adminPayment = additionalPrice
            e.total = `Rp ${adminPayment.toFixed(3)}`;
            e.stock = stockBook;

            if(sets.has(e.title)){
                monthOfCredit.map(val => {
                    maps.set(val, adminPayment/termOfCredit)
                })

                maps.forEach((v, k) => {
                    text[k] = `Rp ${v.toFixed(3)}`;
                })

                e.purchase = purchase;
                e.remain = remain;
                e.stock = stock;
                e.termOfCredit = `${termOfCredit} months`
                e.monthly = monthOfCredit;   
                e.monthPaid = text;
            }
            return e
        })

        for(const [i, v] of books.entries()){
            objLength = Object.keys(books[i]).length
            if(objLength > 14){
                move = array_move(books, i, 0)
            }
        }

        let unique = new Set(move)
        let [...data] = unique
        return data
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
    console.log('Wait, data will display 5s')
    setTimeout(() => {
        fs.readFile('./assets/data.txt', 'utf-8', (err, data) =>{
            if(err){
                reject(`${err.path} is not found`)
            }
            console.log('Data success')
            resolve(data)
        });
    }, 5000)
}

let PromiseAwait = (f) => {
    console.log('Wait, data will display 5s')
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            fs.readFile(f, 'utf-8', (err, data) => {
                if(err) reject({
                    status: 400,
                    message: `${err.path} isn't found`
                });
                console.log('Data success')
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

module.exports = {purchasingBook, purchasingBooks,PromiseUnAwait, PromiseAwaitCall};