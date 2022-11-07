// const {userModel, songModel, playlistModel} = require('../models/index');
// const authorization = require('../utils/auth');
// const {LessThanHour, playlistPromiseCall} = require('../app');
// const {mongoose} = require('mongoose');
// const jwt = require('jsonwebtoken');
// const dotenv = require('dotenv');
// const exp = require('express');
// const e = require('express');
// dotenv.config()

// const api = exp.Router();

// api.post('/login', async(req, res) => {
//     const {email,password} = req.body;

    // let queries = await userModel.findOne({email, password});
    
    // if (!queries) {
    //     res.status(404).send({
    //         status: 404,
    //         message: 'User not found'
    //     })
    // }else{
    //     let auth = jwt.sign({
    //         _id: queries._id
    //     }, process.env.TOKEN_SECRET, {
    //         expiresIn: '2h'
    //     });
    //     res.status(201).send({
    //         status: 201,
    //         message: auth
    //     })
    // }
// })

// //song

// api.post('/moveSong', authorization, async(req, res) => {
//     const data = await playlistPromiseCall();

//     data.map((val) => {
//         let queries = new songModel({...val, user_id: req.user});
//         queries.save();
//         return queries
//     });
//     res.status(201).send({
//         status:201,
//         message: "OK"
//     })
// })

// api.get('/GroupSongArtist/:artist', authorization, async(req, res) => {
//     const {artist} = req.params;
//     const queries = await songModel.aggregate([
//         {
//             $match: {
//                 artist
//             }
//         }
//     ]);

//     if(queries.length === 0){
//         res.status(404).send({
//             status:404,
//             message:`${artist} not found`
//         })
//     }else{
//         res.status(200).send({
//             status:200,
//             message: queries
//         })
//     }
// })

// api.get('/Group', authorization, async(req, res) => {
//     const data = await songModel.aggregate([
//         {
//             $group: {
//                 _id: {artist_name:"$artist"},
//                 count: {$sum: 1}
//             }
//         },
//         {
//           $sort: {
//             count: -1
//           }  
//         }
//     ])

//     res.status(200).send({
//         status:200,
//         message: "Data will displayed",
//         data
//     })
// })

// api.get('/song/:genre', authorization, async(req, res) => {
//     const {genre} = req.params;
//     const queries = await songModel.aggregate([
//         {
//             $match: {
//                 genre
//             }
//         }
//     ]);

//     if(queries.length === 0){
//         res.status(404).send({
//             status:404,
//             message:`${genre} not found`
//         })
//     }else{
//         res.status(200).send({
//             status:200,
//             message: queries
//         })
//     }
// })

// api.post('/song', authorization, async(req, res) => {
//     let {title, duration, artist, genre} = req.body;
//     const data = {title, duration, artist, genre, user_id: req.user};
//     try{
//         let queries = new songModel(data);
//         queries.save();
//         res.status(201).send({
//             status:201,
//             message: "Data is inserted",
//             data
//         })
//     }catch(err){
//         res.status(400).send({
//             status:400,
//             message: err.message
//         })
//     }
// })

// api.get('/song', authorization, async(req, res) => {
//     let skip; let offset; let message;let queries;

//     let {limit, page} = req.query;
//     limit = parseInt(limit);
//     page = parseInt(page);

//     let aggregationQuery = [];

//     if(limit || page || limit === 0){
//         skip = page > 0 ? ((page - 1) * limit) : 0;
//         offset = (page - 1) * limit + 1;
//         aggregationQuery.push(
//             {
//                 $lookup: {
//                     from: 'users', 
//                     localField: 'user_id',
//                     foreignField: '_id',
//                     as: 'users'
//                 }
//             },
//             {
//                 $facet: {
//                     queries_song: [
//                         {$sort: { createdAt: -1 }},
//                         {$skip: skip},
//                         {$limit: limit}
//                     ],
//                     info_page: [
//                         {
//                             $group: {_id: null, count: {$sum: 1}}
//                         }
//                     ]
//                 }
//             }
//         )

//         queries = await songModel.aggregate(aggregationQuery);
//         message = `${offset} - ${skip+queries[0].queries_song.length} datas of ${queries[0].info_page[0].count}`;
//     }else{
//         aggregationQuery.push({
//             $sort: {createdAt: 1}
//         });

//         queries = await songModel.aggregate(aggregationQuery);
//         message = `Song collections length are ${queries.length}`
//     }

//     if(queries.length < 1){
//         res.status(404).send({
//             status: 404,
//             message: "No data show"
//         })
//     }else{
//         res.status(200).send({
//             status:200,
//             message,
//             data:queries
//         })
//     }
// })

// api.put('/song/:id', authorization, async(req, res) => {
//     const {id} = req.params;
//     const {title} = req.body;
//     const converterID = mongoose.Types.ObjectId(id);

//     const queries = await songModel.findOneAndUpdate(
//         {_id: converterID},
//         {
//             $set: { title }
//         },
//         {
//             new: true
//         }
//     )
//     //new knowledge

//     if(queries === null){
//         res.status(404).send({
//             status:404,
//             message: "Data is not able updated",
//         })
//     }else{
//         res.status(201).send({
//             status:201,
//             message: "Data is updated",
//             data: queries
//         })
//     }
// })

// api.delete('/song/:id', authorization, async(req, res) => {
//     const {id} = req.params;
//     const converterID = mongoose.Types.ObjectId(id);

//     const query = await songModel.findOneAndDelete({
//         _id: converterID
//     })
    
//     if(query === null){
//         res.status(404).send({
//             status:404,
//             message: "Data is not able deleted",
//         })
//     }else{
//         res.status(201).send({
//             status: 201,
//             message: "Data is deleted", 
//             desc: query
//         })
//     }
// })

// //playlist

// api.post('/playlists', authorization, async(req, res) => {
//     try{
//         const [{music}, jam, menit, detik] = await LessThanHour();
//         let queries = new playlistModel(
//             {playlist: music, total_duration: {hours: jam[jam.length-1], minutes: menit[menit.length-1], seconds: detik[detik.length-1]}}
//         );
//         queries.save();

//         return res.status(201).send({
//             status:201,
//             message: "Playlists less than one hour is saved",
//             data: music
//         })
//     }catch(e){
//         res.status(400).send({
//             status: 400,
//             message: "The playlist doesn't played yet"
//         })
//     }
// })

// api.get('/playlists', authorization, async(req, res) => {
//     let skip; let offset; let message;let queries;

//     let {limit, page} = req.query;
//     limit = parseInt(limit);
//     page = parseInt(page);

//     let aggregationQuery = [];

//     if(limit || page || limit === 0){
//         skip = page > 0 ? ((page - 1) * limit) : 0;
//         offset = (page - 1) * limit + 1;
//         aggregationQuery.push(
//             {
//                 $facet: {
//                     queries_song: [
//                         {$sort: { createdAt: -1 }},
//                         {$skip: skip},
//                         {
//                             $lookup: {
//                                 from: 'songs', 
//                                 localField: 'playlist.song_id',
//                                 foreignField: '_id',
//                                 as: 'songs'
//                             }
//                         },
//                         {$limit: limit},
//                     ],
//                     info_page: [
//                         {
//                             $group: {_id: null, count: {$sum: 1}}
//                         }
//                     ]
//                 }
//             }
//         )

//         queries = await playlistModel.aggregate(aggregationQuery);
//         message = `${offset} - ${skip+queries[0].queries_song.length} datas of ${queries[0].info_page[0].count}`;
//     }else{
//         aggregationQuery.push({
//             $sort: {createdAt: -1}
//         });

//         queries = await playlistModel.aggregate(aggregationQuery);
//         message = `Playlist collections length are ${queries.length}`
//     }

//     if(queries.length < 1){
//         res.status(404).send({
//             status: 404,
//             message: "No data show"
//         })
//     }else{
//         res.status(200).send({
//             status:200,
//             message,
//             data:queries
//         })
//     }
// })

// api.put('/playlists/:id', authorization, async(req, res) => {
//     let {title} = req.body;
//     let {id} = req.params;
//     const converterID = mongoose.Types.ObjectId(id);

//     let songQuery = await songModel.findOne({title})
//     console.log(converterID)
//     try{
//         let playlistQuery = await playlistModel.updateOne(
//             {_id: converterID},
//             {
//                 $pull: {
//                     playlist: {
//                         song_id: songQuery._id
//                     }
//                 }
//             }
//         );
//         res.status(201).send({
//             status:201,
//             message: "Data is updated",
//             desc: playlistQuery
//         })
//     }catch(err){
//         res.status(404).send({
//             status: 404,
//             message: "Data is not able updated",
//         })
//     } 
// })

// api.delete('/playlists/:id', authorization, async(req, res) => {
//     let {id} = req.params;
//     const converterID = mongoose.Types.ObjectId(id);

//     const queries = await playlistModel.findOneAndDelete({_id:converterID});
    
//     if(queries === null){
//         res.status(404).send({
//             status:404,
//             message: "Data is not able deleted",
//         })
//     }else{
//         res.status(201).send({
//             status: 201,
//             message: "Data is deleted", 
//             desc: queries
//         })
//     }
// })

// module.exports = api;