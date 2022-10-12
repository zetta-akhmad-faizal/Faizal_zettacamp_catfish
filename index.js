let request = require('request');

let page = [1,2,3,4,5,6,7]
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
            let paid;

            if(parseInt(totalOrder) > 999){
            
                let orderSpliter = parseInt(totalOrder).toString().split('');
                if(orderSpliter.length === 4){
                    orderSpliter.splice(1, 0, '.');
                    let join = orderSpliter[0]+orderSpliter[1]+orderSpliter[2]+orderSpliter[3]+orderSpliter[4];
                    paid = `${join}.000`;
                }else if(orderSpliter.length > 4){
                    orderSpliter.splice(2, 0, '.');
                    let join = orderSpliter[0]+orderSpliter[1]+orderSpliter[2]+orderSpliter[3]+orderSpliter[4]+orderSpliter[5];
                    paid = `${join}.000`;
                }
            }else{
                paid = totalOrder;
            }
            let totalMustPaid = (paid/termOfCredit).toFixed(3);
            let monthOfCredit = Object.keys(month).filter(m => month[m] <= termOfCredit).map(m => ({
                'month': m,
                'payment': totalMustPaid
            }));
            console.log(monthOfCredit)
            // console.log(`
            //     ---Detail of Books---
            //     Image: ${bookList[i].image}
            //     Title: ${bookList[i].title}
            //     Author: ${bookList[i].author}
            //     Link Market: ${bookList[i].url}

            //     --Nota--
            //     Percentage of Discount: ${discount}, so amount of discount is Rp. ${amountOfDiscount.toFixed(3)}. Price will become Rp. ${priceAfterDiscount.toFixed(3)} from Rp. ${getPrice[1]}
            //     Percentage of Tax: ${tax}, so amount of tax is Rp. ${amountOfTax.toFixed(3)}
            //     The books must be paid Rp. ${amountAfterTax.toFixed(3)}/books

            //     --Prices--
            //     Total order: ${bookPurchased} X ${amountAfterTax.toFixed(3)}
            //         Rp. ${paid}
            // `)
        }
    }
}

let getBooks = async(error, response, body) =>  {
    if (!error && response.statusCode == 200) {
        const info = await JSON.parse(body);

        let stock = 12;let purchased = 4;
        for(purchased; purchased<stock; purchased++){
            if(purchased > stock){
                break;
            }else{
                purchasingBook(info.books, "A Sitting in St. James", stock, purchased, 6);
                stock -= purchased
            }
            console.log(`Stock still ${stock} but amount of purchased is ${purchased}`)
        }
    }
}

try{
    console.log("Garamedia");
    request(options, getBooks);
}catch(e){
    console.log(e);
};