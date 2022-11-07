const {playlistModel} = require('../../models/index');
const {LessThanHour} = require('../../app')

let getAllPlaylist = async(parent, {data:{page, limit}}, ctx) => {
    let arr = []
    let skip = page > 0 ? ((page - 1) * limit) : 0;

    if(limit && page){
        arr.push(
            {
                $facet: {
                    paginationOfPlaylists: [
                        {$sort: { createdAt: -1 }},
                        {$skip: skip},
                        {$limit: limit}
                    ],
                    totalOfPlaylists: [
                        {
                            $group: {_id: null, count: {$sum: 1}}
                        }
                    ]
                }
            }
        )
        console.log('limit and page')
        message = "Data display with pagination"
    }else{
        arr.push(
            {
                $facet: {
                    paginationOfPlaylists: [
                        {$sort: { createdAt: -1 }}
                    ],
                    totalOfPlaylists: [
                        {
                            $group: {_id: null, count: {$sum: 1}}
                        }
                    ]
                }
            }
        )
        message = "Data displayed without pagination"
    }

    let queriesSong = await playlistModel.aggregate(arr)
    if(queriesSong[0].paginationOfPlaylists.length === 0){
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
let insertPlaylist = async(parent, args, ctx) => {
    try{
        const [{music}, jam, menit, detik] = await LessThanHour();
        let queries = new playlistModel(
            {
                playlist: music, 
                total_duration: {hours: jam[jam.length-1], 
                minutes: menit[menit.length-1], 
                seconds: detik[detik.length-1]},
                user_id: ctx.user._id
            }
        );
        queries.save();

        return {
            message: "Data is saved",
            data: queries
        }
    }catch(e){
        return {message: "Data song is unavailable"}
    }
}
let updatePlaylist = async(parent, args, ctx) => {}
let deletePlaylist = async(parent, args, ctx) => {}

let userLoaderAtPlaylist = async(parent, args, ctx) => {
    if(parent){
        return await ctx.userLoader.load(parent.user_id)
    }
}
module.exports = {
    Query: {
        getAllPlaylist
    },
    Mutation: {
        insertPlaylist,
        updatePlaylist,
        deletePlaylist,
    },
    playlistsSchema: {
        user_id: userLoaderAtPlaylist
    }
}