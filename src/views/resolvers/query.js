const {users, bookself, myfavbooks, mybooks} = require('../../model/index');
const {ApolloError} = require('apollo-server-express')

const Query = {
    hello: () => 'halloworld',
    GetbookPurchased: async(parent, {data: {page, limit, title}} , ctx) =>{
        if(ctx.user.length === 0){
            throw new ApolloError('UnAuthorized')
        }
        let message;
        let arr = [];
        let skip = page > 0 ? ((page - 1) * limit) : 0;

        if(limit && page && !title){
            arr.push(
                {
                    $lookup: {
                        from: 'users',
                        localField:'user_id',
                        foreignField: '_id',
                        as: 'users'
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
            console.log('limit and page')
            message = "Data display with pagination"
        }else if(title && limit && page){
            arr.push(
                {
                    $lookup: {
                        from: 'users',
                        localField:'user_id',
                        foreignField: '_id',
                        as: 'users'
                    }
                },
                {
                    $match: {
                        title
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
            console.log('limit, page and title');
            message = `Data display with title ${title}`
        }else{
            arr.push(
                {
                    $lookup: {
                        from: 'users',
                        localField:'user_id',
                        foreignField: '_id',
                        as: 'users'
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
        }

        let getDataBookList = await mybooks.aggregate(arr)
        // console.log(getDataBookList[0].book_purchased.users)
        if(getDataBookList.length === 0){
            return{
                data_book_purchased: [],
                message: "No data show"
            }
        }else{
            return{
                data_book_purchased: getDataBookList,
                message
            }
        }
    }
}

module.exports = Query;