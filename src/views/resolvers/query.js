const {users, bookself, myfavbooks, mybooks} = require('../../model/index');
const {GraphQLError} = require('graphql')

const Query = {
    hello: () => 'halloworld',
    test: async(parent, {name}, ctx) => {
        const data = await myfavbooks.aggregate([
            // {
            //     $lookup: {
            //         from: 'users',
            //         localField: 'user_id',
            //         foreignField: '_id',
            //         as: 'users'
            //     }
            // },
            {
                $match: {
                    name
                }
            },
            {
                $project: {
                    name:1,
                    user_id:1,
                    users:1
                }
            }
        ])
        // console.log(data)
        return data
    },
    GetbookPurchased: async(parent, {data: {page, limit, title}} , ctx) =>{
        const {user} = await ctx.auth
        if(user._id === null || user.length === 0){
            // throw new ApolloError('UnAuthorized')
            throw new GraphQLError("UnAuthorized", {
                extensions: { code: 401 },
            });
        }
        let message;
        let arr = [];
        let skip = page > 0 ? ((page - 1) * limit) : 0;

        if(limit && page && !title){
            arr.push(
                {
                    $lookup: {
                        from: 'bookselves',
                        localField:'book_id',
                        foreignField: '_id',
                        as: 'book_collections'
                    }
                },
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
                    $lookup: {
                        from: 'bookselves',
                        localField:'book_id',
                        foreignField: '_id',
                        as: 'book_collections'
                    }
                },
                {
                    $match: {
                        'book_collections.title': title
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
            console.log(ctx)
            return{
                data_book_purchased: getDataBookList,
                message
            }
        }
    },
    GetbookSelf: async(parent, {data: {page, limit, name}} , ctx) =>{
        const {user} = await ctx.auth
        if(user._id === null || user.length === 0){
            // throw new ApolloError('UnAuthorized')
            throw new GraphQLError("UnAuthorized", {
                extensions: { code: 401 },
            });
        }
        let message;
        let arr = [];
        let skip = page > 0 ? ((page - 1) * limit) : 0;

        if(limit && page && !name){
            arr.push(
                {
                    $lookup: {
                        from: 'bookselves',
                        localField:'book_id',
                        foreignField: '_id',
                        as: 'book_collections'
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
        }else if(name && limit && page){
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
                    $lookup: {
                        from: 'bookselves',
                        localField:'bookFav.book_id',
                        foreignField: '_id',
                        as: 'book_collections'
                    }
                },
                {
                    $match: {
                        name:name
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
            console.log('limit, page and name');
            message = `Data display with name ${name}`
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
        }

        let getDataBookList = await myfavbooks.aggregate(arr)
        console.log(getDataBookList[0])
        if(getDataBookList.length === 0){
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