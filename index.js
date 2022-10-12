let request = require('request');
let purchasingBook = require('./src/day3')

let page = [1,2,3,4,5,6,7];

const options = {
    url: `http://laravel-books-db.herokuapp.com/api/books?category=historical-fiction&language=en&page=${page[1]}`,
    headers: {
        'User-Agent': 'request',
        'Authorization': 'Bearer 175|35rv9k0sTZLGyOSpUd2Db171SkqAqCo8QMiKyWO3'
    }
};

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