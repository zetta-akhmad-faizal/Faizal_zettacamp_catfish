let request = require('request');

const options = {
    url: 'https://laravel-books-db.herokuapp.com/api/books?page=1&category=historical-fiction&language=en',
    headers: {
        'User-Agent': 'request',
        'Authorization': 'Bearer 175|35rv9k0sTZLGyOSpUd2Db171SkqAqCo8QMiKyWO3'
    }
};

let purchasingBook = (detail, price) => {
    let discount = 30/100;
    let tax = 10/100;
    let getPrice = price.split(" ");

    let amountOfDiscount = parseFloat(getPrice[1]) * discount;
    let priceAfterDiscount = parseFloat(getPrice[1]) - amountOfDiscount;
    let amountOfTax = priceAfterDiscount * tax;
    let amountAfterTax = priceAfterDiscount + amountOfTax 
    console.log(`
        Detail of Book: ${detail}
        Percentage of Discount: ${discount}, so amount of discount is Rp. ${amountOfDiscount.toFixed(3)}
        Percentage of Tax: ${tax}, so amount of tax is Rp. ${amountOfTax.toFixed(3)}
        The books must be paid Rp. ${amountAfterTax.toFixed(3)}
    `)
}

let getBooks = async(error, response, body) =>  {
    if (!error && response.statusCode == 200) {
        const info = await JSON.parse(body);
        info.books.map(b => {
            purchasingBook(b.title, b.price)
        })
    }
}

try{
    request(options, getBooks)
}catch(e){
    console.log(e)
};