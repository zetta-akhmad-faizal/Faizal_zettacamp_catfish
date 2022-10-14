let month = {
    'january': 1, 'febuary': 2, 'march':3, 'april':4, 'may':5, 'june':6, 
    'july':7, 'august':8, 'september':9, 'october':10, 'november':11, 'desember':12
};

let purchasingBook = (bookList, title, stock, bookPurchased, termOfCredit) => {
    let discount = 30/100;
    let tax = 10/100;
    let summary;

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

            summary = [ 
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
            ];
        }
    }
    return summary
}

module.exports = purchasingBook;