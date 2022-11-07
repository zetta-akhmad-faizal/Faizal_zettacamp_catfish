const {songModel} = require('../../models/index');

const getAllSong = async(parent, args, ctx) => {}
const insertSong = async(parent, args, ctx) => {}
const updateSong = async(parent, args, ctx) => {}
const deleteSong = async(parent, args, ctx) => {}

module.exports = {
    Query: {
        getAllSong
    },
    Mutation: {
        insertSong,
        updateSong,
        deleteSong,
    }
}