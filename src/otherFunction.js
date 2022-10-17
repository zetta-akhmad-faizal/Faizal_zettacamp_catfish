let month = {
    'january': 1, 'febuary': 2, 'march':3, 'april':4, 'may':5, 'june':6, 
    'july':7, 'august':8, 'september':9, 'october':10, 'november':11, 'desember':12
};

let purchasingBook = async(bookList, termOfCredit, stockBook, purchase, title, discount, taxAmnesty) => {
    let disc = parseFloat(discount.replace('Rp ', ''));
    let tax = parseFloat(taxAmnesty.replace('Rp ', ''));
    let [monthOfCredit, stock, remain] = await calculateCredit(termOfCredit, stockBook, purchase);
    let books = bookList.map(e => {
        e.tax = taxAmnesty;
        e.discount = discount;
        let getPrice = parseFloat(e.price.replace('Rp ', ''));
        let AfterDiscount = getPrice - disc;
        let AfterTax = AfterDiscount + tax;
        e.afterDiscount = `Rp ${AfterDiscount.toFixed(3)}`;
        e.AfterTax = `Rp ${AfterTax.toFixed(3)}`;
        e.stock = stockBook;
        if(e.title === title){
            e.monthly = monthOfCredit;   
            e.purchase = purchase;
            e.remain = remain;
            e.stock = stock;
            e.termOfCredit = termOfCredit
            e.monthPaid = `Rp ${(AfterTax/termOfCredit).toFixed(3)}/monthly`
        }
        return e
    })
    return books
}

let calculateCredit = async(termOfCredit, stock, purchase) => {
    let monthOfCredit = Object.keys(month).filter(m => month[m] <= termOfCredit);
    let textOver = `Stock only ${stock}, so it isn't enough`;
    let monthOver = "The term of credit only less than 12 month"
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

module.exports = purchasingBook;