const {playlistModel} = require('../../models/index');

let getAllPlaylist = async(parent, args, ctx) => {}
let insertPlaylist = async(parent, args, ctx) => {}
let updatePlaylist = async(parent, args, ctx) => {}
let deletePlaylist = async(parent, args, ctx) => {}

module.exports = {
    Query: {
        getAllPlaylist
    },
    Mutation: {
        insertPlaylist,
        updatePlaylist,
        deletePlaylist,
    }
}