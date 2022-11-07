const {songModel} = require('../../models/index');
const DataLoader = require('dataloader');

let songCallBack = async(songId) => {
    console.log(songId)
    let song = await songModel.find({_id: {$in: songId}});
    const objVar = {}
    song.forEach(val => {
        objVar[val._id] = val;
    });
    return songId.map(id => objVar[id]);
}

let songLoader = new DataLoader(songCallBack);
module.exports = songLoader; 