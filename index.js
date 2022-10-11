let request = require('request');

const options = {
    url: 'https://laravel-books-db.herokuapp.com/api/books?page=1&category=historical-fiction&language=en',
    headers: {
        'User-Agent': 'request',
        'Authorization': 'Bearer 175|35rv9k0sTZLGyOSpUd2Db171SkqAqCo8QMiKyWO3'
    }
};


let purchasingBook = (bookList, title, stock, bookPurchased) => {
    let discount = 30/100;
    let tax = 10/100;

    for(let i=0; i < bookList.length; i++){
        if(title === bookList[i].title){

            if(bookPurchased > stock){
                console.log(`Ups, now my stock are ${stock} books, You cant purchased ${bookPurchased} books`);
                break;
            }else if(bookPurchased <= title){
                continue;
            }

            let getPrice = bookList[i].price.split(" ");
            let amountOfDiscount = parseInt(getPrice[1]) * discount;
            let priceAfterDiscount = parseInt(getPrice[1]) - amountOfDiscount;
            let amountOfTax = priceAfterDiscount * tax;
            let amountAfterTax = priceAfterDiscount + amountOfTax ;

            let totalOrder = bookPurchased*amountAfterTax;
            let paid;
            if(parseInt(totalOrder) > 999){
                let orderSpliter = parseInt(totalOrder).toString().split('');
                if(orderSpliter.length === 4){
                    orderSpliter.splice(1, 0, '.');
                    let join = orderSpliter[0]+orderSpliter[1]+orderSpliter[2]+orderSpliter[3]+orderSpliter[4]
                    paid = `${join}.000`
                }else if(orderSpliter.length > 4){
                    orderSpliter.splice(2, 0, '.');
                    let join = orderSpliter[0]+orderSpliter[1]+orderSpliter[2]+orderSpliter[3]+orderSpliter[4]+orderSpliter[5]
                    paid = `${join}.000`
                }
            }else{
                paid = totalOrder
            }
            console.log(`
                ---Detail of Books---
                Image: ${bookList[i].image}
                Title: ${bookList[i].title}
                Author: ${bookList[i].author}
                Link Market: ${bookList[i].url}

                --Nota--
                Percentage of Discount: ${discount}, so amount of discount is Rp. ${amountOfDiscount.toFixed(3)}
                Percentage of Tax: ${tax}, so amount of tax is Rp. ${amountOfTax.toFixed(3)}
                The books must be paid Rp. ${amountAfterTax.toFixed(3)}/items

                --Prices--
                Total order: ${bookPurchased} X ${amountAfterTax.toFixed(3)}
                    Rp. ${paid}
            `)
        }
    }
}

let getBooks = async(error, response, body) =>  {
    if (!error && response.statusCode == 200) {
        const info = await JSON.parse(body);
        purchasingBook(info.books, "On Rough Seas", 10, 9);
    }
}

try{
    console.log("Hi Guys...");
    request(options, getBooks);
}catch(e){
    console.log(e);
};