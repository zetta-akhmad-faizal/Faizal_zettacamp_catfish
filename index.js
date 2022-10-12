let request = require('request');

let page = [1,2,3,4,5,6,7];
let month = {
    'january': 1, 'febuary': 2, 'march':3, 'april':4, 'may':5, 'june':6, 
    'july':7, 'august':8, 'september':9, 'october':10, 'november':11, 'desember':12
};

const options = {
    url: `http://laravel-books-db.herokuapp.com/api/books?category=historical-fiction&language=en&page=${page[1]}`,
    headers: {
        'User-Agent': 'request',
        'Authorization': 'Bearer 175|35rv9k0sTZLGyOSpUd2Db171SkqAqCo8QMiKyWO3'
    }
};


let purchasingBook = (bookList, title, stock, bookPurchased, termOfCredit) => {
    let discount = 30/100;
    let tax = 10/100;

    for(let i=0; i < bookList.length; i++){

        if(title === bookList[i].title){
            let getPrice = bookList[i].price.split(" ");
            let amountOfDiscount = parseInt(getPrice[1]) * discount;
            let priceAfterDiscount = parseInt(getPrice[1]) - amountOfDiscount;
            let amountOfTax = priceAfterDiscount * tax;
            let amountAfterTax = priceAfterDiscount + amountOfTax;

            let totalOrder = (bookPurchased*amountAfterTax).toFixed(3);

            let totalMustPaid = (totalOrder/termOfCredit).toFixed(3);
            let monthOfCredit = Object.keys(month).filter(m => month[m] <= termOfCredit).map(m => ({'monthly': m,'payment': totalMustPaid}));
            let priceCredit = monthOfCredit.map(({payment}) => parseFloat(payment));
            const reducer = (accumulator, curr) => accumulator + curr;
            const totalCredit = priceCredit.reduce(reducer);

            let [...arr] = monthOfCredit;

            let summary = [ 
                {
                    discount,
                    tax,
                    amountOfDiscount,
                    amountOfTax
                },
                {
                    stock,
                    bookPurchased,
                    remaining: stock-bookPurchased
                },
                {
                    priceAfterDiscount,
                    amountAfterTax,
                    totalOrder
                },
                {   
                    type: 'Credit',
                    termOfCredit
                },
                ...arr,
                {
                    priceCredit,
                    totalCredit
                }
            ]
            console.log(summary)
        }
    }
}

let getBooks = async(error, response, body) =>  {
    if (!error && response.statusCode == 200) {
        const info = await JSON.parse(body);

        let stock = 12;let purchased = 4;
        for(purchased; purchased<stock; purchased++){
            console.log(`---Remaining stock ${stock}---\n`)
            if(purchased > stock){
                break;
            }else{
                purchasingBook(info.books, "A Sitting in St. James", stock, purchased, 6);
                stock -= purchased
            }
            console.log(`---Remaining stock ${stock}---\n`)
        }
    }
}

try{
    console.log("Garamedia");
    request(options, getBooks);
}catch(e){
    console.log(e);
};