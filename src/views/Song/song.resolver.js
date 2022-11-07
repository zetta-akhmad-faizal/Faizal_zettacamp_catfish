const {songModel} = require('../../models/index');
const {mongoose} = require('mongoose');

const getAllSong = async(parent, {data: {page, limit, title}}, ctx) => {
    let arr = []
    let skip = page > 0 ? ((page - 1) * limit) : 0;

    if(limit && page && !title){
        arr.push(
            {
                $facet: {
                    paginationOfSong: [
                        {$sort: { createdAt: -1 }},
                        {$skip: skip},
                        {$limit: limit}
                    ],
                    totalOfSong: [
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
                $match: {
                    title
                }
            },
            {
                $facet: {
                    paginationOfSong: [
                        {$sort: { createdAt: -1 }},
                        {$skip: skip},
                        {$limit: limit}
                    ],
                    totalOfSong: [
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
                $facet: {
                    paginationOfSong: [
                        {$sort: { createdAt: -1 }}
                    ],
                    totalOfSong: [
                        {
                            $group: {_id: null, count: {$sum: 1}}
                        }
                    ]
                }
            }
        )
        message = "Data displayed without pagination"
    }

    let queriesSong = await songModel.aggregate(arr)
    if(queriesSong[0].paginationOfSong.length === 0){
        return{
            data: [],
            message: "No data show"
        }
    }else{
        return{
            data: queriesSong,
            message
        }
    }
}
const insertSong = async(parent, {data: {title, duration, artist,genre}}, ctx) => {
    const parse = {title, duration, artist, genre, user_id: ctx.user._id};
    if(duration){
        let queries = new songModel(parse);
        queries.save();
        return {message: "Song is inserted", data: queries}
    }else{
        return {message: "Duration is null"}
    }
}

const getUserLoaderAtSong = async(parent, args, ctx) => {
    if(parent){
        return await ctx.userLoader.load(parent.user_id)
    }
}

const updateSong = async(parent, {data: {_id, title, duration, artist}}, ctx) => {
    if(duration){
        const songId = mongoose.Types.ObjectId(_id);
        const updateQuery = await songModel.findOneAndUpdate(
            {_id: songId}, 
            {
                $set: {
                    title, duration, artist
                }
            }, {new:true}
        );
        if(updateQuery !== null){
            return {message:"Data is updated", data: updateQuery}
        }else{
            return {message: "Data isn't found"}
        }
    }else{
        return {message: "Duration field is required"}
    }
}
const deleteSong = async(parent, {data:{_id}}, ctx) => {
    if(_id){
        const songId = mongoose.Types.ObjectId(_id);
        const deleteQuery = await songModel.findOneAndDelete(songId, {new: true});
        if(deleteQuery !== null){
            return {message:"Data is deleted", data: deleteQuery}
        }else{
            return {message: "Data isn't found"}
        }
    }else{
        return {message: "_id isn't able to read"}
    }
}

module.exports = {
    Query: {
        getAllSong
    },
    Mutation: {
        insertSong,
        updateSong,
        deleteSong,
    },
    paginationOfSongField:{
        user_id: getUserLoaderAtSong
    }
}