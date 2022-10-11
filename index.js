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
            let amountOfDiscount = parseFloat(getPrice[1]) * discount;
            let priceAfterDiscount = parseFloat(getPrice[1]) - amountOfDiscount;
            let amountOfTax = priceAfterDiscount * tax;
            let amountAfterTax = priceAfterDiscount + amountOfTax ;

            console.log(`
                Detail of Books
                Image: ${bookList[i].image}
                Title: ${bookList[i].title}
                Link Market: ${bookList[i].url}

            `)
            console.log(`
                Percentage of Discount: ${discount}, so amount of discount is Rp. ${amountOfDiscount}00
                Percentage of Tax: ${tax}, so amount of tax is Rp. ${amountOfTax}0
                The books must be paid Rp. ${amountAfterTax}0/items
            `);
            console.log(`
                Total order: ${bookPurchased} X ${amountAfterTax}
                    ${bookPurchased*amountAfterTax}
            `)
        }
    }
}

let getBooks = async(error, response, body) =>  {
    if (!error && response.statusCode == 200) {
        const info = await JSON.parse(body);
        purchasingBook(info.books, "How I Found the Strong", 5, 5)
    }
}

try{
    console.log("Hi Guys...")
    request(options, getBooks)
}catch(e){
    console.log(e)
};