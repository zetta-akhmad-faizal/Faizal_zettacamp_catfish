const {playlistModel, songModel} = require('../../models/index');
const {LessThanHour} = require('../../app');
const {mongoose} = require('mongoose');
const e = require('express');

let getAllPlaylist = async(parent, {data:{page, limit, name}}, ctx) => {
    let arr = []
    let skip = page > 0 ? ((page - 1) * limit) : 0;

    if(limit && page && !name){
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
    }else if(limit && page && name){
        arr.push(
            {
                $match: {
                    name
                }
            },
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
        console.log('limit and page and name')
        message = `Data display with pagination and name ${name}`
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
let insertPlaylist = async(parent, {data: {name}}, ctx) => {
    try{
        const [{music}, jam, menit, detik] = await LessThanHour();
        let queries = new playlistModel(
            {
                name,
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
let updatePlaylist = async(parent, {data:{_id, title}}, ctx) => {
    if(_id){
        const songId = mongoose.Types.ObjectId(_id);
        const getSongQuery = await songModel.findOne({title});
        if(getSongQuery){
            const getPlaylistQuery = await playlistModel.findOneAndUpdate(
                {_id: songId},
                {
                    $push: {
                        playlist: {
                            song_id: getSongQuery._id,
                            duration: getSongQuery.duration
                        }
                    }
                },
                {new: true}
            )
            console.log(getPlaylistQuery);
            return {message: "Data is updated", data: getPlaylistQuery}
        }else{
            return {message: "Data isn't updated"}
        }
    }else{
        return {message: "_id or title field must be completed"}
    }
}
let deletePlaylist = async(parent, {data: {delete_choice, playlistId, songId}}, ctx) => {
    let converterSongId; let converterPlaylistId;
    if(playlistId){
        converterPlaylistId = mongoose.Types.ObjectId(playlistId);
    }
    if(songId){
        converterSongId = mongoose.Types.ObjectId(songId);
    }
    if(!songId || !playlistId){
        return {message: "PlaylistId and songId are null"}
    }
    if(delete_choice === 'song'){
        const queriePullPlaylist = await playlistModel.findOneAndUpdate(
            {_id: converterPlaylistId},
            {
                $pull: {
                    playlist: {
                        song_id: converterSongId
                    }
                }
            },
            {new: true}
        )
        console.log(queriePullPlaylist)
        if(queriePullPlaylist !== null){
            return {message: "Data is updated", data: queriePullPlaylist}
        }else{
            return {message: "Data has been updated"}
        }
    }else if(delete_choice === 'playlists'){
        const querieDeletePlaylist = await playlistModel.findOneAndDelete({_id: converterPlaylistId}, {new:true})
        if(querieDeletePlaylist !== null){
            console.log(querieDeletePlaylist)
            return {message: "Data is deleted", data: querieDeletePlaylist}
        }else{
            return {message: "Data has been deleted"}
        }
    }
}

let songLoaderAtPlaylist = async(parent, args, ctx) => {
    // console.log(parent)
    if(parent){
        return await ctx.songLoader.load(parent.song_id)
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
    playlistField: {
        song_id: songLoaderAtPlaylist
    }
}