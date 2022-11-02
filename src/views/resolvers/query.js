const {users, bookself, myfavbooks} = require('../../model/index');

const Query = {
    hello: () => 'halloworld',
    bookPurchasedDisplay: async(parent, {data: {page, limit}} , ctx) =>{
        let message;
        if(ctx.user.length === 0){
            message = "User unAuthorized"
            return {
                message
            }
        }
        let arr = []

        if(page === undefined || limit === undefined){
            arr.push(
                {
                    $sort: {
                        title: 1
                    }
                },
                {
                    $lookup: {
                        from: 'bookselves',
                        localField:'bookFav.book_id',
                        foreignField: '_id',
                        as: 'book_collections'
                    }
                },
                {
                    $facet: {
                        book_purchased: [
                            {$sort: { createdAt: -1 }}
                        ],
                        info_page: [
                            {
                                $group: {_id: null, count: {$sum: 1}}
                            }
                        ]
                    }
                }
            )
            message = "Data displayed without pagination"
        }else{
            let skip = page > 0 ? ((page - 1) * limit) : 0;
            arr.push(
                {
                    $lookup: {
                        from: 'bookselves',
                        localField:'bookFav.book_id',
                        foreignField: '_id',
                        as: 'book_collections'
                    }
                },
                {
                    $facet: {
                        book_purchased: [
                            {$sort: { createdAt: -1 }},
                            {$skip: skip},
                            {$limit: limit}
                        ],
                        info_page: [
                            {
                                $group: {_id: null, count: {$sum: 1}}
                            }
                        ]
                    }
                }
            )
            message = "Data display with pagination"
        }

        let getDataBookList = await myfavbooks.aggregate(arr)
        console.log(getDataBookList)

        if(getDataBookList[0].book_purchased.length === 0){
            return{
                book_data: [],
                message: "No data show"
            }
        }else{
            return{
                book_data: getDataBookList[0],
                message
            }
        }
    }
}

module.exports = Query;