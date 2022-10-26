let fs = require('fs');

let month = {
    'january': 1, 'febuary': 2, 'march':3, 'april':4, 'may':5, 'june':6, 
    'july':7, 'august':8, 'september':9, 'october':10, 'november':11, 'desember':12
};

let splitterString = (discount, tax, additional, price) => {
    let disc = parseFloat(discount.replace('Rp ', ''));
    let taxAmnesty = parseFloat(tax.replace('Rp ', ''));
    let additionalPrice = parseFloat(additional.replace('Rp ', ''));
    let priceOrigin = parseFloat(price.replace('Rp ', ''));
    return [disc, taxAmnesty, additionalPrice, priceOrigin]
}

let capitalize =(value) =>{
    var textArray = value.split(' ')
    var capitalizedText = ''
    for (var i = 0; i < textArray.length; i++) {
      capitalizedText += textArray[i].charAt(0).toUpperCase() + textArray[i].slice(1) + ' '
    }
    return capitalizedText
  }

// let array_move = (arr, old_index, new_index) => {
//     if (new_index >= arr.length) {
//         var k = new_index - arr.length + 1;
//         while (k--) {
//             arr.push(undefined);
//         }
//     }
//     arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
//     return arr; // for testing
// };

//function purchases is practise in mongodb
let purchases = async(termOfCredit, stockBook, purchase, discount, taxAmnesty, additionalPrice, title) => {
    try{
        let sets = new Set(title);
        let maps = new Map();
        let text={};let arr1 =[];let arr2=[];

        const [monthOfCredit, stock, remain] = await calculateCredit(termOfCredit, stockBook, purchase);

        let myobj = await PromiseAwaitCall();
        let bookList = new Set(myobj);
        const [...data] = bookList;

        let books = data.map(e => {
            const [disc, tax, additional, getPrice] = splitterString(discount, taxAmnesty, additionalPrice, e.price)
            let AfterDiscount = getPrice - disc;
            let AfterTax = AfterDiscount + tax;
            let adminPayment = AfterTax + additional;
            let totalMustPaid = adminPayment * purchase;
            let xin = `Rp.${totalMustPaid.toFixed(3)} `.repeat(monthOfCredit.length).split(" ");
            e.tax = taxAmnesty;
            e.discount = discount;

            e.afterDiscount = `Rp ${AfterDiscount.toFixed(3)}`;
            e.afterTax = `Rp ${AfterTax.toFixed(3)}`;
            e.adminPayment = additionalPrice
            e.total = `Rp ${adminPayment.toFixed(3)}`;
            e.stock = stockBook;
            
            if(sets.has(e.title)){
                //['january', 'feb', 'march']

                e.purchase = purchase;
                e.remain = remain;
                e.stock = stock;
                e.termOfCredit = `${termOfCredit} months`
                e.monthly = monthOfCredit;  
                e.monthPaid =  xin
            }
            return e
        })

        for(const [i, v] of books.entries()){
            let objLength = Object.keys(books[i]).length
            if(objLength > 14){
                arr1.push(books[i]);
            }else if(objLength < 15){
                arr2.push(books[i]);
            }
        }
        
        let newMaps = new Map([['billing', arr1], ['book_order', arr2]]);

        return Object.fromEntries(newMaps).billing;
    }catch(e){
        return e.message
    }
}

let purchasingBooks = async(termOfCredit, stockBook, purchase, title, discount, taxAmnesty) => {
    try{
        let getPrice; let AfterDiscount;let AfterTax;
        let disc = parseFloat(discount.replace('Rp ', ''));
        let tax = parseFloat(taxAmnesty.replace('Rp ', ''));
        let [monthOfCredit, stock, remain] = await calculateCredit(termOfCredit, stockBook, purchase);

        const bookList = await PromiseAwaitCall();

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
        let sets = new Set(title);
        let maps = new Map();
        let text={};let arr1 =[];let arr2=[];

        const [monthOfCredit, stock, remain] = await calculateCredit(termOfCredit, stockBook, purchase);

        let myobj = await PromiseAwaitCall();
        let bookList = new Set(myobj);
        const [...data] = bookList;

        let books = data.map(e => {
            const [disc, tax, additional, getPrice] = splitterString(discount, taxAmnesty, additionalPrice, e.price)

            e.tax = taxAmnesty;
            e.discount = discount;
            let AfterDiscount = getPrice - disc;
            let AfterTax = AfterDiscount + tax;
            let adminPayment = AfterTax + additional;
            e.afterDiscount = `Rp ${AfterDiscount.toFixed(3)}`;
            e.AfterTax = `Rp ${AfterTax.toFixed(3)}`;
            e.adminPayment = additionalPrice
            e.total = `Rp ${adminPayment.toFixed(3)}`;
            e.stock = stockBook;
            if(sets.has(e.title)){
                monthOfCredit.map(val => {
                    maps.set(val, adminPayment/termOfCredit)
                })
                //['january', 'feb', 'march']

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
            let objLength = Object.keys(books[i]).length
            if(objLength > 14){
                arr1.push(books[i]);
            }else if(objLength < 15){
                arr2.push(books[i]);
            }
        }
        
        let newMaps = new Map([['billing', arr1], ['book_order', arr2]]);

        return Object.fromEntries(newMaps);
    }catch(e){
        return e.message
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
    console.log('Data will display 5s')
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
        const data = await PromiseAwait('./assets/data.txt');
        const {books} = JSON.parse(data);
        return books;
    }catch(err){
        return err
    }
}

module.exports = {purchasingBook, purchasingBooks,PromiseUnAwait, PromiseAwaitCall, purchases, capitalize};